# 🌎 WorldTV HDMI Stick

WorldTV is a TV-style web interface designed for HDMI sticks,
Android TV devices, TV browsers and large-screen displays.

## Features

- Live TV interface
- International categories
- UK category
- Pakistan category
- India category
- Sports category
- Movies category
- News category
- Search
- Full-screen video
- Favourites-ready architecture
- Keyboard controls
- Remote-control friendly navigation
- Local settings
- Version checking
- GitHub Pages compatible
- No backend required for the basic interface

## Important legal notice

WorldTV does not provide or bypass paid television subscriptions.

Only use:

1. Streams you own.
2. Streams you are licensed to redistribute.
3. Public streams whose terms permit embedding.
4. Official broadcaster streams where embedding/distribution is permitted.

Do not add unauthorised subscription channels, stolen IPTV playlists,
DRM bypasses or copyrighted streams without permission.

## Project structure

WorldTV-HDMI-Stick/

    index.html
    styles.css
    app.js
    channels.json
    manifest.json
    README.md
    LICENSE
    .gitignore

    assets/
        logo.svg

    data/
        categories.json

    update/
        version.json
        update.js

## Adding an authorised channel

Open:

    channels.json

Example:

```json
{
  "id": "my-channel",
  "name": "My TV Channel",
  "country": "United Kingdom",
  "category": "uk",
  "description": "My authorised channel",
  "logo": "assets/my-channel.png",
  "stream": "https://example.com/live/stream.m3u8",
  "live": true
}
