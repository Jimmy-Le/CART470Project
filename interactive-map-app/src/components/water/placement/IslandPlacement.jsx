import { useCallback, useEffect, useRef, useState } from 'react';
import { islandCatalog } from './islandCatalog.js';
import { checkRoutes, makeIslands, positionAt, worldWidth, worldHeight } from './layout.js';
import './placement.css';

export default function IslandPlacement({ host, engine, positions, onChange, editing }) {
  const [id, select] = useState(islandCatalog[0].id);
  const [armed, arm] = useState(false);
  const [message, report] = useState('');
  const fileInput = useRef(null);

  const apply = useCallback(next => {
    checkRoutes(makeIslands(next), engine.current.getCurrents());
    onChange(next);
  }, [engine, onChange]);

  useEffect(() => {
    if (!armed || editing) return;
    const scene = host.current;
    const world = scene.querySelector('.world');
    const abort = new AbortController();
    const options = { capture: true, signal: abort.signal };
    scene.classList.add('placing-island');
    function click(event) {
      if (event.target.closest('#add')) { arm(false); report(''); }
      if (event.target.closest('.controls')) return;
      event.stopImmediatePropagation();
      const box = world.getBoundingClientRect();
      const x = (event.clientX - box.left) * worldWidth / box.width;
      const y = (event.clientY - box.top) * worldHeight / box.height;
      const others = positions.filter(item => item.id !== id);
      try {
        if (event.target.closest('[data-island]')?.dataset.island === id) {
          apply(others);
          report('Removed ' + id + ' from the map.');
          return;
        }
        const point = positionAt(id, { x, y });
        apply([...others, point]);
        report('Placed ' + id + ' at (' + point.x + ', ' + point.y + '). Click it again to remove.');
      } catch (error) { report(error.message); }
    }
    scene.addEventListener('click', click, options);
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') { arm(false); report('Placement cancelled.'); }
    }, options);
    return () => { abort.abort(); scene.classList.remove('placing-island'); };
  }, [armed, editing, id, positions, host, apply]);

  function save() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(positions, null, 2) + '\n'], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'islandPositions.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function load(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('File exceeds 1 MB.');
      const next = JSON.parse(await file.text());
      apply(next);
      arm(false);
      report('Loaded ' + next.length + ' island positions.');
    } catch (error) { report(error.message); }
  }
  return <div className="island-placement">
    <label>Island <select value={id} onChange={e => { select(e.target.value); arm(!editing); report(''); }}>
      {islandCatalog.map(item => <option key={item.id} value={item.id}>{item.name} ({item.id})</option>)}
    </select></label>
    <button type="button" disabled={editing} aria-pressed={armed} onClick={() => {
      arm(!armed); report(armed ? '' : 'Click water to place or move. Click the selected island to remove it. Esc finishes.');
    }}>{armed ? 'Done editing islands' : 'Edit islands'}</button>
    <button type="button" onClick={save}>Save islands JSON</button>
    <button type="button" disabled={editing} onClick={() => fileInput.current.click()}>Load islands JSON</button>
    <input hidden type="file" accept=".json,application/json" ref={fileInput} onChange={load} />
    <small>Project JSON: <code>interactive-map-app/src/components/water/placement/islandPositions.json</code></small>
    {message && <small role="status">{message}</small>}
  </div>;
}
