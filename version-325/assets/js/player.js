(function () {
  var video = document.getElementById('movie-video');
  var start = document.getElementById('player-start');
  var cover = document.querySelector('.player-cover');
  var clip = window.__clip || '';
  var ready = false;
  var hls = null;

  function prepare() {
    if (!video || !clip || ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = clip;
      ready = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(clip);
      hls.attachMedia(video);
      ready = true;
    }
  }

  function begin() {
    prepare();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    if (video) {
      var play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(function () {});
      }
    }
  }

  if (start) {
    start.addEventListener('click', begin);
  }
  if (cover) {
    cover.addEventListener('click', begin);
  }
  if (video) {
    video.addEventListener('click', prepare);
  }
  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
})();
