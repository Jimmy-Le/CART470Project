import { useId, useMemo, useRef } from 'react';
import defaultIslands from './data/hochelaga-target-islands-filtered.geojson?raw';
import defaultWater from './data/hochelaga-water-preview-v2.geojson?raw';
import defaultLocations from './data/hochelaga-island-locations.json';
import { fitProjection, geometryPath, mapRecords, placeLabels, polygonFeatures } from './mapGeometry.js';
import StylizedWaterLayer from './StylizedWaterLayer.jsx';
import StylizedIslandLayer from './StylizedIslandLayer.jsx';
import useMapCamera from './useMapCamera.js';
import { DECORATION, decorateIsland, organicWashes } from './mapDecoration.js';
import './stylizedMapPreview.css';

const islandData = JSON.parse(defaultIslands);
const waterData = JSON.parse(defaultWater);
const WIDTH = 1400, HEIGHT = 900;
const waterWashes = organicWashes('hochelaga-water-art', [0, 0, WIDTH, HEIGHT], DECORATION.waterPatchCount);

export default function StylizedMapPreview({ islands = islandData, water = waterData,
  locations = defaultLocations, className = '', showLabels = true, textures = true,
  presentationOnly = false }) {
  const uid = useId().replace(/:/g, '');
  const ids = Object.fromEntries(['water', 'clip', 'title', 'description', 'islandClip',
    'waterClip', 'paper']
    .map(name => [name, `smp-${uid}-${name}`]));
  const map = useMemo(() => {
    const features = polygonFeatures(islands);
    const waters = polygonFeatures(water);
    const projection = fitProjection(features.length ? features : waters, WIDTH, HEIGHT);
    if (!projection) return null;
    const records = mapRecords(features, locations, projection.project).map(decorateIsland);
    return { records,
      waterPaths: waters.map(feature => geometryPath(feature.geometry, projection.project)) };
  }, [islands, water, locations]);

  const svg = useRef(null);
  const navigation = useMapCamera(svg, map?.records, WIDTH, HEIGHT);
  const { camera, selectedId } = navigation;
  // Reposition the labels as we zoom so they stay readable.
  const labels = map ? placeLabels(map.records.map(record => ({ ...record,
    anchor: record.anchor?.map((v, i) => v * camera.zoom + (i ? camera.y : camera.x)),
  })).filter(record => record.anchor && record.anchor[0] >= 0 && record.anchor[0] <= WIDTH
    && record.anchor[1] >= 0 && record.anchor[1] <= HEIGHT), WIDTH, HEIGHT) : [];

  if (!map) return <div className={`smp-map smp-empty ${className}`} role="status">No polygon geometry is available for this preview.</div>;
  return <figure className={`smp-map ${presentationOnly ? 'smp-map--presentation' : ''} ${className}`}>
    <div className={`smp-map-toolbar ${presentationOnly ? 'smp-map-toolbar--floating' : ''}`}>
      {!presentationOnly &&
      <span>Scroll to zoom · Drag to explore · Select an island to focus</span>
      }
      <button type="button" onClick={navigation.reset}>Reset View</button>
    </div>
    <svg ref={svg} className={navigation.dragging ? 'smp-dragging' : ''} {...navigation.handlers} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet"
      role="group" aria-labelledby={`${ids.title} ${ids.description}`}>
      <title id={ids.title}>The islands of the Hochelaga Archipelago</title>
      <desc id={ids.description}>A north-up illustrated map using local island and water polygons. Color washes and shoreline bands are artistic decoration, not terrain, vegetation or water-depth data.</desc>
      <defs>
        <clipPath id={ids.waterClip}>
          {map.waterPaths.map((path, index) => <path key={index} d={path} clipRule="evenodd" />)}
        </clipPath>
        {textures && <filter id={ids.paper} x="0" y="0" width={WIDTH} height={HEIGHT}
          filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" seed="17" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>}
        <clipPath id={ids.clip}><rect width={WIDTH} height={HEIGHT} /></clipPath>
      </defs>
      <g clipPath={`url(#${ids.clip})`}>
        <rect className="smp-context" width={WIDTH} height={HEIGHT} />
        <g className="smp-world" transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}>
        <StylizedWaterLayer paths={map.waterPaths} ids={ids} washes={waterWashes} />
        <StylizedIslandLayer islands={map.records} ids={ids} selectedId={selectedId} onFocus={navigation.focusIsland} />
        </g>
        {textures && <rect className="smp-paper-grain smp-decoration" width={WIDTH} height={HEIGHT}
          filter={`url(#${ids.paper})`} aria-hidden="true" />}
        <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`}>
        {showLabels && <g className="smp-labels" aria-hidden="true">
          {labels.map(label => <text key={label.id} x={(label.x - camera.x) / camera.zoom} y={(label.y - camera.y) / camera.zoom}
            data-major={label.labelSize >= 18}
            style={{ fontSize: label.labelSize / camera.zoom, strokeWidth: 1.6 / camera.zoom }}
            textAnchor="middle" dominantBaseline="central">{label.name}</text>)}
        </g>}
        </g>
      </g>
      <g className="smp-compass" transform="translate(1330 60)" aria-hidden="true">
        <text y="-14" textAnchor="middle">N</text>
        <path d="M0 0 L-7 24 L0 19 L7 24 Z" />
        <path d="M0 0 V35" fill="none" />
      </g>
    </svg>
    {!presentationOnly && <><figcaption className="smp-map-caption">
      <span><i className="smp-key-land" />Target islands</span>
      <span><i className="smp-key-water" />Water</span>
      <span><i className="smp-key-context" />Surrounding area</span>
      <span>{map.records.length} island shapes · North up</span>
    </figcaption>
    <p className="smp-art-note">Color washes and shoreline bands are artistic treatments, not vegetation, terrain, or water-depth data.</p></>}
    {presentationOnly && <a className="smp-map-credit" href="https://www.openstreetmap.org/copyright"
      aria-label="Map data copyright OpenStreetMap contributors, ODbL">© OpenStreetMap</a>}
  </figure>;
}
