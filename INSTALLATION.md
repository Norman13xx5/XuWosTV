# XuWosTv Installation Guide

## Requirements

- An LG Smart TV with Developer Mode enabled.
- Windows 10 or Windows 11.
- The TV and computer connected to the same local network.
- The latest `.ipk` file from the GitHub release.
- The Developer Mode passphrase displayed on the TV.

## 1. Enable Developer Mode on the TV

1. Open the LG Content Store.
2. Install and open the official `Developer Mode` application.
3. Sign in with an LG account if requested.
4. Enable Developer Mode and accept the prompt.
5. Reopen Developer Mode after the TV restarts.
6. Keep the displayed IP address and passphrase available.

The Developer Mode session can expire. If the installer rejects the
passphrase, open Developer Mode again and renew the session.

## 2. Prepare the installer folder

Download the Windows installer bundle from the release page and extract the
complete ZIP folder. Do not run the installer from inside a ZIP archive.

The folder should contain at least:

```text
INSTALAR-XUPERTV.bat
instalar-tv.ps1
com.webosflux.xuptertv.fidelity_1.7.4_all.ipk
```

## 3. Install the application

1. Double-click `INSTALAR-XUPERTV.bat`.
2. Enter the TV IP address, or enter `B` to scan the local network.
3. Select `1` for a normal Developer Mode TV.
4. Enter the Developer Mode passphrase. The characters are hidden while you
   type.
5. Wait until the installer reports `LISTO`.

The installer copies the package, installs it through webOS and attempts to
open XuWosTv automatically.

## Command-line installation

Advanced users can run:

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar-tv.ps1 `
  -Ipk .\com.webosflux.xuptertv.fidelity_1.7.4_all.ipk `
  -TvHost 192.168.1.50
```

To check the package without modifying the TV:

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar-tv.ps1 -DryRun
```

## Updating

Use the same installer with a newer `.ipk` file. The current release is
`1.7.4`.

## Uninstalling

On the TV, highlight the XuWosTv icon, hold the `OK` button and choose
`Delete`.

## Troubleshooting

### The TV is not found

- Verify that the TV and computer use the same network.
- Avoid guest Wi-Fi networks or client isolation.
- Reopen Developer Mode and check whether the IP address changed.
- Enter `B` in the installer to scan again.

### The passphrase is rejected

- Renew Developer Mode on the TV.
- Use the current passphrase exactly as shown.
- Do not include spaces.

### The installation succeeds but content does not load

XuWosTv requires Internet access to contact the configured catalog and
playback service. Confirm that the TV can access the Internet and restart the
application.

### The app does not appear after installation

Restart the TV and check the home app bar or the list of installed apps.

## Disclaimer

XuWosTv is an unofficial project and is not affiliated with LG or XuperTV. It
does not include audiovisual content. Use only services and content that you
are authorized to access.
