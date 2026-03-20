# Mall Food Wheelspin

Frontend-only food picker for three Klang Valley malls:

- IOI City Mall
- The Exchange TRX
- Mid Valley Megamall

Built with Vite, React, and Tailwind CSS. State is persisted in `localStorage`, including the last 50 spins.

## Features

- Mall selector with pre-seeded malls
- Per-mall food options with add, edit, delete, and bulk paste import
- Deduplication by normalized name
- Animated SVG wheel with a fixed pointer and uniform random selection
- Spin history with timestamp, mall, and result
- Full app state export to JSON and import from JSON

## Setup

Requirements:

- Node.js 20+ recommended
- npm

Install dependencies:

```bash
npm install
```

## Development

Run the Vite dev server:

```bash
npm run dev
```

Open the local URL shown in the terminal.

## Build

Create a production build:

```bash
npm run build
```

The output is generated in `dist/`.

## Deploy

### Cloudflare Pages

1. Push the repository to GitHub.
2. In Cloudflare Pages, create a new project and connect the repo.
3. Use these build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy.

### GitHub Pages

1. Run `npm run build`.
2. Publish the `dist/` folder with your preferred static deployment flow.
3. If you deploy under a subpath, set the Vite `base` option in `vite.config.js` before building.
4. Enable GitHub Pages for the published branch or artifact.

## Notes

- App state is stored in browser `localStorage`.
- Importing JSON replaces the current in-browser state.
- No backend or map integration is included in this MVP.
