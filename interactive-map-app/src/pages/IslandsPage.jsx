import { useRef, useState, useEffect } from 'react';
import App from '../App.jsx';
import IslandList from '../components/IslandList.jsx';
import IslandPreview from '../components/IslandPreview.jsx';
import IslandInformation from '../components/ComponentIslandInformation.jsx';
import ZoomButtons from '../components/ComponentZoomButtons.jsx';
import WaterMap from '../components/water/WaterMap.jsx';
import { useDatabase } from '../components/Database.jsx';


const fakeIslands = [{
  _id: "6ae84ac8692686bd35b6aa48",
  identifier: "MontrealADFSDF"
}]


export default function IslandsPage() {
  const map = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [notice, setNotice] = useState('');
  const [activeIsland, setActiveIsland] = useState(null);
  const [selectedIsland, setSelectedIsland] = useState(fakeIslands[0]);
  const data = useDatabase();




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
          <IslandList islands={data.islands} activeIslandID={activeIsland} onSelect={selectIsland} />
        </div>
        {notice && <p className="team-map-notice" role="status">{notice}</p>}
        {previewOpen && <div className="team-island-preview">
          <IslandPreview island={selectedIsland} onClose={() => setPreviewOpen(false)} />
        </div>}
        <ZoomButtons zoom={zoom} onZoomChange={setZoom} />
      </section>
      <IslandInformation />
    </main>
  );
}
