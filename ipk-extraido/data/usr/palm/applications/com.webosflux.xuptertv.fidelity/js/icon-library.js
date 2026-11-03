(function () {
  'use strict';

  var SPRITE = 'assets/icons.svg#';

  function createIcon(name) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    svg.setAttribute('class', 'icon-library-icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', SPRITE + name);
    use.setAttribute('href', SPRITE + name);
    svg.appendChild(use);
    return svg;
  }

  function replace(selector, name) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.getAttribute('data-icon-library')) continue;
      node.setAttribute('data-icon-library', name);
      node.style.backgroundImage = 'none';
      node.appendChild(createIcon(name));
    }
  }

  function migrate() {
    replace('.notify-item.search .n-normal', 'search');
    replace('.notify-item.filter .n-normal', 'filter');
    replace('.notify-item.personal .n-normal', 'user');
    replace('.kb-action.switch .ico', 'keyboard');
    replace('.kb-action.clear .ico', 'x');
    replace('.kb-action.del .ico', 'delete');
    replace('.live-fast .fast-btn.f-all', 'list');
    replace('.live-fast .fast-btn.f-fav', 'star');
    replace('.live-fast .fast-btn.f-srch', 'search');
    replace('.live-arrow-up', 'chevron-up');
    replace('.live-arrow-down', 'chevron-down');
    replace('.live-info .live-fullscreen', 'maximize');
  }

  function start() {
    migrate();
    if (window.MutationObserver) {
      new MutationObserver(migrate).observe(document.getElementById('app') || document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, false);
  } else {
    start();
  }
})();
