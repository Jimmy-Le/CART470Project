import { testIslands } from './islandData.js';

// Presentation subset only; keep all geographic source data and camera-fit inputs intact.
export const introIslandIds = testIslands
    .filter((island) => island.id !== 'notre-dame')
    .map((island) => island.id);

// Shared conceptual network; preview remains static.
export const networkPreviewConfig = {
    label: 'Conceptual visual prototype — connections are not verified geographic relationships or the archipelago boundary.',
    groups: {
        outer: [
            ['perrot', 'bizard'],
            ['bizard', 'jesus'],
            ['jesus', 'sainte-therese'],
            ['sainte-therese', 'saint-laurent'],
            ['saint-laurent', 'charron'],
            ['perrot', 'dorval'],
            ['dorval', 'soeurs']
        ],
        inner: [
            ['montreal', 'visitation'],
            ['montreal', 'sainte-helene'],
            ['visitation', 'sainte-helene'],
            ['montreal', 'soeurs'],
            ['soeurs', 'sainte-helene']
        ],
        cross: [
            ['bizard', 'visitation'],
            ['jesus', 'visitation'],
            ['charron', 'sainte-helene'],
            ['bizard', 'montreal']
        ]
    },
    styles: {
        // connective line value
        outer: { color: '#285E68', width: 3.5, opacity: 0.90 },
        inner: { color: '#C27851', width: 2.5, opacity: 0.85 },
        cross: { color: '#829994', width: 1.8, opacity: 0.65 }
    }
};

export const introConfig = {
    startCamera: {
        center: [...testIslands.find((island) => island.id === 'montreal').coordinates],
        // start zoomed value 
        zoom: 12.3
    },
    // Balance the left-side island label and circular marker around screen center.
    startCameraOffset: [56, 0],
    endCamera: { center: [-73.5673, 45.5017], zoom: 9 },
    finalCameraFit: {
        // Pixel allowance for circular markers, right-side labels, and attribution.
        padding: { top: 52, bottom: 64, left: 32, right: 190 },
        maxZoom: 11,
        targetHeightFraction: 0.65,
        labelEdgePadding: 16,
        minContentSize: 64
    },
    delayMs: 1600,
    durationMs: 9500,
    markerFadeMs: 500,
    clickRippleMs: 800,


    //audio setting
    audio: {
        files: {
            bell: 'BELL.mp3',
            wind: 'Wind.mp3',
            river: 'River.mp3',
            seagull: 'Seagull.mp3',
            car: 'CarPassing.mp3'
        },

        windVolume: 0.35,
        windDelayMs: 1200,
        windFadeInMs: 1600,
        windFadeOutMs: 1400,
        riverFadeInMs: 1500,
        riverVolume: 3,
        riverDuckVolume: 0.5,
        riverDuckFadeMs: 700,
        seagullDelayMs: 2300,
        finalFadeOutMs: 900,
        skipFadeOutMs: 120,
        carDelayMs: 300,
    },


    markerReveals: [
        { id: 'sainte-helene', zoom: 11 }
    ],
    overlay: {
        // Set the agreed destination URL here when the next experience is ready.
        destination: null
    },
    connections: {
        groups: networkPreviewConfig.groups,
        styles: networkPreviewConfig.styles,

        phaseStyles: {
            initial: {
                color: '#285E68',
                width: 3,
                opacity: 0.9
            },
            spread: { color: '#718C55', width: 3, opacity: 0.9 },
            closing: {
                color: '#C27851',
                width: 3,
                opacity: 0.9
            }
        },

        propagation: {
            rootId: 'montreal',
            startMs: 750,
            spreadMs: 2600,
            connectMs: 2000,
            settleMs: 1100,
            staggerMs: 60
        }
    },



};



