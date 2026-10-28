import { useId } from 'react';
export default function ZoomButtons({ zoom = 1, onZoomChange }) {
  const id = useId();
  const percent = Math.round(zoom * 100);
  return <div className="team-zoom-controls" aria-label="Map zoom">
    <label htmlFor={id}>Zoom <output>{percent}%</output></label>
    <input id={id} aria-label="Map zoom" type="range" min="70" max="200" step="1"
      value={percent} style={{ '--zoom-fill': `${(percent - 70) / 130 * 100}%` }}
      onChange={event => onZoomChange?.(Number(event.target.value) / 100)} />
    <div className="zoom-scale"><span>70%</span><span>200%</span></div>
    <button type="button" className="team-zoom-reset" onClick={() => onZoomChange?.(1)}>Reset</button>
  </div>;
}
