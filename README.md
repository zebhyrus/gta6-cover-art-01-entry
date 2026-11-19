# Vice Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/zebhyrus/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/zebhyrus/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover Studio turns your photos and a caption into GTA-style cover art:
a multi-panel poster with bold outlined title lettering, a Vice City sunset
or neon colour grade, a retro striped sun and palm silhouettes, exported as
a PNG to share. It is original art drawn on canvas: no game logos, artwork
or fonts, and no network requests. Your photos stay on your machine.

## What it does

- **Any photo** — load up to three of your own photos, or try the two
  built-in samples. Click a panel in the live preview and drag the photo
  inside it, or use the zoom and pan sliders. One photo can fill all panels.
- **Multi-panel posters** — four layouts: Trio (three tall panels), Hero +
  duo, Quad (four panels) and Solo (one full photo), each adapted to the
  export size.
- **Caption editing** — title and subtitle, four title styles (sunset
  gradient, neon pink, white, gold foil), four colour grades (Vice sunset,
  Neon nights, Palm dusk, Clean), plus retro sun, palm silhouettes and film
  grain toggles.
- **Fast export** — pick a size (1080 × 1080, 1080 × 1350, 1920 × 1080) and
  hit Export PNG. Four steps from photo to poster.

## Run it

No build step and no install. Serve `app/` with any static file server:

```sh
node serve.ts
```

then open http://localhost:8080 in desktop Chrome. Everything loads from
local files, so it also works with no network at all.

## How it is built

- `app/index.html` — the editor page: photo, layout, caption and export controls beside a live preview canvas.
- `app/src/render.js` — draws the whole poster: panels, grade, sun, palms, title and subtitle lettering.
- `app/src/layouts.js` — the four panel layouts for square, portrait and landscape covers.
- `app/src/grade.js` — colour grades and hand-drawn decoration (retro sun, palm silhouettes, grain, vignette).
- `app/src/editor.js` — editor state, panel selection, drag-to-pan, controls and PNG export.
- `app/src/shots.js` — fixed `?shot=` scenes used for the screenshots.
- `app/samples/` — two sample photos made with an image model for make.fun, free to use.

`main.ts` hands the entry in: it copies `app/` and `screenshots/` to
`/output` and writes `/output/dossier.json` with the vendored make.fun
library (`vendor/makefun-app.ts`).

<sub>Entered on [make.fun](https://make.fun/?ref=9srzvfjv&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
