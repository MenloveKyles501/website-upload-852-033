(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var opened = mobileMenu.classList.toggle('open');
      document.body.classList.toggle('menu-open', opened);
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var topButton = document.querySelector('[data-back-top]');
  if (topButton) {
    window.addEventListener('scroll', function () {
      topButton.classList.toggle('show', window.scrollY > 420);
    });

    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === active);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startHero();
      });
    }

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  var globalSearch = document.querySelector('[data-global-search]');
  if (globalSearch) {
    globalSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var field = globalSearch.querySelector('input[name="q"]');
      var query = field ? field.value.trim() : '';
      window.location.href = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
    });
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var categorySelect = filterPanel.querySelector('[data-filter-category]');
    var emptyNotice = filterPanel.querySelector('[data-filter-empty]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function matchCard(card) {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.year,
        card.dataset.tags
      ].join(' '));
      var cardCategory = normalize(card.dataset.category);

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (year && normalize(card.dataset.year) !== year) {
        return false;
      }

      if (region && normalize(card.dataset.region) !== region) {
        return false;
      }

      if (category && cardCategory && cardCategory !== category) {
        return false;
      }

      return true;
    }

    function applyFilter() {
      var shown = 0;
      cards.forEach(function (card) {
        var matched = matchCard(card);
        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });

      if (emptyNotice) {
        emptyNotice.hidden = shown !== 0;
      }
    }

    filterPanel.addEventListener('input', applyFilter);
    filterPanel.addEventListener('change', applyFilter);
    filterPanel.addEventListener('reset', function () {
      window.setTimeout(applyFilter, 0);
    });
    applyFilter();
  }

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play]');
    var source = video ? video.querySelector('source') : null;
    var stream = source ? source.getAttribute('src') : '';
    var hls = null;
    var ready = false;

    function begin() {
      if (!video || !stream) {
        return;
      }

      if (button) {
        button.hidden = true;
      }

      if (ready) {
        video.play().catch(function () {});
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = stream;
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', begin);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          begin();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  });
})();
