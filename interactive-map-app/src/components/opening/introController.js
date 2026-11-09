import { setIslandMarkerVisibility } from './islandMarkers.js';
import { createConnectionLines } from './connectionLines.js';
import { createIntroOverlay } from './introOverlay.js';
import { testIslands } from './islandData.js';
import { introIslandIds } from './introConfig.js';
import { createIntroAudio } from './introAudio.js';

const intros = new WeakMap();
const previews = new WeakSet();

export function startNetworkPreview(map, config, networkConfig) {
    if (previews.has(map)) return;
    previews.add(map);
    setIslandMarkerVisibility(map, introIslandIds);
    const lines = createConnectionLines(map, networkConfig);
    let isReady = false;
    const refit = () => {
        if (isReady) map.jumpTo(calculateFinalIntroCamera(map, config));
    };
    const ready = () => {
        isReady = true;
        refit();
        lines.showFinal();
    };
    if (map.isStyleLoaded()) ready();
    else map.once('style.load', ready);
    map.on('resize', refit);
    map.once('remove', () => {
        map.off('style.load', ready);
        map.off('resize', refit);
    });
}

function measureMarkerExtents(map) {
    const extents = new Map();
    for (const marker of map.getContainer().querySelectorAll('.island-marker')) {
        const name = marker.querySelector('.island-marker__label').textContent;
        const island = testIslands.find((entry) => entry.name === name);
        if (!island) continue;
        // Measure even unrevealed markers without making them visible or selectable.
        const clone = marker.cloneNode(true);
        clone.hidden = false;
        Object.assign(clone.style, {
            position: 'fixed', left: '-10000px', top: '0',
            visibility: 'hidden', transform: 'none', animation: 'none', pointerEvents: 'none'
        });
        document.body.append(clone);
        const circle = clone.getBoundingClientRect();
        const label = clone.querySelector('.island-marker__label').getBoundingClientRect();
        const x = circle.left + circle.width / 2;
        const y = circle.top + circle.height / 2;
        extents.set(island.id, {
            left: Math.min(circle.left, label.left) - x,
            right: Math.max(circle.right, label.right) - x,
            top: Math.min(circle.top, label.top) - y,
            bottom: Math.max(circle.bottom, label.bottom) - y
        });
        clone.remove();
    }
    return extents;
}

function mercatorPoint([longitude, latitude]) {
    return {
        x: (longitude + 180) / 360,
        y: 0.5 - Math.log(Math.tan(Math.PI / 4 + latitude * Math.PI / 360)) / (2 * Math.PI)
    };
}

export function calculateFinalIntroCamera(map, config) {
    const longitudes = testIslands.map((island) => island.coordinates[0]);
    const latitudes = testIslands.map((island) => island.coordinates[1]);
    const bounds = [
        [Math.min(...longitudes), Math.min(...latitudes)],
        [Math.max(...longitudes), Math.max(...latitudes)]
    ];
    const { padding, maxZoom, minContentSize, targetHeightFraction, labelEdgePadding } = config.finalCameraFit;
    const container = map.getContainer();
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0 || height <= 0) return config.endCamera;
    const extents = measureMarkerExtents(map);
    const points = testIslands.map((island) => ({
        ...mercatorPoint(island.coordinates),
        extent: extents.get(island.id) ?? {
            left: -padding.left, right: padding.right,
            top: -padding.top, bottom: padding.bottom
        }
    }));
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    // Find the largest scale that meets the height target and fits every label pair.
    let scale = Math.min(height * targetHeightFraction / (maxY - minY), 512 * 2 ** maxZoom);
    const availableWidth = Math.max(minContentSize, width - 2 * labelEdgePadding);
    const availableHeight = Math.max(minContentSize, height - 2 * labelEdgePadding);
    for (const right of points) {
        for (const left of points) {
            if (right.x > left.x) {
                scale = Math.min(scale,
                    (availableWidth - right.extent.right + left.extent.left) / (right.x - left.x));
            }
            if (right.y > left.y) {
                scale = Math.min(scale,
                    (availableHeight - right.extent.bottom + left.extent.top) / (right.y - left.y));
            }
        }
    }
    scale = Math.max(1, scale);
    const contentCenterX = (Math.min(...points.map((point) => point.x * scale + point.extent.left)) +
        Math.max(...points.map((point) => point.x * scale + point.extent.right))) / 2;
    const contentCenterY = (Math.min(...points.map((point) => point.y * scale + point.extent.top)) +
        Math.max(...points.map((point) => point.y * scale + point.extent.bottom))) / 2;
    // Convert the measured content envelope back into padding for MapLibre's bounds fit.
    const horizontalSpace = width - (maxX - minX) * scale;
    const verticalSpace = height - (maxY - minY) * scale;
    const left = horizontalSpace / 2 + (minX + maxX) * scale / 2 - contentCenterX;
    const top = verticalSpace / 2 + (minY + maxY) * scale / 2 - contentCenterY;
    const camera = map.cameraForBounds(bounds, {
        padding: {
            left: Math.max(0, left), right: Math.max(0, horizontalSpace - left),
            top: Math.max(0, top), bottom: Math.max(0, verticalSpace - top)
        },
        maxZoom,
        bearing: 0
    });
    // Retain the previous destination only if MapLibre cannot fit (e.g. zero size).
    return camera ? { center: camera.center, zoom: camera.zoom, bearing: camera.bearing } : config.endCamera;
}

