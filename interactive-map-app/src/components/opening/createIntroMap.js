import { testIslands } from './islandData.js';
import { Map, Marker, setWorkerUrl } from 'maplibre-gl';
import { applyMuseumMapStyle } from './mapStyle.js';
import {
    createIslandMarkers,
    setIslandMarkerVisibility
} from './islandMarkers.js';

import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';



setWorkerUrl(workerUrl);

export function createOpeningMap(container) {
    const map = new Map({
        container,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [-73.65, 45.52],
        zoom: 12,
        attributionControl: true,
    });

    map.once('style.load', () => {
        applyMuseumMapStyle(map);

        setIslandMarkerVisibility(map, ['montreal']);

        createIslandMarkers(map, Marker, testIslands);
    });

    return map;
}
