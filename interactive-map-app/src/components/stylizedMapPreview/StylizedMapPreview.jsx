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

function titleScale(zoom, baseline) {
  return Math.max(.32, Math.min(1.8, (zoom / baseline) ** .45));
}

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
  const [folioOpen, setFolioOpen] = useState(false);
  const exploreRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => {
    if (folioOpen) closeRef.current?.focus({preventScroll:true});
  }, [folioOpen]);
  function closeFolio() {
    setFolioOpen(false);
    requestAnimationFrame(() => exploreRef.current?.focus({preventScroll:true}));
  }
  const [focused, setFocused] = useState(null);
  const [phase, setPhase] = useState('visible');
  const [fontReady, setFontReady] = useState(false);
  const timer = useRef(null);
  const [returnDetail, setReturnDetail] = useState(null);
  const [fadeOutline, setFadeOutline] = useState(false);
  const detailRef = useRef(.5);
  function finishReturn() {
    setReturnDetail(null);
    setFadeOutline(false);
  }
  const destination = useRef(null);
  useEffect(() => {
    let active = true;
    document.fonts.load('15px "IM Fell English"').then(() => {
      if (active) setFontReady(true);
    }).catch(() => {});
    return () => { active = false; clearTimeout(timer.current); };
  }, []);

  const svgRef = useRef(null);
  const cameraRef = useRef(null);
  const focusZoom = useRef(1);
  useEffect(() => {
    if (phase !== 'hidden') return;
    let current = true;
    const frame = requestAnimationFrame(() => {
      const motion = cameraRef.current?.getAnimations()
        .find(animation => animation.transitionProperty === 'transform');
      const reveal = () => { if (current) setPhase('visible'); };
      if (motion) motion.finished.then(reveal, reveal);
      else reveal();
    });
    return () => { current = false; cancelAnimationFrame(frame); };
  }, [phase, focused]);
  const gestureCamera = useRef(null);
  const blockClick = useRef(0);
  const hasMap = Boolean(islands.features.length);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const touches = new Map();
    let frame = 0;
    let settle;
    let inverse;
    function point(x, y) {
      inverse ??= svg.getScreenCTM().inverse();
      return new DOMPoint(x, y).matrixTransform(inverse);
    }
    function zoomAt(from, to, factor) {
      clearTimeout(timer.current);
      if (!svg.classList.contains("smp-zooming")) finishReturn();
      let prev = gestureCamera.current;
      if (!prev) {
        const matrix = new DOMMatrix(getComputedStyle(cameraRef.current).transform);
        prev = { zoom: matrix.a, dx: matrix.e, dy: matrix.f };
      }
      const zoom = Math.max(1, Math.min(2048, prev.zoom * factor));
      const ratio = zoom / prev.zoom;
      const camera = {
        id: destination.current, manual: true, zoom,
        dx: Math.max(WIDTH * (.7 - zoom), Math.min(WIDTH * .3, to.x - (from.x - prev.dx) * ratio)),
        dy: Math.max(HEIGHT * (.7 - zoom), Math.min(HEIGHT * .3, to.y - (from.y - prev.dy) * ratio)),
      };
      gestureCamera.current = camera;
      svg.classList.add('smp-zooming');
      if (!frame) frame = requestAnimationFrame(() => {
        inverse = null;
        frame = 0;
        const latest = gestureCamera.current;
        if (latest) cameraRef.current.style.transform = `translate(${latest.dx}px, ${latest.dy}px) scale(${latest.zoom})`;
        if (!latest) return;
        for (const label of svg.querySelectorAll('[data-label-x]')) {
          const x = latest.dx + latest.zoom * Number(label.dataset.labelX);
          const y = latest.dy + latest.zoom * Number(label.dataset.labelY);
          label.setAttribute('transform', label.dataset.selected
            ? `translate(${x} ${y}) scale(${titleScale(latest.zoom, focusZoom.current)})`
            : `translate(${x} ${y})`);
        }
      });
      clearTimeout(settle);
      settle = setTimeout(() => {
        if (!gestureCamera.current) return;
        setFocused(gestureCamera.current);
        setPhase('visible');
        svg.classList.remove('smp-zooming');
      }, 120);
    }
    function wheel(e) {
      if (!frame) inverse = null;
      e.preventDefault();
      const anchor = point(e.clientX, e.clientY);
      const pixels = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? svg.clientHeight : 1);
      zoomAt(anchor, anchor, Math.exp(-pixels * (e.ctrlKey ? .012 : .002)));
    }
    function pair() {
      const [a,b] = touches.values();
      return { center: point((a.x+b.x)/2, (a.y+b.y)/2), span: Math.hypot(a.x-b.x,a.y-b.y) };
    }
    let dragging = false;
    function down(e) {
      inverse = null;
      if (e.button !== 0 || touches.size >= 2) return;
      if (!touches.size) blockClick.current = 0;
      touches.set(e.pointerId, {x:e.clientX, y:e.clientY});
      if (touches.size === 2) {
        dragging = true;
        for (const id of touches.keys()) svg.setPointerCapture(id);
        blockClick.current = Infinity;
      }
    }
    function move(e) {
      const previous = touches.get(e.pointerId);
      if (!previous) return;
      const next = {x:e.clientX, y:e.clientY};
      if (!dragging) {
        if (Math.hypot(next.x - previous.x, next.y - previous.y) < 6) return;
        dragging = true;
        svg.setPointerCapture(e.pointerId);
        blockClick.current = Infinity;
      }
      const before = touches.size === 2 && pair();
      touches.set(e.pointerId, next);
      if (before) {
        const after = pair();
        if (before.span && after.span) zoomAt(before.center, after.center, after.span / before.span);
      } else {
        zoomAt(point(previous.x, previous.y), point(next.x, next.y), 1);
      }
    }
    function up(e) {
      if (!touches.delete(e.pointerId)) return;
      if (!touches.size && dragging) {
        dragging = false;
        blockClick.current = performance.now() + 300;
      }
    }
    svg.addEventListener('wheel', wheel, {passive:false});
    svg.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      svg.removeEventListener('wheel', wheel);
      svg.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [hasMap]);

  function moveTo(next) {
    setFolioOpen(false);
    const id = next?.id ?? null;
    if (destination.current === id && !gestureCamera.current && !next) return;
    if (gestureCamera.current) setFocused(gestureCamera.current);
    svgRef.current?.classList.remove('smp-zooming');
    gestureCamera.current = null;
    finishReturn();
    destination.current = id;
    clearTimeout(timer.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFocused(next);
      setPhase('visible');
      return;
    }
    setPhase('sinking');
    timer.current = setTimeout(() => {
      if (!next && detailRef.current < .5) setReturnDetail(detailRef.current);
      setPhase('hidden');
      setFocused(next);
    }, 100);
  }
  const zoomLevel = focused?.zoom ?? 1;
  const detail = zoomLevel <= 2 ? .5 : zoomLevel <= 8 ? .125 : zoomLevel <= 32 ? .03 : 0;
  const geometryAt = useMemo(() => {
    if (!islands.features.length) return () => null;
    const project = fitProjection(islands.features, WIDTH, HEIGHT);
    const cache = new Map();
    return tolerance => {
      if (!cache.has(tolerance)) {
        cache.set(tolerance, {
          records: mapRecords(islands.features, project, tolerance),
          waterPaths: water.features.map(f => geometryPath(f.geometry, project, tolerance)),
        });
      }
      return cache.get(tolerance);
    };
  }, [islands, water]);
  const renderedDetail = returnDetail !== null && !fadeOutline ? returnDetail : detail;
  detailRef.current = renderedDetail;
  const map = geometryAt(renderedDetail);
  const previousMap = fadeOutline && returnDetail !== null ? geometryAt(returnDetail) : null;

  const labels = useMemo(() => map && showLabels ? visibleLabels(map.records, focused?.zoom ?? 1, focused?.id) : [], [map, showLabels, focused, fontReady]);
  const feature = folioOpen && islands.features.find(f => f.properties.projectIslandId === 'deslauriers');
  const plate = useMemo(() => {
    if (!feature) return null;
    const project = fitProjection([feature], 340, 220, 77);
    return {
      coast: geometryPath(feature.geometry, project),
      water: water.features.map(f => geometryPath(f.geometry, project, .8)).join(''),
      land: islands.features.filter(f => f !== feature).map(f => geometryPath(f.geometry, project, .8)).join('')
    };
  }, [feature, islands, water]);
  const coast = plate?.coast;
  if (!map) return <div className="smp-map smp-empty">No map data available.</div>;

  const zoom = focused?.zoom ?? 1;
  const dx = focused?.dx ?? 0;
  const dy = focused?.dy ?? 0;


  function selectIsland(id, bounds) {
    const zoom = Math.min(2048, 0.62 * Math.min(WIDTH / bounds.width, HEIGHT / bounds.height));
    focusZoom.current = zoom;
    moveTo({
      id, zoom,
      dx: WIDTH / 2 - (bounds.x + bounds.width / 2) * zoom,
      dy: HEIGHT / 2 - (bounds.y + bounds.height / 2) * zoom,
    });
  }
  return (
    <figure onKeyDownCapture={e => {
      if (e.key === 'Escape' && folioOpen) { e.stopPropagation(); closeFolio(); }
    }} className={`smp-map ${folioOpen ? 'smp-reading' : ''} ${presentationOnly ? 'smp-map--presentation' : ''} ${className}`}>
      <svg ref={svgRef} onClickCapture={e => { if (performance.now() < blockClick.current) e.stopPropagation(); }} onClick={event => { if (!event.target.closest("[data-island-id]")) moveTo(null); }}
        onKeyDown={event => { if (event.key === "Escape") moveTo(null); }}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="group" aria-label="Map of the Hochelaga Archipelago">
        {/* Draw the water first, then put the islands on top. */}
        <rect className="smp-context" width={WIDTH} height={HEIGHT} />
        <g ref={cameraRef} onTransitionEnd={event => {
          if (returnDetail !== null && event.target === event.currentTarget && event.propertyName === 'transform') setFadeOutline(true);
        }} className="smp-camera" style={{ transition: focused?.manual ? "none" : undefined, transform: `translate(${dx}px, ${dy}px) scale(${zoom})` }}>
          <StylizedWaterLayer paths={map.waterPaths} />
          <StylizedIslandLayer islands={map.records} onSelect={selectIsland} />
          {previousMap && <g className="smp-outline-blend" aria-hidden="true" pointerEvents="none"
            onAnimationEnd={event => { if (event.target === event.currentTarget) finishReturn(); }}>
            <rect className="smp-context" width={WIDTH} height={HEIGHT} />
            <StylizedWaterLayer paths={previousMap.waterPaths} />
            {previousMap.records.map(island => <path key={island.id} d={island.path}
              fillRule="evenodd" className="smp-land" style={{pointerEvents:'none'}} vectorEffect="non-scaling-stroke" />)}
          </g>}
        </g>
        <g className={`smp-labels smp-labels--${phase}`} aria-hidden="true">
          {labels.map(island => <g key={island.id} data-label-x={island.anchor[0]} data-label-y={island.anchor[1]}
            data-selected={island.id === focused?.id || undefined}
            transform={`translate(${dx + zoom*island.anchor[0]} ${dy + zoom*island.anchor[1]}) scale(${island.id === focused?.id ? titleScale(zoom, focusZoom.current) : 1})`}>
            {island.id !== focused?.id ? (
            <text className="smp-overview-name" key={island.id}
              x="0" y="0"
              textAnchor="middle" dominantBaseline="central">{island.name}</text>
          ) : (
            <foreignObject key={island.id} x="-300"
              y="-45" width="600" height="90">
              <div className={"smp-island-title" + (island.id === focused?.id ? " selected" : "")}>
                {[...island.name].map((letter, i) => (
                  <span key={i} style={{ '--delay': i === 0 ? "0ms" : Math.round(240 * Math.abs(Math.sin(i * 17.91 + island.name.length))) + 'ms',
                    '--arch': (-.35 * Math.sin(i / Math.max(1, island.name.length - 1) * Math.PI) + .06 * Math.sin(i * 1.73)) + 'em',
                    '--tilt': (-6 * Math.cos(i / Math.max(1, island.name.length - 1) * Math.PI) + 3 * Math.sin(i * 3.46)) + 'deg' }}>
                    {letter === ' ' ? '\u00a0' : letter}
                  </span>
                ))}
              </div>
            </foreignObject>
          )}</g>)}
        </g>
      </svg>

      {focused?.id === 'deslauriers' && phase === 'visible' && !folioOpen &&
        <button type="button" ref={exploreRef} className="smp-explore" onClick={() => setFolioOpen(true)}>
          Explorer l’île <span aria-hidden="true">↗</span>
        </button>}
      {feature && <aside className="smp-folio" aria-labelledby="smp-folio-title" lang="fr">
        <div className="smp-folio-top"><i>Archipel d’Hochelaga</i>
          <button type="button" ref={closeRef} onClick={closeFolio}>Fermer ×</button></div>
        <h2 id="smp-folio-title">Île Deslauriers</h2>
        <i lang="en">Seagull Island</i>
        <svg viewBox="0 0 340 220" role="img" aria-label="Contour de l’île Deslauriers et rose des vents">
          <defs><pattern id="smp-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
            <rect width="5" height="5" fill="#c3bd91"/><path d="M0 0V5" stroke="#696949" strokeWidth=".9"/>
          </pattern></defs>
          <rect x="2" y="2" width="336" height="216" fill="#e7dcc0" stroke="#a49b78"/>
          <svg x="3" y="3" width="334" height="214" viewBox="3 3 334 214" overflow="hidden">
            <path d={plate.water} fill="#cbd6c5" fillRule="evenodd" stroke="#a5ad96" strokeWidth=".65"/>
            <path d={plate.land} fill="#dfd5b6" stroke="#939779" strokeWidth=".8"/>
          </svg>
          <g stroke="#8b7259" strokeWidth=".6" opacity=".20">
            {[0,22.5,45,67.5,90,112.5,135,157.5].map(a =>
              <path key={a} d="M-450 0H450" transform={`translate(50 48) rotate(${a})`}/>)}
          </g>
          <g fill="none" strokeLinejoin="round">
            <path d={coast} stroke="#b8baa1" strokeWidth="12"/>
            <path d={coast} stroke="#e7dcc0" strokeWidth="10"/>
            <path d={coast} stroke="#b4b397" strokeWidth="6"/>
            <path d={coast} stroke="#e7dcc0" strokeWidth="4"/>
          </g>
          <g transform="translate(25 172)" fill="#f3ead2" stroke="#615c49" strokeWidth="1" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 14Q15 12 22 11Q34 9 42 4Q46 0 50 3L57 6L50 7Q47 16 36 19Q25 22 12 16L4 18Z"/>
            <path d="M9 14Q25 9 40 9Q30 17 20 16ZM14 14L29 12M18 15L31 13M30 20L29 25L24 26M35 20L34 24L38 25" fill="none"/>
            <circle cx="48" cy="4" r=".8"/><path d="M53 5L53 6.5"/>
          </g>
          <path d={coast} fill="url(#smp-hatch)" stroke="#4a513d" strokeWidth="1.6"/>
          <g transform="translate(50 48) scale(.8)" fill="#884d37" stroke="#884d37" strokeWidth=".7">
            <circle r="14" fill="#eee4c9"/>
            {[0,90,180,270].map(a => <g key={a} transform={`rotate(${a})`}>
              <path d="M0 -22L4 0H0Z"/><path d="M0 -22L-4 0H0Z" fill="#eee4c9"/></g>)}
            <text y="-26" textAnchor="middle" stroke="none" fontSize="11">N</text>
          </g>
        </svg>
        <div className="smp-coordinates">45,7124° N · 73,4414° O</div>
        <p className="smp-folio-copy">À l’est de Montréal, l’île Deslauriers se trouve dans le fleuve Saint-Laurent. Les goélands à bec cerclé y viennent nicher.</p>
      </aside>}
    </figure>
  );
}
