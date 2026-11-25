export const CAMERA = { minZoom: 1, maxZoom: 16, focusPadding: 110, wheelSensitivity: 0.0015, dragThreshold: 5 };
export const INITIAL_CAMERA = { x: 0, y: 0, zoom: 1 };
const clampZoom = zoom => Math.min(CAMERA.maxZoom, Math.max(CAMERA.minZoom, zoom));

export function zoomAt(camera, point, factor) {
  const zoom = clampZoom(camera.zoom * factor);
  const ratio = zoom / camera.zoom;
  return { zoom, x: point.x - (point.x - camera.x) * ratio,
    y: point.y - (point.y - camera.y) * ratio };
}

export function focusBounds(bounds, width, height) {
  const [left, top, right, bottom] = bounds;
  const zoom = clampZoom(Math.min((width - CAMERA.focusPadding * 2) / Math.max(right - left, 1),
    (height - CAMERA.focusPadding * 2) / Math.max(bottom - top, 1)));
  return { zoom, x: width / 2 - (left + right) / 2 * zoom,
    y: height / 2 - (top + bottom) / 2 * zoom };
}
