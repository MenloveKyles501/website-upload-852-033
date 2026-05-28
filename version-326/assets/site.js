(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(next) {
    if (!slides.length) return;
    current = (next + slides.length) % slides.length;
    slides.forEach(function (slide, index) {
      slide.classList.toggle('is-active', index === current);
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === current);
    });
  }

  var nextButton = document.querySelector('[data-hero-next]');
  var prevButton = document.querySelector('[data-hero-prev]');

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(current + 1);
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(current - 1);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function wireFilter(panel) {
    var targetId = panel.getAttribute('data-target');
    var target = document.getElementById(targetId);
    if (!target) return;

    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var region = panel.querySelector('[data-filter-region]');
    var empty = document.querySelector('[data-empty-for="' + targetId + '"]');

    function apply() {
      var term = normalize(input && input.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var r = normalize(region && region.value);
      var shown = 0;
      var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matched = true;

        if (term && search.indexOf(term) === -1) matched = false;
        if (y && cardYear !== y) matched = false;
        if (t && cardType !== t) matched = false;
        if (r && cardRegion !== r) matched = false;

        card.style.display = matched ? '' : 'none';
        if (matched) shown += 1;
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    [input, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }
    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(wireFilter);
})();
