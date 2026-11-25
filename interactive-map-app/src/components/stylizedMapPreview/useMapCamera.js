import { useEffect, useRef, useState } from 'react';
import { CAMERA, INITIAL_CAMERA, focusBounds, zoomAt } from './mapCamera.js';

export default function useMapCamera(svg, records, width, height) {
  const [camera, setCamera] = useState(INITIAL_CAMERA);
  const [selectedId, setSelectedId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef(null);
  const point = event => {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return null;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: p.x, y: p.y };
  };
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const wheel = event => {
      event.preventDefault();
      const matrix = element.getScreenCTM();
      if (!matrix) return;
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      setCamera(current => zoomAt(current, p, Math.exp(-Math.max(-500, Math.min(500, pixels)) * CAMERA.wheelSensitivity)));
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [svg, records]);

  function focusIsland(id) {
    const record = records.find(item => item.id === id);
    if (!record) return;
    setSelectedId(id);
    setCamera(focusBounds(record.bounds, width, height));
  }
  const cancel = () => { gesture.current = null; setDragging(false); };
  return { camera, selectedId, dragging, focusIsland,
    reset: () => { cancel(); setCamera(INITIAL_CAMERA); setSelectedId(null); },
    handlers: {
      onPointerDown(event) {
        if (event.button !== 0 || gesture.current) return;
        const p = point(event);
        if (!p) return;
        gesture.current = { pointerId: event.pointerId, start: p, camera,
          clientX: event.clientX, clientY: event.clientY,
          islandId: event.target.closest('[data-island-id]')?.getAttribute('data-island-id'), moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove(event) {
        const g = gesture.current;
        if (!g || g.pointerId !== event.pointerId) return;
        const p = point(event);
        if (!p) return;
        g.moved ||= Math.hypot(event.clientX - g.clientX, event.clientY - g.clientY) > CAMERA.dragThreshold;
        if (!g.moved) return;
        setDragging(true);
        setCamera({ ...g.camera, x: g.camera.x + p.x - g.start.x, y: g.camera.y + p.y - g.start.y });
      },
      onPointerUp(event) {
        const g = gesture.current;
        if (!g || g.pointerId !== event.pointerId) return;
        if (!g.moved) {
          if (g.islandId) focusIsland(g.islandId);
          else setSelectedId(null);
        }
        cancel();
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      },
      onPointerCancel: cancel,
      onLostPointerCapture: cancel,
    },
  };
}
