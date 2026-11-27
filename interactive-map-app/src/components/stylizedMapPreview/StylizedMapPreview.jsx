import { useEffect, useMemo, useRef, useState } from 'react';
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

function visibleLabels(records, zoom, selectedId) {
  const occupied = [];
  const priority = ['montreal', 'jesus', 'bizard', 'sainte-helene'];
  const rank = id => priority.includes(id) ? priority.indexOf(id) : priority.length;
  const context = document.createElement('canvas').getContext('2d');
  context.font = '400 15px "IM Fell English", Palatino, Georgia, serif';
  return records.filter(island => island.anchor)
    .sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId) || rank(a.id) - rank(b.id))
    .filter(({ name, anchor: [x, y] }) => {
      const half = context.measureText(name).width / 2 + 5;
      if (occupied.some(box => Math.abs(box.y - y) * zoom < 20 && Math.abs(box.x - x) * zoom < box.half + half)) return false;
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
  const [focused, setFocused] = useState(null);
  const [phase, setPhase] = useState('visible');
  const [fontReady, setFontReady] = useState(false);
  const timer = useRef(null);
  const destination = useRef(null);
  useEffect(() => {
    let active = true;
    document.fonts.load('15px "IM Fell English"').then(() => {
      if (active) setFontReady(true);
    }).catch(() => {});
    return () => { active = false; clearTimeout(timer.current); };
  }, []);

  function moveTo(next) {
    const id = next?.id ?? null;
    if (destination.current === id) return;
    destination.current = id;
    clearTimeout(timer.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFocused(next);
      setPhase('visible');
      return;
    }
    setPhase('sinking');
    timer.current = setTimeout(() => {
      setPhase('hidden');
      setFocused(next);
      timer.current = setTimeout(() => setPhase('visible'), 850);
    }, 230);
  }
  // Prepare the SVG paths once, unless the map data changes.
  const map = useMemo(() => {
    if (!islands.features.length) return null;
    const project = fitProjection(islands.features, WIDTH, HEIGHT);
    const records = mapRecords(islands.features, project);
    return {
      records,
      waterPaths: water.features.map(feature => geometryPath(feature.geometry, project)),
    };
  }, [islands, water]);

  const labels = useMemo(() => map && showLabels ? visibleLabels(map.records, focused?.zoom ?? 1, focused?.id) : [], [map, showLabels, focused, fontReady]);
  if (!map) return <div className="smp-map smp-empty">No map data available.</div>;

  const zoom = focused?.zoom ?? 1;
  const dx = focused?.dx ?? 0;
  const dy = focused?.dy ?? 0;


  function selectIsland(id, bounds) {
    const zoom = Math.min(2048, 0.62 * Math.min(WIDTH / bounds.width, HEIGHT / bounds.height));
    moveTo({
      id, zoom,
      dx: WIDTH / 2 - (bounds.x + bounds.width / 2) * zoom,
      dy: HEIGHT / 2 - (bounds.y + bounds.height / 2) * zoom,
    });
  }
  return (
    <figure className={`smp-map ${presentationOnly ? 'smp-map--presentation' : ''} ${className}`}>
      <svg onClick={event => { if (!event.target.closest("[data-island-id]")) moveTo(null); }}
        onKeyDown={event => { if (event.key === "Escape") moveTo(null); }}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="group" aria-label="Map of the Hochelaga Archipelago">
        {/* Draw the water first, then put the islands on top. */}
        <rect className="smp-context" width={WIDTH} height={HEIGHT} />
        <g className="smp-camera" style={{ transform: `translate(${dx}px, ${dy}px) scale(${zoom})` }}>
          <StylizedWaterLayer paths={map.waterPaths} />
          <StylizedIslandLayer islands={map.records} onSelect={selectIsland} />
        </g>
        <g className={`smp-labels smp-labels--${phase}`} aria-hidden="true">
          {labels.map(island => (
            <foreignObject key={island.id} x={dx + zoom * island.anchor[0] - 160}
              y={dy + zoom * island.anchor[1] - 16} width="320" height="32">
              <div className="smp-island-title">
                {[...island.name].map((letter, i) => (
                  <span key={i} style={{ '--delay': Math.min(i * 9, 90) + 'ms',
                    '--tilt': (i % 2 ? 5 : -5) + 'deg' }}>
                    {letter === ' ' ? '\u00a0' : letter}
                  </span>
                ))}
              </div>
            </foreignObject>
          ))}
        </g>
      </svg>

    </figure>
  );
}
