# Docker Test Environment

This environment serves the extracted webOS application through Nginx and
tests the responsive interface with Chromium and Playwright.

## Start the application

```bash
docker compose up --build -d xupertv
```

Open <http://localhost:8090>.

## Run automated tests

```bash
docker compose --profile test run --build --rm tests
```

The tests cover Full HD, 4K and intermediate resolutions, display scaling,
localStorage persistence, the SVG icon sprite, branding, poster placeholders
and the seek-controller bootstrap.

The connectivity overlay remains hidden in Docker because a normal browser
does not provide Luna Service. A real webOS TV validates the actual portal
connection through the `prewarm` service.

## Stop the environment

```bash
docker compose down
```

## Limitations

Docker does not fully emulate webOS, the Magic Remote, Luna Service, the real
portal session, proxy streaming or TV video decoding. Those features must be
validated on a real LG TV.
