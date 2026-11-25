// Wait for a real drag before capturing the pointer so island clicks still work.
export function attachPan(scene, camera, signal) {
  let pointer = null;
  let dragged = false;
  const options = { capture: true, signal };
  scene.addEventListener('pointerdown', e => {
    if (!e.isPrimary || e.button !== 0 || e.target.closest('.controls')) return;
    if (!scene.matches('.placing-island, .editing') && e.target.closest('.island')) return;
    dragged = false;
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: camera.x, cy: camera.y };
  }, options);
  scene.addEventListener('pointermove', e => {
    if (pointer?.id !== e.pointerId) return;
    const dx = e.clientX - pointer.x, dy = e.clientY - pointer.y;
    if (!dragged && Math.hypot(dx, dy) < 5) return;
    dragged = true;
    scene.setPointerCapture(e.pointerId);
    if (scene.matches('.placing-island, .editing')) return;
    scene.classList.add('panning');
    camera.tx = camera.x = pointer.cx - dx / camera.scale;
    camera.ty = camera.y = pointer.cy - dy / camera.scale;
  }, options);
  function finish(e) {
    if (pointer?.id !== e.pointerId) return;
    pointer = null;
    scene.classList.remove('panning');
  }
  window.addEventListener('pointerup', finish, options);
  window.addEventListener('pointercancel', finish, options);
  scene.addEventListener('click', e => {
    if (dragged && e.detail && !e.target.closest('.controls')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      dragged = false;
    }
  }, options);
}
