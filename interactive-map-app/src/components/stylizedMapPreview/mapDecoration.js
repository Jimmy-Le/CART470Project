// These patches are just for the look of the map, not real terrain or water depth.
export const DECORATION = {
  minIslandArea: 45, areaPerPatch: 1800, maxLandPatches: 28,
  minPatchRadius: 7, maxPatchRadius: 80, waterPatchCount: 24,
  contourPoints: 22, curveTension: 0.09,
};
// Use the same seed so the patches stay put when we zoom or drag.
function seededRandom(seed) {
  let state = 2166136261;
  for (const char of String(seed)) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => {
    state += 0x6D2B79F5;
    let value = Math.imul(state ^ state >>> 15, state | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

export function organicWashes(seed, bounds, count = 5, patchRadius) {
  const random = seededRandom(seed);
  const [left, top, right, bottom] = bounds;
  const width = right - left, height = bottom - top;
  if (!(width > 0 && height > 0)) return [];
  return Array.from({ length: count }, (_, index) => {
    const cx = left + random() * width, cy = top + random() * height;
    const size = (patchRadius ?? Math.min(width, height) * 0.16) * (0.55 + random() * 0.95);
    const rx = size * (0.65 + random() * 0.8), ry = size * (0.65 + random() * 0.8);
    const rotation = random() * Math.PI * 2;
    const phase = random() * Math.PI * 2, phase2 = random() * Math.PI * 2;
    const points = Array.from({ length: DECORATION.contourPoints }, (_, i) => {
      const angle = i / DECORATION.contourPoints * Math.PI * 2;
      const radius = 0.8 + 0.24 * Math.sin(angle * 3 + phase)
        + 0.18 * Math.cos(angle * 5 + phase2) + random() * 0.2;
      const x = Math.cos(angle) * rx * radius, y = Math.sin(angle) * ry * radius;
      return [cx + x * Math.cos(rotation) - y * Math.sin(rotation),
        cy + x * Math.sin(rotation) + y * Math.cos(rotation)];
    });
    const f = value => value.toFixed(2);
    let path = `M${points[0].map(f).join(',')}`;
    points.forEach((a, i) => {
      const n = points.length, tension = DECORATION.curveTension;
      const prev = points[(i + n - 1) % n], b = points[(i + 1) % n], next = points[(i + 2) % n];
      path += `C${f(a[0] + (b[0] - prev[0]) * tension)},${f(a[1] + (b[1] - prev[1]) * tension)} `
        + `${f(b[0] - (next[0] - a[0]) * tension)},${f(b[1] - (next[1] - a[1]) * tension)} ${b.map(f).join(',')}`;
    });
    return { path: path + 'Z', tone: ['dark', 'light', 'mid'][index % 3] };
  });
}

export function decorateIsland(record) {
  const [left, top, right, bottom] = record.bounds;
  const boundsArea = (right - left) * (bottom - top);
  const area = record.area ?? boundsArea;
  const count = area < DECORATION.minIslandArea ? 0
    : Math.min(DECORATION.maxLandPatches, Math.max(1, Math.ceil(area / DECORATION.areaPerPatch)));
  const radius = Math.min(DECORATION.maxPatchRadius,
    Math.max(DECORATION.minPatchRadius, Math.sqrt(area / Math.max(1, count)) * 0.85));
  return { ...record, washes: organicWashes(record.id, record.bounds, count, radius),
    labelSize: Math.min(21, 14 + Math.max(0, Math.log10(Math.max(1, boundsArea)) - 2) * 2.1) };
}
