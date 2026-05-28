(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupImages();
    setupBackTop();
  });

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      toggle.textContent = nav.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function setupFilters() {
    var input = document.querySelector(".js-movie-filter");
    var year = document.querySelector(".js-year-filter");
    var list = document.querySelector("[data-filter-list]");
    var empty = document.querySelector("[data-empty-state]");
    if (!list || (!input && !year)) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function filter() {
      var keyword = normalize(input ? input.value : "");
      var selectedYear = normalize(year ? year.value : "");
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.category
        ].join(" "));
        var yearMatches = !selectedYear || normalize(card.dataset.year) === selectedYear;
        var keywordMatches = !keyword || haystack.indexOf(keyword) !== -1;
        var visible = yearMatches && keywordMatches;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    if (input) {
      input.addEventListener("input", filter);
    }
    if (year) {
      year.addEventListener("change", filter);
    }
    filter();
  }

  function setupImages() {
    var images = document.querySelectorAll("img");
    images.forEach(function (img) {
      img.addEventListener("error", function () {
        var frame = img.closest(".poster-frame, .hero-poster");
        if (frame) {
          frame.classList.add("poster-missing");
        }
      }, { once: true });
    });
  }

  function setupBackTop() {
    var button = document.createElement("button");
    button.className = "back-top";
    button.type = "button";
    button.setAttribute("aria-label", "返回顶部");
    button.textContent = "↑";
    document.body.appendChild(button);
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", function () {
      button.classList.toggle("is-visible", window.scrollY > 600);
    }, { passive: true });
  }
})();
