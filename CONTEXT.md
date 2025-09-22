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
- Cleanse names in scraper: Unicode NFKC, remove all spaces (half/full width).

## Spec (2025-09-22)
- One-card flow like Tinder: show one card at a time.
- First view hides the name and image; clicking flips to reveal both; clicking again advances to next.
- Location shows without the `出現地／` prefix.
- Description masks occurrences of the yokai name with `◯`.
- Masking handles spaced characters inside descriptions (半角/全角スペースを許容)。
- Masking supports aliases configurable via `web/public/aliases.json`.
- Image container is square (1:1) while keeping image aspect via cover.
- Footer shows copyright: `© 水木プロダクション`.
- Footer license block per spec with JA/EN text and links.

## Next
- Wire npm scripts to sync dataset to `web/public`.
- Optional: add Tailwind or better design later.
- Optional: persist favorites locally (localStorage).
