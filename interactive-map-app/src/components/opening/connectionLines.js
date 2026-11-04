import { testIslands } from './islandData.js';

const controllers = new WeakMap();
const SOURCE_ID = 'intro-connections';
const LAYER_ID = 'intro-connection-lines';

export function buildPropagationSchedule(edges, config) {
    const adjacency = new Map();
    edges.forEach(({ pair: [from, to] }, index) => {
        for (const [node, neighbor] of [[from, to], [to, from]]) {
            if (!adjacency.has(node)) adjacency.set(node, []);
            adjacency.get(node).push({ neighbor, index });
        }
    });
    const depths = new Map([[config.rootId, 0]]);
    const queue = [config.rootId];
    const tree = new Map();
    for (let i = 0; i < queue.length; i += 1) {
        const node = queue[i];
        for (const { neighbor, index } of adjacency.get(node) ?? []) {
            if (depths.has(neighbor)) continue;
            const depth = depths.get(node);
            depths.set(neighbor, depth + 1);
            queue.push(neighbor);
            tree.set(index, { index, depth, reverse: edges[index].pair[0] !== node });
        }
    }

    const schedule = new Map();
    function addWave(entries, startMs, durationMs) {
        const stagger = Math.min(config.staggerMs, durationMs / Math.max(1, entries.length * 2));
        entries.forEach((entry, index) => schedule.set(entry.index, {
            ...entry,
            startMs: startMs + index * stagger,
            durationMs: durationMs - Math.max(0, entries.length - 1) * stagger
        }));
    }

    const branches = [...tree.values()];
    addWave(
        branches
            .filter((edge) => edge.depth === 0)
            .map((edge) => ({ ...edge, phase: 'initial' })),
        0,
        config.startMs
    );
    const maxDepth = Math.max(0, ...branches.map((edge) => edge.depth));
    for (let depth = 1; depth <= maxDepth; depth += 1) {
        const waveMs = config.spreadMs / maxDepth;
        addWave(
            branches
                .filter((edge) => edge.depth === depth)
                .map((edge) => ({ ...edge, phase: 'spread' })),
            config.startMs + (depth - 1) * waveMs,
            waveMs
        );
    }
    // Cycle-closing edges finish the network after the outward branches arrive.
    addWave(
        edges.flatMap((edge, index) =>
            tree.has(index)
                ? []
                : [{ index, reverse: false, phase: 'closing' }]
        ),
        config.startMs + config.spreadMs,
        config.connectMs
    );
    return {
        edges: schedule,
        totalMs: config.startMs + config.spreadMs + config.connectMs + config.settleMs
    };
}

