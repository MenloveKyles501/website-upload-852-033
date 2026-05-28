(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
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
    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-slide")) || 0);
        play();
      });
    });
    play();
  }

  function setupLocalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-live-search]"));
    inputs.forEach(function (input) {
      var list = input.closest("section").querySelector("[data-search-list]");
      if (!list) {
        return;
      }
      var items = Array.prototype.slice.call(list.querySelectorAll(".searchable-item"));
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          var text = item.textContent.toLowerCase() + " " + (item.getAttribute("data-title") || "").toLowerCase() + " " + (item.getAttribute("data-genre") || "").toLowerCase() + " " + (item.getAttribute("data-region") || "").toLowerCase();
          item.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
        });
      });
    });
  }

  function setupSearchPage() {
    var input = document.getElementById("siteSearch");
    var genre = document.getElementById("genreFilter");
    var year = document.getElementById("yearFilter");
    var region = document.getElementById("regionFilter");
    var list = document.getElementById("searchResults");
    var status = document.getElementById("searchStatus");
    if (!input || !genre || !year || !region || !list) {
      return;
    }
    var items = Array.prototype.slice.call(list.querySelectorAll(".searchable-item"));
    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var genreValue = genre.value;
      var yearValue = year.value;
      var regionValue = region.value;
      var visible = false;
      items.forEach(function (item) {
        var title = (item.getAttribute("data-title") || "").toLowerCase();
        var itemGenre = item.getAttribute("data-genre") || "";
        var itemYear = item.getAttribute("data-year") || "";
        var itemRegion = item.getAttribute("data-region") || "";
        var text = item.textContent.toLowerCase() + " " + title + " " + itemGenre.toLowerCase() + " " + itemRegion.toLowerCase();
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!genreValue || itemGenre.indexOf(genreValue) !== -1) && (!yearValue || itemYear === yearValue) && (!regionValue || itemRegion === regionValue);
        item.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible = true;
        }
      });
      if (status) {
        status.textContent = visible ? "片单已按条件更新" : "没有匹配内容，换个关键词试试";
      }
    }
    input.addEventListener("input", apply);
    genre.addEventListener("change", apply);
    year.addEventListener("change", apply);
    region.addEventListener("change", apply);
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playButton");
    if (!video || !button || !source) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function play() {
      attach();
      button.classList.add("is-hidden");
      var started = video.play();
      if (started && typeof started.catch === "function") {
        started.catch(function () {});
      }
    }
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
  };

  onReady(function () {
    setupMenu();
    setupHero();
    setupLocalSearch();
    setupSearchPage();
  });
})();
