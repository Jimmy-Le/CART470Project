import { useRef, useState } from 'react';
import App from '../App.jsx';
import IslandList from '../components/IslandList.jsx';
import IslandPreview from '../components/IslandPreview.jsx';
import IslandInformation from '../components/ComponentIslandInformation.jsx';
import ZoomButtons from '../components/ComponentZoomButtons.jsx';
import WaterMap from '../components/water/WaterMap.jsx';

export default function IslandsPage() {
  const map = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [notice, setNotice] = useState('');
  const [activeIsland, setActiveIsland] = useState(null);
  function selectIsland(id, name) {
    setActiveIsland(id);
    if (id === 'i1') {
      setNotice('');
      map.current?.focusIsland();
    } else {
      map.current?.hideName();
      setPreviewOpen(false);
      setNotice(`${name}: this island has not been added to the map yet.`);
    }
  }
  return (
    <main className="water-map-page">
      <App />
      <section className="team-map-stage" aria-label="Archipelago map">
        <WaterMap ref={map} zoom={zoom} onSelect={() => {
          setActiveIsland('i1'); setPreviewOpen(true); setNotice('');
        }} />
        <div className="team-island-list">
          <IslandList activeIsland={activeIsland} onSelect={selectIsland} />
        </div>
        {notice && <p className="team-map-notice" role="status">{notice}</p>}
        {previewOpen && <div className="team-island-preview">
          <IslandPreview onClose={() => setPreviewOpen(false)} />
        </div>}
        <ZoomButtons zoom={zoom} onZoomChange={setZoom} />
      </section>
      <IslandInformation />
    </main>
  );
}
