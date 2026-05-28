(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initGlobalSearch() {
    var forms = document.querySelectorAll("[data-global-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    if (slides.length > 1) {
      start();
    }
  }

  function uniqueSorted(values) {
    return values.filter(Boolean).filter(function (value, index, array) {
      return array.indexOf(value) === index;
    }).sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var lists = document.querySelectorAll("[data-filter-list]");
    lists.forEach(function (list) {
      var scope = list.parentElement.querySelector("[data-filter-scope]");
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
      var input = scope.querySelector("[data-filter-input]");
      var region = scope.querySelector("[data-filter-region]");
      var year = scope.querySelector("[data-filter-year]");
      fillSelect(region, uniqueSorted(cards.map(function (card) { return card.dataset.region; })));
      fillSelect(year, uniqueSorted(cards.map(function (card) { return card.dataset.year; })));

      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.type, card.dataset.tags, card.textContent].join(" ").toLowerCase();
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (regionValue && card.dataset.region !== regionValue) {
            matched = false;
          }
          if (yearValue && card.dataset.year !== yearValue) {
            matched = false;
          }
          card.classList.toggle("is-filter-hidden", !matched);
        });
      }

      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function attachSource(video, source) {
    if (!video) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = source;
  }

  function initPlayer(videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !source) {
      return;
    }
    var started = false;

    function play() {
      if (!started) {
        attachSource(video, source);
        started = true;
      }
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
  }

  ready(function () {
    initMobileNav();
    initGlobalSearch();
    initHero();
    initFilters();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
