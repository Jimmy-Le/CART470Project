import { at, endFade, endLength, easeOut, endpointLabel } from './routeMath.js';

// Shared canvas simulation: currents interact in one field, not separate React frames.
export function createWaterSimulation({ ctx, obstacles, grid, blocked, cellPoint,
  getRoutes, getSelected, getStart, freeId, isPaused, W = 1200, H = 800, CELL = 8 }) {
const COLS = W / CELL;
const ROWS = H / CELL;
const fx = new Float32Array(grid.length);
const fy = new Float32Array(grid.length);
const wet = new Float32Array(grid.length);

const solid = Uint8Array.from(
  { length: grid.length },
  (_, i) => blocked(cellPoint(i), 4) ? 1 : 0
);

let tracers = [];
let flowTime = 0;

const washCanvas = document.createElement('canvas');
washCanvas.width = COLS;
washCanvas.height = ROWS;
const washContext = washCanvas.getContext('2d');

const trailCanvas = document.createElement('canvas');
trailCanvas.width = W;
trailCanvas.height = H;
const ink = trailCanvas.getContext('2d');

function isSolid(x, y) {
  if (x < 5 || y < 5 || x > W - 5 || y > H - 5) return true;

  return !!solid[
    Math.floor(y / CELL) * COLS + Math.floor(x / CELL)
  ];
}

function rebuildField() {
  const routes = getRoutes();
  fx.fill(0);
  fy.fill(0);
  wet.fill(0);

  const contributions = [];

  for (const r of routes) {
    const vx = new Float32Array(grid.length);
    const vy = new Float32Array(grid.length);
    const weights = new Float32Array(grid.length);
    const nearest = new Float32Array(grid.length).fill(Infinity);
    const radius = r.width * .5;

    for (let d = 0; d <= r.length; d += 6) {
      const p = at(r, d);
      const tx = Math.cos(p.angle);
      const ty = Math.sin(p.angle);
      const taper = easeOut((r.length - d) / endLength(r));
      const range = (radius + 10) * (.06 + .94 * taper);

      for (
        let y = Math.max(0, Math.floor((p.y - range) / CELL));
        y < Math.min(ROWS, Math.ceil((p.y + range) / CELL));
        y++
      ) {
        for (
          let x = Math.max(0, Math.floor((p.x - range) / CELL));
          x < Math.min(COLS, Math.ceil((p.x + range) / CELL));
          x++
        ) {
          const i = y * COLS + x;
          if (solid[i]) continue;

          const q = cellPoint(i);
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist >= range || dist >= nearest[i]) continue;

          nearest[i] = dist;

          const edge = Math.max(0, 1 - dist / range);
          const weight = edge * edge * r.strength * taper;

          weights[i] = r.speed > 0 ? weight : 0;

          const cross = dx * (-ty) + dy * tx;
          const speed = r.speed * (.1 + .9 * taper);
          const pull = .22 + (1 - taper) * .7;

          vx[i] = (
            tx + ty * cross / Math.max(20, range) * pull
          ) * speed;

          vy[i] = (
            ty - tx * cross / Math.max(20, range) * pull
          ) * speed;
        }
      }
    }

    contributions.push({ vx, vy, weights });
  }

  for (let i = 0; i < grid.length; i++) {
    if (solid[i]) continue;

    let sum = 0;
    let energy = 0;
    let x = 0;
    let y = 0;
    let peak = 0;

    for (const c of contributions) {
      const w = c.weights[i];
      sum += w;
      peak = Math.max(peak, w);
      x += c.vx[i] * w;
      y += c.vy[i] * w;
      energy += Math.hypot(c.vx[i], c.vy[i]) * w;
    }

    if (sum === 0) continue;

    x /= sum;
    y /= sum;
    energy /= sum;

    const conflict = Math.max(
      0,
      1 - Math.hypot(x, y) / (energy || 1)
    );

    if (conflict > .08) {
      let dominant = contributions[0];
      let weight = 0;

      for (const c of contributions) {
        if (c.weights[i] > weight) {
          weight = c.weights[i];
          dominant = c;
        }
      }

      const len = Math.hypot(
        dominant.vx[i],
        dominant.vy[i]
      ) || 1;

      const q = cellPoint(i);
      const side = Math.sin(q.x * .018 + q.y * .013) >= 0 ? 1 : -1;

      x += -dominant.vy[i] / len * energy * conflict * .6 * side;
      y += dominant.vx[i] / len * energy * conflict * .6 * side;
    }

    const q = cellPoint(i);
    const probe = 14;

    if (isSolid(q.x + Math.sign(x) * probe, q.y)) x = 0;
    if (isSolid(q.x, q.y + Math.sign(y) * probe)) y = 0;

    fx[i] = x;
    fy[i] = y;
    wet[i] = Math.min(1, peak);
  }

  const wash = washContext.createImageData(COLS, ROWS);

  for (let i = 0; i < wet.length; i++) {
    wash.data[i * 4] = 54;
    wash.data[i * 4 + 1] = 94;
    wash.data[i * 4 + 2] = 88;
    wash.data[i * 4 + 3] = Math.round(22 * wet[i]);
  }

  washContext.putImageData(wash, 0, 0);

  tracers = [];
  ink.clearRect(0, 0, W, H);

  for (const r of routes) {
    const count = Math.min(
      180,
      Math.max(28, Math.floor(r.length * r.width / 480))
    );

    for (let i = 0; i < count; i++) {
      tracers.push({
        ...seed(r, true),
        priority: i / count
      });
    }
  }

  tracers.sort((a, b) => a.priority - b.priority);
}

