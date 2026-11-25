import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMERA, INITIAL_CAMERA, focusBounds, zoomAt } from './mapCamera.js';
import { fitProjection, mapRecords, polygonFeatures, polygons, geometryPath, projectedArea } from './mapGeometry.js';
import { decorateIsland, organicWashes } from './mapDecoration.js';

test('wheel zoom stays centered on the cursor', () => {
  const camera = { x: -200, y: 90, zoom: 3 }, cursor = { x: 840, y: 240 };
  for (const factor of [0.001, 0.8, 1.5, 1000]) {
    const next = zoomAt(camera, cursor, factor);
    assert(next.zoom >= CAMERA.minZoom && next.zoom <= CAMERA.maxZoom);
    assert(Math.abs((cursor.x - camera.x) / camera.zoom - (cursor.x - next.x) / next.zoom) < 1e-9);
    assert(Math.abs((cursor.y - camera.y) / camera.zoom - (cursor.y - next.y) / next.zoom) < 1e-9);
  }
});

test('focus centers islands and limits zoom on small islands', () => {
  const large = focusBounds([100, 100, 900, 700], 1400, 900);
  const small = focusBounds([100, 100, 101, 101], 1400, 900);
  assert(small.zoom > large.zoom);
  assert.equal(small.zoom, CAMERA.maxZoom);
  assert.equal(500 * large.zoom + large.x, 700);
  assert.equal(400 * large.zoom + large.y, 450);
  assert.deepEqual(INITIAL_CAMERA, { x: 0, y: 0, zoom: 1 });
});

const load = name => JSON.parse(readFileSync(new URL(`./data/${name}`, import.meta.url), 'utf8'));
const features = polygonFeatures(load('hochelaga-target-islands-filtered.geojson'));
const projection = fitProjection(features);
const records = mapRecords(features, load('hochelaga-island-locations.json'), projection.project);

test('all 23 islands have unique IDs and valid bounds', () => {
  assert.equal(records.length, 23);
  assert.equal(new Set(records.map(record => record.id)).size, 23);
  records.forEach((record, index) => {
    assert.equal(record.id, features[index].properties.projectIslandId);
    assert(record.bounds.every(Number.isFinite));
    const c = focusBounds(record.bounds, 1400, 900);
    assert(Math.abs((record.bounds[0] + record.bounds[2]) / 2 * c.zoom + c.x - 700) < 1e-8);
    assert(Math.abs((record.bounds[1] + record.bounds[3]) / 2 * c.zoom + c.y - 450) < 1e-8);
  });
});

test('land and water paths keep all polygon rings', () => {
  const water = polygonFeatures(load('hochelaga-water-preview-v2.geojson'));
  assert.equal(water.length, 73);
  for (const feature of [...features, ...water]) {
    const path = geometryPath(feature.geometry, projection.project);
    assert(!/NaN|Infinity/.test(path));
    assert.equal((path.match(/Z/g) ?? []).length,
      polygons(feature.geometry).reduce((count, polygon) => count + polygon.length, 0));
  }
});

test('island decoration stays the same without changing its outline', () => {
  const first = records.map(decorateIsland);
  const reordered = [...records].reverse().map(decorateIsland);
  for (const record of first) {
    assert.deepEqual(record.washes, reordered.find(other => other.id === record.id).washes);
    assert.equal(record.path, records.find(other => other.id === record.id).path);
    assert(record.washes.every(wash => !/NaN|Infinity/.test(wash.path)));
  }
  assert.notDeepEqual(first[0].washes, first[1].washes);
  assert.deepEqual(organicWashes('empty', [0, 0, 0, 0]), []);
});

test('larger islands get more color patches', () => {
  const geometry = { type: 'Polygon', coordinates: [
    [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
    [[2, 2], [4, 2], [4, 4], [2, 4], [2, 2]],
  ] };
  assert.equal(projectedArea(geometry, point => point), 96);
  const record = { id: 'density-test', bounds: [0, 0, 100, 100] };
  assert.equal(decorateIsland({ ...record, area: 10 }).washes.length, 0);
  assert(decorateIsland({ ...record, area: 10000 }).washes.length
    > decorateIsland({ ...record, area: 200 }).washes.length);
});

function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

test('water coverage includes the main lakes without changing map bounds', () => {
  const oldWater = polygonFeatures(load('hochelaga-water-preview.geojson'));
  const newWater = polygonFeatures(load('hochelaga-water-preview-v2.geojson'));
  const covers = (data, point) => data.some(feature => polygons(feature.geometry)
    .some(polygon => inRing(point, polygon[0]) && !polygon.slice(1).some(hole => inRing(point, hole))));
  for (const point of [[-73.65, 45.42], [-73.58, 45.43], [-73.95, 45.45], [-73.9, 45.53]]) {
    assert.equal(covers(oldWater, point), false);
    assert.equal(covers(newWater, point), true);
  }
  assert.deepEqual(projection.bounds, [-74.0009248, 45.3453023, -73.4039926, 45.7576752]);
  for (const name of ['Lac Saint-Louis', 'Lac des Deux-Montagnes', 'Lac Saint-François', 'Rapides de Lachine']) {
    assert(newWater.some(feature => feature.properties.name === name));
  }
});
