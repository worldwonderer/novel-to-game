# QA_REPORT · Frankenstein — The Hovel

- Date: 2026-07-28
- Round: **first independent QA**. Before this round the example shipped with no `qa/` stage at all.
- Verdict: **not `PASS`** — the slice is playable, mechanically clean, and now carries its six
  engraved plates, but two release gates are still open (Caslon fonts, audio set) and no ending
  has been reached (see *Release gate* and *Not verified*).
- `blocker`: 0 (1 found this round, **fixed**, with a regression check)
- `major`: 1, partly cleared (images done; fonts and audio outstanding)
- `minor`: 3 fixed, 2 open
- Deliverable name: **playable vertical slice, plates in, two gates open**

The automated result says this run boots, plays a full night, reaches night 2, restarts to a valid
initial state, and is deterministic under a fixed seed. It does **not** say the game is good, that
the 45-minute arc lands, or that any ending has been reached by a human.

## Environment

```bash
cd examples/frankenstein
node qa/design_invariants.mjs   # engine invariants, 10 sections
python3 qa/qa_browser.py        # real Chromium, mouse pass + keyboard-only pass
```

| Item | Value |
|---|---|
| Page | `http://127.0.0.1:5199/?seed=42&fast=1` |
| Form | native ES Module + Canvas 2D, zero build |
| Viewport | 1280×800 (target), 1280×720 (minimum) both tested |
| Browser assertions | 28 passed, 0 failed |
| Engine invariants | all sections hold |
| Console errors / failed requests | 0 / 0 |
| Request domains | `127.0.0.1:5199` only — **no external domain** |
| Total build | 1.50 MB (6 plates as WebP; budget is 25 MB) |
| Frame p50 / p95 / worst | 8.3 / 10.3 / 10.4 ms — comfortably inside the 30 FPS floor (33.4 ms) |
| Main-thread long tasks | 0 in-game, 0 at boot |

Machine-readable summary: `qa/evidence/automated.json`. Frames: `qa/evidence/browser/` (10).

Frame sampling sits on the two heaviest live screens (title reveal, night play), not an idle
screen, and reports the distribution rather than a mean.

## Findings and reflow

| # | Severity | Stage | Finding | Verification |
|---|---|---|---|---|
| B1 | `blocker` | `build` | **The title screen never completed.** `engine.tick()` owns `state.phaseTick`, and `step()`'s `title` case called `tickTitle(input)` without it — unlike `coldOpen` and `about`, which both call it. So `phaseTick` stayed 0 forever, `titleBeat` (= `phaseTick/45`) stayed 0, and the title text and all three verbs were never drawn. A player saw two blank shapes with no way in; only a blind Enter started the game | **Fixed** — `src/main.js` `case 'title'` now calls `engine.tick(state, {})`. Harness asserts `phaseTick >= 270` (full reveal); measured 414. Engine invariants still hold |
| F1 | `major` | `build` | All **6 release-gated image keys** and both Caslon fonts were absent; every one rendered as its grey box. Per `ART_DIRECTION` §16.1 a missing gated key means the build fails release | **Images fixed; fonts and audio still open.** All 6 plates (`plate/paper`, `plate/title`, `plate/room`, `plate/hovel`, `plate/door`, `plate/fire`) generated, sized to their draw size and shipped as WebP (17 MB PNG → 1.4 MB, total build 1.50 MB against a 25 MB budget). They enter through `src/skin.js`; a key that fails to load still draws a grey box carrying its key name and the run continues. **Still absent:** `font/caslon-text`, `font/caslon-display`, and the release-gated audio set |
| F2 | `minor` | `build` | Title line collided with the plate border: the plate ended at `PLATE.h-180` = 620 and the 30 px title sat at `0.78h` = 624, so the rule cut the letterforms. §3.3 puts occlusion tolerance at zero | **Fixed** — plate now stops at `0.72h`; title block clears the platemark |
| F3 | `minor` | `build` | In the hovel, the opaque prompt band (`0.88h`–`0.96h` = 704–768) was drawn over the tally plank (620–730) and completely hid the food heap (baseline 720). The plank carries Words and the heap carries own-food — both are read-outs the player is meant to check | **Fixed** — heap, plank and journal bundle raised to a `FLOOR` of 690 so they clear the band |
| F4 | `minor` | `design` | The cold open requires **23 s of continuously held input** before the first night, and `?fast=1` does not shorten it (`coldTime` counts real seconds, not night-minutes). It is a deliberate paced scene, but it is also 23 s before any interactive verb, and it makes every automated pass slow | **Open** — flagged to `game-world-design`; not changed unilaterally because the pacing is an explicit authored beat |
| F5 | `minor` | `product` | `qa/` did not exist: no harness, no evidence, no report. `GAME_DESIGN` §14 named the acceptance path but nothing executed it | **Fixed** — `qa/qa_browser.py` added, following the repo convention (evidence in-workspace at `qa/evidence/browser/`, JPEG, never `/tmp`) |

