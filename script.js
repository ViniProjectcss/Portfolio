gsap.registerPlugin(ScrollTrigger);

// HERO

gsap.from(".tag", {
  opacity: 0,
  y: 30,
  duration: 1
});

gsap.from(".title", {
  opacity: 0,
  y: 50,
  duration: 1,
  delay: 0.3
});

gsap.from(".subtitle", {
  opacity: 0,
  y: 50,
  duration: 1,
  delay: 0.6
});

gsap.from(".hero-buttons", {
  opacity: 0,
  y: 50,
  duration: 1,
  delay: 0.9
});

// INTEGRATIONS

gsap.utils.toArray(".integration-card").forEach((card) => {

  gsap.fromTo(card,

    {
      opacity: 0,
      y: 80
    },

    {
      opacity: 1,
      y: 0,
      duration: 1,

      scrollTrigger: {
        trigger: card,
        start: "top 85%",

        toggleActions: "play reset play reset"
      }
    }

  );

});

// SKILLS

gsap.fromTo(".skills-carousel-wrapper", { opacity: 0, y: 60 }, {
  opacity: 1,
  y: 0,
  duration: 1,
  scrollTrigger: {
    trigger: ".skills-carousel-wrapper",
    start: "top 85%",
    toggleActions: "play reset play reset"
  }
});

gsap.fromTo(".learning-card", { opacity: 0, y: 60 }, {
  opacity: 1,
  y: 0,
  duration: 1,
  scrollTrigger: {
    trigger: ".learning-card",
    start: "top 88%",
    toggleActions: "play reset play reset"
  }
});

// ========================================
// CARROSSEL DE HABILIDADES
// ========================================

(function () {

  const track = document.getElementById('skillsTrack');
  const carousel = document.getElementById('skillsCarousel');
  const prevBtn = document.getElementById('skillPrev');
  const nextBtn = document.getElementById('skillNext');
  const dotsContainer = document.getElementById('skillDots');

  if (!track || !carousel) return;

  const cards = Array.from(track.querySelectorAll('.skill-card'));
  let currentIndex = 0;
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 3200;

  function getVisibleCards() {
    const containerWidth = carousel.offsetWidth;
    const cardWidth = cards[0].offsetWidth + 22;
    return Math.max(1, Math.floor(containerWidth / cardWidth));
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getVisibleCards());
  }

  function getCardWidth() {
    return cards[0].offsetWidth + 22;
  }

  function updateCarousel() {
    const offset = currentIndex * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    const totalDots = getMaxIndex() + 1;
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('span');
      dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
      dot.addEventListener('click', function () {
        currentIndex = i;
        updateCarousel();
        startAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function goPrev() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = getMaxIndex();
    }
    updateCarousel();
  }

  function goNext() {
    if (currentIndex < getMaxIndex()) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateCarousel();
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(goNext, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  prevBtn.addEventListener('click', function () {
    goPrev();
    startAutoplay();
  });

  nextBtn.addEventListener('click', function () {
    goNext();
    startAutoplay();
  });

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('touchstart', stopAutoplay, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (currentIndex > getMaxIndex()) currentIndex = getMaxIndex();
      buildDots();
      updateCarousel();
    }, 200);
  });

  buildDots();
  updateCarousel();
  startAutoplay();

})();

// PROJETOS

async function carregarProjetos() {

  const res = await fetch('./projects.json');

  const projetos = await res.json();

  const container =
    document.getElementById('projects-container');

  projetos.forEach((p) => {

    const card = document.createElement('div');

    card.classList.add('card');

    card.innerHTML = `
      <img src="${p.imagem}" alt="">

      <div class="card-content">

        <h3>${p.nome}</h3>

        <p>${p.descricao}</p>

        <small>
          ${p.tecnologias.join(' • ')}
        </small>

      </div>
    `;

    container.appendChild(card);

    gsap.to(card, {

      opacity: 1,
      y: 0,
      duration: 1,

      scrollTrigger: {
        trigger: card,
        start: "top 85%"
      }

    });

  });

}

carregarProjetos();


gsap.registerPlugin(ScrollTrigger);

// ANIMAÇÃO DOS CARDS

gsap.utils.toArray(".project-card").forEach((card) => {

  gsap.fromTo(card,

    {
      opacity: 0,
      y: 80
    },

    {
      opacity: 1,
      y: 0,
      duration: 1,

      scrollTrigger: {
        trigger: card,
        start: "top 85%",

        toggleActions: "play reset play reset"
      }
    }

  );

});



gsap.registerPlugin(ScrollTrigger);

/* =====================================================
   ABOUT TEXT
===================================================== */

gsap.utils.toArray(".about-content p").forEach((item) => {

  gsap.to(item, {

    opacity: 1,
    y: 0,
    duration: 1,

    scrollTrigger: {
      trigger: item,
      start: "top 88%",

      toggleActions: "play reset play reset"
    }

  });

});



