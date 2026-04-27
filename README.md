# Mall Food Wheelspin

Frontend-only food picker for three Klang Valley malls:

- IOI City Mall
- The Exchange TRX
- Mid Valley Megamall

Built with Vite, React, and Tailwind CSS. State is persisted in `localStorage`, including a per-user last-50 spin history.

## Features

- Mall selector with pre-seeded malls
- Per-mall food options with add, edit, delete, and bulk paste import
- Deduplication by normalized name
- Animated SVG wheel with a fixed pointer and uniform random selection
- Per-user spin history with timestamp, mall, and result
- Full app state export to JSON and import from JSON

## Setup

Requirements:

- Node.js 20+ recommended
- npm

Install dependencies:

```bash
npm install
```

Create a local `.env` file for values you do not want committed:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ADMIN_GATE_PIN=your-admin-pin
VITE_APP_URL=http://localhost:5173
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

Run the test suite:

```bash
npm test
```

## Deploy

### Cloudflare Pages

1. Push the repository to GitHub.
2. In Cloudflare Pages, create a new project and connect the repo.
3. Use these build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add the same environment variables in Cloudflare Pages. Set `VITE_APP_URL` to your deployed site URL, for example `https://your-project.pages.dev`.
5. Deploy.
6. The repo includes `public/_headers`, so the built site ships the same baseline security headers used by Vite dev/preview.

### GitHub Pages

1. Run `npm run build`.
2. Publish the `dist/` folder with your preferred static deployment flow.
3. If you deploy under a subpath, set the Vite `base` option in `vite.config.js` before building.
4. Set `VITE_APP_URL` to the full GitHub Pages app URL, including the repository subpath, for example `https://username.github.io/mall-food-wheelspin/`.
5. Enable GitHub Pages for the published branch or artifact.
6. GitHub Pages does not apply the `public/_headers` file, so equivalent headers must be configured through a different hosting layer if you need them in production.

## Supabase Auth Redirects

For magic-link admin sign-in, configure Supabase Auth with your deployed app URL:

1. In Supabase, open Authentication > URL Configuration.
2. Set Site URL to your deployed app URL, not `http://localhost:3000`.
3. Add your deployed app URL to Redirect URLs.
4. Keep localhost URLs only for local development, such as `http://localhost:5173`.

The app sends `VITE_APP_URL` as the magic-link redirect target. If it is not set, it falls back to the current Vite base URL.

## Notes

- Selected mall, wheel filters, theme mode, and per-user spin history are stored in browser `localStorage`.
- Supabase RLS now requires matching policies for public wheel reads and authenticated admin writes.
- Admin access depends on a signed-in Supabase user whose `profiles.role` is `admin`.
- `VITE_ADMIN_GATE_PIN` is only a client-side gate for the sign-in flow, not the source of truth for authorization.
- `.env` files are gitignored; use `.env.example` as the committed template.
- Vite dev and preview send baseline security headers, and `public/_headers` carries the same set into static builds for hosts that support header rules files.
- Importing JSON replaces the current in-browser state.
- No backend or map integration is included in this MVP.
