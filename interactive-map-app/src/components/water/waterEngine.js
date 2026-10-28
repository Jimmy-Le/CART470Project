import { createWaterSimulation } from './engine/waterSimulation.js';
import { createPathfinder } from './engine/pathfinding.js';
import { measure, at, routeName } from './engine/routeMath.js';
import { createNameAnimation } from './engine/nameAnimation.js';
import { serializeCurrents, normalizeCurrents } from './data/currentStorage.js';
// Adapted from Tianshun's water prototype. One isolated engine per mounted map.
export function createWaterMap(root, { islands: islandData, currents = [], onSelect = () => {}, onStateChange = () => {}, onCurrentsChange = () => {} } = {}) {
const abort = new AbortController();
const signal = abort.signal;
let frameId = 0;
let fieldFrame = 0;
let disposed = false;
let zoom = 1;
let fitScale = 1;

const scene = root;
const world = root.querySelector('#world');
const canvas = root.querySelector('#water');
const ctx = canvas.getContext('2d');
const hitContext = document.createElement('canvas').getContext('2d');
const islands = [...root.querySelectorAll('.island')];

const W = 1200;
const H = 800;
const CELL = 8;

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const camera = { x: 600, y: 400, tx: 600, ty: 400, scale: 1 };

let routes = [];
let selected = -1;
let editing = false;
let start = null;
let paused = reduced;
let last = 0;

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
let status = 'Add a current, then choose two points in the water.';
const message = text => { status = text; updateUI(); };

const obstacles = islands.map(el => {
  const svg = el.querySelector('svg');
  const vb = svg.viewBox.baseVal;
  const scale = el.offsetWidth / vb.width;
  const path = new Path2D();

  path.addPath(
    new Path2D(el.querySelector('path').getAttribute('d')),
    new DOMMatrix([scale, 0, 0, el.offsetHeight / vb.height, el.offsetLeft - vb.x * scale, el.offsetTop - vb.y * el.offsetHeight / vb.height])
  );

  return path;
});

const { blocked, plan, cellPoint, grid } = createPathfinder(obstacles, hitContext, W, H, CELL);

function freeId() {
  let id = 0;
  while (routes.some(r => r.id === id)) id++;
  return id;
}

function save() {
  onCurrentsChange(serializeCurrents(routes));
  updateUI();
}
function updateUI() {
  onStateChange({ routes: serializeCurrents(routes), selected, editing, paused, status });
  scene.classList.toggle('editing', editing);
  scene.classList.toggle('motion-paused', paused);
}

function cancel() {
  editing = false;
  start = null;
  updateUI();
}

function toggleAdd() {
  if (editing) {
    cancel();
    message('Cancelled.');
  } else {
    editing = true;
    start = null;
    updateUI();
    message('Choose a start point in the water. Esc to cancel.');
  }
};

function selectCurrent(id) {
  selected = Number(id);
  updateUI();
};

function updateCurrent(name, value) {
  const r = routes.find(r => r.id === selected);
  const limits = { speed: [0, 150], width: [20, 180], strength: [0, 2] };
  if (!r || !limits[name] || !Number.isFinite(Number(value))) return;
  r[name] = Math.max(limits[name][0], Math.min(limits[name][1], Number(value)));
  save();
  if (!fieldPending) {
    fieldPending = true;
    fieldFrame = requestAnimationFrame(() => {
      if (disposed) return;
      fieldPending = false;
      rebuildField();
    });
  }
}

function reverseCurrent() {
  const r = routes.find(r => r.id === selected);

  if (r) {
    [r.a, r.b] = [r.b, r.a];
    r.points.reverse();
    measure(r);
    save();
    rebuildField();
    message(`${routeName(r)}: direction reversed.`);
  }
};

function deleteCurrent() {
  routes = routes.filter(r => r.id !== selected);
  selected = routes.at(-1)?.id ?? -1;
  save();
  rebuildField();
  updateUI();
  message('Current deleted. Its endpoint numbers are available again.');
};

function togglePause() {
  paused = !paused;
  scene.classList.toggle('motion-paused', paused);
  updateUI();
};

function overview() {
  camera.tx = 600;
  camera.ty = 400;
};

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && editing) {
    cancel();
    message('Cancelled.');
  }
}, { signal });

