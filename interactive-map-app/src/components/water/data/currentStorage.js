import defaults from './currents.json';

export const DEFAULT_STORAGE_KEY = 'cart470-team-water-v1';
const clamp = (value, min, max, fallback) => Number.isFinite(value)
  ? Math.max(min, Math.min(max, value)) : fallback;
const point = p => p && Number.isFinite(p.x) && Number.isFinite(p.y)
  && p.x >= 0 && p.x <= 1200 && p.y >= 0 && p.y <= 800;

// Plain records only: never store particles, Path2D, DOM elements or animation frames.
export function normalizeCurrents(records) {
  if (!Array.isArray(records)) return [];
  const ids = new Set();
  return records.slice(0, 40).flatMap(item => {
    if (!item || !Number.isSafeInteger(item.id) || item.id < 0 || ids.has(item.id)
      || !point(item.a) || !point(item.b)) return [];
    ids.add(item.id);
    return [{ id: item.id, a: { ...item.a }, b: { ...item.b },
      speed: clamp(item.speed, 0, 150, 35),
      width: clamp(item.width, 20, 180, 70),
      strength: clamp(item.strength, 0, 2, 1) }];
  });
}
export function serializeCurrents(routes) {
  return routes.map(({ id, a, b, speed, width, strength }) => ({
    id, a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y }, speed, width, strength,
  }));
}
export function loadLocalCurrents(key = DEFAULT_STORAGE_KEY) {
  try {
    const raw = key ? localStorage.getItem(key) : null;
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return normalizeCurrents(parsed);
    }
  } catch { /* Invalid or unavailable storage falls back to project defaults. */ }
  return normalizeCurrents(defaults);
}
export function saveLocalCurrents(records, key = DEFAULT_STORAGE_KEY) {
  if (!key) return;
  try { localStorage.setItem(key, JSON.stringify(serializeCurrents(records))); }
  catch { /* The editor continues to work when storage is unavailable. */ }
}
