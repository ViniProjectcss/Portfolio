particlesJS("particles-js", {

  particles: {

    number: {
      value: 70
    },

    color: {
      value: "#38bdf8"
    },

    shape: {
      type: "circle"
    },

    opacity: {
      value: 0.3
    },

    size: {
      value: 3
    },

    line_linked: {
      enable: true,
      distance: 150,
      color: "#38bdf8",
      opacity: 0.2,
      width: 1
    },

    move: {
      enable: true,
      speed: 2
    }

  },

  interactivity: {

    detect_on: "canvas",

    events: {

      onhover: {
        enable: true,
        mode: "grab"
      }

    },

    modes: {

      grab: {
        distance: 140,

        line_linked: {
          opacity: 0.5
        }
      }

    }

  },

  retina_detect: true

});