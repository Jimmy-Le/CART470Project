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

// M starts a shape, L connects the points, and Z closes the ring.
export function geometryPath(geometry, project) {
  return polygons(geometry).map(polygon =>
    polygon.map(ring =>
      ring.map((point, index) => {
        const [x, y] = project(point);
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      }).join('') + 'Z'
    ).join('')
  ).join('');
}

// Each island already has an ID, name and reference point in the GeoJSON.
export function mapRecords(features, project) {
  return features.map(feature => {
    const { projectIslandId, projectName, referenceLon, referenceLat } = feature.properties;
    const anchor = Number.isFinite(referenceLon) && Number.isFinite(referenceLat)
      ? project([referenceLon, referenceLat])
      : null;

    return {
      id: projectIslandId,
      name: projectName,
      path: geometryPath(feature.geometry, project),
      anchor,
    };
  });
}
