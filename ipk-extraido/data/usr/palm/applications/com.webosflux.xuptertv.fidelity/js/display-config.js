(function () {
  'use strict';

  var STORAGE_KEY = 'xupertv-display-config';
  var CONFIG_VERSION = 1;
  var DESIGN_WIDTH = 1920;
  var DESIGN_HEIGHT = 1080;
  var app = null;

  function numberOr(value, fallback) {
    return typeof value === 'number' && isFinite(value) ? value : fallback;
  }

  function getViewport() {
    var width = Math.round(window.innerWidth || document.documentElement.clientWidth || DESIGN_WIDTH);
    var height = Math.round(window.innerHeight || document.documentElement.clientHeight || DESIGN_HEIGHT);
    var pixelRatio = numberOr(window.devicePixelRatio, 1);

    return {
      width: Math.max(1, width),
      height: Math.max(1, height),
      pixelRatio: pixelRatio
    };
  }

  function readConfig() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (!saved || saved.schemaVersion !== CONFIG_VERSION) return null;
      if (saved.appVersion !== '1.7.4') return null;
      if (!isFinite(saved.viewportWidth) || !isFinite(saved.viewportHeight)) return null;
      return saved;
    } catch (error) {
      return null;
    }
  }

  function writeConfig(config) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      // Storage can be unavailable without preventing the app from opening.
    }
  }

  function isCurrent(config, viewport) {
    return config &&
      config.viewportWidth === viewport.width &&
      config.viewportHeight === viewport.height &&
      config.pixelRatio === viewport.pixelRatio;
  }

  function createConfig(viewport) {
    var scale = Math.min(viewport.width / DESIGN_WIDTH, viewport.height / DESIGN_HEIGHT);
    if (!isFinite(scale) || scale <= 0) scale = 1;

    return {
      schemaVersion: CONFIG_VERSION,
      appVersion: '1.7.4',
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      screenWidth: Math.round(window.screen && window.screen.width || viewport.width),
      screenHeight: Math.round(window.screen && window.screen.height || viewport.height),
      pixelRatio: viewport.pixelRatio,
      scale: scale,
      offsetX: Math.max(0, Math.round((viewport.width - DESIGN_WIDTH * scale) / 2)),
      offsetY: Math.max(0, Math.round((viewport.height - DESIGN_HEIGHT * scale) / 2))
    };
  }

  function applyConfig(config) {
    if (!app || !config) return;
    app.style.left = config.offsetX + 'px';
    app.style.top = config.offsetY + 'px';
    app.style.webkitTransformOrigin = 'top left';
    app.style.transformOrigin = 'top left';
    app.style.webkitTransform = 'scale(' + config.scale + ')';
    app.style.transform = 'scale(' + config.scale + ')';
  }

  function configureDisplay() {
    app = document.getElementById('app');
    if (!app) return;

    var viewport = getViewport();
    var config = readConfig();
    if (!isCurrent(config, viewport)) {
      config = createConfig(viewport);
      writeConfig(config);
    }
    applyConfig(config);
  }

  function start() {
    configureDisplay();
    window.addEventListener('resize', configureDisplay, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, false);
  } else {
    start();
  }
})();
