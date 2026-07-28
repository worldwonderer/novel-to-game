# QA_REPORT · Frankenstein — The Hovel

- Date: 2026-07-28
- Round: **fourth**. Round 1 was the first independent QA (before it the example had no `qa/`
  stage at all). Round 2 drove the harness through a complete campaign to an ending. Round 3
  repaired the mouse input path that round 2 exposed. Round 4 made the `seen` ending render, and
  fixed a QA assertion of my own that could not hold at normal speed (F9).
- Verdict: **not `PASS`** — the slice is **completable by either input scheme**: full eight-night
  campaigns reach the `door` ending at exchange 5 and restart clean, one driven entirely by
  keyboard and one entirely by mouse, and the `seen` ending now renders and is played to its
  failure card. Still open: two release gates (Caslon fonts, audio set), and `want` and `silence`
  remain unplayed (see *Findings*, *Release gate*, *Not verified*).
- `blocker`: 0 (1 found in round 1, **fixed**, with a regression check)
- `major`: 3 — 1 partly cleared (images done; fonts and audio outstanding), 2 **fixed**
  (F6 mouse input, F7 the `seen` ending)
- `minor`: 4 fixed, 3 open
- Deliverable name: **completable vertical slice, both input schemes, plates in, two gates open**

The automated result says this build boots, plays seven nights, takes the long walk, opens the
door, lands all five exchanges, reaches a designed ending, plays the epilogue and restarts to a
valid initial state — deterministically, under a fixed seed, at both game speeds. It does **not**
say the game is good, that the 45-minute arc lands, or that any human has played it.

## Environment

```bash
cd examples/frankenstein
node qa/design_invariants.mjs   # engine invariants, 10 sections
python3 qa/qa_browser.py        # real Chromium: keyboard pass, mouse pass, keyboard campaign, mouse campaign
```

| Item | Value |
|---|---|
| Page | `http://127.0.0.1:5199/?seed=42&fast=1` (and `?seed=42` under `QA_SLOW=1`) |
| Form | native ES Module + Canvas 2D, zero build |
| Viewport | 1280×800 (target), 1280×720 (minimum) both tested |
| Browser assertions | **133 passed, 0 failed** (28 from round 1 and 39 from round 2, both unchanged; 66 new mouse-path assertions) |
| Engine invariants | all sections hold |
| Console errors / failed requests | 0 / 0 |
| Request domains | `127.0.0.1:5199` only — **no external domain** |
| Total build | 1.50 MB (6 plates as WebP; budget is 25 MB) |
| Frame p50 / p95 / worst | 8.3 / 10.0 / 10.4 ms — comfortably inside the 30 FPS floor (33.4 ms) |
| Main-thread long tasks | 0 in-game, 0 at boot |

Machine-readable summary: `qa/evidence/automated.json`. Frames: `qa/evidence/browser/` (27).
Full run log: `qa/evidence/qa_browser_last.log`.

Frame sampling sits on the two heaviest live screens (title reveal, night play), not an idle
screen, and reports the distribution rather than a mean.

**Timing evidence is valid for the keyboard campaign; the mouse campaign's normal-speed run is
still owed.** Round 1's figures came from an accelerated run and were not usable for pacing. The
keyboard campaign has since been played at normal speed under `QA_SLOW=1` — green, p50 8.3 /
p95 10.1 / worst 10.3 ms, 0 in-game long tasks. Round 3's blanket claim that timing evidence was
valid was **too broad**: F9 aborted the mouse campaign under `QA_SLOW`, so that pass had never
completed at normal speed. F9 is fixed; a clean `QA_SLOW` run covering both campaigns is the
outstanding item. The door scene runs on a real-time clock
(5 slots × 30 s) at either speed, so a full campaign takes ~6 min accelerated and ~15 min normal.

## Findings and reflow

