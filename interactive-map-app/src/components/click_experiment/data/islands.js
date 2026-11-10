import image from '../../../assets/blue.png';
import audio from '../../../assets/audio/seagulls.mp3';

//my test island assets
import island1PNG from '../../../assets/Experiment/Island1.png';
import island1SVG from '../../../assets/Experiment/islandDetail.svg';

//I create a new SVG to JS file for testing
import {
    island1ViewBox,
    island1Coast
} from './Island1Coast.js';

// Replace these records with mapped API data when the island endpoint is ready.
export const defaultIslands = [{
    id: 'i1', name: 'Seagull Island', image, audio,
    x: 450, y: 240, width: 300, height: 291.579,
    viewBox: '0 0 570 554',
    coast: "M498,316 L503,326 L514,337 L531,350 L527,360 L531,373 L542,388 L537,399 L531,409 L508,413 L496,419 L484,425 L470,429 L413,404 L410,411 L395,409 L392,415 L378,412 L371,413 L365,415 L358,417 L350,415 L342,414 L336,414 L332,416 L327,419 L323,421 L319,425 L314,428 L310,432 L305,435 L301,439 L296,443 L291,446 L285,450 L279,450 L274,452 L267,456 L261,457 L255,457 L247,467 L239,470 L231,474 L222,479 L213,483 L205,482 L198,477 L193,470 L189,463 L188,451 L185,443 L171,449 L166,444 L165,434 L161,428 L156,424 L162,410 L173,393 L163,393 L158,389 L155,384 L154,378 L154,372 L153,366 L150,361 L147,356 L145,350 L148,344 L152,337 L153,332 L151,327 L126,322 L126,316 L121,309 L112,302 L117,295 L118,288 L119,282 L119,274 L118,267 L119,259 L120,252 L134,251 L135,244 L136,236 L136,228 L141,223 L142,215 L142,205 L143,196 L145,187 L149,179 L132,146 L132,132 L141,126 L149,120 L150,101 L153,84 L160,73 L168,60 L180,57 L186,39 L199,38 L213,40 L229,62 L243,83 L254,90 L264,89 L274,107 L280,176 L286,173 L292,176 L299,174 L303,184 L307,190 L312,195 L316,199 L320,204 L323,209 L326,215 L329,220 L332,225 L334,229 L337,233 L353,222 L365,216 L369,220 L375,223 L384,223 L391,226 L398,229 L397,237 L399,243 L412,244 L421,247 L431,251 L438,256 L443,262 L446,270 L454,276 L457,283 L465,291 L472,298 L484,307 Z",
    camera: { x: 600, y: 400 },
    label: { x: 390, y: 560, width: 400 },
}];


const originalIsland = defaultIslands[0];

defaultIslands.push(
    {
        ...originalIsland,
        id: 'i2',
        name: 'Test Island 2',

        image: island1PNG,
        detailImage: island1SVG,

        x: 100,
        y: 100,
        width: 220,
        height: 214,
        camera: { x: 210, y: 207 },
        label: { x: 50, y: 330, width: 320 },
    },
    {
        ...originalIsland,
        id: 'i3',
        name: 'Test Island 3',

        image: island1PNG,
        detailImage: island1SVG,

        x: 850,
        y: 430,
        width: 180,
        height: 175,
        camera: { x: 940, y: 518 },
        label: { x: 780, y: 620, width: 320 },
    },

    {
        ...originalIsland,
        id: 'i4',
        name: 'Test Island 4',

        image: island1PNG,
        detailImage: island1SVG,

        x: 350,
        y: 570,
        width: 160,
        height: 156,
        camera: { x: 430, y: 648 },
        label: { x: 280, y: 730, width: 300 },
    },
    {
        ...originalIsland,

        id: 'i5',
        name: 'Island 1',

        image: island1PNG,
        detailImage: island1SVG,

        x: 900,
        y: 80,
        width: 200,
        height: 200 * 304 / 314,

        viewBox: island1ViewBox,
        coast: island1Coast,

        camera: { x: 1000, y: 177 },
        label: { x: 850, y: 290, width: 300 },
    }
);





