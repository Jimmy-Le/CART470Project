import { islandCatalog } from './islandCatalog.js';
import { defaultIslands } from '../data/islands.js';
import { createPathfinder } from '../engine/pathfinding.js';

const original = defaultIslands[0];
export const worldWidth = 1200;
export const worldHeight = 800;

export function positionAt(id, point) {
  return { id, x: Math.round(point.x - original.width / 2),
    y: Math.round(point.y - original.height / 2) };
}

export function makeIslands(records) {
  if (!Array.isArray(records)) throw new Error('Expected an array of island positions.');
  const seen = new Set();
  return records.map(({ id, x, y }) => {
    const entry = islandCatalog.find(item => item.id === id);
    const { width, height } = original;
    if (!entry || seen.has(id)) throw new Error('Unknown or repeated island ID.');
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Invalid island coordinates.');
    seen.add(id);
    return { ...original, id, name: entry.name, audio: id === original.id ? original.audio : null,
      x, y, width, height, label: { x: x + width / 2 - 200, y: y + height + 14, width: 400 } };
  });
}

// The engine replans currents when the coastline changes. Reject a layout
// that would otherwise silently discard an existing current during that rebuild.
export function checkRoutes(islands, currents) {
  if (!currents.length) return;
  const paths = islands.map(island => {
    const [left, top, w, h] = island.viewBox.split(/\s+/).map(Number);
    const sx = Math.round(island.width) / w;
    const sy = Math.round(island.height) / h;
    const path = new Path2D();
    path.addPath(new Path2D(island.coast), new DOMMatrix([sx, 0, 0, sy,
      Math.round(island.x) - left * sx, Math.round(island.y) - top * sy]));
    return path;
  });
  const ctx = document.createElement('canvas').getContext('2d');
  const { plan } = createPathfinder(paths, ctx, worldWidth, worldHeight);
  if (currents.some(route => !plan(route.a, route.b))) {
    throw new Error('This layout blocks an existing current. Choose another spot or edit that current first.');
  }
}
