// Click sparks: vanilla port of the React Bits "Click Spark" line effect (reactbits.dev, MIT + Commons Clause).
const Sparks = (() => {
  const GRAVITY = 500;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '9999' });
  let ctx = null;
  let ratio = 1;
  let raf = 0;
  const bursts = [];

  const resize = () => {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
  };

  const ensure = () => {
    if (ctx) return;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  };

  const line = (x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const frame = (now) => {
    raf = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    for (let b = bursts.length - 1; b >= 0; b--) {
      const { x, y, start, s, sparks } = bursts[b];
      const elapsed = Math.max(0, now - start);
      let alive = false;

      if (s.ring) {
        const p = elapsed / (reduced ? 320 : s.duration * 0.8);
        if (p < 1) {
          alive = true;
          ctx.globalAlpha = Math.pow(1 - p, 2) * 0.7;
          ctx.strokeStyle = s.colors[0];
          ctx.lineWidth = Math.max(0.5, s.width * (1 - p) * 0.9);
          ctx.beginPath();
          ctx.arc(x, y, 2 + s.radius * 0.6 * (reduced ? 0.6 : easeOut(p)), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      for (const sp of sparks) {
        const p = elapsed / (reduced ? 320 : s.duration * sp.life);
        if (p >= 1) continue;
        alive = true;
        const e = reduced ? 0.55 : easeOut(clamp(p, 0, 1));
        const sec = reduced ? 0 : elapsed / 1000;
        const drop = 0.5 * s.gravity * GRAVITY * sec * sec;
        const dist = s.radius * sp.reach * e;
        const len = Math.max(0.01, s.size * sp.scale * (reduced ? 0.5 : Math.pow(1 - p, 1.6)));
        const cos = Math.cos(sp.angle);
        const sin = Math.sin(sp.angle);
        const x1 = x + cos * dist;
        const y1 = y + sin * dist + drop;
        const x2 = x + cos * (dist + len);
        const y2 = y + sin * (dist + len) + drop;
        const fade = reduced ? 1 - p : 1 - smoothstep(0.55, 1, p);
        const width = s.width * sp.scale;
        ctx.strokeStyle = sp.color;
        if (s.glow > 0) {
          ctx.globalAlpha = fade * 0.14 * s.glow;
          ctx.lineWidth = width * 4.5;
          line(x1, y1, x2, y2);
        }
        ctx.globalAlpha = fade;
        ctx.lineWidth = width;
        line(x1, y1, x2, y2);
      }

      if (!alive) bursts.splice(b, 1);
    }
    ctx.globalAlpha = 1;
    if (bursts.length) raf = requestAnimationFrame(frame);
  };

  const spawn = (x, y, o = {}) => {
    ensure();
    const s = {
      colors: o.colors || ['#ffffff'],
      size: o.size ?? 14,
      radius: o.radius ?? 30,
      count: o.count ?? 8,
      width: o.width ?? 2,
      duration: o.duration ?? 500,
      randomness: o.randomness ?? 0.2,
      gravity: o.gravity ?? 0,
      glow: o.glow ?? 0,
      ring: !!o.ring
    };
    const step = (Math.PI * 2) / s.count;
    const offset = Math.floor(Math.random() * s.colors.length);
    const sparks = Array.from({ length: s.count }, (_, i) => ({
      angle: -Math.PI / 2 + step * i + (Math.random() - 0.5) * s.randomness * step * 0.9,
      reach: 1 + (Math.random() - 0.5) * 0.7 * s.randomness,
      scale: 1 + (Math.random() - 0.5) * 0.8 * s.randomness,
      life: 1 + (Math.random() - 0.5) * 0.5 * s.randomness,
      color: s.colors[(i + offset) % s.colors.length]
    }));
    bursts.push({ x, y, start: performance.now(), s, sparks });
    if (!raf) raf = requestAnimationFrame(frame);
  };

  return { spawn };
})();

const FX = {
  crush: { colors: ['#ffb000', '#ff7a00', '#ffe6a3'], count: 16, radius: 48, size: 16, width: 2.2, duration: 700, gravity: 0.9, randomness: 0.7, glow: 0.6 },
  hazard: { colors: ['#ffc400', '#111111'], count: 10, radius: 42, size: 12, width: 3, duration: 500, randomness: 0.4 },
  plate: { colors: ['#0b4ea2', '#8e9aab', '#111111'], count: 10, radius: 40, size: 12, width: 2, duration: 520, randomness: 0.4, ring: true },
  start: { colors: ['#ff3b30', '#ff9500', '#ffd60a'], count: 18, radius: 70, size: 14, width: 2, duration: 750, randomness: 0.5, ring: true, glow: 0.8 }
};

document.querySelectorAll('[data-fx]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const r = btn.getBoundingClientRect();
    const fromKeyboard = e.detail === 0;
    Sparks.spawn(fromKeyboard ? r.left + r.width / 2 : e.clientX, fromKeyboard ? r.top + r.height / 2 : e.clientY, FX[btn.dataset.fx]);
    btn.classList.remove('is-hit');
    void btn.offsetWidth;
    btn.classList.add('is-hit');
    if (!btn.hasAttribute('data-demo')) setTimeout(() => { window.location.href = btn.href; }, 450);
  });
  btn.addEventListener('animationend', (e) => {
    if (e.target === btn) btn.classList.remove('is-hit');
  });
});

document.querySelectorAll('[data-tilt]').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`);
  });
  el.addEventListener('pointerleave', () => {
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  });
});
