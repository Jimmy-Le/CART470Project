// Animation owns styles only; React owns the name and letter DOM nodes.
export function createNameAnimation({ namePlate, island, label, velocity, ctx, reduced, isPaused }) {
const floatingLetters = [...namePlate.querySelectorAll('.drift-letter')].map((element, i) => ({ element, level: 0, phase: i * 1.73 }));
let nameTarget = 0;
let nameClock = 0;
let nameX = 0;
let nameY = 0;
let nameDelay = 0;

function hideName() {
  nameTarget = 0;
  nameDelay = 0;
  island.classList.remove('name-revealed');
}

function revealName() {
  nameTarget = 1;
  nameDelay = 0;

  floatingLetters.forEach(item => {
    item.revealDelay = Math.random() * .9;
  });

  island.classList.add('name-revealed');
}

function updateName(dt) {
  nameDelay += dt;

  if (!isPaused() && !reduced) {
    nameClock += dt;
  }

  const v = velocity(label.x + label.width / 2 + nameX, label.y + 20 + nameY);
  const targetX = Math.max(-12, Math.min(12, v.x * .22));
  const targetY = Math.max(-5, Math.min(5, v.y * .15));

  if (!isPaused() && !reduced) {
    const follow = 1 - Math.exp(-dt * .6);
    nameX += (targetX - nameX) * follow;
    nameY += (targetY - nameY) * follow;
  }

  namePlate.style.transform =
    `translate(${nameX}px, ${nameY}px)`;

  floatingLetters.forEach((item, i) => {
    const delay = nameTarget
  ? (item.revealDelay ?? 0)
  : (floatingLetters.length - 1 - i) * .035;

    if (reduced) {
      item.level = nameTarget;
    } else if (nameDelay >= delay) {
      const step = dt / (nameTarget ? 2 : 2.3);

      item.level = Math.max(
        0,
        Math.min(1, item.level + (nameTarget ? step : -step))
      );
    }

    const p = item.level;
    const ease = p * p * (3 - 2 * p);

    // 固定在地图平面上，保留弧形和不规则排列。
    const arch = -17 * Math.sin(i / Math.max(1, floatingLetters.length - 1) * Math.PI);
    const irregular = Math.sin(item.phase) * 3;
    const y = arch + irregular;

    const sway = reduced
      ? 0
      : Math.sin(nameClock * .55 + item.phase) * 1.6;

    const angle =
      Math.cos(i / Math.max(1, floatingLetters.length - 1) * Math.PI) * -6 +
      Math.sin(item.phase * 2) * 3 +
      sway;

    item.element.style.opacity = ease;
    item.element.style.filter =
      `blur(${(1 - ease) * 2.4}px)`;

    // 没有向上位移，也没有纵向缩放。
    item.element.style.transform =
      `translate(${sway}px, ${y}px) rotate(${angle}deg)`;

    item.element.style.clipPath = 'none';

    // 从字母中心向四周揭开水膜。
    const opening = ease * 145;
    const mask = `radial-gradient(
      ellipse at 50% 50%,
      #000 ${Math.max(0, opening - 22)}%,
      transparent ${Math.max(.1, opening)}%
    )`;

    item.element.style.maskImage = mask;
    item.element.style.webkitMaskImage = mask;

    if (p <= 0 || item.element.textContent === '\u00a0') return;

    const cx =
      namePlate.offsetLeft +
      nameX +
      item.element.offsetLeft +
      item.element.offsetWidth / 2 +
      sway;

    const cy =
      namePlate.offsetTop +
      nameY +
      item.element.offsetTop +
      item.element.offsetHeight / 2 +
      y;

    const rx = (item.element.offsetWidth / 2 + 12) * ease;
    const ry = (item.element.offsetHeight / 2 + 8) * ease;

    if (rx < .1 || ry < .1) return;

    // 逐渐清除字母周围的水纹，露出下方纸张质感。
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle * Math.PI / 180);
    ctx.scale(rx, ry);
    ctx.globalCompositeOperation = 'destination-out';

    const clearing = ctx.createRadialGradient(
      0, 0, 0,
      0, 0, 1
    );

    clearing.addColorStop(
      0,
      `rgba(0,0,0,${ease * .94})`
    );

    clearing.addColorStop(
      .65,
      `rgba(0,0,0,${ease * .85})`
    );

    clearing.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = clearing;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();

  });
}


return { hide: hideName, reveal: revealName, update: updateName };
}
