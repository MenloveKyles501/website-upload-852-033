(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroBg = document.querySelector('[data-hero-bg]');
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
    if (heroBg) {
      heroBg.style.backgroundImage = 'url(' + slides[current].getAttribute('data-bg') + ')';
    }
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  showSlide(0);
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function renderSearch(form, query) {
    var target = document.querySelector(form.getAttribute('data-search-target'));
    if (!target) {
      return;
    }
    var q = normalize(query);
    target.innerHTML = '';
    if (q.length < 1) {
      target.classList.remove('is-visible');
      return;
    }
    var data = window.SEARCH_ITEMS || [];
    var result = data.filter(function (item) {
      return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.tags).indexOf(q) > -1;
    }).slice(0, 12);
    result.forEach(function (item) {
      var a = document.createElement('a');
      var img = document.createElement('img');
      var wrap = document.createElement('span');
      var title = document.createElement('strong');
      var meta = document.createElement('span');
      a.className = 'search-result';
      a.href = item.link;
      img.src = item.cover;
      img.alt = '';
      title.textContent = item.title;
      meta.textContent = item.year + ' · ' + item.region + ' · ' + item.type;
      wrap.appendChild(title);
      wrap.appendChild(meta);
      a.appendChild(img);
      a.appendChild(wrap);
      target.appendChild(a);
    });
    target.classList.toggle('is-visible', result.length > 0);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    var input = form.querySelector('input');
    if (!input) {
      return;
    }
    input.addEventListener('input', function () {
      renderSearch(form, input.value);
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch(form, input.value);
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]')).forEach(function (area) {
    var input = area.querySelector('[data-filter-input]');
    var select = area.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));
    var empty = area.querySelector('[data-filter-empty]');
    function applyFilter() {
      var q = normalize(input ? input.value : '');
      var y = select ? select.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var hay = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-tags'));
        var year = card.getAttribute('data-year') || '';
        var ok = (!q || hay.indexOf(q) > -1) && (!y || year === y);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });
})();