/* =====================================================
   SOFT SKILLS
===================================================== */

gsap.utils.toArray(".soft-card").forEach((card) => {

  gsap.to(card, {

    opacity: 1,
    y: 0,
    duration: 1,

    scrollTrigger: {
      trigger: card,
      start: "top 85%",

      toggleActions: "play reset play reset"
    }

  });

});


/* =====================================================
   WORKFLOW
===================================================== */

gsap.utils.toArray(".workflow-card").forEach((card) => {

  gsap.to(card, {

    opacity: 1,
    y: 0,
    duration: 1,

    scrollTrigger: {
      trigger: card,
      start: "top 85%",

      toggleActions: "play reset play reset"
    }

  });

});


/* =====================================================
   ABOUT EDUCATION
===================================================== */

gsap.to(".about-education", {

  opacity: 1,
  y: 0,
  duration: 1,

  scrollTrigger: {
    trigger: ".about-education",
    start: "top 88%",

    toggleActions: "play reset play reset"
  }

});




// ========================================
// MODAL PROJETOS
// ========================================

function openModal(id) {

  document.getElementById(id).classList.add('active');

}

function closeModal(id) {

  document.getElementById(id).classList.remove('active');

}

window.addEventListener('click', function(e) {

  document.querySelectorAll('.project-modal').forEach(modal => {

    if (e.target === modal) {

      modal.classList.remove('active');

    }

  });

});