## What was actually verified

- **Boot → title → cold open → night → night 2 → restart**, driven twice: once **mouse-primary**
  and once **keyboard-only**. `BUILD_BRIEF` requires every action to be reachable by keyboard
  alone; the keyboard-only pass completes the same path.
- **Observable state moves** under input: `night`, `minute`, `words`, `store`, `unease` all change.
  A tick counter advancing was not accepted as evidence on its own.
- **Determinism**: same seed + same input sequence → identical state, twice.
- **Restart** returns night 1 / words 0 and the title phase.
- **Both viewports** (1280×800, 1280×720): no scroll overflow, canvas non-zero.
- **`prefers-reduced-motion`**: still renders.
- **Self-contained**: no external request domain, no failed requests.

Note on input: movement and the context action are **held**, not tapped — `main.js` reads
`keys.has(...)` every tick, so a press that releases inside one frame does nothing. The first
version of this harness tapped keys and wrongly concluded the simulation was frozen. Anyone
writing further automation against this build has to hold.

## Not verified this round

- **No ending was reached.** The run reaches night 2; the walk, the door and the endings are
  untested. This is the single biggest gap and the next thing to automate.
- **Timing evidence**: this run used `?fast=1`, so all timing figures except the cold-open hold
  are invalid as pacing evidence. A `QA_SLOW=1` pass is required before any pacing claim.
- **Signature frames**: now judgeable for the first time — the plates are in — but no frame-by-frame
  pass has been run against `ART_DIRECTION`'s signature moments. Deferred, not passed.
- **Onboarding comprehension**: no clean-context judgement has been run
  (`qa/evidence/onboarding.md` does not exist), so first-time onboarding cannot be marked `PASS`.
- **Audio**: `ART_DIRECTION` §13.5 specifies a release-gated audio set; none is implemented.
- **Human playtest**: not started. There is no `qa/PLAYTEST_PROTOCOL.md` yet.

## Release gate

| Gate | State |
|---|---|
| 6 gated image keys | **present** — generated, sized, shipped as WebP, wired through `src/skin.js` |
| 2 Caslon fonts | **absent** — Georgia/serif fallback in use |
| Release-gated audio set | **absent** |
| 9 degradable keys | all currently on their named lesser expression |

The six plates are in and the game reads as the engraved book it was specified to be. Two gates
remain open — the Caslon subset and the audio set — so this is still not a release build, and this
report does not call it one. The fallback path is intact and exercised: a key that fails to load
draws a grey box carrying its key name and the run continues.

**Known integration debt after the plates landed.** The Canvas state objects were positioned
against the greybox room; the room's hearth, board, stool and window have been re-anchored to
fractions of the aperture so they register on the real plate. Two things are still drawn as flat
greybox rectangles over the engraved hovel and want the engraved treatment: the cold slot and the
tally plank. The aperture is also still a plain rectangle rather than the ragged chink of §7.1.
