const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mix = (a, b, t) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t
});

export function createPathfinder(obstacles, hitContext, W = 1200, H = 800, CELL = 8) {
const COLS = W / CELL;
const ROWS = H / CELL;
function blocked(p, margin = 14) {
  if (
    p.x < margin ||
    p.y < margin ||
    p.x > W - margin ||
    p.y > H - margin
  ) return true;

  hitContext.lineWidth = margin * 2;

  return obstacles.some(path =>
    hitContext.isPointInPath(path, p.x, p.y) ||
    (margin > 0 && hitContext.isPointInStroke(path, p.x, p.y))
  );
}

function clearLine(a, b, margin = 14) {
  const steps = Math.max(1, Math.ceil(distance(a, b) / 3));

  for (let i = 0; i <= steps; i++) {
    if (blocked(mix(a, b, i / steps), margin)) return false;
  }

  return true;
}

const cellPoint = i => ({
  x: (i % COLS) * CELL + CELL / 2,
  y: Math.floor(i / COLS) * CELL + CELL / 2
});

const grid = Uint8Array.from(
  { length: COLS * ROWS },
  (_, i) => blocked(cellPoint(i), 26) ? 1 : 0
);

class Heap {
  constructor() {
    this.a = [];
  }

  push(item) {
    let i = this.a.length;
    this.a.push(item);

    while (i) {
      const p = (i - 1) >> 1;
      if (this.a[p].f <= item.f) break;
      this.a[i] = this.a[p];
      i = p;
    }

    this.a[i] = item;
  }

  pop() {
    const root = this.a[0];
    const tail = this.a.pop();

    if (this.a.length) {
      let i = 0;

      while (i * 2 + 1 < this.a.length) {
        let j = i * 2 + 1;

        if (
          j + 1 < this.a.length &&
          this.a[j + 1].f < this.a[j].f
        ) j++;

        if (this.a[j].f >= tail.f) break;

        this.a[i] = this.a[j];
        i = j;
      }

      this.a[i] = tail;
    }

    return root;
  }
}

function nearestCell(p) {
  let best = -1;
  let d = Infinity;

  const cx = Math.floor(p.x / CELL);
  const cy = Math.floor(p.y / CELL);

  for (let y = cy - 3; y <= cy + 3; y++) {
    for (let x = cx - 3; x <= cx + 3; x++) {
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue;

      const i = y * COLS + x;
      const q = cellPoint(i);
      const v = distance(p, q);

      if (!grid[i] && v < d && clearLine(p, q)) {
        best = i;
        d = v;
      }
    }
  }

  return best;
}

function plan(a, b) {
  if (blocked(a) || blocked(b) || distance(a, b) < 24) return null;
  if (clearLine(a, b)) return [a, b];

  const from = nearestCell(a);
  const to = nearestCell(b);

  if (from < 0 || to < 0) return null;

  const costs = new Float64Array(grid.length).fill(Infinity);
  const parent = new Int32Array(grid.length).fill(-1);
  const closed = new Uint8Array(grid.length);
  const heap = new Heap();

  costs[from] = 0;
  heap.push({ i: from, f: distance(cellPoint(from), b) });

  const dirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1]
  ];

  while (heap.a.length) {
    const { i } = heap.pop();
    if (closed[i]) continue;

    if (i === to) {
      const path = [b];
      let n = i;

      while (n !== -1) {
        path.push(cellPoint(n));
        n = parent[n];
      }

      path.push(a);
      path.reverse();

      const simple = [a];
      let k = 0;

      while (k < path.length - 1) {
        let j = path.length - 1;

        while (
          j > k + 1 &&
          !clearLine(path[k], path[j], 26)
        ) j--;

        simple.push(path[j]);
        k = j;
      }

      return smooth(simple);
    }

    closed[i] = 1;

    const x = i % COLS;
    const y = Math.floor(i / COLS);

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;

      const j = ny * COLS + nx;
      if (grid[j] || closed[j]) continue;

      if (
        dx && dy &&
        (grid[y * COLS + nx] || grid[ny * COLS + x])
      ) continue;

      const g = costs[i] + CELL * Math.hypot(dx, dy);

      if (g < costs[j]) {
        costs[j] = g;
        parent[j] = i;
        heap.push({
          i: j,
          f: g + distance(cellPoint(j), cellPoint(to))
        });
      }
    }
  }

  return null;
}

function smooth(points) {
  const result = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1];
    const b = points[i];
    const c = points[i + 1];

    const radius = Math.min(
      45,
      distance(a, b) * .25,
      distance(b, c) * .25
    );

    const entry = mix(b, a, radius / distance(a, b));
    const exit = mix(b, c, radius / distance(b, c));
    const curve = [];

    for (let j = 0; j <= 24; j++) {
      const t = j / 24;

      curve.push({
        x: (1 - t) ** 2 * entry.x +
          2 * (1 - t) * t * b.x +
          t * t * exit.x,
        y: (1 - t) ** 2 * entry.y +
          2 * (1 - t) * t * b.y +
          t * t * exit.y
      });
    }

    if (
      curve.every((p, j) =>
        !blocked(p) &&
        (!j || clearLine(curve[j - 1], p))
      )
    ) {
      result.push(...curve);
    } else {
      result.push(b);
    }
  }

  result.push(points.at(-1));

  return result.every((p, i) =>
    !i || clearLine(result[i - 1], p)
  ) ? result : points;
}


return { blocked, plan, cellPoint, grid };
}
