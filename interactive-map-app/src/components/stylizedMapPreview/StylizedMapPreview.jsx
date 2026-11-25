import { useMemo } from 'react';
import islandSource from './data/hochelaga-target-islands-filtered.geojson?raw';
import waterSource from './data/hochelaga-water-preview-v2.geojson?raw';
import { fitProjection, geometryPath, mapRecords } from './mapGeometry.js';
import StylizedIslandLayer from './StylizedIslandLayer.jsx';
import StylizedWaterLayer from './StylizedWaterLayer.jsx';
import './stylizedMapPreview.css';

// Vite reads these files as text, so turn them into objects first.
const islandData = JSON.parse(islandSource);
const waterData = JSON.parse(waterSource);
const WIDTH = 1400;
const HEIGHT = 900;

export default function StylizedMapPreview({
  islands = islandData,
  water = waterData,
  className = '',
  showLabels = true,
  presentationOnly = false,
}) {
  // Prepare the SVG paths once, unless the map data changes.
  const map = useMemo(() => {
    if (!islands.features.length) return null;
    const project = fitProjection(islands.features, WIDTH, HEIGHT);
    return {
      records: mapRecords(islands.features, project),
      waterPaths: water.features.map(feature => geometryPath(feature.geometry, project)),
    };
  }, [islands, water]);

  if (!map) return <div className="smp-map smp-empty">No map data available.</div>;

  return (
    <figure className={`smp-map ${presentationOnly ? 'smp-map--presentation' : ''} ${className}`}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Map of the Hochelaga Archipelago">
        {/* Draw the water first, then put the islands on top. */}
        <rect className="smp-context" width={WIDTH} height={HEIGHT} />
        <StylizedWaterLayer paths={map.waterPaths} />
        <StylizedIslandLayer islands={map.records} />

        {/* Just put each name at its reference point. No automatic repositioning. */}
        {showLabels && (
          <g className="smp-labels">
            {map.records.filter(island => island.anchor).map(island => (
              <text key={island.id} x={island.anchor[0]} y={island.anchor[1]}
                textAnchor="middle" dominantBaseline="central">
                {island.name}
              </text>
            ))}
          </g>
        )}
      </svg>
      <a className="smp-map-credit" href="https://www.openstreetmap.org/copyright">
        © OpenStreetMap contributors
      </a>
    </figure>
  );
}