| # | Severity | Stage | Finding | Verification |
|---|---|---|---|---|
| B1 | `blocker` | `build` | **The title screen never completed.** `engine.tick()` owns `state.phaseTick`, and `step()`'s `title` case called `tickTitle(input)` without it — unlike `coldOpen` and `about`, which both call it. So `phaseTick` stayed 0 forever, `titleBeat` (= `phaseTick/45`) stayed 0, and the title text and all three verbs were never drawn. A player saw two blank shapes with no way in; only a blind Enter started the game | **Fixed** — `src/main.js` `case 'title'` now calls `engine.tick(state, {})`. Harness asserts `phaseTick >= 270` (full reveal); measured 414. Engine invariants still hold |
| F1 | `major` | `build` | All **6 release-gated image keys** and both Caslon fonts were absent; every one rendered as its grey box. Per `ART_DIRECTION` §16.1 a missing gated key means the build fails release | **Images fixed; fonts and audio still open.** All 6 plates (`plate/paper`, `plate/title`, `plate/room`, `plate/hovel`, `plate/door`, `plate/fire`) generated, sized to their draw size and shipped as WebP (17 MB PNG → 1.4 MB, total build 1.50 MB against a 25 MB budget). They enter through `src/skin.js`; a key that fails to load still draws a grey box carrying its key name and the run continues. **Still absent:** `font/caslon-text`, `font/caslon-display`, and the release-gated audio set |
| F2 | `minor` | `build` | Title line collided with the plate border: the plate ended at `PLATE.h-180` = 620 and the 30 px title sat at `0.78h` = 624, so the rule cut the letterforms. §3.3 puts occlusion tolerance at zero | **Fixed** — plate now stops at `0.72h`; title block clears the platemark |
| F3 | `minor` | `build` | In the hovel, the opaque prompt band (`0.88h`–`0.96h` = 704–768) was drawn over the tally plank (620–730) and completely hid the food heap (baseline 720). The plank carries Words and the heap carries own-food — both are read-outs the player is meant to check | **Fixed** — heap, plank and journal bundle raised to a `FLOOR` of 690 so they clear the band |
| F4 | `minor` | `design` | The cold open requires **23 s of continuously held input** before the first night, and `?fast=1` does not shorten it (`coldTime` counts real seconds, not night-minutes). It is a deliberate paced scene, but it is also 23 s before any interactive verb, and it makes every automated pass slow | **Open** — flagged to `game-world-design`; not changed unilaterally because the pacing is an explicit authored beat |
| F5 | `minor` | `product` | `qa/` did not exist: no harness, no evidence, no report. `GAME_DESIGN` §14 named the acceptance path but nothing executed it | **Fixed** — `qa/qa_browser.py` added, following the repo convention (evidence in-workspace at `qa/evidence/browser/`, JPEG, never `/tmp`) |
| F6 | `major` | `build` | **Every mouse click was dead.** `src/main.js:66` declares `edges` with `action / drop / exit / journal / advance` and no `clicked`; line 104 does `const e = { ...edges }`, so `e.clicked` is permanently `undefined`, and line 106 clears `mouse.clicked` having never read it. Nine call sites depend on `input.clicked` — title buttons, click-to-move, exit-by-click, the knock, the door. All are unreachable. `mouse.down` is read as a *level* (lines 219 / 279 / 297), so held-mouse still drives the cold open and the context action, which is why round 1's "mouse-primary" pass went green: it exercised holds and silently fell through to Enter for everything else | **Fixed.** Three dead pieces, not one: (a) `consumeEdges` now reads `mouse.clicked` *before* clearing it, so one `mousedown` yields exactly one edge consumed by exactly one tick; (b) `scene.queuedAction` was declared, reset and read but **never assigned a value**, so `maybeQueuedAction` was a permanent no-op — a restored `clicked` alone would have walked the creature to a hotspot and left it standing there; (c) `yardClick` was defined at `main.js:167` and **never called**, its body carrying the no-op expression `engine.applyClick ? null : null;`. All three are wired, and the hotspot radii mirror `nearestActionable`'s per-object reaches exactly (DOOR 34, OUTHOUSE 40, WELL 30, DOOR_APRON 30, MILK_HOUSE 30, WOOD_EDGE 44, HOVEL_MOUTH 24). Verified by a **complete mouse-only campaign** to the `door` ending. The harness's silent `keyboard.press("Enter")` fallback — what let this hide in round 1 — is deleted |
| F7 | `major` | `build` | **The `seen` ending crashes the renderer.** `src/main.js:497` calls `R.wedge(...)`; `src/render.js:40` defines `wedge` as a module-local function and never exports it (the export list has no `wedge`). Once the `seen` phase begins, every frame throws `R.wedge is not a function` — the frozen cone and the failure card never draw and the console fills. The sim keeps ticking, so a keypress still advances to the epilogue over a dead screen. One of the four designed endings (§12) is unshippable | **Fixed** — `wedge` is now exported; it was the only one of the fifteen symbols `renderSeen` touches that `render.js` withheld. Verified by a dedicated `seen` pass: seed 42, night 1, the plank lifted through the real input path and the creature left standing in the yard until Agatha's retiring patrol finds him at minute 1.38 — no state injection. The pass asserts the sighting is the designed one (`ending=seen`, `seenBy=agatha`, `seenCtx=night`, inside the retiring window, seer's cone still live in the freeze), then the 2 s hold, the SEEN card, and the advance to the epilogue. Console-clean is asserted **segment-scoped** — zero *new* errors through the phase — on top of the untouched run-wide gate, so a run that never enters `seen` cannot pass it by default. Frames: `26_seen_freeze.jpg` (both whitened wedges, the creature inside Agatha's, the shadow across the seer), `27_seen_card.jpg` |
| F9 | `minor` | `product` | **A QA assertion could not hold at normal speed.** `[mouse-campaign] click-to-move actually moves the creature` (added in round 3, by me) demanded >40 px of travel on a leg only 45.5 px long, while `click_arrive` stops polling inside a 14 px arrival radius — so the guaranteed floor is 31.5 px and the bar sat above it. The creature moves `WALK_SPEED` = 290 px per *night-minute*, i.e. 290 px/s at `?fast=1` but 36 px/s at normal speed, and the 100 ms poll therefore overshoots the arrival ring by ~29 px accelerated against ~3.6 px at normal speed. The assertion was a coin-flip at `fast` (observed both 43.6 px pass and 33.4 px fail) and unpassable under `QA_SLOW`. It aborted the mouse campaign, so **the round-3 claim that timing evidence was valid covered the keyboard campaign only** | **Fixed** — the bar is now derived from the geometry rather than hand-picked: travel must be at least the leg length minus the shared `ARRIVE_R` constant (which `click_arrive` also uses, so the two cannot drift). Standing still still fails it |
| F8 | `minor` | `build` | **The ending card's text overflows its plate and becomes unreadable.** `drawCard` (`src/render.js:348`) paints the card from `0.22w` to `0.78w` and then draws each line centred on `PLATE.w/2` with no wrapping and no fit-to-width. The epilogue's first line renders at 30 px display and is wider than the card, so it spills onto the `nightDeep` background still in `PAL.ink` — dark on dark. In `13_campaign_epilogue.jpg` the words "At da…" and "…sking." are effectively invisible. This is the payoff text of the whole slice | **Open** — found by looking at the frame, not by an assertion; the harness verifies the epilogue *plays*, nothing verifies it can be *read* |

## What was actually verified

- **A complete campaign to an ending.** Seed 42, played through the real input path with no state
  injection: listen at the chink on nights 1–2; night 3 carry a load to their door after the
  retiring window closes (Firing 0 → 1); night 4 the first lesson, then a second carry (1 → 2);
  lessons on nights 5–7; day 8 the long walk with all five slots, the yard crossed in daylight,
  the knock losing no slot; then the door, **all five exchanges landed** (96 words against the
  80-word gate, 2 carries against the exchange-5 lock), ending id `door`, the epilogue, `afterRun`,
  and a restart to a valid initial state. Reproduced at both speeds — `?fast=1` and `QA_SLOW=1`.
- **The same campaign again, driven entirely by mouse** — no keyboard at any point. Title verb
  clicked to enter; the about card and the options plate opened, toggled and dismissed by click;
  the chink clicked to listen; the cold slot clicked to step out; click-to-move across the yard
  with the creature's position asserted before and after each leg; the outhouse, the door pile and
  the hovel mouth clicked to take, put down and slip back in; four lessons started by click; the
  cottage door clicked to knock, keeping all five slots; five exchanges clicked; the withheld hand
  held with `mouse.down`; epilogue cards and restart clicked. Ending `door`, exchange 5.
- **Boot → title → cold open → night → night 2 → restart**, driven twice, once by keyboard only
  and once by mouse. `BUILD_BRIEF` requires every action to be reachable by keyboard alone; the
  keyboard-only pass completes the path.
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

- **Two of the four endings.** `door` and `seen` are played end to end; `want` and `silence`
  are untested.
- **Endings by mouse other than `door`** — the mouse campaign reaches `door` only, same as the
  keyboard one.
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
