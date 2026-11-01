# Blackjack Trainer

**Play it at [bjt.chamurajasekera.me](https://bjt.chamurajasekera.me/)**

Practice blackjack basic strategy with a pixel-art table. Every decision is graded against the strategy chart, with a short explanation of the correct play.

## Features

- Instant feedback on every decision, plus a scorecard and a log of recent mistakes
- Pullout strategy chart that outlines your last decision
- Optional hints for the correct move
- Keyboard controls: `H` hit, `S` stand, `D` double, `P` split, `R` surrender, `Y`/`N` insurance, `Space` deal, `C` chart, `M` stats
- Settings for surrender, insurance and the blackjack payout (3:2 or 6:5). The chart, hints and grading follow them
- Installable as a web app that works offline
- Progress is saved in your browser

The table uses 6 decks, the dealer stands on soft 17, and doubling after a split is allowed.

## Development

Requires [Node.js](https://nodejs.org/).

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server |
| `npm test` | Runs the unit tests |
| `npm run build` | Type-checks and builds to `dist/` |
| `npm run preview` | Serves the production build |

Pushing to `main` runs the tests and deploys to GitHub Pages.

## How it's organised

Built with [Solid](https://www.solidjs.com/), TypeScript and [Vite](https://vite.dev/).

- `src/engine/`: the game itself in plain TypeScript, with no framework code, covering cards, strategy, grading and round flow
- `src/store.ts`: connects the engine to Solid, plus keyboard shortcuts and autosave
- `src/components/`: one component per part of the screen, each with its own CSS file
- `src/persistence.ts`: saves and loads progress

## Credits

Card art is [Pixel Plebes](https://greebles.itch.io/pixel-plebes) by Devlyn JD. The pixel font is [Jersey 10](https://fonts.google.com/specimen/Jersey+10).