function hideName() {
  names.forEach(name => name.hide());
  islands.forEach(el => {
    el.classList.remove('active');
    el.setAttribute('aria-pressed', 'false');
  });
}
function focusIsland(id = islandData[0]?.id) {
  if (editing) return;
  const index = islandData.findIndex(item => item.id === id);
  if (index < 0) return;
  const data = islandData[index];
  hideName();
  camera.tx = data.camera?.x ?? data.x + data.width / 2;
  camera.ty = data.camera?.y ?? data.y + data.height / 2;
  names[index].reveal();
  islands[index].classList.add('active');
  islands[index].setAttribute('aria-pressed', 'true');
  onSelect(data.id, data);
}
// Island buttons use React onClick; the engine handles water hit testing only.

function mapPoint(e) {
  const r = world.getBoundingClientRect();

  return {
    x: (e.clientX - r.left) / camera.scale,
    y: (e.clientY - r.top) / camera.scale
  };
}

world.addEventListener('click', e => {
  if (e.target.closest('.island')) return;
  const p = mapPoint(e);

  if (!editing) {
    let best = null;
    let d = 20;

    for (const r of routes) {
      for (let k = 0; k <= r.length; k += 6) {
        const v = distance(at(r, k), p);

        if (v < d) {
          d = v;
          best = r;
        }
      }
    }

    if (best) {
      selected = best.id;
      updateUI();
    }

    return;
  }

  if (blocked(p)) {
    message('Choose open water, a little farther from the shore.');
    return;
  }

  if (!start) {
    start = p;
    message('Choose the end point. The current will avoid the island.');
    return;
  }

  if (distance(start, p) < 24) {
    message('Choose an end point farther from the start.');
    return;
  }

  if (routes.length >= 40) { cancel(); message('Maximum 40 currents. Delete one before adding another.'); return; }
  const points = plan(start, p);

  if (!points) {
    message('No clear route found. Choose another end point.');
    return;
  }

  const route = {
    id: freeId(),
    a: start,
    b: p,
    points,
    speed: 35,
    width: 70,
    strength: 1
  };

  measure(route);
  routes.push(route);
  selected = route.id;

  cancel();
  save();
  rebuildField();

  message(
    `${routeName(route)} created. Adjust speed, width and strength below.`
  );
}, { signal });

let fieldPending = false;
const simulation = createWaterSimulation({ ctx, obstacles, grid, blocked, cellPoint,
  getRoutes: () => routes, getSelected: () => selected, getStart: () => start,
  freeId, isPaused: () => paused, W, H, CELL,
});
const { rebuildField, draw, velocity } = simulation;

function updateResolution() {
  const ratio = Math.max(
    1,
    Math.min(3, camera.scale * (globalThis.devicePixelRatio || 1))
  );

  const width = Math.round(W * ratio);
  const height = Math.round(H * ratio);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    simulation.setResolution(width, height);

    ctx.setTransform(width / W, 0, 0, height / H, 0, 0);
  }
}

function resize() {
  const rect = scene.getBoundingClientRect();
  const panel = root.querySelector('.controls').getBoundingClientRect();

  camera.scale = Math.min(
    (rect.width - 24) / W,
    (rect.height - panel.height - 44) / H
  );

  fitScale = Math.max(.12, camera.scale);
  camera.scale = fitScale * zoom;
  updateResolution();
}

function frame(t) {
  if (disposed) return;
  const dt = last ? Math.min((t - last) / 1000, .04) : 0;
  last = t;

  const k = reduced ? 1 : 1 - Math.exp(-dt * 4);

  camera.x += (camera.tx - camera.x) * k;
  camera.y += (camera.ty - camera.y) * k;

  const available = scene.clientHeight -
    root.querySelector('.controls').offsetHeight - 36;

  world.style.left = `${scene.clientWidth / 2}px`;
  world.style.top = `${available / 2}px`;

  world.style.transform =
    `scale(${camera.scale}) translate(${-camera.x}px,${-camera.y}px)`;

  draw(dt);
  names.forEach(name => name.update(dt));
  frameId = requestAnimationFrame(frame);
}

