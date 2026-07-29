# Progress

> `qa` gate not passed: the slice is **completable by either input scheme** — full eight-night
> campaigns reach the `door` ending at exchange 5 and restart clean, one all-keyboard and one
> all-mouse (267/267 browser assertions, engine invariants hold) — **all four designed endings
> (`door`, `seen`, `want`, `silence`) are played end to end**, and all 6 release-gated **image** keys are generated and
> wired, and both Caslon faces ship. Still open: one release gate, the audio set.
> Not a release build.

- Source: Project Gutenberg, *Frankenstein; or, The Modern Prometheus* (1818), public domain
- Mode: `quick`
- Chosen concept: `The Hovel` — the creature's year at the chink, chapters XI–XVI
- Current stage: `qa`
- Completed: `intake`, `analyze`, `concept`, `design`, `art`, `build`
- Coverage: `analysis/_coverage.md` (source 24 / succeeded 24 / failed 0)
- gate:analyze pass
- gate:concept pass
- gate:design pass
- gate:art pass
- gate:build pass
- gate:qa fail(3 `major`: F1 partly cleared — 6 gated image keys present, Caslon fonts and audio
  still absent; F6 **fixed** — the whole mouse click path was dead in three places and is now
  wired, proved by an all-mouse campaign; F7 **fixed** — `wedge` was never exported, so every
  frame of the `seen` phase threw; now exported and the phase plays to its failure card;
  3 `minor` open: 23 s held cold open before the first interactive verb; F11 **fixed** — the cold slot, tally plank and journal
  bundle are engraved rather than flat swatches, gated at pixel level, with the slot's upper band
  named as a stated remainder; F10 the card shrink ladder undercuts `ART_DIRECTION`
  §9's type floor, measure and text-size setting. F8 **fixed** — card text now wraps inside its
  paper, gated over 2898 layouts. F9 `minor` found and fixed: a QA assertion of ours demanded more travel than the
  geometry could deliver, so the mouse campaign could not pass at normal speed)
- Reflow record: 2026-07-28 first independent QA. 1 `blocker` found and fixed —
  `step()`'s `title` case never called `engine.tick()`, so `phaseTick` stayed 0, `titleBeat`
  stayed 0, and the title text and all three verbs were never drawn; the first screen was two
  blank shapes with no way in. Also fixed 2 `minor` occlusion defects (title crossing the
  platemark; the prompt band covering the tally plank and food heap).
- Evidence: `qa/evidence/automated.json` (267 passed / 0 failed, 0 console errors, 0 external
  request domains, build 1.52 MB), `qa/evidence/browser/` 46 frames,
  `qa/evidence/qa_browser_last.log`, `node qa/design_invariants.mjs` all sections hold
- Verified path: the full campaign — boot → title → cold open → nights 1–7 (2 carries, 4 lessons,
  96 words) → the day-8 long walk → the door → five exchanges → ending `door` → epilogue →
  `afterRun` → restart. Played through the real input path, no state injection. Reproduced at
  both game speeds (`?fast=1` and `QA_SLOW=1`), so timing evidence is now valid. Plus the round-1
  keyboard-only and mouse passes. The whole campaign also runs **mouse-only** — no keyboard at
  any point: title verb, about card, options toggle, chink, cold slot, click-to-move, the three
  carry hotspots, four lesson starts, the knock, five exchanges, epilogue and restart, all by
  click. Determinism confirmed under a fixed seed.
- Not verified: a clean `QA_SLOW` run
  covering the mouse campaign (F9 blocked it until now); signature frames not yet
  judged against `ART_DIRECTION` now that the plates are in; no clean-context onboarding
  judgement; no audio; no human playtest protocol yet
- Assets: `plate/hovel` regenerated 2026-07-28 to §7.1's composition (one warm chink, left of
  centre; the earlier plate put it right of centre at 1.4% width — F12). All 6 release-gated plates generated 2026-07-28 (`plate/paper|title|room|hovel|door|fire`),
  sized to draw size and shipped as WebP — 17 MB PNG → 1.4 MB, total build 1.50 MB against a
  25 MB budget. They enter through `src/skin.js`; a key that fails to load still draws a grey box
  with its key name and the run continues. The 9 degradable keys remain on their named lesser
  expression. Fonts and audio still absent.
- Licence: `public_domain_source`; the two Caslon faces are `OFL-1.1` (licence text ships at
  `build/app/assets/font/OFL.txt`)
- Updated: 2026-07-28
