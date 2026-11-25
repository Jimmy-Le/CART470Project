import defaults from '../components/water/placement/islandPositions.json';
import { makeIslands } from '../components/water/placement/layout.js';
import { useMemo, useRef, useState } from 'react';
import App from '../App.jsx';
import IslandList from '../components/IslandList.jsx';
import IslandPreview from '../components/IslandPreview.jsx';
import IslandInformation from '../components/ComponentIslandInformation.jsx';
import ZoomButtons from '../components/ComponentZoomButtons.jsx';
import WaterMap from '../components/water/WaterMap.jsx';

export default function IslandsPage() {
  const [positions, setPositions] = useState(defaults);
  const islands = useMemo(() => makeIslands(positions), [positions]);
  const map = useRef(null);
  const overviewZoom = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [notice, setNotice] = useState('');
  const [activeIsland, setActiveIsland] = useState(null);
  function updatePositions(next) {
    setPreviewOpen(false);
    overviewZoom.current = null;
    setPositions(next);
    setNotice('');
    setActiveIsland(null);
  }
  function selectIsland(id, name) {
    if (islands.some(island => island.id === id)) {
      setNotice('');
      map.current?.focusIsland(id);
    } else {
      map.current?.hideName();
      setActiveIsland(id);
      setPreviewOpen(false);
      setNotice(`${name}: this island has not been added to the map yet.`);
    }
  }
  return (
    <main className="water-map-page">
      <App />
      <section className="team-map-stage" aria-label="Archipelago map">
        <WaterMap ref={map} zoom={zoom} islands={islands} positions={positions} onPositionsChange={updatePositions} onSelect={id => {
          setActiveIsland(id);
          setPreviewOpen(id === 'i1');
          setNotice('');
          if (id != null) {
            overviewZoom.current ??= zoom;
            setZoom(Math.min(2, overviewZoom.current * 1.45));
          } else if (overviewZoom.current != null) {
            setZoom(overviewZoom.current);
            overviewZoom.current = null;
          }
        }} />
        <div className="team-island-list">
          <IslandList activeIsland={activeIsland} onSelect={selectIsland} />
        </div>
        {notice && <p className="team-map-notice" role="status">{notice}</p>}
        {previewOpen && <div className="team-island-preview">
          <IslandPreview title={islands.find(item => item.id === activeIsland)?.name} onClose={() => map.current?.hideName()} />
        </div>}
        <ZoomButtons zoom={zoom} onZoomChange={setZoom} />
      </section>
      <IslandInformation />
    </main>
  );
}