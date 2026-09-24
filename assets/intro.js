/* =====================================================================
   INTRO — Vinicius Macedo
   Porta em JS puro do componente React "IntroExperience".
   Gera as letras do nome, anima o canvas de partículas e controla
   o botão "Entrar no Portfólio" / "Pular intro".
===================================================================== */
(function () {

  const LOGO_TEXT = 'Vini Dev';
  const REDUCED_MOTION_DURATION = 650;
  const INTRO_DURATION = 4300;

  const shell = document.getElementById('introShell');
  const logoStage = document.getElementById('logoStage');
  const canvas = document.getElementById('particleField');
  const skipButton = document.getElementById('skipButton');

  if (!shell || !logoStage) return;

  /* ---------- Monta as letras do nome ---------- */
  const shineEl = logoStage.querySelector('.logo-shine');
  Array.from(LOGO_TEXT).forEach(function (letter, index) {
    const span = document.createElement('span');
    span.className = 'logo-letter' + (letter === ' ' ? ' logo-space' : '');
    span.style.setProperty('--letter-index', index);
    span.textContent = letter === ' ' ? '\u00a0' : letter;
    logoStage.insertBefore(span, shineEl);
  });

  /* ---------- Estado / util ---------- */
  let introComplete = false;
  let frameId = null;
  let startTime = null;
  let particles = [];

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function finishIntro() {
    if (introComplete) return;
    introComplete = true;
    shell.classList.add('is-complete');
    if (frameId) cancelAnimationFrame(frameId);
  }

  /* ---------- Reduced motion ---------- */
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = mediaQuery.matches;

  if (reducedMotion) {
    window.setTimeout(finishIntro, REDUCED_MOTION_DURATION);
  } else if (canvas) {
    const context = canvas.getContext('2d');

    if (context) {
      function resize() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * ratio;
        canvas.height = window.innerHeight * ratio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
      }

      const particleCount = window.innerWidth < 640 ? 46 : 92;
      particles = Array.from({ length: particleCount }, function (_, index) {
        return {
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          size: 0.4 + Math.random() * 1.7,
          speed: 0.04 + Math.random() * 0.12,
          alpha: 0.18 + Math.random() * 0.54,
          phase: index * 1.7
        };
      });

      resize();
      window.addEventListener('resize', resize);

      function render(time) {
        if (startTime === null) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / INTRO_DURATION, 1);
        const width = window.innerWidth;
        const height = window.innerHeight;
        context.clearRect(0, 0, width, height);

        const glow = context.createRadialGradient(
          width * 0.5, height * 0.48, 0,
          width * 0.5, height * 0.48, Math.max(width, height) * 0.52
        );
        glow.addColorStop(0, 'rgba(17, 87, 145, ' + (0.08 + Math.sin(progress * Math.PI) * 0.08) + ')');
        glow.addColorStop(0.55, 'rgba(7, 39, 75, 0.025)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);

        const impactProgress = Math.max(0, Math.min((elapsed - 2440) / 500, 1));

        particles.forEach(function (particle) {
          const drift = (particle.y + time * 0.00001 * particle.speed) % 1;
          const impactBurst = impactProgress > 0 ? easeOutCubic(impactProgress) : 0;
          const distance = 0.4 + particle.z * 1.5;
          const px = particle.x * width + Math.cos(particle.phase) * impactBurst * width * 0.19 * distance;
          const py = drift * height + Math.sin(particle.phase) * impactBurst * height * 0.14 * distance;
          const radius = particle.size * (1 + impactBurst * 1.5);
          const alpha = particle.alpha * (0.55 + Math.sin(time * 0.002 + particle.phase) * 0.2) * (1 - Math.max(0, progress - 0.8) * 2.5);
          context.beginPath();
          context.fillStyle = 'rgba(115, 203, 255, ' + Math.max(0, alpha) + ')';
          context.arc(px, py, radius, 0, Math.PI * 2);
          context.fill();
        });

        if (impactProgress > 0 && impactProgress < 1) {
          const ring = context.createRadialGradient(
            width * 0.5, height * 0.5, 0,
            width * 0.5, height * 0.5, width * 0.28 * impactProgress
          );
          ring.addColorStop(0, 'rgba(164, 232, 255, 0)');
          ring.addColorStop(0.75, 'rgba(83, 190, 255, ' + (0.13 * (1 - impactProgress)) + ')');
          ring.addColorStop(0.98, 'rgba(195, 243, 255, ' + (0.8 * (1 - impactProgress)) + ')');
          ring.addColorStop(1, 'rgba(108, 211, 255, 0)');
          context.fillStyle = ring;
          context.fillRect(0, 0, width, height);
        }

        if (progress < 1) {
          frameId = requestAnimationFrame(render);
        } else {
          finishIntro();
        }
      }

      frameId = requestAnimationFrame(render);
    }
  }

  /* ---------- Botões ---------- */
  if (skipButton) {
    skipButton.addEventListener('click', finishIntro);
  }

  // O botão "Entrar no Portfólio" é um link normal (href="portfolio.html"),
  // então funciona mesmo se o JS falhar — não precisa de listener pra navegar.

})();
