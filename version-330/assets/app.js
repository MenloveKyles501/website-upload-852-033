(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        start();
    }

    function initGlobalSearch() {
        document.querySelectorAll('[data-global-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });
    }

    function initCategoryFilter() {
        var grid = document.querySelector('[data-card-grid]');
        if (!grid) {
            return;
        }
        var input = document.querySelector('[data-filter-input]');
        var year = document.querySelector('[data-filter-year]');
        var type = document.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            var selectedType = type ? type.value : '';
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-keywords')
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
                card.style.display = matchKeyword && matchYear && matchType ? '' : 'none';
            });
        }
        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    function movieResultCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a href="' + escapeHtml(item.url) + '">',
            '<div class="poster-box">',
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<div class="poster-mask"><p>' + escapeHtml(item.summary) + '</p></div>',
            '<div class="poster-badges"><span class="badge badge-dark">' + escapeHtml(item.year) + '</span></div>',
            '<span class="play-chip">▶</span>',
            '</div>',
            '<div class="movie-card-body">',
            '<h3>' + escapeHtml(item.title) + '</h3>',
            '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
            '<div class="movie-tags">' + tags + '</div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[char];
        });
    }

    function initSearchPage() {
        var results = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-page-input]');
        var form = document.querySelector('[data-search-page-form]');
        if (!results || !input || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        function render(query) {
            var keyword = query.trim().toLowerCase();
            if (!keyword) {
                results.innerHTML = '<div class="search-empty">输入关键词后即可查找影片。</div>';
                return;
            }
            var matched = window.SEARCH_INDEX.filter(function (item) {
                return String(item.keywords || '').toLowerCase().indexOf(keyword) !== -1;
            }).slice(0, 120);
            if (!matched.length) {
                results.innerHTML = '<div class="search-empty">没有找到匹配影片。</div>';
                return;
            }
            results.innerHTML = matched.map(movieResultCard).join('');
        }
        render(initial);
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var url = new URL(window.location.href);
            if (query) {
                url.searchParams.set('q', query);
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState({}, '', url.toString());
            render(query);
        });
    }

    window.initializePlayer = function (source) {
        var video = document.querySelector('[data-player-video]');
        var trigger = document.querySelector('[data-play-trigger]');
        if (!video || !trigger || !source) {
            return;
        }
        var hls = null;
        var attached = false;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            attach();
            trigger.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }
        trigger.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            trigger.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initNavigation();
        initHero();
        initGlobalSearch();
        initCategoryFilter();
        initSearchPage();
    });
})();
