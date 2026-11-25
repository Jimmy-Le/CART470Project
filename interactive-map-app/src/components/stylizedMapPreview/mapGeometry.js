export function polygons(geometry) {
  if (geometry?.type === 'Polygon') return [geometry.coordinates];
  if (geometry?.type === 'MultiPolygon') return geometry.coordinates;
  if (geometry?.type === 'GeometryCollection') return geometry.geometries.flatMap(polygons);
  return [];
}

const validPoint = point => Array.isArray(point) && point.length >= 2
  && Number.isFinite(point[0]) && Number.isFinite(point[1]);

export function polygonFeatures(data) {
  const features = data?.type === 'FeatureCollection' ? data.features
    : data?.type === 'Feature' ? [data] : [];
  return (features ?? []).filter(feature => polygons(feature.geometry)
    .some(polygon => polygon.some(ring => ring.filter(validPoint).length >= 3)));
}

// Use the same projection for land and water so they line up.
export function fitProjection(features, width = 1400, height = 900, padding = 90) {
  let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
  for (const feature of features) for (const polygon of polygons(feature.geometry)) {
    for (const ring of polygon) for (const point of ring) {
      if (!validPoint(point)) continue;
      west = Math.min(west, point[0]); east = Math.max(east, point[0]);
      south = Math.min(south, point[1]); north = Math.max(north, point[1]);
    }
  }
  if (!Number.isFinite(west)) return null;
  // Adjust longitude for the latitude of the map.
  const latitudeFactor = Math.max(0.01, Math.cos((north + south) / 2 * Math.PI / 180));
  const spanX = Math.max((east - west) * latitudeFactor, 1e-6);
  const spanY = Math.max(north - south, 1e-6);
  const inset = Math.max(0, Math.min(padding, width / 2 - 1, height / 2 - 1));
  const scale = Math.min((width - inset * 2) / spanX, (height - inset * 2) / spanY);
  const left = (width - spanX * scale) / 2, top = (height - spanY * scale) / 2;
  return {
    bounds: [west, south, east, north],
    project: ([longitude, latitude]) => [
      left + (longitude - west) * latitudeFactor * scale,
      top + (north - latitude) * scale,
    ],
  };
}

// Keep every ring so SVG can draw holes with evenodd fill.
export function geometryPath(geometry, project) {
  return polygons(geometry).map(polygon => polygon.map(ring => {
    const points = ring.filter(validPoint).map(project);
    if (points.length < 3) return '';
    return points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join('') + 'Z';
  }).join('')).join('');
}

function fallbackAnchor(geometry, project) {
  // Use the center of the largest polygon if there is no label position.
  let largest = null;
  for (const polygon of polygons(geometry)) {
    const points = (polygon[0] ?? []).filter(validPoint).map(project);
    let area = 0, x = 0, y = 0;
    points.forEach((a, i) => {
      const b = points[(i + 1) % points.length];
      const cross = a[0] * b[1] - b[0] * a[1];
      area += cross; x += (a[0] + b[0]) * cross; y += (a[1] + b[1]) * cross;
    });
    if (Math.abs(area) > (largest?.area ?? 0)) {
      largest = { area: Math.abs(area), point: [x / (3 * area), y / (3 * area)] };
    }
  }
  return largest?.point ?? polygons(geometry).flat(2).filter(validPoint).map(project)[0];
}

export function mapRecords(features, locations, project) {
  const metadata = Array.isArray(locations) ? locations : locations?.islands ?? [];
  return features.map((feature, index) => {
    const p = feature.properties ?? {};
    const location = metadata.find(item => p.projectIslandId != null
      && item.provisionalId === p.projectIslandId);
    const name = p.projectName || location?.projectName || p.name || location?.officialName || `Island ${index + 1}`;
    const reference = [p.referenceLon ?? location?.longitude, p.referenceLat ?? location?.latitude];
    return {
      id: String(p.projectIslandId ?? feature.id ?? p['@id'] ?? `island-${index}`),
      name, path: geometryPath(feature.geometry, project),
      bounds: projectedBounds(feature.geometry, project),
      area: projectedArea(feature.geometry, project),
      anchor: validPoint(reference) ? project(reference) : fallbackAnchor(feature.geometry, project),
    };
  });
}

export function projectedBounds(geometry, project) {
  const points = polygons(geometry).flat(2).filter(validPoint).map(project);
  return points.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y),
    Math.max(b[2], x), Math.max(b[3], y)], [Infinity, Infinity, -Infinity, -Infinity]);
}

export function projectedArea(geometry, project) {
  return polygons(geometry).reduce((total, polygon) => total + polygon.reduce((area, ring, index) => {
    const points = ring.filter(validPoint).map(project);
    const ringArea = Math.abs(points.reduce((sum, a, i) => {
      const b = points[(i + 1) % points.length];
      return sum + a[0] * b[1] - b[0] * a[1];
    }, 0)) / 2;
    return area + (index ? -ringArea : ringArea);
  }, 0), 0);
}

// Move the labels around to avoid overlap without moving the islands.
export function placeLabels(records, width, height) {
  const occupied = [];
  return records.filter(record => record.anchor).map(record => {
    const fontSize = record.labelSize ?? 14;
    const w = Math.min(280, record.name.length * fontSize * 0.55 + 16), h = fontSize + 10;
    const [ax, ay] = record.anchor;
    let best;
    for (const dy of [0, -26, 26, -52, 52, -78, 78, -104, 104]) {
      for (const dx of [0, -w / 2 - 12, w / 2 + 12]) {
        const x = Math.max(w / 2 + 10, Math.min(width - w / 2 - 10, ax + dx));
        const y = Math.max(24, Math.min(height - 24, ay + dy));
        const box = { left: x - w / 2, right: x + w / 2, top: y - h / 2, bottom: y + h / 2 };
        const overlap = occupied.reduce((sum, b) => sum + Math.max(0, Math.min(b.right, box.right) - Math.max(b.left, box.left))
          * Math.max(0, Math.min(b.bottom, box.bottom) - Math.max(b.top, box.top)), 0);
        const score = overlap * 100 + Math.hypot(x - ax, y - ay);
        if (!best || score < best.score) best = { x, y, box, score };
      }
    }
    occupied.push(best.box);
    return { ...record, x: best.x, y: best.y };
  });
}
