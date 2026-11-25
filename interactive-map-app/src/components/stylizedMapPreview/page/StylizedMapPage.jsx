import { Link } from 'react-router-dom';
import StylizedMapPreview from "../StylizedMapPreview.jsx";

// Set false to restore the title, instructions, legend and footer for development.
const PRESENTATION_ONLY = true;

export default function StylizedMapPage() {
  return <main className={`smp-page ${PRESENTATION_ONLY ? 'smp-page--presentation' : ''}`}>
    {!PRESENTATION_ONLY && <header className="smp-page-header">
      <div><p className="smp-subtitle">Hochelaga Archipelago</p>
        <h1>An atlas of islands</h1>
        <p>Land, water, and the shapes of a shared landscape.</p></div>
      <Link to="/">Back to the main map</Link>
    </header>}
    <StylizedMapPreview presentationOnly={PRESENTATION_ONLY} />
    {!PRESENTATION_ONLY && <footer className="smp-page-footer">
      <p>Visual study using local geographic outlines. Small islands remain at their true relative scale. Some source matches are provisional.</p>
      <p>Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, ODbL. Island references: supplied official toponym records.</p>
    </footer>}
  </main>;
}
