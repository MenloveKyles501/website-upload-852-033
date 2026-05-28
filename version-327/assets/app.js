(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = $('.menu-toggle');
        var menu = $('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            button.textContent = menu.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function initHeaderSearch() {
        $all('form.site-search, form.large-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    input.focus();
                }
            });
        });
    }

    function initHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('.hero-slide', hero);
        var dots = $all('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var input = $('[data-filter-input]');
        var list = $('[data-filter-list]');
        if (!input || !list) {
            return;
        }
        var items = $all('[data-search]', list);
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');
        if (initial) {
            input.value = initial;
        }

        function apply() {
            var query = normalize(input.value);
            items.forEach(function (item) {
                var haystack = normalize(item.getAttribute('data-search'));
                item.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
            });
        }

        input.addEventListener('input', apply);
        $all('[data-filter-chip]').forEach(function (chip) {
            chip.addEventListener('click', function () {
                input.value = chip.getAttribute('data-filter-chip') || chip.textContent || '';
                input.focus();
                apply();
            });
        });
        apply();
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById('movie-player');
        var startButton = document.getElementById('player-start');
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = source;
            }
        }

        function play() {
            load();
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (startButton) {
                        startButton.classList.remove('is-hidden');
                    }
                });
            }
        }

        load();
        if (startButton) {
            startButton.addEventListener('click', play);
        }
        video.addEventListener('play', function () {
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHeaderSearch();
        initHero();
        initFilters();
    });
}());