function seed(r, spread = false) {
  for (let attempt = 0; attempt < 15; attempt++) {
    const p = at(
      r,
      spread
        ? Math.random() * r.length
        : Math.random() * Math.min(50, r.length)
    );

    const taper = endFade(r, p);

    const offset = (Math.random() - .5) *
      r.width * .9 * (.06 + .94 * taper);

    const x = p.x - Math.sin(p.angle) * offset;
    const y = p.y + Math.cos(p.angle) * offset;

    if (!isSolid(x, y)) {
      return {
        x,
        y,
        owner: r.id,
        age: Math.random() * 5,
        life: 8 + Math.random() * 14,
        alpha: .2 + Math.random() * .25,
        size: 1.5 + Math.random() * 1.9
      };
    }
  }

  return {
    x: r.a.x,
    y: r.a.y,
    owner: r.id,
    age: 0,
    life: 12,
    alpha: .25,
    size: .7
  };
}

function velocity(x, y) {
  const gx = Math.max(
    0,
    Math.min(COLS - 1.001, x / CELL - .5)
  );

  const gy = Math.max(
    0,
    Math.min(ROWS - 1.001, y / CELL - .5)
  );

  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  const tx = gx - ix;
  const ty = gy - iy;

  let vx = 0;
  let vy = 0;
  let w = 0;

  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      const k = (iy + b) * COLS + ix + a;
      const t = (a ? tx : 1 - tx) * (b ? ty : 1 - ty);

      vx += fx[k] * t;
      vy += fy[k] * t;
      w += wet[k] * t;
    }
  }

  return { x: vx, y: vy, w };
}

function marker(p, text, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(p.x - 18, p.y - 12, 36, 24, 12);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, p.x, p.y);
}

let echoLayers = null;

function buildEchoLayers() {
  return obstacles.map(path => {
    const layer = document.createElement('canvas');
    layer.width = W;
    layer.height = H;

    const g = layer.getContext('2d');

    for (const radius of [10, 22, 36]) {
      const ring = document.createElement('canvas');
      ring.width = W;
      ring.height = H;

      const brush = ring.getContext('2d');

      brush.strokeStyle = '#e8efdb';
      brush.lineJoin = 'round';
      brush.lineWidth = radius * 2 + 1.3;
      brush.stroke(path);

      brush.globalCompositeOperation = 'destination-out';
      brush.lineWidth = radius * 2;
      brush.stroke(path);
      brush.fill(path);

      g.globalAlpha = radius === 10 ? .5 : .25;
      g.drawImage(ring, 0, 0);
    }

    return layer;
  });
}

function paintPigment(p, r, i) {
  const taper = endFade(r, p);

  const life = Math.max(
    0,
    Math.min(1, p.age / 1.4, (p.life - p.age) / 1.8)
  );

  const alpha = life * taper * taper *
    Math.min(1.2, r.strength) * (p.visibility || 0);

  if (alpha < .02) return;

  const length = (
    i % 4 === 0 ? 115 : 48 + (i % 5) * 11
  ) * (.3 + .7 * taper);

  const points = [];
  let x = p.x;
  let y = p.y;

  for (let j = 0; j <= 24; j++) {
    const v = velocity(x, y);
    const speed = Math.hypot(v.x, v.y);

    if (speed < .2 || v.w < .002 || isSolid(x, y)) break;

    const nx = -v.y / speed;
    const ny = v.x / speed;
    const t = j / 24;

    const wave = Math.sin(t * 5 - p.age * .85 + i * 2.3) *
      Math.sin(Math.PI * t) * 2.8;

    points.push({
      x: x + nx * wave,
      y: y + ny * wave,
      nx,
      ny
    });

    x -= v.x / speed * length / 24;
    y -= v.y / speed * length / 24;
  }

  if (points.length < 5) return;

  const edge = (offset, color, thickness) => {
    const left = [];
    const right = [];

    points.forEach((q, j) => {
      const t = j / (points.length - 1);

      const width = Math.sin(Math.PI * t) ** .8 *
        thickness * taper *
        (.84 + .16 * Math.sin(t * 17 + i));

      left.push({
        x: q.x + q.nx * (offset + width),
        y: q.y + q.ny * (offset + width)
      });

      right.push({
        x: q.x + q.nx * (offset - width),
        y: q.y + q.ny * (offset - width)
      });
    });

    ink.beginPath();

    left.forEach((q, j) =>
      j ? ink.lineTo(q.x, q.y) : ink.moveTo(q.x, q.y)
    );

    right.reverse().forEach(q => ink.lineTo(q.x, q.y));

    ink.closePath();
    ink.fillStyle = color;
    ink.fill();
  };

  edge(
    0,
    `rgba(47,89,82,${alpha * .26})`,
    i % 4 === 0 ? 2.4 : 1.5
  );

  edge(
    2.1,
    `rgba(247,244,224,${alpha * .66})`,
    i % 4 === 0 ? 1.9 : 1.05
  );

  if (i % 3 === 0) {
    ink.beginPath();

    points.forEach((q, j) => {
      if (j < 5 || j > 14) return;

      if (j === 5) {
        ink.moveTo(q.x + q.nx * 2, q.y + q.ny * 2);
      } else {
        ink.lineTo(q.x + q.nx * 2, q.y + q.ny * 2);
      }
    });

    ink.lineWidth = .55;
    ink.strokeStyle = `rgba(186,207,197,${alpha * .75})`;
    ink.stroke();
  }
}

