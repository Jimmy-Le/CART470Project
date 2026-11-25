const COLORS = {
    background: '#F0EBDD',
    water: '#B8D5DE',
    vegetation: '#D5DFC8',
    residential: '#EAE6DA',
    roads: '#D6D2C8'
};

const ROAD_OPACITY = [
    'interpolate', ['linear'], ['zoom'],
    9, 0.08,
    11, 0.18,
    13, 0.35,
    15, 0.50
];

const ROAD_LINE_LAYERS = [
    'tunnel_motorway_casing',
    'tunnel_motorway_inner',
    'highway_path',
    'highway_minor',
    'highway_major_casing',
    'highway_major_inner',
    'highway_major_subtle',
    'highway_motorway_casing',
    'highway_motorway_inner',
    'highway_motorway_subtle',
    'highway_motorway_bridge_casing',
    'highway_motorway_bridge_inner'
];

const HIDDEN_LAYERS = [
    'building',
    'highway_path',
    'highway_minor',
    'highway-name-path',
    'highway-name-minor',
    'highway-name-major',
    'highway-shield-non-us',
    'highway-shield-us-interstate',
    'road_shield_us',
    'airport',
    'label_other',
    'label_village',
    // Verified Positron settlement labels (source-layer: place).
    'label_town',
    'label_city',
    'label_city_capital',
    'waterway_line_label',
    'water_name_point_label',
    'water_name_line_label'
];

export function applyMuseumMapStyle(map) {
    const paintChanges = [
        ['background', 'background', { 'background-color': COLORS.background }],
        ['water', 'fill', { 'fill-color': COLORS.water }],
        ['park', 'fill', { 'fill-color': COLORS.vegetation }],
        ['landcover_wood', 'fill', { 'fill-color': COLORS.vegetation }],
        ['landuse_residential', 'fill', { 'fill-color': COLORS.residential }],
        ['highway_major_inner', 'line', { 'line-color': COLORS.roads }],
        ['highway_motorway_inner', 'line', { 'line-color': COLORS.roads }]
    ];

    for (const [id, type, properties] of paintChanges) {
        const layer = map.getLayer(id);
        if (!layer || layer.type !== type) continue;

        for (const [property, value] of Object.entries(properties)) {
            map.setPaintProperty(id, property, value);
        }
    }

    for (const id of HIDDEN_LAYERS) {
        if (map.getLayer(id)) {
            map.setLayoutProperty(id, 'visibility', 'none');
        }
    }

    for (const id of ROAD_LINE_LAYERS) {
        const layer = map.getLayer(id);
        if (layer?.type === 'line' && map.getLayoutProperty(id, 'visibility') !== 'none') {
            map.setPaintProperty(id, 'line-opacity', ROAD_OPACITY);
        }
    }
}