/* =====================================================================
   FOTO — ANIMAÇÃO DE SCROLL (HERO → SOBRE MIM)
   -----------------------------------------------------------------
   Move a foto (.hero-image) da posição original no Hero até a área
   reservada em "Sobre Mim" (.about-photo-target), acompanhando a
   progressão do scroll (GSAP ScrollTrigger com scrub).

   Não mexe em nenhum outro elemento do Hero: um placeholder do
   mesmo tamanho é inserido no lugar da foto para que o layout
   (textos, botões, stats, fundo, partículas) não se mova nem um
   pixel.
===================================================================== */
(function () {

  const heroImage   = document.querySelector('.hero-image');
  const heroSection = document.querySelector('.hero');
  const aboutSection = document.querySelector('.about');
  const aboutTarget  = document.querySelector('.about-photo-target');

  if (!heroImage || !heroSection || !aboutSection || !aboutTarget) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Respeita usuários que pedem menos animação no sistema.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Ajuste este valor (0 a 1) para escolher o quão "pelo centro"
  // a foto passa no meio do trajeto. 0.5 = exatamente na metade.
  const MEIO_TRAJETO = 0.55;

  // "scrub" controla a suavidade/velocidade de resposta ao scroll:
  // valores menores (ex: 0.2) seguem o scroll quase instantaneamente,
  // valores maiores (ex: 1.5) deixam a foto "atrasada", mais suave.
  const SCRUB = 0.6;

  // Mesma largura em que o CSS empilha o Hero (foto abaixo do texto).
  // Nesse layout a foto só aparece depois que o usuário rola além do
  // texto/botões, então o gatilho de início da animação precisa ser
  // a própria foto entrando na tela — não o topo do Hero inteiro.
  const STACKED_BREAKPOINT = 992;

  let placeholder = null;
  let heroPhotoTimeline = null;

  function pageOffset(rect) {
    return {
      left: rect.left + (window.scrollX || window.pageXOffset),
      top: rect.top + (window.scrollY || window.pageYOffset),
      width: rect.width,
      height: rect.height
    };
  }

  function destroyPhotoScroll() {
    if (heroPhotoTimeline) {
      heroPhotoTimeline.scrollTrigger && heroPhotoTimeline.scrollTrigger.kill();
      heroPhotoTimeline.kill();
      heroPhotoTimeline = null;
    }

    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.insertBefore(heroImage, placeholder);
      placeholder.parentNode.removeChild(placeholder);
      placeholder = null;
    }

    heroImage.style.position = '';
    heroImage.style.left = '';
    heroImage.style.top = '';
    heroImage.style.width = '';
    heroImage.style.height = '';
    heroImage.style.margin = '';
    heroImage.style.zIndex = '';
    heroImage.style.willChange = '';
  }

  function setupPhotoScroll() {

    if (heroPhotoTimeline) return; // já configurado

    const isStacked = window.innerWidth <= STACKED_BREAKPOINT;

    // Posição/tamanho atuais da foto (exatamente como está hoje).
    const start = pageOffset(heroImage.getBoundingClientRect());

    // Placeholder ocupa o lugar da foto no layout flex do Hero,
    // preservando o espaçamento entre hero-content / hero-image.
    placeholder = document.createElement('div');
    placeholder.style.width = start.width + 'px';
    placeholder.style.height = start.height + 'px';
    placeholder.style.flexShrink = '0';
    placeholder.setAttribute('aria-hidden', 'true');
    heroImage.parentNode.insertBefore(placeholder, heroImage);

    // A foto passa a ser posicionada em coordenadas de página,
    // livre do "overflow: hidden" do Hero.
    document.body.appendChild(heroImage);

    heroImage.style.position = 'absolute';
    heroImage.style.margin = '0';
    heroImage.style.left = start.left + 'px';
    heroImage.style.top = start.top + 'px';
    heroImage.style.width = start.width + 'px';
    heroImage.style.height = start.height + 'px';
    heroImage.style.zIndex = '500';
    heroImage.style.willChange = 'left, top, width, height';

    // Posição final = área reservada em "Sobre Mim".
    const end = pageOffset(aboutTarget.getBoundingClientRect());

    // Ponto intermediário: centro da tela, criando a trajetória
    // diagonal entre o Hero e "Sobre Mim".
    const midWidth  = start.width + (end.width - start.width) * MEIO_TRAJETO;
    const midHeight = start.height + (end.height - start.height) * MEIO_TRAJETO;
    const mid = {
      left: (window.innerWidth / 2) - (midWidth / 2),
      top: start.top + (end.top - start.top) * MEIO_TRAJETO,
      width: midWidth,
      height: midHeight
    };

    heroPhotoTimeline = gsap.timeline({
      scrollTrigger: isStacked
        ? {
            // Mobile/empilhado: a foto começa parada. Só passa a se
            // mexer quando o usuário rolar o suficiente para ela
            // chegar ao topo da tela (ou seja, depois de ler o texto
            // e os botões, quando a foto já está totalmente visível).
            trigger: placeholder,
            start: 'top top',
            endTrigger: aboutSection,
            end: 'top top',
            scrub: SCRUB,
            invalidateOnRefresh: true
          }
        : {
            // Desktop: comportamento original, sem alterações.
            trigger: heroSection,
            start: 'top top',
            endTrigger: aboutSection,
            end: 'top top',
            scrub: SCRUB,
            invalidateOnRefresh: true
          }
    });

    // Duração explícita (1) em cada trecho + "posicionamento
    // por encadeamento" (a segunda animação começa exatamente
    // onde a primeira termina, sem usar um instante fixo como
    // "1"). Isso elimina o intervalo "morto" que fazia a foto
    // ficar parada no meio do trajeto.
    heroPhotoTimeline
      .to(heroImage, {
        left: mid.left,
        top: mid.top,
        width: mid.width,
        height: mid.height,
        duration: 1,
        ease: 'power1.inOut'
      })
      .to(heroImage, {
        left: end.left,
        top: end.top,
        width: end.width,
        height: end.height,
        duration: 1,
        ease: 'power1.inOut'
      });
  }

  window.addEventListener('load', setupPhotoScroll);

  // No mobile, a barra de endereço do navegador aparece/some durante
  // o scroll e isso dispara "resize" mudando só a altura (innerHeight),
  // sem mudar a largura. Se reconstruíssemos a animação nesse momento,
  // ela travaria/sumiria no meio do gesto de rolagem. Por isso só
  // reconstruímos quando a LARGURA realmente muda (giro de tela,
  // redimensionar janela no desktop etc.).
  let resizeTimer;
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      destroyPhotoScroll();
      setupPhotoScroll();
      ScrollTrigger.refresh();
    }, 250);
  });

})();

/* =====================================================================
   NAVBAR — scroll state + menu mobile
   (Bloco novo, não interfere na animação de scroll da foto acima)
===================================================================== */
(function () {

  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');

  if (navbar) {
    const onScroll = function () {
      if (window.scrollY > 40) {
        navbar.classList.add('is-scrolled');
      } else {
        navbar.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  if (navToggle && navbar) {
    navToggle.addEventListener('click', function () {
      navbar.classList.toggle('is-open');
    });

    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        navbar.classList.remove('is-open');
      });
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

})();

/* =====================================================================
   DOWNLOAD FORÇADO DO CURRÍCULO
   -----------------------------------------------------------------
   Baixa o PDF via fetch + blob em vez de deixar o navegador navegar
   até o arquivo (o que abre o visualizador nativo em vez de baixar).
   Só funciona servido por http/https (GitHub Pages, Live Server etc);
   em file:// o fetch falha e cai no fallback (comportamento antigo).
===================================================================== */
(function () {

  document.querySelectorAll('.js-cv-download').forEach(function (link) {
    link.addEventListener('click', async function (e) {
      e.preventDefault();
      const url = link.getAttribute('href');

      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = 'Curriculo-Vinicius-Macedo.pdf';
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();

        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        window.location.href = url;
      }
    });
  });

})();