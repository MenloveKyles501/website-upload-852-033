(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function() {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, pos) {
        slide.classList.toggle('is-active', pos === current);
      });
      dots.forEach(function(dot, pos) {
        dot.classList.toggle('is-active', pos === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, pos) {
      dot.addEventListener('click', function() {
        show(pos);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function(panel) {
      var search = panel.querySelector('[data-site-search]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var section = panel.parentElement;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
      var empty = panel.querySelector('[data-empty-state]');

      function yearMatch(cardYear, wanted) {
        if (!wanted) {
          return true;
        }
        if (wanted === '2010') {
          return /^201/.test(cardYear);
        }
        if (wanted === '2000') {
          return /^200/.test(cardYear);
        }
        if (wanted === '1990') {
          var number = parseInt(cardYear, 10);
          return !number || number < 2000;
        }
        return cardYear === wanted;
      }

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : '';
        var wantedRegion = region ? region.value : '';
        var wantedType = type ? type.value : '';
        var wantedYear = year ? year.value : '';
        var visible = 0;

        cards.forEach(function(card) {
          var haystack = card.getAttribute('data-search') || '';
          var cardRegion = card.getAttribute('data-region') || '';
          var cardType = card.getAttribute('data-type') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (wantedRegion && cardRegion.indexOf(wantedRegion) === -1 && haystack.indexOf(wantedRegion.toLowerCase()) === -1) {
            ok = false;
          }
          if (wantedType && cardType.indexOf(wantedType) === -1 && haystack.indexOf(wantedType.toLowerCase()) === -1) {
            ok = false;
          }
          if (!yearMatch(cardYear, wantedYear)) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [search, region, type, year].forEach(function(control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      if (search && params.get('q')) {
        search.value = params.get('q');
      }
      apply();
    });
  }

  window.initMoviePlayer = function(videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hls = null;
    if (!video || !overlay || !source) {
      return;
    }

    function reveal() {
      overlay.classList.add('is-hidden');
    }

    function restore() {
      overlay.classList.remove('is-hidden');
    }

    function playVideo() {
      reveal();
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', source);
        }
        video.play().catch(restore);
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(restore);
          });
        } else {
          video.play().catch(restore);
        }
        return;
      }
      if (!video.getAttribute('src')) {
        video.setAttribute('src', source);
      }
      video.play().catch(restore);
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function() {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', reveal);
    video.addEventListener('ended', restore);
  };

  ready(function() {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
