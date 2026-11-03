(function () {
  'use strict';

  var SERVICE_ID = 'com.webosflux.xuptertv.fidelity.service';
  var SERVICE_TIMEOUT = 12000;
  var overlay;
  var message;
  var status;
  var retryButton;
  var exitButton;
  var active = false;
  var checking = false;

  function isWebOS() {
    return Boolean(window.PalmSystem || window.PalmServiceBridge);
  }

  function setVisible(visible) {
    active = visible;
    if (!overlay) return;
    overlay.classList.toggle('is-active', visible);
    overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
    if (visible && retryButton) retryButton.focus();
  }

  function setChecking(value) {
    checking = value;
    if (!overlay) return;
    overlay.classList.toggle('is-checking', value);
    if (retryButton) retryButton.disabled = value;
    if (exitButton) exitButton.disabled = value;
    if (status) status.textContent = value ? 'Comprobando conexión...' : '';
  }

  function finish(success, reason) {
    setChecking(false);
    if (success) {
      setVisible(false);
      return;
    }
    if (message) {
      message.textContent = reason ||
        'Conecta el televisor a Internet para continuar usando XuperTV.';
    }
    setVisible(true);
  }

  function checkService(done) {
    if (!window.webOS || !window.webOS.service ||
        typeof window.webOS.service.request !== 'function') {
      done(false, 'No se pudo verificar el servicio de conexión del televisor.');
      return;
    }

    var settled = false;
    var timer = setTimeout(function () {
      if (!settled) {
        settled = true;
        done(false, 'La conexión tardó demasiado. Comprueba la red del televisor.');
      }
    }, SERVICE_TIMEOUT);

    function complete(success, reason) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      done(success, reason);
    }

    try {
      window.webOS.service.request('luna://' + SERVICE_ID, {
        method: 'prewarm',
        parameters: {},
        onSuccess: function (response) {
          if (response && response.returnValue !== false) {
            complete(true);
          } else {
            complete(false, 'El servicio no pudo conectarse al portal.');
          }
        },
        onFailure: function () {
          complete(false, 'No se pudo conectar con el portal. Comprueba Internet.');
        }
      });
    } catch (error) {
      complete(false, 'No se pudo verificar la conexión del televisor.');
    }
  }

  function checkConnection() {
    if (checking) return;
    setVisible(true);
    setChecking(true);

    if (navigator.onLine === false) {
      finish(false, 'El televisor no tiene conexión de red. Conéctalo a Internet y reintenta.');
      return;
    }

    // A normal browser has no Luna Service. Keep Docker/browser UI tests usable.
    if (!isWebOS()) {
      finish(true);
      return;
    }

    checkService(finish);
  }

  function exitApp() {
    if (window.webOS && typeof window.webOS.platformBack === 'function') {
      window.webOS.platformBack();
      return;
    }
    if (window.PalmSystem && typeof window.PalmSystem.platformBack === 'function') {
      window.PalmSystem.platformBack();
      return;
    }
    if (typeof window.close === 'function') window.close();
  }

  function handleRemoteKey(event) {
    if (!active) return;
    var key = event.key || '';
    var code = event.keyCode || event.which;
    var isEnter = key === 'Enter' || key === 'OK' || code === 13;
    var isBack = key === 'Back' || key === 'GoBack' || code === 461;

    if (isBack) {
      event.preventDefault();
      event.stopPropagation();
      exitApp();
      return;
    }
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      if (!checking) {
        if (document.activeElement === retryButton) exitButton.focus();
        else retryButton.focus();
      }
      return;
    }
    if (isEnter) {
      event.preventDefault();
      event.stopPropagation();
      if (document.activeElement === exitButton) exitApp();
      else checkConnection();
    }
  }

  function start() {
    overlay = document.getElementById('connectivity-overlay');
    message = document.getElementById('connectivity-message');
    status = document.getElementById('connectivity-status');
    retryButton = document.getElementById('connectivity-retry');
    exitButton = document.getElementById('connectivity-exit');
    if (!overlay || !retryButton || !exitButton) return;

    retryButton.addEventListener('click', checkConnection, false);
    exitButton.addEventListener('click', exitApp, false);
    document.addEventListener('keydown', handleRemoteKey, true);

    // Delay the first check until the app's webOS bridge has initialized.
    setTimeout(checkConnection, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, false);
  } else {
    start();
  }
})();
