import { useMemo, useState } from 'react';
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

function visibleLabels(records) {
  const occupied = [];
  const priority = ['montreal', 'jesus', 'bizard', 'sainte-helene'];
  const rank = id => priority.includes(id) ? priority.indexOf(id) : priority.length;
  const context = document.createElement('canvas').getContext('2d');
  context.font = '500 13px Georgia, serif';
  return records.filter(island => island.anchor)
    .sort((a, b) => rank(a.id) - rank(b.id))
    .filter(({ name, anchor: [x, y] }) => {
      const half = context.measureText(name).width / 2 + 5;
      if (occupied.some(box => Math.abs(box.y - y) < 20 && Math.abs(box.x - x) < box.half + half)) return false;
      occupied.push({ x, y, half });
      return true;
    });
}

export default function StylizedMapPreview({
  islands = islandData,
  water = waterData,
  className = '',
  showLabels = true,
  presentationOnly = false,
}) {
  const [focused, setFocused] = useState(false);
  // Prepare the SVG paths once, unless the map data changes.
  const map = useMemo(() => {
    if (!islands.features.length) return null;
    const project = fitProjection(islands.features, WIDTH, HEIGHT);
    const records = mapRecords(islands.features, project);
    return {
      records, labels: visibleLabels(records),
      waterPaths: water.features.map(feature => geometryPath(feature.geometry, project)),
    };
  }, [islands, water]);

  if (!map) return <div className="smp-map smp-empty">No map data available.</div>;

  const montreal = map.records.find(island => island.id === "montreal");
  return (
    <figure className={`smp-map ${presentationOnly ? 'smp-map--presentation' : ''} ${className}`}>
      <svg onClick={event => { if (!event.target.closest("[data-island-id]")) setFocused(false); }}
        onKeyDown={event => { if (event.key === "Escape") setFocused(false); }}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="group" aria-label="Map of the Hochelaga Archipelago">
        {/* Draw the water first, then put the islands on top. */}
        <rect className="smp-context" width={WIDTH} height={HEIGHT} />
        <g className="smp-camera" style={{ transformOrigin: montreal?.anchor?.map(n => n + "px").join(" "), transform: focused ? "scale(1.45)" : undefined }}>
        <StylizedWaterLayer paths={map.waterPaths} />
        <StylizedIslandLayer islands={map.records} onMontreal={() => setFocused(true)} />


        {showLabels && (
          <g className="smp-labels" style={{pointerEvents: "none"}}>
            {map.labels.map(island => (
              <text key={island.id} x={island.anchor[0]} y={island.anchor[1]}
                textAnchor="middle" dominantBaseline="central">
                {island.name}
              </text>
            ))}
          </g>
        )}
        </g>
      </svg>

    </figure>
  );
}
