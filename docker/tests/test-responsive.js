const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
const storageKey = 'xupertv-display-config';

async function readConfig(page) {
  return page.evaluate((key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }, storageKey);
}

async function checkViewport(page, width, height, expectedScale) {
  await page.setViewportSize({ width, height });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction((key) => Boolean(localStorage.getItem(key)), storageKey);

  const result = await page.evaluate((key) => {
    const app = document.getElementById('app');
    return {
      config: JSON.parse(localStorage.getItem(key)),
      transform: app && app.style.transform,
      left: app && app.style.left,
      top: app && app.style.top
    };
  }, storageKey);

  assert.ok(result.config, `No se creó configuración para ${width}x${height}`);
  assert.equal(result.config.viewportWidth, width);
  assert.equal(result.config.viewportHeight, height);
  assert.ok(Math.abs(result.config.scale - expectedScale) < 0.001);
  assert.match(result.transform, /^scale\(/);
  assert.equal(result.left, `${result.config.offsetX}px`);
  assert.equal(result.top, `${result.config.offsetY}px`);
  return result.config;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  try {
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'domcontentloaded' });

    const iconResponse = await page.request.get(`${baseUrl}/assets/icons.svg`);
    assert.equal(iconResponse.status(), 200);
    assert.match(await iconResponse.text(), /symbol id="search"/);

    const posterResponse = await page.request.get(`${baseUrl}/assets/placeholder-poster.svg`);
    assert.equal(posterResponse.status(), 200);
    assert.match(await posterResponse.text(), /Cargando imagen/);

    const posterLoaderState = await page.evaluate(() => ({
      loaded: Boolean(window.XuperTVPoster),
      placeholder: window.XuperTVPoster && window.XuperTVPoster.placeholder
    }));
    assert.equal(posterLoaderState.loaded, true);
    assert.equal(posterLoaderState.placeholder, 'assets/placeholder-poster.svg');

    const seekState = await page.evaluate(() => ({
      loaded: Boolean(window.XuperTVSeek),
      hasBar: Boolean(document.getElementById('vod-seekbar')),
      total: window.XuperTVSeek && window.XuperTVSeek.duration()
    }));
    assert.equal(seekState.loaded, true);
    assert.equal(seekState.hasBar, true);
    assert.equal(seekState.total, 0);

    const appInfoResponse = await page.request.get(`${baseUrl}/appinfo.json`);
    const appInfo = await appInfoResponse.json();
    assert.equal(appInfo.title, 'XuWosTv');

    const brandState = await page.evaluate(() => ({
      title: document.title,
      welcome: document.querySelector('.welcome-name') && document.querySelector('.welcome-name').textContent
    }));
    assert.equal(brandState.title, 'XuWosTv');
    assert.equal(brandState.welcome, 'XuWosTv');

    const loadingState = await page.evaluate(() => {
      const track = document.querySelector('.welcome-loading-track');
      const fill = document.querySelector('.welcome-loading-fill');
      return {
        track: Boolean(track),
        fill: Boolean(fill),
        animation: fill ? getComputedStyle(fill).animationName : ''
      };
    });
    assert.equal(loadingState.track, true);
    assert.equal(loadingState.fill, true);
    assert.notEqual(loadingState.animation, 'none');

    const creditState = await page.evaluate(() => {
      const startup = document.querySelector('.welcome-credit');
      const home = document.querySelector('.home-port-credit');
      return {
        startupExists: Boolean(startup),
        homeDisplay: home && getComputedStyle(home).display
      };
    });
    assert.equal(creditState.startupExists, false);
    assert.equal(creditState.homeDisplay, 'none');

    const connectivityState = await page.evaluate(() => {
      const overlay = document.getElementById('connectivity-overlay');
      return {
        exists: Boolean(overlay),
        active: Boolean(overlay && overlay.classList.contains('is-active'))
      };
    });
    assert.equal(connectivityState.exists, true);
    assert.equal(connectivityState.active, false);

    await page.waitForTimeout(500);
    const iconCount = await page.locator('.icon-library-icon').count();
    assert.ok(iconCount > 0, 'No se insertaron iconos SVG en la interfaz');

    const fullHd = await checkViewport(page, 1920, 1080, 1);
    const fullHdAfterReload = await checkViewport(page, 1920, 1080, 1);
    assert.deepEqual(fullHdAfterReload, fullHd);

    await checkViewport(page, 3840, 2160, 2);
    await checkViewport(page, 1366, 768, 1366 / 1920);

    console.log('Responsive display tests: OK');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