function draw(dt) {
  const routes = getRoutes();
  const selected = getSelected();
  const start = getStart();
  const paused = isPaused();
  if (!echoLayers) echoLayers = buildEchoLayers();

  ctx.clearRect(0, 0, W, H);

  if (!paused && dt > 0) flowTime += dt;

  echoLayers.forEach((layer, i) => {
    ctx.globalAlpha = .2 + Math.sin(flowTime * .3 + i * 2.3) * .05;
    ctx.drawImage(layer, 0, 0, W, H);
  });

  ctx.globalAlpha = 1;
  ink.clearRect(0, 0, W, H);
  ink.imageSmoothingEnabled = true;
  ink.drawImage(washCanvas, 0, 0, W, H);

  ink.globalCompositeOperation = 'destination-out';
  for (const path of obstacles) ink.fill(path);

  ink.globalCompositeOperation = 'source-over';
  ctx.drawImage(trailCanvas, 0, 0, W, H);

  ink.clearRect(0, 0, W, H);

  const occupied = new Set();
  let visible = 0;
  const routeMap = new Map(routes.map(r => [r.id, r]));

  for (let i = 0; i < tracers.length; i++) {
    const p = tracers[i];
    const r = routeMap.get(p.owner);

    if (!r || r.strength === 0) continue;

    if (!paused && dt > 0 && r.speed > 0) {
      const v = velocity(p.x, p.y);
      const speed = Math.hypot(v.x, v.y);
      const taper = endFade(r, p);

      let nx = p.x + v.x * dt;
      let ny = p.y + v.y * dt;

      if (isSolid(nx, ny)) {
        if (!isSolid(nx, p.y)) {
          ny = p.y;
        } else if (!isSolid(p.x, ny)) {
          nx = p.x;
        } else {
          tracers[i] = seed(r, true);
          continue;
        }
      }

      p.age += dt;

      if (
        p.age > p.life ||
        v.w < .004 ||
        speed < .3 ||
        taper < .006
      ) {
        tracers[i] = seed(r, true);
        continue;
      }

      p.x = nx;
      p.y = ny;
    }

    const cell = `${Math.floor(p.x / 60)},${Math.floor(p.y / 44)}`;

    const admitted = visible < 70 &&
      !occupied.has(cell) &&
      endFade(r, p) > .05;

    if (admitted) {
      occupied.add(cell);
      visible++;
    }

    if (!paused && dt > 0) {
      p.visibility = (p.visibility || 0) +
        ((admitted ? 1 : 0) - (p.visibility || 0)) *
        (1 - Math.exp(-dt * 7));
    }

    if (p.visibility > .015) paintPigment(p, r, i);
  }

  ink.globalCompositeOperation = 'destination-out';
  ink.fillStyle = '#000';

  for (const path of obstacles) ink.fill(path);

  ink.globalCompositeOperation = 'source-over';
  ctx.drawImage(trailCanvas, 0, 0, W, H);

  const active = routes.find(r => r.id === selected);

  if (active) {
    marker(active.a, endpointLabel(active.id), '#34534f');
    marker(active.b, endpointLabel(active.id, 1), '#966945');
  }

  if (start) marker(start, endpointLabel(freeId()), '#34534f');
}

return { rebuildField, draw, velocity,
  setResolution(width, height) {
    trailCanvas.width = width;
    trailCanvas.height = height;
    ink.setTransform(width / W, 0, 0, height / H, 0, 0);
  },
};
}
