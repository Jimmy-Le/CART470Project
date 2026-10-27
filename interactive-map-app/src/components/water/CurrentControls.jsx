import { routeName } from './engine/routeMath.js';

export function CurrentOption({ current }) {
  return <option value={current.id}>{routeName(current)}</option>;
}
export function CurrentSlider({ name, label, value, min, max, step, disabled, onChange, unit }) {
  return <label>{label} <input type="range" min={min} max={max} step={step}
    value={value} disabled={disabled} onChange={event => onChange(name, Number(event.target.value))} />
    <output>{name === 'strength' ? value.toFixed(2) : `${value} ${unit}`}</output>
  </label>;
}

export default function CurrentControls({ state, actions }) {
  const route = state.routes.find(item => item.id === state.selected);
  return <section className="controls" aria-label="Current editor">
    <div className="toolbar">
      <button id="add" type="button" aria-pressed={state.editing} onClick={actions.toggleAdd}>
        {state.editing ? 'Cancel' : '+ Add current'}</button>
      <button type="button" onClick={actions.overview}>Overview</button>
      <button type="button" aria-pressed={state.paused} onClick={actions.togglePause}>
        {state.paused ? 'Play' : 'Pause'}</button>
    </div>
    <p id="status" role="status">{state.status}</p>
    <div className="edit-row">
      <label>Current <select aria-label="Selected current" value={state.selected}
        disabled={!route} onChange={event => actions.selectCurrent(Number(event.target.value))}>
        {!state.routes.length && <option value={-1}>No currents</option>}
        {state.routes.map(current => <CurrentOption key={current.id} current={current} />)}
      </select></label>
      <CurrentSlider name="speed" label="Speed" value={route?.speed ?? 35}
        min={0} max={150} step={1} unit="map px/s" disabled={!route} onChange={actions.updateCurrent} />
      <CurrentSlider name="width" label="Width" value={route?.width ?? 70}
        min={20} max={180} step={2} unit="map px" disabled={!route} onChange={actions.updateCurrent} />
      <CurrentSlider name="strength" label="Strength" value={route?.strength ?? 1}
        min={0} max={2} step={0.05} disabled={!route} onChange={actions.updateCurrent} />
      <button type="button" disabled={!route} onClick={actions.reverseCurrent}>Reverse</button>
      <button type="button" disabled={!route} onClick={actions.deleteCurrent}>Delete</button>
    </div>
  </section>;
}
