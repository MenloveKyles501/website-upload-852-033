(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-video-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var trigger = box.querySelector("[data-player-trigger]");
      var state = box.querySelector("[data-player-state]");
      if (!video || !trigger) {
        return;
      }

      var stream = video.getAttribute("data-stream");
      var loaded = false;
      var hls = null;

      function setState(message) {
        if (!state) {
          return;
        }
        state.textContent = message || "";
        state.classList.toggle("is-visible", Boolean(message));
      }

      function hideLayer() {
        trigger.classList.add("is-hidden");
      }

      function showLayer() {
        trigger.classList.remove("is-hidden");
      }

      function startVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            showLayer();
            setState("点击播放");
          });
        }
      }

      function bindStream() {
        if (!stream) {
          setState("线路暂不可用");
          return;
        }
        if (loaded) {
          hideLayer();
          startVideo();
          return;
        }
        loaded = true;
        setState("正在加载影片…");

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setState("");
            hideLayer();
            startVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setState("线路繁忙，请稍后再试");
              showLayer();
              try {
                hls.destroy();
              } catch (error) {
                hls = null;
              }
            }
          });
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.addEventListener("loadedmetadata", function () {
            setState("");
            hideLayer();
            startVideo();
          }, { once: true });
          video.load();
          return;
        }

        video.src = stream;
        video.addEventListener("canplay", function () {
          setState("");
          hideLayer();
          startVideo();
        }, { once: true });
        video.load();
      }

      trigger.addEventListener("click", bindStream);
      video.addEventListener("play", hideLayer);
      video.addEventListener("pause", function () {
        if (!video.ended) {
          showLayer();
        }
      });
      video.addEventListener("ended", showLayer);
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
