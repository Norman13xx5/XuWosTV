(function () {
  'use strict';

  var PLACEHOLDER = 'assets/placeholder-poster.svg';
  var FALLBACK_POSTER = 'assets/original/common/bg_placehoder_vertical.png';

  function isFallback(src) {
    return src && src.indexOf('bg_placehoder_vertical.png') !== -1;
  }

  function setState(image, state) {
    var container = image.closest && image.closest('.poster, .bento, .history-card');
    if (!container) return;
    container.classList.remove('poster-image-loading', 'poster-image-loaded', 'poster-image-error');
    container.classList.add('poster-image-' + state);
  }

  function prepare(image) {
    if (!image || image.getAttribute('data-poster-loader')) return;
    image.setAttribute('data-poster-loader', '1');
    image.addEventListener('load', function () {
      setState(image, 'loaded');
    }, false);
    image.addEventListener('error', function () {
      setState(image, 'error');
      image.style.display = 'none';
    }, false);

    if (isFallback(image.getAttribute('src'))) {
      image.setAttribute('src', PLACEHOLDER);
    } else if (image.getAttribute('data-poster-src')) {
      setState(image, 'loading');
    }
  }

  function scan() {
    var images = document.querySelectorAll('img[data-poster-src], img.p-img, img.bento-img, img.history-poster');
    for (var i = 0; i < images.length; i++) prepare(images[i]);
  }

  function start() {
    scan();
    if (window.MutationObserver) {
      new MutationObserver(scan).observe(document.getElementById('app') || document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  window.XuperTVPoster = {
    placeholder: PLACEHOLDER,
    fallback: FALLBACK_POSTER,
    refresh: scan
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, false);
  } else {
    start();
  }
})();
