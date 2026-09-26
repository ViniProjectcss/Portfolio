/* =====================================================================
   ATOMS BG — fundo animado com vários átomos (canvas 2D)
   Cada átomo = núcleo brilhante + 2-3 órbitas elípticas com elétrons.
   Só mexe no visual de FUNDO da página — nada de outros elementos.
===================================================================== */

(function () {

  const canvas = document.getElementById('atomsBg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let vw = window.innerWidth;
  let vh = window.innerHeight;

  // paleta viva (mesmas cores do design system, só combinadas de forma mais intensa no fundo)
  const PALETTE = [
    ['#22d3ee', '#6366f1'],
    ['#a855f7', '#ec4899'],
    ['#fbbf24', '#ec4899'],
    ['#6366f1', '#a855f7'],
    ['#22d3ee', '#a855f7'],
    ['#ec4899', '#6366f1']
  ];

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth;
    vh = window.innerHeight;
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
  }

  function atomCount() {
    if (vw < 620) return 9;
    if (vw < 1100) return 15;
    return 22;
  }

  function makeAtom() {
    const [c1, c2] = pick(PALETTE);
    return {
      x: rand(0, vw),
      y: rand(0, vh),
      vx: rand(-0.12, 0.12),
      vy: rand(-0.09, 0.09),
      size: rand(14, 40),
      rings: Math.round(rand(2, 3)),
      angle: rand(0, Math.PI * 2),
      spin: rand(-0.0035, 0.0035),
      tilt: rand(0.32, 0.62),
      c1, c2,
      alpha: rand(0.30, 0.62),
      eSpeed: rand(0.012, 0.03),
      eOffset: rand(0, Math.PI * 2)
    };
  }

  let atoms = [];

  function build() {
    atoms = Array.from({ length: atomCount() }, makeAtom);
  }

  function drawAtom(a, t) {
    const x = a.x * dpr;
    const y = a.y * dpr;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a.angle);
    ctx.globalAlpha = a.alpha;

    for (let r = 0; r < a.rings; r++) {
      const rw = (a.size + r * a.size * 0.6) * dpr;
      const rh = rw * a.tilt;

      ctx.save();
      ctx.rotate((Math.PI / a.rings) * r + r * 0.4);
      ctx.strokeStyle = a.c1;
      ctx.lineWidth = 1 * dpr;
      ctx.globalAlpha = a.alpha * 0.55;
      ctx.beginPath();
      ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
      ctx.stroke();

      const ea = a.eOffset + t * a.eSpeed * (r + 1);
      const ex = Math.cos(ea) * rw;
      const ey = Math.sin(ea) * rh;

      ctx.globalAlpha = a.alpha;
      ctx.beginPath();
      ctx.fillStyle = a.c2;
      ctx.shadowColor = a.c2;
      ctx.shadowBlur = 10 * dpr;
      ctx.arc(ex, ey, 2.3 * dpr, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, a.size * 0.3 * dpr);
    grad.addColorStop(0, a.c2);
    grad.addColorStop(1, a.c1);

    ctx.globalAlpha = a.alpha;
    ctx.beginPath();
    ctx.fillStyle = grad;
    ctx.shadowColor = a.c1;
    ctx.shadowBlur = 16 * dpr;
    ctx.arc(0, 0, a.size * 0.17 * dpr, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  let start = null;
  let rafId = null;

  function frame(ts) {
    if (!start) start = ts;
    const t = ts - start;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const a of atoms) {
      a.x += a.vx;
      a.y += a.vy;
      a.angle += a.spin;

      if (a.x < -80) a.x = vw + 80;
      if (a.x > vw + 80) a.x = -80;
      if (a.y < -80) a.y = vh + 80;
      if (a.y > vh + 80) a.y = -80;

      drawAtom(a, t);
    }

    rafId = requestAnimationFrame(frame);
  }

  function start_() {
    resize();
    build();
    if (prefersReduced) {
      // desenha um quadro estático, sem animar (respeita preferência do usuário)
      drawAtom.callCount = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      atoms.forEach(a => drawAtom(a, 0));
      return;
    }
    if (rafId) cancelAnimationFrame(rafId);
    start = null;
    rafId = requestAnimationFrame(frame);
  }

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(start_, 200);
  });

  start_();

})();
