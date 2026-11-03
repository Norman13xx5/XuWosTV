# XuWosTv

XuWosTv is an unofficial webOS application for LG Smart TVs. It provides a
modern TV interface with remote-control navigation, remote catalog artwork,
VOD playback controls, live-channel support and responsive display scaling.

## Download

Download the latest release from:

<https://github.com/Norman13xx5/XuWosTV/releases/latest>

The release contains the `.ipk` package and a Windows installation bundle.

## Installation

Read [INSTALLATION.md](INSTALLATION.md) for the complete English guide.

The TV must have LG Developer Mode enabled and the computer must be connected
to the same network. The installer uses the IP address and passphrase shown by
the Developer Mode application.

## Development

The extracted webOS application is available under
`ipk-extraido/data/usr/palm/applications/com.webosflux.xuptertv.fidelity`.

The Docker environment serves the application for browser-based UI testing:

```bash
docker compose up --build -d xupertv
docker compose --profile test run --build --rm tests
```

Open <http://localhost:8090> after starting the container.

Docker can test the web interface, responsive scaling, icon rendering,
placeholder artwork and local persistence. A real LG TV is still required to
validate Luna Service, the Magic Remote, portal authentication and video
decoding.

## Credits and disclaimer

This is an unofficial community project. Credit is retained for
`CRISTIANCODEV`, whose work inspired the webOS port. This project is not
affiliated with LG or XuperTV and does not include audiovisual content.

Catalog data, artwork and playback availability depend on the configured
authorized service. Users are responsible for complying with applicable laws
and the terms of any service they access.

Licensed under GPL-2.0. See [LICENSE](LICENSE).
