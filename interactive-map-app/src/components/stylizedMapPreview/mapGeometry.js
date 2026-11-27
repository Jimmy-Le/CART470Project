// Some islands have more than one polygon. Treat both types the same way.
export function polygons(geometry) {
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

// Fit the map around the islands and leave a little space around the edges.
export function fitProjection(features, width, height, padding = 90) {
  let west = Infinity;
  let east = -Infinity;
  let south = Infinity;
  let north = -Infinity;

  for (const feature of features) {
    for (const polygon of polygons(feature.geometry)) {
      for (const ring of polygon) {
        for (const [lon, lat] of ring) {
          west = Math.min(west, lon);
          east = Math.max(east, lon);
          south = Math.min(south, lat);
          north = Math.max(north, lat);
        }
      }
    }
  }

  // Longitude needs a correction at this latitude to keep the map in proportion.
  const latitudeFactor = Math.cos((north + south) / 2 * Math.PI / 180);
  const spanX = (east - west) * latitudeFactor;
  const spanY = north - south;
  const scale = Math.min((width - 2 * padding) / spanX, (height - 2 * padding) / spanY);
  const left = (width - spanX * scale) / 2;
  const top = (height - spanY * scale) / 2;

  // Use this same function for the islands, water and names so they line up.
  return ([lon, lat]) => [
    left + (lon - west) * latitudeFactor * scale,
    top + (north - lat) * scale,
  ];
}

// Keep vertices whose distance to a replacement segment exceeds the map-space tolerance.
function simplifyRing(points, tolerance) {
  if (!tolerance || points.length < 6) return points;
  const last = points.length - 1;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[last] = 1;
  const segments = [[0, last]];
  while (segments.length) {
    const [a, b] = segments.pop();
    const [x, y] = points[a];
    const dx = points[b][0] - x, dy = points[b][1] - y;
    const length2 = dx * dx + dy * dy;
    let limit = tolerance * tolerance, pivot = -1;
    for (let i = a + 1; i < b; i++) {
      const px = points[i][0] - x, py = points[i][1] - y;
      const t = length2 ? Math.max(0, Math.min(1, (px * dx + py * dy) / length2)) : 0;
      const distance = (px - t * dx) ** 2 + (py - t * dy) ** 2;
      if (distance > limit) { limit = distance; pivot = i; }
    }
    if (pivot >= 0) {
      keep[pivot] = 1;
      segments.push([a, pivot], [pivot, b]);
    }
  }
  const result = points.filter((_, i) => keep[i]);
  return result.length >= 4 ? result : points;
}

export function geometryPath(geometry, project, tolerance = 0) {
  return polygons(geometry).map(polygon => polygon.map(ring =>
    simplifyRing(ring.map(project), tolerance).map(([x, y], i) =>
      `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`
    ).join('') + 'Z'
  ).join('')).join('');
}

// Each island already has an ID, name and reference point in the GeoJSON.
export function mapRecords(features, project, tolerance = 0) {
  return features.map(feature => {
    const { projectIslandId, projectName, referenceLon, referenceLat } = feature.properties;
    const anchor = Number.isFinite(referenceLon) && Number.isFinite(referenceLat)
      ? project([referenceLon, referenceLat])
      : null;

    return {
      id: projectIslandId,
      name: projectName,
      path: geometryPath(feature.geometry, project, tolerance),
      anchor,
    };
  });
}
