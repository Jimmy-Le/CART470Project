export default function ZoomButtons({ zoom = 1, onZoomChange }) {
  return <div className="team-zoom-controls" aria-label="Map zoom">
    <button type="button" aria-label="Zoom in" disabled={zoom >= 2}
      onClick={() => onZoomChange?.(value => Math.min(2, +(value + .1).toFixed(1)))}>+</button>
    <output aria-label="Zoom level">{Math.round(zoom * 100)}%</output>
    <button type="button" aria-label="Zoom out" disabled={zoom <= .7}
      onClick={() => onZoomChange?.(value => Math.max(.7, +(value - .1).toFixed(1)))}>−</button>
    <button type="button" className="team-zoom-reset" onClick={() => onZoomChange?.(1)}>Reset</button>
  </div>;
}
