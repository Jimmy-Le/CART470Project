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
  const [arrival, setArrival] = useState('quiet');
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
    let displayed;
    let previousTime;
    let smooth = false;
    let idle = false;
    let labelNodes;
    function commit() {
      if (!gestureCamera.current || frame || !idle) return;
      setFocused(gestureCamera.current);
      setPhase('visible');
      svg.classList.remove('smp-zooming');
    }
    function draw(time) {
      frame = 0;
      inverse = null;
      const goal = gestureCamera.current;
      if (!goal) return;
      const dt = previousTime == null ? 16 : time - previousTime;
      previousTime = time;
      const weight = smooth ? -Math.expm1(-dt / 42) : 1;
      const moving = weight < 1 && (
        Math.abs(goal.zoom / displayed.zoom - 1) > .0001 ||
        Math.abs(goal.dx - displayed.dx) > .1 || Math.abs(goal.dy - displayed.dy) > .1
      );
      const blend = moving ? weight : 1;
      const zoom = displayed.zoom + (goal.zoom - displayed.zoom) * blend;
      const dx = displayed.dx + (goal.dx - displayed.dx) * blend;
      const dy = displayed.dy + (goal.dy - displayed.dy) * blend;
      cameraRef.current.style.transform = `translate(${dx}px, ${dy}px) scale(${zoom})`;
      if (zoom !== displayed.zoom || !labelNodes) {
        labelNodes ??= svg.querySelectorAll('[data-label-scale]');
        for (const label of labelNodes) {
          const size = label.dataset.selected ? titleScale(zoom, focusZoom.current) : 1;
          label.setAttribute('transform', `scale(${size / zoom})`);
        }
      }
      displayed = {zoom, dx, dy};
      if (moving) frame = requestAnimationFrame(draw);
      else commit();
    }
    function zoomAt(from, to, factor, easeWheel = false) {
      clearTimeout(timer.current);
      if (!svg.classList.contains("smp-zooming")) finishReturn();
      let prev = gestureCamera.current;
      if (!prev) {
        const matrix = new DOMMatrix(getComputedStyle(cameraRef.current).transform);
        prev = { zoom: matrix.a, dx: matrix.e, dy: matrix.f };
      }
      if (!svg.classList.contains('smp-zooming') || !displayed) {
        displayed = prev;
        previousTime = null;
        labelNodes = null;
      }
      idle = false;
      smooth = easeWheel && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const zoom = Math.max(1, Math.min(2048, prev.zoom * factor));
      const ratio = zoom / prev.zoom;
      const camera = {
        id: destination.current, manual: true, zoom,
        dx: Math.max(WIDTH * (.7 - zoom), Math.min(WIDTH * .3, to.x - (from.x - prev.dx) * ratio)),
        dy: Math.max(HEIGHT * (.7 - zoom), Math.min(HEIGHT * .3, to.y - (from.y - prev.dy) * ratio)),
      };
      gestureCamera.current = camera;
      svg.classList.add('smp-zooming');
      if (!frame) frame = requestAnimationFrame(draw);
      clearTimeout(settle);
      settle = setTimeout(() => {
        idle = true;
        commit();
      }, 120);
    }
    function wheel(e) {
      if (!frame) inverse = null;
      e.preventDefault();
      const anchor = point(e.clientX, e.clientY);
      const pixels = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? svg.clientHeight : 1);
      zoomAt(anchor, anchor, Math.exp(-pixels * (e.ctrlKey ? .012 : .002)), true);
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
    const current = new DOMMatrix(getComputedStyle(cameraRef.current).transform);
    const target = next ?? { zoom: 1, dx: 0, dy: 0 };
    const ratio = target.zoom / current.a;
    const shiftX = (WIDTH / 2 - current.e) * ratio + target.dx - WIDTH / 2;
    const shiftY = (HEIGHT / 2 - current.f) * ratio + target.dy - HEIGHT / 2;
    const nearby = Math.abs(Math.log2(ratio)) < .22 &&
      Math.hypot(shiftX / WIDTH, shiftY / HEIGHT) < .10;
    const gentleFocus = nearby && id === 'montreal';
    const quiet = nearby && !gentleFocus;
    if (gentleFocus) next = { ...next, gentleFocus: true };
    setArrival(quiet ? 'quiet' : !next || ratio < .8 ? 'overview' : 'island');
    if (gestureCamera.current) setFocused(gestureCamera.current);
    svgRef.current?.classList.remove('smp-zooming');
    gestureCamera.current = null;
    finishReturn();
    destination.current = id;
    clearTimeout(timer.current);
    if (quiet && next) {
      focusZoom.current = current.a;
      setFocused({ ...next, zoom: current.a, dx: current.e, dy: current.f });
      setPhase('visible');
      return;
    }
    if (quiet || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
  const feature = folioOpen && islands.features.find(f => f.properties.projectIslandId === focused?.id);
  const plate = useMemo(() => {
    if (!feature) return null;
    const project = fitProjection([feature], 340, 220, 77);
    const { referenceLon: lon, referenceLat: lat } = feature.properties;
    const origin = project([lon, lat]);
    // One thousandth of a degree of latitude is approximately 111.2 metres.
    const unitsPerMetre = Math.abs(project([lon, lat + .001])[1] - origin[1]) / 111.2;
    const maxMetres = 74 / unitsPerMetre;
    const decade = 10 ** Math.floor(Math.log10(maxMetres));
    const metres = [5, 2, 1].map(n => n * decade).find(n => n <= maxMetres);
    const scaleWidth = metres * unitsPerMetre;
    const neighbours = islands.features.filter(other => other !== feature).flatMap(other => {
      const { referenceLon, referenceLat, projectName } = other.properties;
      if (!projectName || !Number.isFinite(referenceLon) || !Number.isFinite(referenceLat)) return [];
      const [x, y] = project([referenceLon, referenceLat]);
      const outside = x < 2 || x > 338 || y < 2 || y > 218;
      const outline = other.geometry.type === 'Polygon' ? other.geometry.coordinates[0] : other.geometry.coordinates[0][0];
      const points = outline.map(project);
      const xx = points.reduce((a,p) => a+(p[0]-x)**2,0);
      const yy = points.reduce((a,p) => a+(p[1]-y)**2,0);
      const xy = points.reduce((a,p) => a+(p[0]-x)*(p[1]-y),0);
      const tilt = Math.max(-10,Math.min(10,Math.atan2(2*xy,xx-yy)*90/Math.PI));
      return [{name:projectName, x, y, tilt, outside, distance:Math.hypot(x-origin[0], y-origin[1])}];
    }).sort((a,b) => a.distance-b.distance);
    const occupied = [[3,3,78,76],[223,183,339,218],[115,70,225,150]];
    if (feature.properties.projectIslandId === 'deslauriers') occupied.push([12,156,90,211]);
    const chartLabels = [];
    for (const candidate of neighbours) {
      if (candidate.outside) continue;
      const half = candidate.name.length * 3.7 + 4;
      for (const offset of [0,-12,13]) {
        const x = candidate.x, y = candidate.y + offset;
        const box = [x-half,y-17,x+half,y+9];
        if (box[0]<5 || box[1]<5 || box[2]>335 || box[3]>215) continue;
        if (occupied.some(([l,t,r,b]) => box[0]<r && box[2]>l && box[1]<b && box[3]>t)) continue;
        occupied.push(box);
        chartLabels.push({...candidate,y});
        break;
      }
      if (chartLabels.length === 3) break;
    }
    const neighbour = chartLabels[0] ?? neighbours.find(n => n.outside);
    let bearing;
    if (neighbour?.outside) {
      const dx = neighbour.x-origin[0], dy = neighbour.y-origin[1];
      const t = Math.min((dx>0 ? 315-origin[0] : 25-origin[0])/dx || Infinity,
                         (dy>0 ? 178-origin[1] : 23-origin[1])/dy || Infinity);
      bearing = { x: origin[0]+dx*t, y: origin[1]+dy*t, angle:Math.atan2(dy,dx)*180/Math.PI };
    }
    const waves = [], marks = [];
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    for (const polygon of polygons) {
      const ring = polygon[0].map(project);
      let travelled = 0, next = 3, count = 0;
      for (let i=1; i<ring.length; i++) {
        const [x,y] = ring[i-1], dx=ring[i][0]-x, dy=ring[i][1]-y;
        const length = Math.hypot(dx,dy);
        while (next < travelled+length) {
          const t=(next-travelled)/length, px=x+t*dx, py=y+t*dy;
          if (px>170) marks.push(`M${px} ${py}l3 2`);
          if (++count%5===0) {
            const offset=px>170 ? 7 : -13;
            waves.push(`M${px+offset} ${py}q2 -1.8 4 0t4 0m-6 2.5q2 -1 4 0`);
          }
          next+=3.1;
        }
        travelled+=length;
      }
    }
    return {
      metres, scaleWidth, chartLabels, neighbour, bearing, waves:waves.join(''), marks:marks.join(''),
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
        }} className="smp-camera" style={{ transition: focused?.manual ? "none" : undefined, transitionDuration: focused?.gentleFocus ? "320ms" : undefined, transform: `translate(${dx}px, ${dy}px) scale(${zoom})` }}>
          <StylizedWaterLayer paths={map.waterPaths} />
          <StylizedIslandLayer islands={map.records} onSelect={selectIsland} />
          {previousMap && <g className="smp-outline-blend" aria-hidden="true" pointerEvents="none"
            onAnimationEnd={event => { if (event.target === event.currentTarget) finishReturn(); }}>
            <rect className="smp-context" width={WIDTH} height={HEIGHT} />
            <StylizedWaterLayer paths={previousMap.waterPaths} />
            {previousMap.records.map(island => <path key={island.id} d={island.path}
              fillRule="evenodd" className="smp-land" style={{pointerEvents:'none'}} vectorEffect="non-scaling-stroke" />)}
          </g>}
        <g className={`smp-labels smp-labels--${phase} smp-arrival-${arrival}`} aria-hidden="true">
          {labels.map(island => <g key={island.id} transform={`translate(${island.anchor[0]} ${island.anchor[1]})`}>
            <g data-label-scale="" data-selected={island.id === focused?.id || undefined}
              transform={`scale(${(island.id === focused?.id ? titleScale(zoom, focusZoom.current) : 1) / zoom})`}>
            {island.id !== focused?.id || arrival !== 'island' ? (
            <text className={'smp-overview-name' + (island.id === focused?.id ? ' smp-chosen' : '')} key={island.id}
              x="0" y="0"
              textAnchor="middle" dominantBaseline="central">{island.name}</text>
          ) : (
            <foreignObject key={island.id} x="-300"
              y="-45" width="600" height="90">
              <div className={"smp-island-title" + (island.id === focused?.id ? " selected" : " smp-neighbour")}>
                {[...island.name].map((letter, i) => (
                  <span key={i} style={{ '--delay': i === 0 ? "0ms" : Math.round(240 * Math.abs(Math.sin(i * 17.91 + island.name.length))) + 'ms',
                    '--arch': (-.35 * Math.sin(i / Math.max(1, island.name.length - 1) * Math.PI) + .06 * Math.sin(i * 1.73)) + 'em',
                    '--tilt': (-6 * Math.cos(i / Math.max(1, island.name.length - 1) * Math.PI) + 3 * Math.sin(i * 3.46)) + 'deg' }}>
                    {letter === ' ' ? '\u00a0' : letter}
                  </span>
                ))}
              </div>
            </foreignObject>
          )}</g></g>)}
        </g>
        </g>
      </svg>

      {focused?.id && phase === 'visible' && !folioOpen &&
        <button type="button" ref={exploreRef} className="smp-explore" onClick={() => setFolioOpen(true)}>
          Explorer l’île <span aria-hidden="true">↗</span>
        </button>}
      {feature && <aside className="smp-folio" aria-labelledby="smp-folio-title" lang="fr">
        <div className="smp-folio-top"><i>Archipel d’Hochelaga</i>
          <button type="button" ref={closeRef} onClick={closeFolio}>Fermer ×</button></div>
        <h2 id="smp-folio-title">{feature.properties.projectName}</h2>
        {feature.properties.projectIslandId === 'deslauriers' && <i lang="en">Seagull Island</i>}
        <svg viewBox="0 0 340 220" role="img" aria-label={`Carte de ${feature.properties.projectName}`}>
          <defs><pattern id="smp-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
            <rect width="5" height="5" fill="#c3bd91"/><path d="M0 0V5" stroke="#696949" strokeWidth=".9"/>
          </pattern></defs>
          <rect x="2" y="2" width="336" height="216" fill="#e7dcc0" stroke="#a49b78"/>
          <svg x="3" y="3" width="334" height="214" viewBox="3 3 334 214" overflow="hidden">
            <path d={plate.water} fill="#dadcc8" fillRule="evenodd" stroke="#a5ad96" strokeWidth=".65"/>
            <path d={plate.land} fill="#dfd5b6" stroke="#939779" strokeWidth=".8"/>
          </svg>
          <g stroke="#8b7259" strokeWidth=".6" opacity=".14">
            {[0,22.5,45,67.5,90,112.5,135,157.5].map(a =>
              <path key={a} d="M-450 0H450" transform={`translate(50 48) rotate(${a})`}/>)}
          </g>
          <path d="M3 3H337" stroke="#984b3c" strokeWidth="1.4"/>
          <path d={plate.marks} fill="none" stroke="#6e6954" strokeWidth=".65"/>
          <g clipPath="url(#smp-water-clip)" fill="none" stroke="#969b83" opacity=".57">
            <path d={plate.land} transform="translate(1.6 1.3)" strokeDasharray="6 2 2 5" strokeWidth=".65"/>
            <path d={plate.land} transform="translate(3 2.8)" strokeDasharray="4 12 7 16" strokeWidth=".45"/>
          </g>
          <path d={plate.waves} fill="none" stroke="#748174" strokeWidth=".55" clipPath="url(#smp-water-clip)"/>
          <defs><clipPath id="smp-water-clip"><path d={plate.water} clipRule="evenodd"/></clipPath></defs>
          {feature.properties.projectIslandId === 'deslauriers' &&
          <g transform="translate(25 172)" fill="#f3ead2" stroke="#615c49" strokeWidth="1" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 14Q15 12 22 11Q34 9 42 4Q46 0 50 3L57 6L50 7Q47 16 36 19Q25 22 12 16L4 18Z"/>
            <path d="M9 14Q25 9 40 9Q30 17 20 16ZM14 14L29 12M18 15L31 13M30 20L29 25L24 26M35 20L34 24L38 25" fill="none"/>
            <circle cx="48" cy="4" r=".8"/><path d="M53 5L53 6.5"/>
            <path d="M17 28q5 -2 10 0t10 0m-14 3q4 -1.5 9 0M23 14l5-2m0 2 5-2" fill="none" strokeWidth=".6"/>
          </g>}
          <path d={coast} fill="url(#smp-hatch)" stroke="#4a513d" strokeWidth="1.6"/>
          <g transform="translate(50 48) scale(.8)" fill="#884d37" stroke="#884d37" strokeWidth=".7">
            <circle r="14" fill="#eee4c9"/>
            {[0,90,180,270].map(a => <g key={a} transform={`rotate(${a})`}>
              <path d="M0 -22L4 0H0Z"/><path d="M0 -22L-4 0H0Z" fill="#eee4c9"/></g>)}
            <text y="-26" textAnchor="middle" stroke="none" fontSize="11">N</text>
          </g>
          {plate.bearing && <g transform={`translate(${plate.bearing.x} ${plate.bearing.y})`}>
            <path d="M-5 0H6l-3 -2m3 2-3 2" transform={`rotate(${plate.bearing.angle})`} fill="none" stroke="#774d37"/>
            <text className="smp-script" x={plate.bearing.x>170?-9:9} y="4" textAnchor={plate.bearing.x>170?'end':'start'}>Vers {plate.neighbour.name}</text>
          </g>}
          {plate.chartLabels.map(label => <text key={label.name + label.x} className="smp-script"
            transform={`rotate(${label.tilt / 2} ${label.x} ${label.y})`}
            x={label.x} y={label.y} textAnchor="middle">{label.name}</text>)}
          {Number.isFinite(plate.scaleWidth) && <g transform={`translate(${326-plate.scaleWidth} 201)`}
            fill="#67523d" stroke="#67523d" strokeWidth=".75">
            <rect width={plate.scaleWidth} height="3" fill="#eee4ca"/>
            {[0,2].map(i => <rect key={i} x={i*plate.scaleWidth/4} width={plate.scaleWidth/4} height="3"/>)}
            <path d={`M0 -3v8 M${plate.scaleWidth} -3v8`}/>
            <text x={plate.scaleWidth} y="-5" textAnchor="end" fontFamily="Georgia, serif" fontSize="9" stroke="none">
              {plate.metres >= 1000 ? plate.metres/1000 + ' km' : plate.metres + ' m'}
            </text>
          </g>}
        </svg>
        <div className="smp-coordinates">{[feature.properties.referenceLat,feature.properties.referenceLon].map((v,i) => Number.isFinite(v) ? Math.abs(v).toFixed(4).replace('.',',')+'° '+(i ? (v<0?'O':'E') : (v<0?'S':'N')) : '').filter(Boolean).join(' · ')}</div>
        {feature.properties.projectIslandId === 'deslauriers' && <p className="smp-folio-copy">À l’est de Montréal, l’île Deslauriers se trouve dans le fleuve Saint-Laurent. Les goélands à bec cerclé y viennent nicher.</p>}
      </aside>}
    </figure>
  );
}
