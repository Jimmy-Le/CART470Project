const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mix = (a, b, t) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t
});
export function measure(route) {
  route.lengths = [0];

  for (let i = 1; i < route.points.length; i++) {
    route.lengths.push(
      route.lengths[i - 1] +
      distance(route.points[i - 1], route.points[i])
    );
  }

  route.length = route.lengths.at(-1);
  route.phase = 0;
}

export function at(route, d) {
  d = Math.max(0, Math.min(d, route.length));

  let lo = 1;
  let hi = route.lengths.length - 1;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (route.lengths[mid] < d) lo = mid + 1;
    else hi = mid;
  }

  const a = route.points[lo - 1];
  const b = route.points[lo];

  const p = mix(
    a,
    b,
    (d - route.lengths[lo - 1]) /
    (route.lengths[lo] - route.lengths[lo - 1] || 1)
  );

  p.angle = Math.atan2(b.y - a.y, b.x - a.x);
  return p;
}

function letter(id) {
  let n = id;
  let text = "";

  do {
    text = String.fromCharCode(65 + n % 26) + text;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);

  return text;
}

export function endpointLabel(id, end = 0) {
  return `${letter(Math.floor(id / 13))}${(id % 13) * 2 + 1 + end}`;
}

export function routeName(r) {
  return `${endpointLabel(r.id)}–${endpointLabel(r.id, 1)}`;
}

export const easeOut = t => {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
};

export function endLength(r) {
  return Math.min(r.length * .42, Math.max(100, r.width * 1.8));
}

export function endFade(r, p) {
  const length = endLength(r);

  if (distance(p, r.b) > length * 1.7) return 1;

  let best = Infinity;
  let progress = 0;

  for (let i = 1; i < r.points.length; i++) {
    const a = r.points[i - 1];
    const b = r.points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const t = Math.max(
      0,
      Math.min(
        1,
        ((p.x - a.x) * dx + (p.y - a.y) * dy) /
        (dx * dx + dy * dy || 1)
      )
    );

    const q = mix(a, b, t);
    const d = distance(p, q);

    if (d < best) {
      best = d;
      progress = r.lengths[i - 1] +
        t * (r.lengths[i] - r.lengths[i - 1]);
    }
  }

  return easeOut((r.length - progress) / length);
}

