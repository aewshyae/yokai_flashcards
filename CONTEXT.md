# Context Log

## Goal
- Build a flashcard service using data scraped from Mizuki Shigeru Road pages.
- Extract: bronze statue image URL, yokai name (number removed), appearance location, description.

## Current State
- Scraper implemented in `scripts/scrape.ts` with axios + cheerio.
- Data generated: `data/yokai.json` (119 entries). Image URLs are absolute.
- Web app scaffolded in `web/` (Vite + React + TS).
- Flashcard UI implemented in `web/src/App.tsx` with search and image-only filter.
- Dataset copied to `web/public/yokai.json`.

## Decisions
- Keep `name` field without numeric prefix; keep numeric id separately (may be -1 if absent).
- Do not bundle images; use remote URLs from source pages.
- Minimal styling via inline styles to ship quickly.

## Next
- Wire npm scripts to sync dataset to `web/public`.
- Optional: add Tailwind or better design later.
- Optional: persist favorites locally (localStorage).
