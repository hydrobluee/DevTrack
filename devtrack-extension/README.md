# DevTrack React Conversion

This is a Vite + React + Tailwind CSS conversion of the original DevTrack extension UI.

## Structure

- `public/images/` — copied assets from the original extension
- `src/components/` — reusable UI pieces
- `src/pages/` — extension page components for the popup, weekly summary, and settings flow
- `popup.html` — extension popup entry
- `getting_started.html` — weekly progress page entry
- `settings.html` — GitHub setup page entry
- `manifest.json` — extension manifest
- `vite.config.js` — multi-page Vite config

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build output is in `dist/`.

## Load In Chrome

1. Run `npm install`
2. Run `npm run build`
3. Open `chrome://extensions`
4. Turn on **Developer mode**
5. Click **Load unpacked**
6. Select the `dist/` folder

Important: do not load the project root folder. Chrome extensions cannot run the source `.jsx` files directly, so the unpacked extension must be loaded from `dist/` after building.
The build script now copies `manifest.json` into `dist/`, so if it is missing, run `npm run build` again before loading the extension.
