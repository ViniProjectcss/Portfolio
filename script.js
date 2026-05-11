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