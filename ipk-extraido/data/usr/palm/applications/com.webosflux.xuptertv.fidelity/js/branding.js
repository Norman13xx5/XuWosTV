(function () {
  'use strict';

  function replaceText(root) {
    var walker = document.createTreeWalker(root, 4, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.indexOf('XuperTV') !== -1) {
        node.nodeValue = node.nodeValue.replace(/XuperTV/g, 'XuWosTv');
      }
    }
  }

  function start() {
    document.title = 'XuWosTv';
    replaceText(document.body);
    if (window.MutationObserver) {
      new MutationObserver(function () { replaceText(document.body); }).observe(document.body, {
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
