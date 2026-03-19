# AGENTS.md

## Project
Mall Food Wheelspin (Malaysia): IOI City Mall, The Exchange TRX, Mid Valley Megamall

## Tech constraints
- Free-only stack
- Frontend-only MVP (no backend)
- Vite + React
- Tailwind CSS
- Use npm (no pnpm/yarn)
- Persist to localStorage (history: last 50 spins)
- Minimal dependencies

## MVP requirements
- Mall selector with 3 malls pre-seeded:
  - IOI City Mall
  - The Exchange TRX
  - Mid Valley Megamall
- Per-mall food options:
  - CRUD (add/edit/delete)
  - Bulk paste import (one option per line)
  - Deduplicate by normalized name:
    - trim, collapse spaces, lowercase, normalize apostrophes
- Wheel:
  - animated spin with easing
  - uniform random pick
  - show result clearly
  - disable spin if <2 options
- History:
  - store last 50 spins in localStorage
  - show timestamp + mall + result
- Import/Export:
  - export full app state to JSON
  - import JSON to restore
- QA:
  - `npm run dev` works
  - `npm run build` succeeds

## Repo conventions
- Keep components small and readable
- Prefer docs in README over lots of comments
- Add basic error handling and empty states