export function startIntro(
    map,
    skipButton,
    config,
    onExplore = () => { }
) {
    if (intros.has(map)) return intros.get(map);

    let state = 'idle';
    let timer;
    let cameraEndTime;
    let windTimer;
    let hasLoaded = map.loaded();
    const audio = createIntroAudio(config.audio);
    const revealedIds = new Set(['montreal']);
    const connectionLines = createConnectionLines(map, config.connections);
    const overlay = createIntroOverlay(
        document.querySelector('#intro-overlay'),
        config.overlay,
        begin,
        onExplore
    );
    const attract = document.querySelector('#intro-attract');
    const beginButton = attract.querySelector('button');
    const container = map.getContainer();
    const stage = attract.parentElement;
    // Programmatic focus may inherit keyboard-style rings after a prevented click.
    const onPointerInput = () => stage.classList.add('intro-pointer-input');
    const onKeyboardInput = () => stage.classList.remove('intro-pointer-input');
    stage.addEventListener('pointerdown', onPointerInput, true);
    stage.addEventListener('keydown', onKeyboardInput, true);
    let finalCamera;
    let finalCameraSize;
    const getFinalCamera = () => {
        const size = `${container.clientWidth}x${container.clientHeight}`;
        if (!finalCamera || size !== finalCameraSize) {
            finalCamera = calculateFinalIntroCamera(map, config);
            finalCameraSize = size;
        }
        return finalCamera;
    };
    const wasInert = container.inert;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handlers = [
        'boxZoom', 'doubleClickZoom', 'dragPan', 'dragRotate',
        'keyboard', 'scrollZoom', 'touchZoomRotate', 'touchPitch'
    ].map((name) => map[name]).filter(Boolean);
    const enabledHandlers = handlers.filter((handler) => handler.isEnabled());

    const restore = () => {
        container.inert = wasInert;
        for (const handler of enabledHandlers) handler.enable();
        if (document.activeElement === skipButton) map.getCanvas().focus();
        skipButton.hidden = true;
        skipButton.removeEventListener('click', complete);
        motionPreference.removeEventListener('change', onMotionChange);
        map.off('load', ready);
        map.off('moveend', cameraComplete);
        map.off('zoom', revealMarkers);
    };

    function complete(quick = true) {
        if (state === 'idle' || state === 'completed' || state === 'disposed') return;

        audio.finish(quick !== false);

        state = 'completed';
        clearTimeout(timer);
        windTimer = undefined;
        map.off('moveend', cameraComplete);
        map.stop();
        map.jumpTo(getFinalCamera());
        setIslandMarkerVisibility(map, introIslandIds);
        connectionLines.showFinal();
        restore();
        overlay.show();
    }

    function cameraComplete() {
        if (state !== 'animating') return;
        state = 'connections';

        audio.network();

        map.off('zoom', revealMarkers);
        setIslandMarkerVisibility(map, introIslandIds);

        connectionLines.play(
            () => complete(false),

            (phase) => {
                if (state !== 'connections') return;

                if (phase === 'spread') {
                    audio.seagull();
                }

                if (phase === 'closing') {
                    audio.car();
                }
            }
        );

    }

    function dispose() {
        state = 'disposed';
        container.classList.remove('intro-idle');
        clearTimeout(timer);
        windTimer = undefined;
        connectionLines.dispose();
        audio.dispose();
        setIslandMarkerVisibility(map, introIslandIds);
        restore();
        overlay.dispose();
        beginButton.removeEventListener('click', beginFromAttract);
        stage.removeEventListener('pointerdown', onPointerInput, true);
        stage.removeEventListener('keydown', onKeyboardInput, true);
        stage.classList.remove('intro-pointer-input');
        container.removeEventListener('click', beginFromMarker, true);
        map.off('resize', refit);
        map.off('style.load', refitAfterStyle);
        map.off('remove', dispose);
    }

    function refit() {
        finalCamera = undefined;
        if (state === 'animating') {
            const remainingMs = Math.max(0, cameraEndTime - performance.now());
            map.off('moveend', cameraComplete);
            map.stop();
            map.once('moveend', cameraComplete);
            map.easeTo({ ...getFinalCamera(), duration: remainingMs });
        } else if (state === 'connections' || state === 'completed') {
            map.jumpTo(getFinalCamera());
        }
    }

    function refitAfterStyle() {
        if (state === 'completed') refit();
    }

    function onMotionChange(event) {
        if (event.matches) complete();
    }

    function begin() {
        if (state !== 'idle' && state !== 'completed') return;
        state = 'waiting';

        //audio begin
        audio.begin();

        container.classList.remove('intro-idle');
        overlay.hide();
        attract.hidden = true;
        clearTimeout(timer);
        windTimer = undefined;
        connectionLines.clear();
        revealedIds.clear();
        revealedIds.add('montreal');
        setIslandMarkerVisibility(map, ['montreal']);
        finalCamera = undefined;
        container.inert = true;
        for (const handler of enabledHandlers) handler.disable();
        map.stop();
        map.easeTo({ ...config.startCamera, offset: config.startCameraOffset, duration: 0 });
        skipButton.hidden = false;
        skipButton.addEventListener('click', complete);
        skipButton.focus({ preventScroll: true });
        motionPreference.addEventListener('change', onMotionChange);
        if (hasLoaded || map.loaded()) ready();
    }

    function beginFromAttract() {
        if (state === 'idle') begin();
    }

    function beginFromMarker(event) {
        if (state !== 'idle') return;
        const marker = event.target.closest?.('.island-marker');
        if (!marker || marker.hidden) return;
        // Capture activation before the normal marker-selection handler runs.
        event.preventDefault();
        event.stopImmediatePropagation();

        marker.addEventListener('animationend', (event) => {
            if (event.animationName === 'intro-click-ripple') {
                marker.classList.remove('intro-click-ripple');
                marker.style.removeProperty('--intro-click-ripple-duration');
            }
        }, { once: true });
        marker.classList.add('intro-click-ripple');

        beginFromAttract();
    }

    function revealMarkers() {
        if (state !== 'animating') return;
        let changed = false;
        const bounds = map.getBounds();
        for (const island of testIslands) {
            if (!introIslandIds.includes(island.id)) continue;
            const reveal = config.markerReveals?.find((entry) => entry.id === island.id);
            const thresholdReached = !reveal || map.getZoom() <= reveal.zoom;
            if (!revealedIds.has(island.id) && thresholdReached && bounds.contains(island.coordinates)) {
                revealedIds.add(island.id);
                changed = true;
            }
        }
        if (changed) {
            setIslandMarkerVisibility(map, [...revealedIds], { fadeDurationMs: config.markerFadeMs });
        }
    }

    function ready() {
        // Remember the one-time load event even while the visitor is still idle.
        hasLoaded = true;
        if (state !== 'waiting') return;
        if (motionPreference.matches) {
            complete();
            return;
        }
        state = 'delaying';
        timer = setTimeout(() => {
            timer = undefined;
            if (state !== 'delaying') return;
            state = 'animating';
            map.on('zoom', revealMarkers);
            revealMarkers();
            map.once('moveend', cameraComplete);
            cameraEndTime = performance.now() + config.durationMs;

            windTimer = setTimeout(() => {
                windTimer = undefined;

                if (state !== 'animating') return;

                audio.zoom(
                    Math.max(0, config.durationMs - config.audio.windDelayMs)
                );
            }, config.audio.windDelayMs);

            map.easeTo({ ...getFinalCamera(), duration: config.durationMs });
        }, config.delayMs);
    }

    const controller = { begin, skip: complete, get state() { return state; } };
    intros.set(map, controller);
    for (const handler of enabledHandlers) handler.disable();
    // Keep the sole idle marker keyboard-accessible; navigation stays disabled.
    container.inert = false;
    setIslandMarkerVisibility(map, ['montreal']);
    connectionLines.clear();
    container.classList.add('intro-idle');
    skipButton.hidden = true;
    attract.hidden = false;
    beginButton.addEventListener('click', beginFromAttract);
    container.addEventListener('click', beginFromMarker, true);
    map.once('remove', dispose);
    map.on('resize', refit);
    map.once('style.load', refitAfterStyle);
    if (!hasLoaded) map.once('load', ready);
    map.easeTo({ ...config.startCamera, offset: config.startCameraOffset, duration: 0 });
    return controller;
}
