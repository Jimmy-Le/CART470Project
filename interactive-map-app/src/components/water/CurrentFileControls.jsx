import { useRef, useState } from 'react';

function parseFile(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('Expected a JSON array of currents.');
  if (data.length > 40) throw new Error('Maximum 40 currents per file.');
  const ids = new Set();
  for (const r of data) {
    if (!r || !Number.isSafeInteger(r.id) || r.id < 0 || ids.has(r.id)) throw new Error('Each current needs a unique non-negative integer id.');
    ids.add(r.id);
    for (const p of [r.a, r.b]) {
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x > 1200 || p.y < 0 || p.y > 800) throw new Error('Invalid endpoint coordinates.');
    }
    for (const [key, min, max] of [['speed',0,150],['width',20,180],['strength',0,2]]) {
      if (!Number.isFinite(r[key]) || r[key] < min || r[key] > max) throw new Error(`Invalid ${key}: expected ${min}–${max}.`);
    }
  }
  return data;
}

export default function CurrentFileControls({ actions }) {
  const input = useRef(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  function save() {
    const blob = new Blob([JSON.stringify(actions.getCurrents(), null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'currents.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('JSON downloaded. Share this file to load the same currents.');
  }
  async function load(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setLoading(true);
    try {
      if (file.size > 1024 * 1024) throw new Error('File must be smaller than 1 MB.');
      const records = parseFile(await file.text());
      const count = actions.importCurrents(records);
      setMessage(`Loaded ${count} currents.${count < records.length ? ` Skipped ${records.length - count} routes blocked by the map.` : ''} Save JSON and replace the project file to share these changes.`);
    } catch (error) { setMessage(`Could not load JSON: ${error.message}`); }
    finally { setLoading(false); }
  }
  return <div className="current-file-controls">
    <div className="toolbar">
      <button type="button" onClick={save} disabled={loading}>Save JSON</button>
      <button type="button" onClick={() => input.current.click()} disabled={loading}>{loading ? 'Loading…' : 'Load JSON'}</button>
      <input ref={input} type="file" accept=".json,application/json" hidden onChange={load} />
    </div>
    <p role="status">{message || 'Project defaults: data/currents.json. Save JSON and replace that file to publish your edits.'}</p>
  </div>;
}
