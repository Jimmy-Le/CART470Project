const visibilityStates = new WeakMap();

function getVisibilityState(map) {
    if (!visibilityStates.has(map)) {
        visibilityStates.set(map, { visibleIds: null, buttons: new Map(), fades: new Map() });
    }
    return visibilityStates.get(map);
}


export function setIslandMarkerVisibility(map, islandIds = null, { fadeDurationMs = 0 } = {}) {
    const state = getVisibilityState(map);
    state.visibleIds = islandIds === null ? null : new Set(islandIds);
    for (const [id, button] of state.buttons) {
        const hidden = state.visibleIds !== null && !state.visibleIds.has(id);
        const wasHidden = button.hidden;
        if (hidden || fadeDurationMs === 0) {
            const fade = state.fades.get(id);
            if (fade) {
                fade.onfinish = null;
                fade.cancel();
                state.fades.delete(id);
            }
        }
        button.hidden = hidden;
        if (wasHidden && !hidden && fadeDurationMs > 0 &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // Animate the whole button so its label shares the same opacity.
            const fade = button.animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: fadeDurationMs,
                easing: 'linear'
            });
            state.fades.set(id, fade);
            fade.onfinish = () => {
                if (state.fades.get(id) === fade) state.fades.delete(id);
            };
        }
    }
}

export function createIslandMarkers(map, Marker, islands, onSelect = () => { }) {
    const buttons = [];
    const visibility = getVisibilityState(map);
    const selectIsland = (island, selectedButton = null) => {
        for (const button of buttons) {
            button.setAttribute('aria-pressed', String(button === selectedButton));
        }
        onSelect(island);
    };

    map.on('click', (event) => {
        if (event.originalEvent?.target?.closest('.island-marker')) return;
        selectIsland(null);
    });

    return islands.map((island) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'island-marker';
        button.dataset.labelPosition = island.labelPosition;
        button.setAttribute('aria-label', `Select ${island.name} (test island)`);
        button.setAttribute('aria-pressed', 'false');
        button.hidden = visibility.visibleIds !== null && !visibility.visibleIds.has(island.id);
        visibility.buttons.set(island.id, button);

        const label = document.createElement('span');
        label.className = 'island-marker__label';
        label.textContent = island.name;
        const [offsetX, offsetY] = island.labelOffset ?? [0, 0];
        label.style.setProperty('--island-label-offset-x', `${offsetX}px`);
        label.style.setProperty('--island-label-offset-y', `${offsetY}px`);
        button.append(label);
        buttons.push(button);

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            selectIsland(island, button);
            console.log('Selected island:', island.name);
        });

        return new Marker({ element: button, anchor: 'center' })
            .setLngLat(island.coordinates)
            .addTo(map);
    });
}
