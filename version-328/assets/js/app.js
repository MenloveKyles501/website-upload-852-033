(function () {
    var mobileButton = document.querySelector(".mobile-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;
    var sliderTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var index = Number(dot.getAttribute("data-hero-dot"));
            showSlide(index);
            if (sliderTimer) {
                window.clearInterval(sliderTimer);
            }
            sliderTimer = window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        });
    });

    if (slides.length > 1) {
        sliderTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    function normalizeText(text) {
        return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function filterCards(value) {
        var keyword = normalizeText(value);
        var cards = document.querySelectorAll("[data-search]");

        cards.forEach(function (card) {
            var haystack = normalizeText(card.getAttribute("data-search"));
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.classList.toggle("hidden-by-filter", !matched);
        });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));

    filterInputs.forEach(function (input) {
        if (query && !input.value) {
            input.value = query;
        }

        input.addEventListener("input", function () {
            filterCards(input.value);
        });
    });

    if (query) {
        filterCards(query);
    }
})();

function startMoviePlayer(streamUrl) {
    var player = document.querySelector("[data-player]");

    if (!player || !streamUrl) {
        return;
    }

    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");

    if (!video) {
        return;
    }

    function playVideo() {
        if (cover) {
            cover.classList.add("is-hidden");
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (!video.getAttribute("src")) {
                video.setAttribute("src", streamUrl);
            }
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video.hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                video.hlsInstance = hls;
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.play().catch(function () {});
            }
            return;
        }

        if (!video.getAttribute("src")) {
            video.setAttribute("src", streamUrl);
        }
        video.play().catch(function () {});
    }

    if (cover) {
        cover.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });
}