export function createConnectionLines(map, config) {
    if (controllers.has(map)) return controllers.get(map);
    const coordinates = new Map([...testIslands, ...(config.extraIslands ?? [])]
        .map((island) => [island.id, island.coordinates]));
    // Conceptual test connections only; these do not represent geographic boundaries.
    const edges = config.groups
        ? Object.entries(config.groups).flatMap(([group, pairs]) => pairs.map((pair) => ({ pair, group })))
        : config.pairs.map((pair) => ({ pair }));
    const segments = edges.map(({ pair: [from, to], group }) => {
        if (!coordinates.has(from) || !coordinates.has(to)) {
            throw new Error(`Unknown island ID in connection: ${from} -> ${to}`);
        }
        return { start: coordinates.get(from), end: coordinates.get(to), group };
    });
    const timeline = config.propagation ? buildPropagationSchedule(edges, config.propagation) : null;
    let data = { type: 'FeatureCollection', features: [] };
    let timer;
    let frame;
    let generation = 0;
    let disposed = false;
    let styleReady = map.isStyleLoaded();

    const groupPaint = (property) => [
        'match', ['get', 'group'],
        ...Object.entries(config.styles).flatMap(([group, style]) => [group, style[property]]),
        config.styles.cross[property]
    ];


    const linePaint = (property) => {
        if (!config.phaseStyles) {
            return config.groups
                ? groupPaint(property)
                : config[property];
        }

        return [
            'match',
            ['get', 'phase'],
            ...Object.entries(config.phaseStyles).flatMap(
                ([phase, style]) => [phase, style[property]]
            ),
            config.groups
                ? groupPaint(property)
                : config[property]
        ];
    };


    function render() {
        if (disposed || !styleReady) return;
        if (!map.getSource(SOURCE_ID)) map.addSource(SOURCE_ID, { type: 'geojson', data });
        else map.getSource(SOURCE_ID).setData(data);
        if (!map.getLayer(LAYER_ID)) {
            map.addLayer({
                id: LAYER_ID,
                type: 'line',
                source: SOURCE_ID,
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': linePaint('color'),
                    'line-width': linePaint('width'),
                    'line-opacity': linePaint('opacity')
                }
            });
        }
    }

    function update(progress, schedule = null) {
        data = {
            type: 'FeatureCollection',
            features: segments.flatMap((segment, index) => {
                const timing = schedule?.get(index);
                const { group } = segment;
                const [start, end] = timing?.reverse
                    ? [segment.end, segment.start] : [segment.start, segment.end];
                const amount = Math.min(1, Math.max(0, timing
                    ? (progress - timing.startMs) / timing.durationMs : progress - index));
                if (amount === 0) return [];
                return [{
                    type: 'Feature',
                    properties: {
                        ...(group ? { group } : {}),
                        ...(timing?.phase ? { phase: timing.phase } : {})
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: [start, amount === 1 ? end : start.map((value, axis) => value + (end[axis] - value) * amount)]
                    }
                }];
            })
        };
        render();
    }

    function cancel() {
        generation += 1;
        clearTimeout(timer);
        cancelAnimationFrame(frame);
    }

    function showFinal() {
        cancel();
        update(
            timeline ? timeline.totalMs : segments.length,
            timeline?.edges
        );
    }


    function play(onComplete, onPhaseChange = () => { }) {
        cancel();

        const currentGeneration = generation;
        update(0);

        let currentPhase = null;

        timer = setTimeout(() => {
            let startTime;

            function tick(time) {
                if (disposed || generation !== currentGeneration) return;

                startTime ??= time;

                const elapsed = time - startTime;

                const progress = timeline
                    ? elapsed
                    : config.durationMs > 0
                        ? elapsed / config.durationMs
                        : segments.length;

                // Notify when the connection animation enters a new phase.
                if (timeline) {
                    const propagation = config.propagation;

                    let nextPhase;

                    if (elapsed < propagation.startMs) {
                        nextPhase = 'initial';
                    } else if (
                        elapsed < propagation.startMs + propagation.spreadMs
                    ) {
                        nextPhase = 'spread';
                    } else {
                        nextPhase = 'closing';
                    }

                    if (nextPhase !== currentPhase) {
                        currentPhase = nextPhase;
                        onPhaseChange(nextPhase);
                    }
                }

                update(progress, timeline?.edges);

                if (
                    timeline
                        ? elapsed >= timeline.totalMs
                        : progress >= segments.length
                ) {
                    onComplete?.();
                } else {
                    frame = requestAnimationFrame(tick);
                }
            }

            if (!disposed && generation === currentGeneration) {
                frame = requestAnimationFrame(tick);
            }
        }, config.delayMs ?? 0);
    }


    function dispose() {
        disposed = true;
        cancel();
        map.off('style.load', onStyleLoad);
        map.off('remove', dispose);
    }

    // Also supports Skip before the style is ready: render the latest final data on load.
    function onStyleLoad() {
        styleReady = true;
        render();
    }
    map.on('style.load', onStyleLoad);
    map.once('remove', dispose);
    const controller = { play, showFinal, dispose, clear() { cancel(); update(0); } };
    controllers.set(map, controller);
    return controller;
}
