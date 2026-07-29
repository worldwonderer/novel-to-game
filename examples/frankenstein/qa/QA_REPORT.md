# QA_REPORT · Frankenstein — The Hovel

- Date: 2026-07-28
- Round: **fifth**. Round 1 was the first independent QA (before it the example had no `qa/`
  stage at all). Round 2 drove the harness through a complete campaign to an ending. Round 3
  repaired the mouse input path that round 2 exposed. Round 4 made the `seen` ending render, and
  fixed a QA assertion of my own that could not hold at normal speed (F9). Round 5 made card text
  wrap inside its paper (F8) and gated it executably.
- Verdict: **not `PASS`** — the slice is **completable by either input scheme**: full eight-night
  campaigns reach the `door` ending at exchange 5 and restart clean, one driven entirely by
  keyboard and one entirely by mouse, and the `seen` ending now renders and is played to its
  failure card, and `want` and `silence` are played too — **all four designed endings now have
  executable evidence**. Still open: one release gate, the audio set (see *Findings*,
  *Release gate*, *Not verified*).
- `blocker`: 0 (1 found in round 1, **fixed**, with a regression check)
- `major`: 4 — 1 partly cleared (images and fonts done; audio outstanding), 3 **fixed**
  (F6 mouse input, F7 the `seen` ending, F12 the hovel plate's composition)
- `minor`: 6 fixed, 4 open
- Deliverable name: **completable vertical slice, both input schemes, plates and fonts in, one gate open**

The automated result says this build boots, plays seven nights, takes the long walk, opens the
door, lands all five exchanges, reaches a designed ending, plays the epilogue and restarts to a
valid initial state — deterministically, under a fixed seed, at both game speeds. It does **not**
say the game is good, that the 45-minute arc lands, or that any human has played it.

## Environment

```bash
cd examples/frankenstein
node qa/design_invariants.mjs   # engine invariants, 10 sections
python3 qa/qa_browser.py        # real Chromium: keyboard, mouse, both campaigns, the seen ending, card layout
```

| Item | Value |
|---|---|
| Page | `http://127.0.0.1:5199/?seed=42&fast=1` (and `?seed=42` under `QA_SLOW=1`) |
| Form | native ES Module + Canvas 2D, zero build |
| Viewport | 1280×800 (target), 1280×720 (minimum) both tested |
| Browser assertions | **246 passed, 0 failed** across seven passes: keyboard, mouse, keyboard campaign, mouse campaign, and all four designed endings (`door`, `seen`, `want`, `silence`), plus a card-layout gate over 2898 layouts and a font gate proving both Caslon faces really render |
| Engine invariants | all sections hold |
| Console errors / failed requests | 0 / 0 |
| Request domains | `127.0.0.1:5199` only — **no external domain** |
| Total build | 1.52 MB (6 plates as WebP + 2 woff2 at 33 KB; budget is 25 MB) |
| Frame p50 / p95 / worst | 8.3 / 10.0 / 10.4 ms — comfortably inside the 30 FPS floor (33.4 ms) |
| Main-thread long tasks | 0 in-game, 0 at boot |

Machine-readable summary: `qa/evidence/automated.json`. Frames: `qa/evidence/browser/` (44).
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
| F1 | `major` | `build` | All **6 release-gated image keys** and both Caslon fonts were absent; every one rendered as its grey box. Per `ART_DIRECTION` §16.1 a missing gated key means the build fails release | **Images fixed; fonts now fixed too; audio still open.** All 6 plates (`plate/paper`, `plate/title`, `plate/room`, `plate/hovel`, `plate/door`, `plate/fire`) generated, sized to their draw size and shipped as WebP (17 MB PNG → 1.4 MB, total build 1.50 MB against a 25 MB budget). They enter through `src/skin.js`; a key that fails to load still draws a grey box carrying its key name and the run continues. **Fonts now fixed too:** `font/caslon-text` and `font/caslon-display` ship as self-hosted woff2 Latin-1 subsets (16.6 / 15.7 KB, `OFL.txt` alongside), enter through `src/skin.js`'s key mechanism via `FontFace`, and are gated in the browser suite — `document.fonts.check` for both faces, neither key in `skin.pending()`, and canvas `measureText` width deltas proving each face really renders in place of Georgia and that Text and Display are distinct families. **Still absent:** the release-gated audio set |
| F2 | `minor` | `build` | Title line collided with the plate border: the plate ended at `PLATE.h-180` = 620 and the 30 px title sat at `0.78h` = 624, so the rule cut the letterforms. §3.3 puts occlusion tolerance at zero | **Fixed** — plate now stops at `0.72h`; title block clears the platemark |
| F3 | `minor` | `build` | In the hovel, the opaque prompt band (`0.88h`–`0.96h` = 704–768) was drawn over the tally plank (620–730) and completely hid the food heap (baseline 720). The plank carries Words and the heap carries own-food — both are read-outs the player is meant to check | **Fixed** — heap, plank and journal bundle raised to a `FLOOR` of 690 so they clear the band |
| F4 | `minor` | `design` | The cold open requires **23 s of continuously held input** before the first night, and `?fast=1` does not shorten it (`coldTime` counts real seconds, not night-minutes). It is a deliberate paced scene, but it is also 23 s before any interactive verb, and it makes every automated pass slow | **Open** — flagged to `game-world-design`; not changed unilaterally because the pacing is an explicit authored beat |
| F5 | `minor` | `product` | `qa/` did not exist: no harness, no evidence, no report. `GAME_DESIGN` §14 named the acceptance path but nothing executed it | **Fixed** — `qa/qa_browser.py` added, following the repo convention (evidence in-workspace at `qa/evidence/browser/`, JPEG, never `/tmp`) |
| F6 | `major` | `build` | **Every mouse click was dead.** `src/main.js:66` declares `edges` with `action / drop / exit / journal / advance` and no `clicked`; line 104 does `const e = { ...edges }`, so `e.clicked` is permanently `undefined`, and line 106 clears `mouse.clicked` having never read it. Nine call sites depend on `input.clicked` — title buttons, click-to-move, exit-by-click, the knock, the door. All are unreachable. `mouse.down` is read as a *level* (lines 219 / 279 / 297), so held-mouse still drives the cold open and the context action, which is why round 1's "mouse-primary" pass went green: it exercised holds and silently fell through to Enter for everything else | **Fixed.** Three dead pieces, not one: (a) `consumeEdges` now reads `mouse.clicked` *before* clearing it, so one `mousedown` yields exactly one edge consumed by exactly one tick; (b) `scene.queuedAction` was declared, reset and read but **never assigned a value**, so `maybeQueuedAction` was a permanent no-op — a restored `clicked` alone would have walked the creature to a hotspot and left it standing there; (c) `yardClick` was defined at `main.js:167` and **never called**, its body carrying the no-op expression `engine.applyClick ? null : null;`. All three are wired, and the hotspot radii mirror `nearestActionable`'s per-object reaches exactly (DOOR 34, OUTHOUSE 40, WELL 30, DOOR_APRON 30, MILK_HOUSE 30, WOOD_EDGE 44, HOVEL_MOUTH 24). Verified by a **complete mouse-only campaign** to the `door` ending. The harness's silent `keyboard.press("Enter")` fallback — what let this hide in round 1 — is deleted |
| F7 | `major` | `build` | **The `seen` ending crashes the renderer.** `src/main.js:497` calls `R.wedge(...)`; `src/render.js:40` defines `wedge` as a module-local function and never exports it (the export list has no `wedge`). Once the `seen` phase begins, every frame throws `R.wedge is not a function` — the frozen cone and the failure card never draw and the console fills. The sim keeps ticking, so a keypress still advances to the epilogue over a dead screen. One of the four designed endings (§12) is unshippable | **Fixed** — `wedge` is now exported; it was the only one of the fifteen symbols `renderSeen` touches that `render.js` withheld. Verified by a dedicated `seen` pass: seed 42, night 1, the plank lifted through the real input path and the creature left standing in the yard until Agatha's retiring patrol finds him at minute 1.38 — no state injection. The pass asserts the sighting is the designed one (`ending=seen`, `seenBy=agatha`, `seenCtx=night`, inside the retiring window, seer's cone still live in the freeze), then the 2 s hold, the SEEN card, and the advance to the epilogue. Console-clean is asserted **segment-scoped** — zero *new* errors through the phase — on top of the untouched run-wide gate, so a run that never enters `seen` cannot pass it by default. Frames: `26_seen_freeze.jpg` (both whitened wedges, the creature inside Agatha's, the shadow across the seer), `27_seen_card.jpg` |
| F13 | `minor` | `art` | **The aperture is irregular but does not read as a chink in boards.** The rectangular clip is gone and the mask is now a `det()`-seeded sawtooth registered to the boards' own teeth, gated so a rectangle (variance 0) cannot pass. But the teeth are a uniform 7 px step on all four sides, so at game scale the aperture reads as a pinked or torn-paper mount, not §7.1's "ragged aperture — the chink in the boarded window". Prised boards give long, mostly straight edges broken at irregular points, not a constant-frequency fringe | **Open, deliberately deferred.** The machinery is sound and stays: `aperturePath` retraces the same tooth lines and salts as the four `plankBreak`/`plankEnd` calls, inset 2 px, so no room pixel escapes onto the boards and no sliver of plate shows between them — envelope bounds derived from the geometry (`by-2`, `lx+2`, `rx-2`), not tuned. Reshaping is held until **after** F12: regenerating `plate/hovel` to §7.1's composition changes where the aperture sits and what surrounds it, so cutting a new silhouette first would be thrown away. Carried to the signature-frame pass with F11. **The regenerated plate now shows what the silhouette should be**, so the reshape has a concrete target rather than a prose description. It also left a small registration artifact: the plate's opening shows above the mask's top edge in a 52x11 px sliver (15 warm pixels at x 236-288, y 126-137), so the reshaped mask must cover the plate's opening completely |
| F12 | `major` | `art` | **The generated `plate/hovel` does not implement §7.1's composition, and the frame now carries two warm chinks.** §7.1 calls the hovel interior "the signature frame of this game" and puts a ragged aperture **left of centre**, "occupying about 34% of the frame's width and 40% of its height, warm, and inside it the whitewashed room". Measured on the shipped plate, its one warm opening sits at **x 868-886, y 308-502 — centred at x 877, right of centre, 1.4% of frame width and 24% of its height**: a light leak between boards, not an aperture onto a room. The game draws its own aperture at 160-590 (33.6% x 41.3%, left of centre) per §7.1, so the two do not register and the signature frame shows a warm rectangle left of centre *and* an unexplained warm crack right of centre. The plate's only large left-of-centre opening is cold and shows snow and trees, not the room | **Fixed.** `plate/hovel` regenerated via codex imagegen against §7.1, two variants produced and one rejected: the reject fragmented the wall into six or seven slivers where §7.1 asks for one aperture. The shipped plate measures **warm mass x 230-580, centred 405 — left of centre, with 0.0% of warm pixels right of centre** (was: centred 877, right of centre), and that mass sits inside the Canvas aperture at 160-590, so the room drawn over it covers it and one chink remains in frame. Its opening is edged as §7.1 describes — long straight board edges with splintered breaks across the grain — which also supplies the reference silhouette F13 was missing. **Consequence for QA:** the plate lights the straw, and the F11/F13 pixel probes were written against a dark-straw plate, keyed on "warm means content". Two broke — the aperture's bottom lane latched onto the plate's glow at y 500 and read it as a leak, and the plank control could not separate plank from lit straw (`#3a3020` passes `warm()` itself). Both corrected, not tuned: the bottom lane now measures the boundary from *inside* the room, and the control moved to the prompt band's straight edge, which is keyed on luminance and independent of the plate (scores 0 px^2 over 234 columns). Building those gates before regenerating the plate was the wrong order |
| F11 | `minor` | `art` | **Three objects were flat swatches on an engraved plate.** The cold slot, the tally plank body and the journal bundle were single `fillRect` fills with a 1.5 px stroke, sitting on top of the real `plate/hovel` woodcut like stickers. §7.1 asks the slot to be "a narrow cold slot where the loose plank sits, through which a strip of the yard is visible: the corner of the cottage and the pile of cut wood at the door"; §16.3 lists the pile courses, the tally plank and its scratches as Canvas 2D work | **Fixed, with a stated remainder.** A reusable `hatch` (density and broken lines, never a gradient), `plankBreak` and `plankEnd` for the boards' broken silhouette, and a deterministic index-hash `det()` for mark jitter — explicitly *not* the engine's seeded RNG, which would consume the sim's seed stream and desync replays. `drawPile` now takes a geometry argument and serves both the yard plan and the strip seen through the slot, so the pile courses cannot drift into two implementations. Gated at pixel level: each region must clear 40 unique colours and 150 luminance variance, with same-size bare-straw patches as controls that are themselves asserted, so a broken probe fails loudly. Measured slot 638/471, plank 145/1080, bundle 197/773 against a flat fill's ~3-6 colours and ~10 variance. **Remainder:** the slot's upper band between the cottage corner and the right end cap is still one dark tone with sparse marks and reads as a flat field at a glance; the plank's knots fall under the tally rows; the parcel is 50x40 px and reads more diagram than engraving. Carried to the signature-frame pass (queue 13), where "does it read" is the actual question |
| F10 | `minor` | `art` | **The card shrink ladder collides with `ART_DIRECTION` §9's own numbers.** Three parts. (a) §9's table gives card body 22 px with a floor "it must never cross" of 13 px, but `layoutCard` clamps at `Math.max(11, ...)` — below spec. Latent today (the worst observed setting is 16 px) but the clamp is wrong. (b) The ladder largely cancels the text-size setting on the busiest cards: the 4-line epilogue with buttons lands at 17 px / 18 px / 20 px for `textScale` 1 / 1.25 / 1.5, so a reader asking for 50% larger type gets 18%. (c) §9 also fixes a measure of ≤ 62 characters and specifies "left-aligned, ragged right"; the layout gate checks pixels only, and cards are drawn centred. The centring predates this round | **Open** — the fit criterion for F8 is met and gated; these are the *typographic* rules around it, none of which the new gate covers. Filed rather than fixed so the round stayed on its stated scope |
| F9 | `minor` | `product` | **A QA assertion could not hold at normal speed.** `[mouse-campaign] click-to-move actually moves the creature` (added in round 3, by me) demanded >40 px of travel on a leg only 45.5 px long, while `click_arrive` stops polling inside a 14 px arrival radius — so the guaranteed floor is 31.5 px and the bar sat above it. The creature moves `WALK_SPEED` = 290 px per *night-minute*, i.e. 290 px/s at `?fast=1` but 36 px/s at normal speed, and the 100 ms poll therefore overshoots the arrival ring by ~29 px accelerated against ~3.6 px at normal speed. The assertion was a coin-flip at `fast` (observed both 43.6 px pass and 33.4 px fail) and unpassable under `QA_SLOW`. It aborted the mouse campaign, so **the round-3 claim that timing evidence was valid covered the keyboard campaign only** | **Fixed** — the bar is now derived from the geometry rather than hand-picked: travel must be at least the leg length minus the shared `ARRIVE_R` constant (which `click_arrive` also uses, so the two cannot drift). Standing still still fails it |
| F8 | `minor` | `build` | **The ending card's text overflows its plate and becomes unreadable.** `drawCard` (`src/render.js:348`) paints the card from `0.22w` to `0.78w` and then draws each line centred on `PLATE.w/2` with no wrapping and no fit-to-width. The epilogue's first line renders at 30 px display and is wider than the card, so it spills onto the `nightDeep` background still in `PAL.ink` — dark on dark. In `13_campaign_epilogue.jpg` the words "At da…" and "…sking." are effectively invisible. This is the payoff text of the whole slice | **Fixed** — `drawCard`'s inline geometry is lifted into a `CARD` constant; `wrapCardLine` does a `measureText` word walk in the style of the existing `glossText`; and `layoutCard` is a pure, exported measure that wraps every logical line to the paper's inner width and steps type and leading down a ladder until the block clears the paper's foot **and** the button zone. A word wider than the measure is left whole so the gate fails loudly rather than the card spilling ink. Button hit boxes are unchanged, so the all-mouse campaign still passes. Proved executably, not by eye: the harness walks the whole `STRINGS` tree and asserts width and height over **2898 layouts across 229 strings** — every card variant, with and without buttons, at `textScale` 1, 1.25 and 1.5. Overflow `[]`, misfit `[]`. Frame: `14_campaign_epilogue.jpg` |

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

- ~~Endings~~ — **all four designed endings (§12) are now played end to end**: `door` and `seen`,
  plus `want` (five nights taking from the milk-house until `zeroStoreRun` reaches 3) and
  `silence` (the door clock run out at exchange index 0). Each asserts its id, a segment-scoped
  console-clean gate, `afterRun`, and a valid restart.
- **Endings by mouse other than `door`** — the mouse campaign reaches `door` only; `seen`,
  `want` and `silence` are driven by keyboard.
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
| 2 Caslon fonts | **present** — Libre Caslon Text + Display, self-hosted woff2 Latin-1 subsets (16.6 / 15.7 KB) with `OFL.txt`, wired as `font/caslon-text` / `font/caslon-display` through `src/skin.js`; `document.fonts.check` true for both, `skin.pending()` holds neither, and canvas `measureText` proves both faces really render (not the Georgia fallback) and are not the same family |
| Release-gated audio set | **absent** |
| 9 degradable keys | all currently on their named lesser expression |

The six plates and both Caslon faces are in and the game reads as the engraved book it was
specified to be. One gate remains open — the audio set — so this is still not a release build, and
this report does not call it one. The fallback path is intact and exercised: a key that fails to
load draws a grey box carrying its key name (or sets type in Georgia, for a font key) and the run
continues.

**Known integration debt after the plates landed.** The Canvas state objects were positioned
against the greybox room; the room's hearth, board, stool and window have been re-anchored to
fractions of the aperture so they register on the real plate. Two things are still drawn as flat
greybox rectangles over the engraved hovel and want the engraved treatment: the cold slot and the
tally plank. The aperture is also still a plain rectangle rather than the ragged chink of §7.1.