const names = islandData.map((data, index) => createNameAnimation({
  namePlate: root.querySelectorAll('.sea-name')[index],
  island: islands[index], label: data.label, velocity, ctx, reduced,
  isPaused: () => paused,
}));

function loadCurrents(records) {
  routes = [];
  for (const item of normalizeCurrents(records)) {
    const points = plan(item.a, item.b);
    if (!points) continue;
    const route = { ...item, points };
    measure(route);
    routes.push(route);
  }
  selected = routes.at(-1)?.id ?? -1;
  editing = false;
  start = null;
}
loadCurrents(currents);
rebuildField();
updateUI();
resize();

window.addEventListener('resize', resize, { signal });
const observer = new ResizeObserver(resize);
observer.observe(root);
observer.observe(root.querySelector('.controls'));
frameId = requestAnimationFrame(frame);
// ↑ ↑ ↓ ↓ ← → ← → B A
// max 10s between first and last key, max 5s between any two keys.
const panelSequence = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

let panelKeyHistory = [];
let panelControlsHidden = false;

window.addEventListener('keydown', (event) => {
  if (
    event.repeat ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey
  ) {
    return;
  }

  // when typing in a text field, reset the key history to avoid accidentally revealing the panel.
  const target = event.target;
  const typingText =
    target?.isContentEditable ||
    target?.tagName === 'TEXTAREA' ||
    (
      target?.tagName === 'INPUT' &&
      !['range', 'checkbox', 'radio', 'button', 'submit']
        .includes(target.type)
    );

  if (typingText) {
    panelKeyHistory = [];
    return;
  }

  const now = performance.now();

  if (panelKeyHistory.length) {
    const first = panelKeyHistory[0];
    const last = panelKeyHistory[panelKeyHistory.length - 1];

    if (
      now - first.time > 10000 ||
      now - last.time > 5000
    ) {
      panelKeyHistory = [];
    }
  }

  // event.code 
  const key = event.code || (
    event.key.toLowerCase() === 'b' ? 'KeyB' :
    event.key.toLowerCase() === 'a' ? 'KeyA' :
    event.key
  );

  panelKeyHistory.push({ key, time: now });

  // when the sequence is broken, remove the earliest key until the history matches the expected sequence.
  while (
    panelKeyHistory.length &&
    !panelKeyHistory.every(
      (item, index) => item.key === panelSequence[index]
    )
  ) {
    panelKeyHistory.shift();
  }

  // avoid scrolling the page when using arrow keys to reveal the panel.
  if (
    panelKeyHistory.length &&
    key.startsWith('Arrow')
  ) {
    event.preventDefault();
  }

  if (panelKeyHistory.length !== panelSequence.length) return;

  panelKeyHistory = [];

  const panel = root.querySelector('.controls');
  if (!panel) return;

  panelControlsHidden = !panelControlsHidden;

  // when the panel is hidden, remove focus from any element inside it to prevent accidental interaction.
  if (panelControlsHidden) {
    if (panel.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    panel.style.setProperty('visibility', 'hidden', 'important');
    panel.style.setProperty('pointer-events', 'none', 'important');
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
  } else {
    panel.style.removeProperty('visibility');
    panel.style.removeProperty('pointer-events');
    panel.inert = false;
    panel.removeAttribute('aria-hidden');
  }
}, { capture: true, signal });
return {
  focusIsland,
  hideName,
  toggleAdd, selectCurrent, updateCurrent, reverseCurrent, deleteCurrent, togglePause, overview,
  getCurrents: () => serializeCurrents(routes),
  importCurrents(records) {
    loadCurrents(records);
    rebuildField();
    save();
    message(`Loaded ${routes.length} currents from JSON.`);
    return routes.length;
  },
  setCurrents(records) {
    loadCurrents(records);
    rebuildField();
    updateUI();
  },
  setZoom(value) {
    zoom = Number.isFinite(value) ? Math.max(.7, Math.min(2, value)) : 1;
    camera.scale = fitScale * zoom;
    updateResolution();
  },
  destroy() {
    disposed = true;
    abort.abort();
    observer.disconnect();
    cancelAnimationFrame(frameId);
    cancelAnimationFrame(fieldFrame);
  }
};
}
