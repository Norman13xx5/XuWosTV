(function () {
  'use strict';

  var video;
  var seekbar;
  var progress;
  var buffered;
  var thumb;
  var currentLabel;
  var totalLabel;
  var scrubbing = false;
  var originalTime = 0;
  var previewTime = 0;
  var resumeAfterSeek = false;

  function finitePositive(value) {
    return typeof value === 'number' && isFinite(value) && value > 0 ? value : 0;
  }

  function parseDuration(value) {
    if (typeof value === 'number') return finitePositive(value);
    if (typeof value !== 'string') return 0;
    var text = value.trim();
    if (!text || text === '-' || text === '—') return 0;
    var parts = text.split(':');
    if (parts.length === 2 || parts.length === 3) {
      var seconds = 0;
      for (var i = 0; i < parts.length; i++) {
        var part = Number(parts[i]);
        if (!isFinite(part) || part < 0) return 0;
        seconds = seconds * 60 + part;
      }
      return finitePositive(seconds);
    }
    var numeric = Number(text);
    return finitePositive(numeric);
  }

  function state() {
    return window.__xuper && window.__xuper.state;
  }

  function duration() {
    var appState = state();
    var mediaDuration = video && finitePositive(video.duration);
    if (mediaDuration) return mediaDuration;
    if (appState && appState.playerEpisode) {
      var episodeDuration = parseDuration(appState.playerEpisode.duration);
      if (episodeDuration) return episodeDuration;
    }
    if (appState && appState.playerItem) {
      var itemDuration = parseDuration(appState.playerItem.duration);
      if (itemDuration) return itemDuration;
    }
    return 0;
  }

  function position() {
    return video && typeof video.currentTime === 'number' && isFinite(video.currentTime) ?
      Math.max(0, video.currentTime) : 0;
  }

  function format(seconds) {
    if (!finitePositive(seconds) && seconds !== 0) return '--:--:--';
    seconds = Math.max(0, Math.floor(seconds));
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var rest = seconds % 60;
    function pad(value) { return value < 10 ? '0' + value : String(value); }
    return pad(hours) + ':' + pad(minutes) + ':' + pad(rest);
  }

  function render(time, total) {
    if (!seekbar || !progress || !thumb) return;
    var known = finitePositive(total);
    var percent = known ? Math.min(100, Math.max(0, (time / total) * 100)) : 0;
    seekbar.classList.toggle('is-seek-disabled', !known);
    if (currentLabel) currentLabel.textContent = known ? format(time) : '--:--:--';
    if (totalLabel) totalLabel.textContent = known ? format(total) : '--:--:--';
    progress.style.width = percent.toFixed(3) + '%';
    thumb.style.left = percent.toFixed(3) + '%';

    if (buffered && video && video.buffered && video.buffered.length && known) {
      try {
        var end = video.buffered.end(video.buffered.length - 1);
        buffered.style.width = Math.min(100, Math.max(0, (end / total) * 100)).toFixed(3) + '%';
      } catch (error) {
        buffered.style.width = '0%';
      }
    } else if (buffered) {
      buffered.style.width = '0%';
    }
  }

  function isVod() {
    var appState = state();
    return !!(appState && appState.screen === 'player' && appState.playerMode === 'vod');
  }

  function focusElement(element) {
    if (window.__xuper && typeof window.__xuper.focus === 'function') {
      window.__xuper.focus(element);
    } else if (element && element.focus) {
      element.focus();
    }
  }

  function focusIsPlayer() {
    var appState = state();
    if (!appState || !appState.focus) return true;
    return appState.focus === seekbar || appState.focus === video ||
      appState.focus.id === 'player-stage' || appState.focus.id === 'vod-seekbar';
  }

  function setTime(next) {
    var total = duration();
    if (!total || !video) return false;
    previewTime = Math.min(total - 0.05, Math.max(0, next));
    try {
      video.currentTime = previewTime;
    } catch (error) {
      return false;
    }
    render(previewTime, total);
    return true;
  }

  function moveBy(delta) {
    var total = duration();
    if (!total) {
      render(position(), 0);
      return;
    }
    setTime((scrubbing ? previewTime : position()) + delta);
  }

  function enterScrub() {
    if (scrubbing || !isVod()) return;
    var total = duration();
    if (!total) {
      render(position(), 0);
      return;
    }
    originalTime = position();
    previewTime = originalTime;
    resumeAfterSeek = !!(video && !video.paused);
    if (video && resumeAfterSeek) video.pause();
    scrubbing = true;
    seekbar.classList.add('is-scrubbing');
    focusElement(seekbar);
    render(previewTime, total);
  }

  function leaveScrub(commit) {
    if (!scrubbing) return;
    if (!commit) setTime(originalTime);
    scrubbing = false;
    seekbar.classList.remove('is-scrubbing');
    focusElement(video && document.getElementById('player-stage'));
    if (commit && resumeAfterSeek && video) {
      try {
        var promise = video.play();
        if (promise && promise.catch) promise.catch(function () {});
      } catch (error) {}
    }
    resumeAfterSeek = false;
    render(position(), duration());
  }

  function handleKey(event) {
    if (!isVod() || !focusIsPlayer()) return;
    var key = event.key || '';
    var code = event.keyCode || event.which;
    var left = key === 'ArrowLeft' || code === 37;
    var right = key === 'ArrowRight' || code === 39;
    var up = key === 'ArrowUp' || code === 38;
    var down = key === 'ArrowDown' || code === 40;
    var enter = key === 'Enter' || key === 'OK' || code === 13;
    var back = key === 'Back' || key === 'GoBack' || code === 461;

    if (scrubbing) {
      if (left || right) {
        event.preventDefault();
        event.stopPropagation();
        var step = Math.max(10, duration() * 0.02);
        moveBy(left ? -step : step);
      } else if (down || enter) {
        event.preventDefault();
        event.stopPropagation();
        leaveScrub(true);
      } else if (back || up) {
        event.preventDefault();
        event.stopPropagation();
        leaveScrub(false);
      }
      return;
    }

    if (up) {
      event.preventDefault();
      event.stopPropagation();
      enterScrub();
    } else if (left || right) {
      event.preventDefault();
      event.stopPropagation();
      moveBy(left ? -10 : 10);
    }
  }

  function refresh() {
    render(position(), duration());
  }

  function start() {
    video = document.getElementById('player-video');
    seekbar = document.getElementById('vod-seekbar');
    progress = document.getElementById('vod-seek-progress');
    buffered = document.getElementById('vod-seek-buffered');
    thumb = document.getElementById('vod-seek-thumb');
    currentLabel = document.getElementById('vod-time-current');
    totalLabel = document.getElementById('vod-time-total');
    if (!video || !seekbar) return;

    document.addEventListener('keydown', handleKey, true);
    ['loadedmetadata', 'durationchange', 'timeupdate', 'progress', 'canplay', 'seeked'].forEach(function (name) {
      video.addEventListener(name, refresh, false);
    });
    // The legacy player also refreshes the bar on its own timer. Run after it
    // so an unknown duration never gets replaced by a guessed value.
    setInterval(refresh, 700);
    refresh();
  }

  window.XuperTVSeek = {
    refresh: refresh,
    duration: duration,
    position: position,
    enter: enterScrub,
    commit: function () { leaveScrub(true); },
    cancel: function () { leaveScrub(false); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, false);
  } else {
    start();
  }
})();
