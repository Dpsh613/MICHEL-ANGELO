# Michelangelo: The Living Atelier

A responsive, imagined personal website for a contemporary Michelangelo, built with React 19, TypeScript, Vite, Tailwind CSS v4, and Motion.

## Run

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

The application starts in `src/App.tsx`. Editorial content lives in `src/data.ts`, visual styling in `src/index.css`, and the native-dialog artwork experience in `src/components/ArtworkDialog.tsx`.

## Deploy

Pushes to `main` build the site and publish it to GitHub Pages through `.github/workflows/deploy-pages.yml`.

- Live site: https://dpsh613.github.io/MICHEL-ANGELO/
- The workflow can also be run manually from the repository's Actions tab.
- GitHub Pages must use "GitHub Actions" as its source; the workflow requests this automatically, but it can also be set under Settings → Pages.

## Explore

- A full-bleed entrance with choreographed typography and restrained scroll motion.
- Six searchable works and studies, with discipline filters and accent-insensitive search.
- Artwork detail selections, zoom controls, pointer panning, and keyboard exploration.
- A three-stage drawing table with accessible arrow-key navigation.
- A pointer-controlled light study with a keyboard- and touch-operable slider.
- Optional, locally synthesized ambient audio. No autoplay or external audio requests.
- Responsive mobile navigation, contained dialog focus, Escape support, and reduced-motion preferences.

## Verify

- `npx tsc --noEmit`
- `npx playwright install --with-deps chromium`
- `npx playwright test`

The browser suite covers navigation, filters, search, artwork details, zoom, panning, process tabs, light controls, ambient sound, responsive overflow, focus management, and automated WCAG checks.

All fonts and images are served locally. There is no backend or third-party runtime API dependency.

## Image Context

This is an independent creative interpretation, not an official archive or estate website. Generated atmospheric images are explicitly distinguished from authentic works in the artwork viewer and the About dialog. Source photography credits and licenses are included in `public/images/CREDITS.txt`. Typeface licenses are included in `public/fonts/`.
