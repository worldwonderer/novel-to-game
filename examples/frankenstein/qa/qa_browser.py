#!/usr/bin/env python3
"""Frankenstein slice — real-browser QA.

Boot -> title -> cold open -> nights -> restart, driven twice (mouse-primary and
keyboard-only; BUILD_BRIEF requires every action to be reachable by keyboard alone),
then a third, full campaign: seed 42, played through nights 1-7 to the walk, the
door, an ending, the epilogue, afterRun and restart (GAME_DESIGN §10, §12) — and a
fourth pass that repeats that campaign mouse-only: title buttons, click-to-move,
click-to-exit, hotspot walk-and-act (queuedAction), the lesson window, the knock,
the door exchanges, the epilogue cards and the restart button, all by click/hold
with no keyboard input anywhere (QA_REPORT F6) — and a fifth pass that gets the
creature seen on night 1 by standing still in the yard until Agatha's retiring
patrol finds him, asserting the seen phase renders console-clean and the SEEN
failure card lands after the 2 s hold (QA_REPORT F7).

Evidence lands in the workspace at qa/evidence/browser/ as JPEG. The qa contract treats
paths outside the workspace (and system temp dirs) as no evidence at all.

Usage:  python3 qa/qa_browser.py
Env:    BASE_URL, QA_SLOW=1 (normal speed; timing evidence is only valid here),
        QA_SHOTS to override the evidence directory.
"""
from __future__ import annotations

import json
import math
import os
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

EXAMPLE_ROOT = Path(__file__).resolve().parent.parent
APP = EXAMPLE_ROOT / "build" / "app"
EVIDENCE = EXAMPLE_ROOT / "qa" / "evidence"
SHOTS = Path(os.environ.get("QA_SHOTS", EVIDENCE / "browser"))
PORT = 5199
BASE = os.environ.get("BASE_URL", f"http://127.0.0.1:{PORT}")
SLOW = bool(os.environ.get("QA_SLOW"))
URL = f"{BASE}/?seed=42" + ("" if SLOW else "&fast=1")
# Real-second timeouts scale with the speed: at normal speed a night-minute is
# 8 s and the creature walks 36 px/s; at ?fast=1 they are 1 s and 290 px/s.
SPEED = 8 if SLOW else 1
# Arrival tolerance for click-to-move polling. Shared so the assertion that a
# click really moved the creature is derived from the same number the poll uses.
ARRIVE_R = 14

# Canvas game with a 60 Hz rAF loop, so frame-time distribution is the right measure.
# PRODUCT_BRIEF names a >=30 FPS floor => 33.4 ms; absolute stall gate 200 ms.
FRAME_FLOOR_MS = 33.4
STALL_MS = 200.0

passed = failed = 0
errors: list[str] = []
net_errors: list[str] = []
request_hosts: set[str] = set()
perf: dict[str, dict] = {}
shot_n = 0

LONGTASK_INIT = """
window.__longtasks = [];
try {
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__longtasks.push({ms: Math.round(e.duration), at: Math.round(e.startTime)});
  }).observe({ entryTypes: ['longtask'] });
} catch (err) { window.__longtasks = null; }
"""


def section(name: str) -> None:
    print(f"\n== {name} ==")


def check(cond: bool, name: str) -> bool:
    global passed, failed
    if cond:
        passed += 1
        print(f"  PASS  {name}")
    else:
        failed += 1
        print(f"  FAIL  {name}")
    return bool(cond)


def shot(page, name: str) -> str:
    global shot_n
    shot_n += 1
    fn = f"{shot_n:02d}_{name}.jpg"
    page.screenshot(path=str(SHOTS / fn), type="jpeg", quality=80)
    return fn


def ensure_server():
    s = socket.socket()
    try:
        s.connect(("127.0.0.1", PORT)); s.close()
        return None
    except OSError:
        pass
    proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
        cwd=APP, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(60):
        try:
            s = socket.socket(); s.connect(("127.0.0.1", PORT)); s.close()
            return proc
        except OSError:
            time.sleep(0.1)
    proc.kill()
    raise RuntimeError("local server failed to start")


def st(page):
    return page.evaluate("(() => { const s = window.__game.state; return JSON.parse(JSON.stringify(s)); })()")


def phase(page) -> str:
    return page.evaluate("window.__game.phase")


def frame_stats(page, label: str, n: int = 90) -> dict:
    """Frame-interval distribution at the current (heaviest) screen.

    All samples kept, first frame included — that is where a cold-path hitch lands.
    A mean is not a conclusion.
    """
    samples = page.evaluate(
        """async (n) => new Promise((res) => {
            const s = []; let last = performance.now();
            const tick = (now) => { s.push(now - last); last = now;
              if (s.length >= n) res(s); else requestAnimationFrame(tick); };
            requestAnimationFrame(tick);
        })""", n)
    o = sorted(samples)
    pick = lambda q: o[min(len(o) - 1, int(len(o) * q))]
    d = {"p50": round(pick(.50), 2), "p95": round(pick(.95), 2), "max": round(o[-1], 2), "n": len(o)}
    perf[label] = d
    print(f"  frame {label}: p50 {d['p50']} / p95 {d['p95']} / worst {d['max']} ms")
    return d


def wait_phase(page, want, timeout_ms=20000) -> bool:
    """Drive the title/scene phases forward until `want` is reached."""
    step = 200
    for _ in range(timeout_ms // step):
        if phase(page) == want:
            return True
        page.wait_for_timeout(step)
    return phase(page) == want


def hold(page, key: str, ms: int) -> None:
    """Movement and the context action are HOLD, not press: main.js reads
    keys.has(...) every tick, so a press that releases in the same frame does nothing."""
    page.keyboard.down(key)
    page.wait_for_timeout(ms)
    page.keyboard.up(key)


def hold_mouse(page, x: int, y: int, ms: int) -> None:
    page.mouse.move(x, y)
    page.mouse.down()
    page.wait_for_timeout(ms)
    page.mouse.up()


def run_once(page, mode: str) -> dict:
    """One full pass. mode='keyboard' uses keys only; mode='mouse' clicks the canvas."""
    out = {}
    page.goto(URL, wait_until="networkidle")
    page.wait_for_timeout(400)

    section(f"[{mode}] boot and title")
    check(phase(page) == "title", "boots into the title phase")
    # the title reveals over ~4.5 s (beat = phaseTick/45, 6 beats)
    page.wait_for_timeout(6000)
    beat = page.evaluate("window.__game.state.phaseTick")
    check(beat >= 270, f"title fully revealed (phaseTick {beat} >= 270)")
    out["title_shot"] = shot(page, f"{mode}_title")
    frame_stats(page, f"{mode}_title")

    if mode == "mouse":
        # The three title verbs are click targets (drawTitle hit boxes, low-centre).
        section("[mouse] title buttons: about and options plates")
        page.mouse.click(640, 756)   # third verb: about
        page.wait_for_timeout(400)
        check(phase(page) == "about", "clicking the third title verb opens the about card")
        page.mouse.click(640, 400)   # anywhere: back (main.js step 'about')
        page.wait_for_timeout(400)
        check(phase(page) == "title", "clicking the about card returns to the title")
        # Coming back resets phaseTick, so the verbs fade in again with the beat.
        page.wait_for_function("window.__game.state.phaseTick >= 280", timeout=10000)
        page.mouse.click(640, 722)   # second verb: options
        page.wait_for_timeout(400)
        check(phase(page) == "options", "clicking the second title verb opens the options plate")
        before = page.evaluate(
            "(JSON.parse(localStorage.getItem('hovel.options') || '{}').textScale) || 1")
        page.mouse.click(640, 400)   # toggles the focused row (text size)
        page.wait_for_timeout(300)
        after = page.evaluate(
            "(JSON.parse(localStorage.getItem('hovel.options') || '{}').textScale) || 1")
        check(after != before, f"clicking an options row toggles it (textScale {before} -> {after})")
        # Options has no mouse-driven way back (focus moves on arrows only), so
        # reload for a clean title; the reveal must run again for the hit boxes.
        page.evaluate("localStorage.removeItem('hovel.options')")
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(6000)
        check(phase(page) == "title", "back on a clean title after the options detour")

    section(f"[{mode}] enter the run")
    if mode == "keyboard":
        page.keyboard.press("Enter")
    else:
        out["title_button_shot"] = shot(page, "mouseclick_title_button")
        page.mouse.click(640, 688)          # first title verb sits low-centre
        page.wait_for_timeout(200)
        check(phase(page) == "coldOpen",
              "the first title verb is clickable (no keyboard fallback)")
    page.wait_for_timeout(600)
    check(phase(page) != "title", f"leaving the title works ({mode})")
    out["cold_open_shot"] = shot(page, f"{mode}_cold_open")

    # The cold open advances only while the action is HELD and wants 23 s of it.
    # ?fast=1 does not shorten it: coldTime counts real seconds, not night-minutes.
    section(f"[{mode}] cold open (23 s held)")
    t0 = time.time()
    if mode == "keyboard":
        page.keyboard.down(" ")
    else:
        page.mouse.move(640, 400); page.mouse.down()
    while phase(page) == "coldOpen" and time.time() - t0 < 40:
        page.wait_for_timeout(500)
    if mode == "keyboard":
        page.keyboard.up(" ")
    else:
        page.mouse.up()
    out["cold_open_seconds"] = round(time.time() - t0, 1)
    check(phase(page) == "night",
          f"cold open completes into the night ({out['cold_open_seconds']} s held, phase={phase(page)})")

    section(f"[{mode}] the nights")
    s0 = st(page)
    start_night = s0.get("night")
    # Movement and the context action are held, not tapped (see hold()).
    for i in range(24):
        if mode == "keyboard":
            hold(page, ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"][i % 4], 420)
            hold(page, " ", 900)          # hold to watch / take the context action
        else:
            hold_mouse(page, 400 + (i % 5) * 90, 300 + (i % 3) * 70, 700)
        if i == 6:
            out["playing_shot"] = shot(page, f"{mode}_playing")
            frame_stats(page, f"{mode}_playing")
        cur = st(page)
        if cur.get("night") and start_night and cur["night"] > start_night:
            out["advanced_a_night"] = True
            break
    s1 = st(page)
    check(s1.get("tick", 0) > s0.get("tick", 0), "the simulation advances under input")
    changed = [k for k in ("night", "minute", "words", "firing", "store", "ownFood", "unease")
               if s0.get(k) != s1.get(k)]
    check(bool(changed), f"observable state changes: {changed or 'none'}")
    out["state_changed"] = changed
    out["night_reached"] = s1.get("night")

    section(f"[{mode}] restart")
    page.evaluate("window.__game.restart()")
    page.wait_for_timeout(500)
    s2 = st(page)
    check(phase(page) == "title", "restart returns to the title")
    check(s2.get("night") == s0.get("night") and s2.get("words") == s0.get("words"),
          f"restart restores a valid initial state (night {s2.get('night')}, words {s2.get('words')})")
    out["restart_shot"] = shot(page, f"{mode}_restart")
    return out


# ---------------------------------------------------------------- full campaign
#
# One genuinely played run to an ending (GAME_DESIGN §10 beats 1-5, §12, §15):
#   night 1-2  listen at the chink (words, and the trigger that fires once at
#              firing-0 dawns: unease 1, decays the next incident-free night)
#   night 3    listen, then after the retiring window carry the load to the door
#   night 4    the first lesson at minute 0, then the second carry
#   night 5-7  lesson at minute 0, listen out the rest
#   day 8      the long walk (Store 3 at dawn 6 -> 5 slots), knock inside the
#              15-30 s band, five exchanges (words >= 80 and carries >= 1), the
#              withheld hand, the moon hold, afterRun, restart.
# Nothing here pokes run state: minutes pass in real time, every action goes
# through the game's own input path (key/mouse events), and the cones, costs
# and gates all apply. The single concession is the lesson start: the engine
# accepts it only inside the first 0.03 night-minutes (availableAction), which
# is 1-2 ticks at any speed, so it is dispatched in-page, rAF-aligned, as an
# ordinary KeyboardEvent through the real keydown listener.

DESIGNED_ENDINGS = ("seen", "want", "silence", "door")  # GAME_DESIGN §12 "No dead end"

START_LESSON_JS = """
() => new Promise((res) => {
  const key = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }));
  };
  key();  // advance the dawn read
  let guard = 0;
  const pump = () => {
    const g = window.__game;
    const a = g.state.tonight && g.state.tonight.action;
    if (a && a.kind === 'lesson') { res('lesson'); return; }
    if (g.phase === 'night' && g.state.minute > 0.5) { res('missed'); return; }
    if (++guard > 600) { res('timeout'); return; }
    // One fresh edge per frame: the dawn read consumes the first of them; the
    // very next one lands on the first night tick (minute 1/mt <= 0.03), which
    // is the only moment the engine accepts a lesson start.
    key();
    requestAnimationFrame(pump);
  };
  requestAnimationFrame(pump);
})
"""


class CampaignAbort(Exception):
    pass


def need(cond: bool, name: str) -> None:
    """PASS lines print as they land; a failure is reported once, by the
    run_campaign handler, together with the state snapshot."""
    if cond:
        check(True, name)
    else:
        raise CampaignAbort(name)


def press(page, key: str = "e", ms: int = 90) -> None:
    page.keyboard.down(key)
    page.wait_for_timeout(ms)
    page.keyboard.up(key)


def qa_state(page) -> dict:
    return page.evaluate("""(() => {
      const g = window.__game; const s = g.state;
      return { phase: g.phase, night: s.night, day: s.day,
        minute: Math.round(s.minute * 100) / 100, length: s.nightLength,
        words: s.words, firing: s.firing, store: s.store, unease: s.unease,
        x: Math.round(s.creature.x), y: Math.round(s.creature.y),
        carrying: s.creature.carrying, inHovel: s.creature.inHovel,
        ending: s.ending, seenBy: s.seenBy, seenCtx: s.seenContext, exchanges: s.exchangesReached,
        carries: s.carriesTotal, lessons: s.lessonsAttended, listens: s.listensCompleted,
        slipped: s.walkSlipped, walk: s.walk,
        door: s.door && { index: s.door.index, exchangeTicks: s.door.exchangeTicks,
                          clockTicks: s.door.clockTicks, slots: s.door.slots },
        canSpeak: g.engine.doorCanSpeak(s),
        lessonDone: !!(s.tonight && s.tonight.lessonDone),
        listening: !!(s.tonight && s.tonight.listening),
        action: (s.tonight && s.tonight.action) ? s.tonight.action.kind : null,
        walkStage: s.walkScene ? s.walkScene.stage : null }; })()""")


def wait_cond(page, pred, timeout_s: float, poll_ms: int = 150):
    t0 = time.time()
    s = qa_state(page)
    while not pred(s):
        if time.time() - t0 > timeout_s:
            return None
        page.wait_for_timeout(poll_ms)
        s = qa_state(page)
    return s


def wait_dawn(page, timeout_s: float = 0) -> dict:
    """The night plays out to the dawn read; being seen aborts the campaign."""
    s = wait_cond(page, lambda s: s["phase"] in ("dawnRead", "seen"), timeout_s or 30 * SPEED)
    if s is None:
        raise CampaignAbort("night did not reach the dawn read")
    if s["phase"] == "seen":
        raise CampaignAbort(f"seen by {s['seenBy']} on night {s['night']}, minute {s['minute']}")
    return s


def drive_to(page, tx: int, ty: int, radius: int = 14, timeout_s: float = 0,
             phases=("night",)):
    """Keyboard click-to-move: poll the creature and hold arrows toward the point.
    The keyboard campaign drives with keys because BUILD_BRIEF requires the whole
    path to be reachable by keyboard alone; the mouse campaign below clicks."""
    timeout_s = timeout_s or 12 * SPEED
    held: set[str] = set()

    def release():
        for k in held:
            page.keyboard.up(k)
        held.clear()

    t0 = time.time()
    s = qa_state(page)
    while math.hypot(tx - s["x"], ty - s["y"]) > radius:
        if s["phase"] not in phases:
            release()
            return s
        if time.time() - t0 > timeout_s:
            release()
            return None
        want: set[str] = set()
        if tx - s["x"] > 6:
            want.add("ArrowRight")
        elif tx - s["x"] < -6:
            want.add("ArrowLeft")
        if ty - s["y"] > 6:
            want.add("ArrowDown")
        elif ty - s["y"] < -6:
            want.add("ArrowUp")
        for k in want - held:
            page.keyboard.down(k)
        for k in held - want:
            page.keyboard.up(k)
        held.clear()
        held.update(want)
        page.wait_for_timeout(70)
        s = qa_state(page)
    release()
    return s


# Keyboard routes around the obstacle rectangles (engine constants.js). The
# drive controller walks 45-degree diagonals until an axis enters its deadzone,
# which pins it against rectangle faces it meets mid-diagonal; these legs are
# axis-aligned or diagonal-safe, verified at both speeds in Node against the
# engine itself. The lanes follow the designed CARRY_ROUTE.
ROUTE_OUT = [(585, 258), (455, 330), (310, 458)]   # mouth -> below the outhouse
ROUTE_DOOR = [(450, 462), (748, 462), (748, 425), (700, 425)]  # outhouse -> door, south lane
ROUTE_HOME = [(748, 410), (748, 290), (684, 290), (630, 265)]  # door -> mouth, east lane
ROUTE_CROSS = [(684, 222), (748, 222), (748, 425), (700, 425)]  # the walk, daylight


def carry_load(page, out: dict, tag: str) -> None:
    """Outhouse -> door -> hovel mouth, inside the cone-free minutes. The caller
    has already stepped out; ends back inside with firing one higher."""
    f0 = qa_state(page)["firing"]
    for wx, wy in ROUTE_OUT:
        s = drive_to(page, wx, wy, 12)
        if s is None or s["phase"] != "night":
            raise CampaignAbort(f"{tag}: the walk to the outhouse failed (last={s})")
    press(page)  # take the load (instant context action, in reach of the outhouse)
    need(qa_state(page)["carrying"], f"[campaign] {tag}: the load is taken up")
    for wx, wy in ROUTE_DOOR:
        s = drive_to(page, wx, wy, 16)
        if s is None or s["phase"] != "night":
            raise CampaignAbort(f"{tag}: the carry to the door failed (last={s})")
    press(page)  # put it down at their door
    s = qa_state(page)
    need(not s["carrying"] and s["firing"] == f0 + 1,
         f"[campaign] {tag}: put down at their door (firing {f0} -> {s['firing']})")
    out[f"{tag}_shot"] = shot(page, f"campaign_{tag}")
    for wx, wy in ROUTE_HOME:
        s = drive_to(page, wx, wy, 12)
        if s is None or s["phase"] != "night":
            raise CampaignAbort(f"{tag}: the walk home failed (last={s})")
    press(page)  # slip back inside
    need(qa_state(page)["inHovel"], f"[campaign] {tag}: back inside ahead of the dawn window")


def start_lesson(page, night: int) -> None:
    r = page.evaluate(START_LESSON_JS)
    need(r == "lesson", f"night {night}: the lesson starts at minute 0 ({r})")


# ---------------------------------------------------------------- hovel plate
#
# TASK 5 ("刻在版上"): the cold slot, the tally plank and the journal bundle
# were single fillRect swatches over plate/hovel — flat stickers on an
# engraved ground. Pixel-level guard: sample each region on the canvas itself
# and assert it is not one colour. A same-size patch of bare straw next to
# each region is the control: the straw is part of the engraved plate, so it
# marks what "engraved" scores on the same metric — and a broken probe (all
# zeros, a covered canvas) fails the controls too, loudly.
#
# Floors: measured on the engraved build (2026-07-28, the night frame — the
# poorer case; the dawn frame scores higher): slot 754 unique / 525 luminance
# variance, plank 143 / 921, bundle 197 / 773; straw controls 2865/658,
# 3002/490, 893/637. A flat fillRect with a 1.5 px stroke scores ~3-6 unique
# colours and variance ~10. The floors sit ~3.5x below the worst engraved
# measurement and an order of magnitude above flat.
UNIQUE_FLOOR = 40
VAR_FLOOR = 150.0

HOVEL_PROBE_JS = """(() => {
  const c = document.getElementById('plate');
  const ctx = c.getContext('2d');
  const probe = (x, y, w, h) => {
    const d = ctx.getImageData(x, y, w, h).data;
    const colours = new Set();
    let sum = 0, sum2 = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      colours.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
      const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      sum += l; sum2 += l * l; n++;
    }
    const mean = sum / n;
    return { unique: colours.size, var: Math.round((sum2 / n - mean * mean) * 10) / 10 };
  };
  return {
    slot: probe(900, 480, 260, 90),        // the cold slot (TASK 5 coordinates)
    plank: probe(460, 560, 400, 110),      // the tally plank; FLOOR = 690
    bundle: probe(880, 600, 50, 40),       // the journal parcel
    straw_slot: probe(900, 590, 260, 90),  // controls: bare straw, same sizes
    straw_plank: probe(60, 565, 400, 110),
    straw_bundle: probe(1200, 600, 50, 40),
  };
})()"""


def hovel_plate_checks(page, out: dict) -> None:
    """Night 7, after the lesson: words >= 62 (the campaign's own gates prove
    >= 80 by the walk, so >= 62 here is arithmetic), the creature is inside,
    and slot + plank + bundle are all on the straw in one frame."""
    s = qa_state(page)
    need(s["words"] >= 62,
         f"[campaign] night 7: words {s['words']} >= 62, the journal bundle is on the straw")
    rep = page.evaluate(HOVEL_PROBE_JS)
    out["hovel_probe"] = rep
    for region in ("slot", "plank", "bundle"):
        r, c = rep[region], rep[f"straw_{region}"]
        need(r["unique"] >= UNIQUE_FLOOR and r["var"] >= VAR_FLOOR,
             f"[campaign] hovel {region} is no flat swatch "
             f"({r['unique']} colours >= {UNIQUE_FLOOR}, luminance var {r['var']} >= {VAR_FLOOR}; "
             f"straw control {c['unique']} / {c['var']})")
    need(all(rep[f"straw_{r}"]["unique"] >= UNIQUE_FLOOR and rep[f"straw_{r}"]["var"] >= VAR_FLOOR
             for r in ("slot", "plank", "bundle")),
         "[campaign] the straw controls read as engraved plate (probe sanity)")
    out["hovel_shot"] = shot(page, "campaign_hovel_night")


def run_campaign(page) -> dict:
    """The full path the docstring promises: played, on the fixed seed, to a
    designed ending, then restarted to a valid initial state."""
    out = {"plan": "listen n1-2; carry n3; lesson+carry n4; lesson n5-7; "
                   "walk day 8 (5 slots); five exchanges; epilogue; restart"}
    try:
        section("[campaign] boot, title, cold open")
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(600)
        need(phase(page) == "title", "[campaign] boots into the title phase")
        page.keyboard.press("Enter")
        need(wait_cond(page, lambda s: s["phase"] == "coldOpen", 5),
             "[campaign] leaving the title works")
        page.keyboard.down(" ")
        t0 = time.time()
        while phase(page) == "coldOpen" and time.time() - t0 < 40:
            page.wait_for_timeout(500)
        page.keyboard.up(" ")
        s = qa_state(page)
        need(s["phase"] == "night" and s["night"] == 1,
             "[campaign] cold open completes into night 1")

        section("[campaign] nights 1-2: listening at the chink")
        press(page)  # start listening; blocks mint every 2 night-minutes
        s = wait_dawn(page)
        out["words_after_n1"] = s["words"]
        need(s["words"] >= 10, f"[campaign] night 1 banks words by listening ({s['words']})")
        press(page)  # let the day pass -> night 2
        need(wait_cond(page, lambda s: s["phase"] == "night" and s["night"] == 2, 5),
             "[campaign] night 2 begins")
        press(page)
        s = wait_dawn(page)
        out["words_after_n2"] = s["words"]

        section("[campaign] night 3: first carry after the retiring window")
        press(page)  # -> night 3
        need(wait_cond(page, lambda s: s["phase"] == "night" and s["night"] == 3, 5),
             "[campaign] night 3 begins")
        press(page)  # listen through minutes 0-5
        need(wait_cond(page, lambda s: s["minute"] >= 5.2, 10 * SPEED),
             "[campaign] night 3: the retiring window closes")
        press(page)  # come away from the chink
        press(page, "x")  # lift the plank
        need(wait_cond(page, lambda s: not s["inHovel"], 5),
             "[campaign] night 3: steps out once the yard is empty")
        carry_load(page, out, "n3_carry")
        out["hovel_f1_shot"] = shot(page, "campaign_hovel_firing1")  # the slot's pile: 1 course
        press(page)  # listen out the rest
        wait_dawn(page)

        section("[campaign] night 4: first lesson, second carry")
        start_lesson(page, 4)
        need(wait_cond(page, lambda s: s["lessonDone"], 10 * SPEED),
             "[campaign] night 4: the first lesson completes (+20 words)")
        press(page, "x")
        need(wait_cond(page, lambda s: not s["inHovel"], 5),
             "[campaign] night 4: steps out after the lesson")
        carry_load(page, out, "n4_carry")
        out["hovel_f2_shot"] = shot(page, "campaign_hovel_firing2")  # the slot's pile: 2 courses
        press(page)
        s = wait_dawn(page)

        section("[campaign] nights 5-7: the remaining lessons")
        for n in (5, 6, 7):
            start_lesson(page, n)
            need(wait_cond(page, lambda s: s["lessonDone"], 10 * SPEED),
                 f"[campaign] night {n}: the lesson completes")
            if n == 7:
                section("[campaign] hovel plate: nothing reads as a flat swatch (TASK 5)")
                hovel_plate_checks(page, out)
            press(page)  # listen out the rest
            s = wait_dawn(page)
        out["nights_completed"] = 7
        out["words_at_walk"] = s["words"]
        need(s["lessons"] == 4, f"[campaign] four lessons attended ({s['lessons']})")
        need(s["words"] >= 80,
             f"[campaign] words {s['words']} >= 80, the fifth exchange gate (GAME_DESIGN §7)")
        need(s["carries"] >= 1,
             f"[campaign] carries {s['carries']} >= 1, the exchange-5 lock (GAME_DESIGN §9)")
        need(s["night"] == 8,
             f"[campaign] seven full nights played before the walk (now at dawn 8, night counter {s['night']})")

        section("[campaign] day 8: the walk")
        press(page)  # let the day pass -> the walk
        s = wait_cond(page, lambda s: s["phase"] == "walk", 5)
        need(s and s["walk"] and s["walk"]["band"] == "long" and s["walk"]["slots"] == 5,
             f"[campaign] the long walk, five slots (walk={s and s['walk']})")
        need(wait_cond(page, lambda s: s["walkStage"] == "cross", 6),
             "[campaign] the three go out at the gate")
        out["walk_shot"] = shot(page, "campaign_walk")
        page.wait_for_timeout(17000)  # knocking inside 15 s costs a slot; past 30 s another
        for wx, wy in ROUTE_CROSS:
            s = drive_to(page, wx, wy, 16, phases=("walk",))
            if s is None or s["phase"] != "walk":
                raise CampaignAbort(f"the daylight crossing failed (last={s})")
        need(True, "[campaign] crosses the yard in daylight")
        press(page, "e", 120)
        s = wait_cond(page, lambda s: s["phase"] == "door", 5)
        need(s and s["door"] and s["door"]["slots"] == 5,
             f"[campaign] the knock keeps all five slots (slots={s and s['door'] and s['door']['slots']})")
        out["door_shot"] = shot(page, "campaign_door")

        section("[campaign] the door: five exchanges")
        t0 = time.time()
        while time.time() - t0 < 170:
            s = qa_state(page)
            if s["phase"] != "door":
                break
            if s["door"] and s["door"]["exchangeTicks"] <= 0 and s["canSpeak"]:
                press(page, "e", 60)
            page.wait_for_timeout(350)
        s = wait_cond(page, lambda s: s["phase"] == "aftermath", 10)
        need(s is not None, "[campaign] the door opens when the walk's clock runs out")
        need(s["exchanges"] == 5,
             f"[campaign] all five exchanges land (reached {s['exchanges']}, words {s['words']})")
        need(s["ending"] in DESIGNED_ENDINGS,
             f"[campaign] ending id is a designed one ({s['ending']}; §12: {DESIGNED_ENDINGS})")
        need(s["ending"] == "door", f"[campaign] the run ends at the door ({s['ending']})")
        out["ending"] = s["ending"]
        out["exchanges"] = s["exchanges"]

        section("[campaign] aftermath, epilogue, afterRun")
        model = page.evaluate("(() => { const g = window.__game; return g.engine.epilogueModel(g.state); })()")
        need(model["ending"] == "door" and model["exchange5"],
             f"[campaign] the epilogue model agrees (ending={model['ending']}, "
             f"exchange5={model['exchange5']}, storeAtFlight={model['storeAtFlight']}, beds={model['beds']})")
        out["epilogue_model"] = model
        page.keyboard.down("e")  # the withheld hand, then the moon hold
        done = None
        t0 = time.time()
        while time.time() - t0 < 60:
            ph = phase(page)
            if ph == "epilogue" and "epilogue_shot" not in out:
                page.wait_for_timeout(800)  # the lane card, the run's ending text
                out["epilogue_shot"] = shot(page, "campaign_epilogue")
            if ph == "afterRun":
                done = qa_state(page)
                break
            page.wait_for_timeout(400)
        page.keyboard.up("e")
        need(done is not None, "[campaign] the epilogue plays out to afterRun")
        need(done["ending"] == "door" and done["exchanges"] == 5,
             "[campaign] the ending is still recorded at afterRun")
        out["afterrun_shot"] = shot(page, "campaign_afterrun")

        section("[campaign] restart")
        page.keyboard.press("Enter")
        s = wait_cond(page, lambda s: s["phase"] == "title", 5)
        need(s and s["night"] == 1 and s["words"] == 0,
             f"[campaign] restart restores a valid initial state "
             f"(phase={s and s['phase']}, night {s and s['night']}, words {s and s['words']})")
        out["restart_shot"] = shot(page, "campaign_restart")
        out["completed"] = True
    except CampaignAbort as e:
        out["completed"] = False
        out["abort"] = str(e)
        check(False, f"[campaign] {e}")
        try:
            out["state_at_abort"] = qa_state(page)
            out["abort_shot"] = shot(page, "campaign_abort")
        except Exception:
            pass
    return out


# ---------------------------------------------------------------- mouse campaign
#
# QA_REPORT F6: the same campaign as run_campaign, but every input is a mouse
# click or hold — no keyboard anywhere. Click-to-move goes through the game's
# own click path (main.js yardClick / scene.queuedAction): a click on a
# hotspot walks the creature there and acts on arrival, so the outhouse, the
# door pile, the hovel mouth and the cottage door are clicked directly at the
# ends of the same safe lanes the keyboard campaign drives.

START_LESSON_MOUSE_JS = """
() => new Promise((res) => {
  const canvas = document.getElementById('plate');
  const r = canvas.getBoundingClientRect();
  // (640, 400) on the plate: the chink, off the exit slot.
  const cx = r.left + r.width * (640 / 1280);
  const cy = r.top + r.height * (400 / 800);
  const click = () => {
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: cx, clientY: cy, bubbles: true }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  };
  click();  // advance the dawn read
  let guard = 0;
  const pump = () => {
    const g = window.__game;
    const a = g.state.tonight && g.state.tonight.action;
    if (a && a.kind === 'lesson') { res('lesson'); return; }
    if (g.phase === 'night' && g.state.minute > 0.5) { res('missed'); return; }
    if (++guard > 600) { res('timeout'); return; }
    // One fresh click edge per frame — the same concession as the keyboard
    // pump: the engine accepts a lesson start only at minute <= 0.03, which
    // is 1-2 ticks at any speed.
    click();
    requestAnimationFrame(pump);
  };
  requestAnimationFrame(pump);
})
"""


def click_arrive(page, x: int, y: int, phase_want: str = "night",
                 radius: int = ARRIVE_R, timeout_s: float = 0) -> dict:
    """Click a plain (non-hotspot) spot and poll until the creature gets there."""
    page.mouse.click(x, y)
    s = wait_cond(page, lambda s: s["phase"] != phase_want
                  or math.hypot(x - s["x"], y - s["y"]) <= radius,
                  timeout_s or 15 * SPEED, 100)
    need(s is not None and s["phase"] == phase_want
         and math.hypot(x - s["x"], y - s["y"]) <= radius,
         f"[mouse-campaign] click-to-move reaches ({x},{y}) (last={s})")
    return s


def mouse_carry(page, out: dict, tag: str) -> None:
    """The carry, clicked: waypoints move, the hotspots act on arrival
    (outhouse -> take the load, door -> put it down, mouth -> slip inside)."""
    f0 = qa_state(page)["firing"]
    x0, y0 = qa_state(page)["x"], qa_state(page)["y"]
    s = click_arrive(page, 585, 258)
    if "move_shot" not in out:  # first carry: evidence that click-to-move moves
        out["move_shot"] = shot(page, "mouseclick_yard_move")
        # Bound the travel by the geometry, not by a hand-picked number. The leg
        # is d0 long and click_arrive stops polling inside ARRIVE_R, so a real
        # walk covers at least d0 - ARRIVE_R; standing still covers 0. A fixed
        # bar cannot work here: the creature moves WALK_SPEED (290 px) per
        # *night-minute*, so it covers 290 px/s at ?fast=1 but only 36 px/s at
        # normal speed, and the 100 ms poll overshoots the arrival ring by ~29 px
        # accelerated against ~3.6 px at normal speed. The old `> 40` bar sat
        # above the guaranteed floor of 31.5 px, so it failed outright under
        # QA_SLOW and was a coin-flip at fast.
        d0 = math.hypot(585 - x0, 258 - y0)
        moved = math.hypot(s["x"] - x0, s["y"] - y0)
        need(moved >= d0 - ARRIVE_R - 2,
             f"[mouse-campaign] click-to-move actually moves the creature "
             f"(({x0},{y0}) -> ({s['x']},{s['y']}); moved {moved:.1f} px of the "
             f"{d0:.1f} px leg, floor {d0 - ARRIVE_R - 2:.1f})")
    click_arrive(page, 455, 330)
    page.mouse.click(310, 485)  # the outhouse: walk there and take the load on arrival
    s = wait_cond(page, lambda s: s["carrying"] or s["phase"] != "night", 15 * SPEED, 100)
    need(s and s["phase"] == "night" and s["carrying"],
         f"[mouse-campaign] {tag}: the outhouse click walks over and takes the load (last={s})")
    click_arrive(page, 450, 462)
    click_arrive(page, 748, 462)
    click_arrive(page, 748, 425)
    page.mouse.click(700, 425)  # their door: put the load down on arrival
    s = wait_cond(page, lambda s: not s["carrying"] or s["phase"] != "night", 15 * SPEED, 100)
    need(s and s["phase"] == "night" and not s["carrying"] and s["firing"] == f0 + 1,
         f"[mouse-campaign] {tag}: the door click puts the load down "
         f"(firing {f0} -> {s and s['firing']})")
    out[f"{tag}_shot"] = shot(page, f"mousecampaign_{tag}")
    click_arrive(page, 748, 410)
    click_arrive(page, 748, 290)
    click_arrive(page, 684, 290)
    page.mouse.click(630, 265)  # the hovel mouth: slip back inside on arrival
    s = wait_cond(page, lambda s: s["inHovel"] or s["phase"] != "night", 15 * SPEED, 100)
    need(s and s["inHovel"],
         f"[mouse-campaign] {tag}: the mouth click slips back inside (last={s})")


def run_mouse_campaign(page) -> dict:
    """The F6 done-criterion pass: the full campaign to an ending, mouse only.
    Mirrors run_campaign beat for beat; every input above is page.mouse or an
    in-page MouseEvent through the real canvas listener (the lesson pump)."""
    out = {"plan": "as [campaign], but no keyboard input anywhere; hotspots "
                   "carry the context actions (walk-and-act on arrival)"}
    try:
        section("[mouse-campaign] boot, title, cold open")
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(600)
        need(phase(page) == "title", "[mouse-campaign] boots into the title phase")
        page.wait_for_timeout(6000)  # the verb hit boxes exist only at beat 6
        out["title_button_shot"] = shot(page, "mousecampaign_title_button")
        page.mouse.click(640, 688)   # the first verb: into the run
        need(wait_cond(page, lambda s: s["phase"] == "coldOpen", 5) is not None,
             "[mouse-campaign] clicking the first title verb enters the run")
        page.mouse.move(640, 400)
        page.mouse.down()
        t0 = time.time()
        while phase(page) == "coldOpen" and time.time() - t0 < 40:
            page.wait_for_timeout(500)
        page.mouse.up()
        s = qa_state(page)
        need(s["phase"] == "night" and s["night"] == 1,
             "[mouse-campaign] cold open completes into night 1 (held mouse)")

        section("[mouse-campaign] nights 1-2: listening, clicked at the chink")
        page.mouse.click(640, 400)
        need(wait_cond(page, lambda s: s["listening"], 5) is not None,
             "[mouse-campaign] night 1: a click at the chink starts listening")
        s = wait_dawn(page)
        out["words_after_n1"] = s["words"]
        need(s["words"] >= 10, f"[mouse-campaign] night 1 banks words by listening ({s['words']})")
        page.mouse.click(640, 400)   # let the day pass: dawn read advanced by click
        need(wait_cond(page, lambda s: s["phase"] == "night" and s["night"] == 2, 5),
             "[mouse-campaign] night 2 begins (dawn read advanced by click)")
        page.mouse.click(640, 400)
        s = wait_dawn(page)
        out["words_after_n2"] = s["words"]

        section("[mouse-campaign] night 3: first carry, clicked")
        page.mouse.click(640, 400)   # -> night 3
        need(wait_cond(page, lambda s: s["phase"] == "night" and s["night"] == 3, 5),
             "[mouse-campaign] night 3 begins")
        page.mouse.click(640, 400)   # listen through the retiring window
        need(wait_cond(page, lambda s: s["minute"] >= 5.2, 10 * SPEED),
             "[mouse-campaign] night 3: the retiring window closes")
        page.mouse.click(1000, 600)  # the cold slot, lower right: lift the plank
        need(wait_cond(page, lambda s: not s["inHovel"], 5) is not None,
             "[mouse-campaign] night 3: clicking the cold slot steps out")
        mouse_carry(page, out, "n3_carry")
        page.mouse.click(640, 400)   # listen out the rest
        wait_dawn(page)

        section("[mouse-campaign] night 4: first lesson by click, second carry")
        r = page.evaluate(START_LESSON_MOUSE_JS)
        need(r == "lesson",
             f"[mouse-campaign] night 4: the lesson starts at minute 0 by click ({r})")
        need(wait_cond(page, lambda s: s["lessonDone"], 10 * SPEED),
             "[mouse-campaign] night 4: the first lesson completes (+20 words)")
        page.mouse.click(1000, 600)
        need(wait_cond(page, lambda s: not s["inHovel"], 5) is not None,
             "[mouse-campaign] night 4: steps out after the lesson")
        mouse_carry(page, out, "n4_carry")
        page.mouse.click(640, 400)
        wait_dawn(page)

        section("[mouse-campaign] nights 5-7: the remaining lessons by click")
        for n in (5, 6, 7):
            r = page.evaluate(START_LESSON_MOUSE_JS)
            need(r == "lesson",
                 f"[mouse-campaign] night {n}: the lesson starts at minute 0 by click ({r})")
            need(wait_cond(page, lambda s: s["lessonDone"], 10 * SPEED),
                 f"[mouse-campaign] night {n}: the lesson completes")
            page.mouse.click(640, 400)   # listen out the rest
            s = wait_dawn(page)
        out["nights_completed"] = 7
        out["words_at_walk"] = s["words"]
        need(s["lessons"] == 4, f"[mouse-campaign] four lessons attended ({s['lessons']})")
        need(s["words"] >= 80,
             f"[mouse-campaign] words {s['words']} >= 80, the fifth exchange gate (GAME_DESIGN §7)")
        need(s["carries"] >= 1,
             f"[mouse-campaign] carries {s['carries']} >= 1, the exchange-5 lock (GAME_DESIGN §9)")
        need(s["night"] == 8,
             f"[mouse-campaign] seven full nights played before the walk (night counter {s['night']})")

        section("[mouse-campaign] day 8: the walk, clicked")
        page.mouse.click(640, 400)   # let the day pass -> the walk
        s = wait_cond(page, lambda s: s["phase"] == "walk", 5)
        need(s and s["walk"] and s["walk"]["band"] == "long" and s["walk"]["slots"] == 5,
             f"[mouse-campaign] the long walk, five slots (walk={s and s['walk']})")
        need(wait_cond(page, lambda s: s["walkStage"] == "cross", 6),
             "[mouse-campaign] the three go out at the gate")
        out["walk_shot"] = shot(page, "mousecampaign_walk")
        page.wait_for_timeout(17000)  # knocking inside 15 s costs a slot; past 30 s another
        click_arrive(page, 684, 222, "walk", 16)
        click_arrive(page, 748, 222, "walk", 16)
        click_arrive(page, 748, 425, "walk", 16)
        page.mouse.click(700, 425)   # the door: walk up and knock on arrival
        s = wait_cond(page, lambda s: s["phase"] == "door", 15 * SPEED, 100)
        need(s and s["door"] and s["door"]["slots"] == 5,
             f"[mouse-campaign] clicking the door walks up and knocks, keeping all five slots "
             f"(slots={s and s['door'] and s['door']['slots']})")
        out["door_shot"] = shot(page, "mousecampaign_door")

        section("[mouse-campaign] the door: five exchanges, clicked")
        t0 = time.time()
        while time.time() - t0 < 170:
            s = qa_state(page)
            if s["phase"] != "door":
                break
            if s["door"] and s["door"]["exchangeTicks"] <= 0 and s["canSpeak"]:
                page.mouse.click(640, 400)
                page.wait_for_timeout(60)
            page.wait_for_timeout(350)
        s = wait_cond(page, lambda s: s["phase"] == "aftermath", 10)
        need(s is not None, "[mouse-campaign] the door opens when the walk's clock runs out")
        need(s["exchanges"] == 5,
             f"[mouse-campaign] all five exchanges land by click "
             f"(reached {s['exchanges']}, words {s['words']})")
        need(s["ending"] in DESIGNED_ENDINGS,
             f"[mouse-campaign] ending id is a designed one ({s['ending']}; §12: {DESIGNED_ENDINGS})")
        need(s["ending"] == "door", f"[mouse-campaign] the run ends at the door ({s['ending']})")
        out["ending"] = s["ending"]
        out["exchanges"] = s["exchanges"]

        section("[mouse-campaign] aftermath, epilogue, afterRun")
        page.mouse.move(640, 400)
        page.mouse.down()            # the withheld hand
        page.wait_for_timeout(1500)
        page.mouse.up()
        need(wait_cond(page, lambda s: s["phase"] == "epilogue", 15) is not None,
             "[mouse-campaign] the withheld hand holds (mouse.down) into the epilogue")
        step0 = page.evaluate("window.__game.epilogueStep")
        page.mouse.click(640, 400)   # a card advance well ahead of its minTicks timer
        page.wait_for_timeout(700)
        step1 = page.evaluate("window.__game.epilogueStep")
        need(step1 == step0 + 1,
             f"[mouse-campaign] a click advances an epilogue card (step {step0} -> {step1})")
        out["epilogue_shot"] = shot(page, "mousecampaign_epilogue")
        page.mouse.click(640, 400)   # the next card too; the moon hold ignores clicks
        page.wait_for_timeout(700)
        page.mouse.down()            # the moon hold; fire and closing run on their timers
        done = None
        t0 = time.time()
        while time.time() - t0 < 60:
            if phase(page) == "afterRun":
                done = qa_state(page)
                break
            page.wait_for_timeout(400)
        page.mouse.up()
        need(done is not None, "[mouse-campaign] the epilogue plays out to afterRun")
        need(done["ending"] == "door" and done["exchanges"] == 5,
             "[mouse-campaign] the ending is still recorded at afterRun")
        out["afterrun_shot"] = shot(page, "mousecampaign_afterrun")

        section("[mouse-campaign] restart, clicked")
        page.mouse.click(640, 493)   # the restart button on the after-run card
        s = wait_cond(page, lambda s: s["phase"] == "title", 5)
        need(s and s["night"] == 1 and s["words"] == 0,
             f"[mouse-campaign] clicking restart restores a valid initial state "
             f"(phase={s and s['phase']}, night {s and s['night']}, words {s and s['words']})")
        out["restart_shot"] = shot(page, "mousecampaign_restart")
        out["completed"] = True
    except CampaignAbort as e:
        out["completed"] = False
        out["abort"] = str(e)
        check(False, f"[mouse-campaign] {e}")
        try:
            out["state_at_abort"] = qa_state(page)
            out["abort_shot"] = shot(page, "mousecampaign_abort")
        except Exception:
            pass
    return out


# ---------------------------------------------------------------- seen ending
#
# QA_REPORT F7: the seen ending, reached by real play on the fixed seed — no
# state injection. Night 1, lift the plank and stand still in the yard: Agatha's
# retiring patrol finds the creature at minute ~= 1.38 (a designed risk). The
# pass exists to prove renderSeen runs console-clean end to end — the frozen
# wedges, the shadow under the seer, and the failure card after the 2 s hold.
# F7's symptom was exactly a console flood from this phase, so the segment gets
# its own zero-new-errors assertion on top of the run-wide console gate.

def run_seen(page) -> dict:
    out = {"plan": "night 1: step out of the mouth, stand still; Agatha's "
                   "retiring patrol sees the creature at minute ~= 1.38"}
    try:
        section("[seen] boot, title, cold open")
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(600)
        need(phase(page) == "title", "[seen] boots into the title phase")
        page.keyboard.press("Enter")
        need(wait_cond(page, lambda s: s["phase"] == "coldOpen", 5) is not None,
             "[seen] leaving the title works")
        page.keyboard.down(" ")
        t0 = time.time()
        while phase(page) == "coldOpen" and time.time() - t0 < 40:
            page.wait_for_timeout(500)
        page.keyboard.up(" ")
        s = qa_state(page)
        need(s["phase"] == "night" and s["night"] == 1,
             "[seen] cold open completes into night 1")

        section("[seen] night 1: out of the mouth, standing still")
        err0 = len(errors)
        press(page, "x")  # lift the plank; then no input at all
        s = wait_cond(page, lambda s: s["phase"] == "seen", 30 * SPEED)
        need(s is not None, "[seen] Agatha's retiring patrol finds the creature")
        need(s["ending"] == "seen" and s["seenBy"] == "agatha" and s["seenCtx"] == "night",
             f"[seen] the night sighting is recorded (ending={s['ending']}, "
             f"seenBy={s['seenBy']}, context={s['seenCtx']}, minute {s['minute']})")
        need(s["minute"] < 5,
             f"[seen] seen inside the retiring window (minute {s['minute']} < 5)")
        cones = page.evaluate("window.__game.cones.map(c => c.owner)")
        need(s["seenBy"] in cones,
             f"[seen] the seer's cone is still live in the freeze (cones={cones})")
        out["freeze_shot"] = shot(page, "seen_freeze")

        section("[seen] the failure card after the 2 s hold")
        try:
            page.wait_for_function("window.__game.epilogueStep >= 1", timeout=10000)
            held = True
        except Exception:
            held = False
        need(held, "[seen] the 2 s hold elapses into the failure card")
        page.wait_for_timeout(300)  # let the card draw for a few frames
        out["card_shot"] = shot(page, "seen_card")
        need(len(errors) == err0,
             f"[seen] console clean through the seen phase ({len(errors) - err0} new errors)")
        press(page)
        s = wait_cond(page, lambda s: s["phase"] == "epilogue", 5)
        need(s is not None and s["ending"] == "seen",
             "[seen] any key moves on to the epilogue, the ending still recorded")
        out["completed"] = True
    except CampaignAbort as e:
        out["completed"] = False
        out["abort"] = str(e)
        check(False, f"[seen] {e}")
        try:
            out["state_at_abort"] = qa_state(page)
            out["abort_shot"] = shot(page, "seen_abort")
        except Exception:
            pass
    return out


# ---------------------------------------------------------------- card layout
#
# QA_REPORT F8: card text must stay on the paper. drawCard now lays out
# through layoutCard (render.js) — a pure measure, no drawing — which the
# harness drives through window.__game. Every string in STRINGS is tried as
# a card body line and as the display line, plus every composite card
# main.js can build (the options panel at each focus row, the about and SEEN
# cards, all epilogue sets, the closing triplets, the end card), with and
# without a foot button, at every reachable textScale. Each wrapped line
# must measure inside the paper's inner width and the block must clear the
# paper's foot and the button zone — so a future long string fails here
# instead of silently spilling ink onto the nightDeep ground.

def run_card_layout(page) -> dict:
    out = {}
    section("card layout: no glyph off the paper (F8)")
    rep = page.evaluate("""(() => {
      const g = window.__game;
      const S = g.STRINGS;
      const all = [];
      (function walk(o) {
        if (!o) return;
        if (typeof o === 'string') { all.push(o); return; }
        if (typeof o !== 'object') return;
        for (const v of Object.values(o)) walk(v);
      })(S);
      const cards = [];
      for (const s of all) { cards.push(['SEEN', s]); cards.push([s]); }
      const O = S.options;
      const rows = [                       // the longest variant of every row
        `${O.textSize}: ${O.textSizeValues[2]}`, `${O.ink}: ${O.inkValues[1]}`,
        `${O.sound}: ${O.onOff[0]}`, `${O.murmur}: ${O.onOff[0]}`,
        `${O.motion}: ${O.onOff[0]}`, O.back];
      for (let f = 0; f < rows.length; f++)
        cards.push([O.title, ...rows.map((r, i) => (i === f ? `— ${r} —` : r))]);
      cards.push([...S.about]);
      for (const fl of [S.failure.seenAgatha, S.failure.seenFelix,
                        S.failure.seenFirstLight, S.failure.seenGarden])
        cards.push([S.failure.header, fl]);
      cards.push([S.epilogue.gone.line1, S.epilogue.gone.line2]);
      cards.push([S.epilogue.darkDay]);
      cards.push([...S.epilogue.lane]);                       // the F8 frame
      cards.push([...S.epilogue.lane, S.epilogue.laneSatUp, S.epilogue.laneAnswer]);
      cards.push([...S.epilogue.lane, S.epilogue.laneSatUp, S.epilogue.laneAnswerProduce]);
      cards.push([...S.epilogue.lane, S.epilogue.laneAnswer]);
      const C = S.epilogue.closing;
      for (const t of [[C.labourTrue, C.theft, C.journal], [C.labourTrue, C.fewWords, C.noJournal],
                       [C.labourFalse, C.theft, C.noJournal], [C.labourFalse, C.fewWords, C.journal],
                       [C.labourTrue, C.journal], [C.fed, C.journal], [C.theft, C.noJournal]])
        cards.push(t);
      cards.push([S.cards.endOfRun]);
      const wide = [], tall = [];
      const shrunk = {};
      let checked = 0;
      for (const scale of [1, 1.25, 1.5]) {
        for (const lines of cards) {
          for (const btns of [[], [{ id: 'b', label: S.cards.restart, focus: true }]]) {
            const L = g.layoutCard(lines, { textScale: scale }, btns);
            checked++;
            for (const ln of L.lines) {
              if (ln.width > L.innerW + 0.5)
                wide.push({ scale, str: ln.str.slice(0, 60),
                            width: Math.round(ln.width * 10) / 10, innerW: L.innerW });
            }
            if (L.textBottom > L.textLimit + 0.5 || L.textTop < L.paperTop - 0.5)
              tall.push({ scale, first: String(lines[0]).slice(0, 40), logical: lines.length,
                          buttons: btns.length, bottom: Math.round(L.textBottom),
                          limit: Math.round(L.textLimit) });
            if (L.shrink < 1) {
              const k = `${scale}|${lines.length}|${btns.length}|${String(lines[0]).slice(0, 30)}`;
              if (!(k in shrunk) || L.shrink < shrunk[k].shrink)
                shrunk[k] = { scale, shrink: L.shrink, px: L.px, logical: lines.length,
                              buttons: btns.length, first: String(lines[0]).slice(0, 44) };
            }
          }
        }
      }
      return { checked, nStrings: all.length, wide, tall, shrunk: Object.values(shrunk) };
    })()""")
    check(not rep["wide"],
          f"every card line wraps inside the paper's inner width "
          f"({rep['checked']} layouts over {rep['nStrings']} strings; overflow: {rep['wide'][:3]})")
    check(not rep["tall"],
          f"every card block clears the paper's foot and the button zone "
          f"({rep['checked']} layouts; misfit: {rep['tall'][:3]})")
    out["layout"] = rep
    for s in sorted(rep["shrunk"], key=lambda s: (s["scale"], s["first"])):
        print(f"  note  textScale {s['scale']}: a {s['logical']}-line card "
              f"({'buttons' if s['buttons'] else 'no buttons'}) fits at shrink {s['shrink']} "
              f"(body {s['px']} px) — {s['first']!r}")

    # Frames for the record: the about card, and the options panel at
    # textScale 1.25 — both go through drawCard's new wrapping path.
    page.goto(URL, wait_until="networkidle")
    page.wait_for_timeout(6000)
    page.mouse.click(640, 756)   # third verb: about
    page.wait_for_timeout(500)
    check(phase(page) == "about", "the about card opens for the layout frame")
    out["about_shot"] = shot(page, "card_about")
    page.mouse.click(640, 400)   # anywhere: back to the title
    page.wait_for_timeout(400)
    page.wait_for_function("window.__game.state.phaseTick >= 280", timeout=10000)
    page.mouse.click(640, 722)   # second verb: options
    page.wait_for_timeout(400)
    page.mouse.click(640, 400)   # toggle text size 1 -> 1.25
    page.wait_for_timeout(400)
    scale = page.evaluate("(JSON.parse(localStorage.getItem('hovel.options') || '{}').textScale) || 1")
    check(scale == 1.25, f"the options frame is at textScale 1.25 (got {scale})")
    out["options_shot"] = shot(page, "card_options_scale125")
    page.evaluate("localStorage.removeItem('hovel.options')")
    out["completed"] = True
    return out


def main() -> int:
    shutil.rmtree(SHOTS, ignore_errors=True)
    SHOTS.mkdir(parents=True, exist_ok=True)
    server = ensure_server()
    result = {}
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            ctx = browser.new_context(viewport={"width": 1280, "height": 800})
            page = ctx.new_page()
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: errors.append(f"PAGEERROR: {e}"))
            page.on("requestfailed", lambda r: net_errors.append(f"{r.url}: {r.failure}"))
            page.on("request", lambda r: request_hosts.add(urlparse(r.url).netloc))
            page.add_init_script(LONGTASK_INIT)

            result["keyboard"] = run_once(page, "keyboard")
            result["mouse"] = run_once(page, "mouse")
            result["campaign"] = run_campaign(page)
            result["mouse_campaign"] = run_mouse_campaign(page)
            result["seen"] = run_seen(page)
            result["card_layout"] = run_card_layout(page)

            section("determinism")
            def replay():
                page.goto(URL, wait_until="networkidle")
                page.wait_for_timeout(300)
                page.keyboard.press("Enter")
                for _ in range(40):
                    page.keyboard.press("ArrowRight"); page.wait_for_timeout(40)
                s = st(page)
                return {k: s.get(k) for k in ("night", "words", "firing", "store", "ownFood", "unease")}
            a, b = replay(), replay()
            check(a == b, f"same seed + same input sequence -> same state ({a})")

            section("viewport and readability")
            for w, h in ((1280, 800), (1280, 720)):
                page.set_viewport_size({"width": w, "height": h})
                page.wait_for_timeout(400)
                overflow = page.evaluate(
                    "document.documentElement.scrollWidth > window.innerWidth ||"
                    " document.documentElement.scrollHeight > window.innerHeight")
                check(not overflow, f"{w}x{h} no scroll overflow")
                cv = page.locator("canvas").bounding_box()
                check(cv and cv["width"] > 0 and cv["height"] > 0, f"{w}x{h} canvas has non-zero size")
                shot(page, f"viewport_{w}x{h}")
            page.set_viewport_size({"width": 1280, "height": 800})

            section("reduced motion")
            rm = browser.new_context(viewport={"width": 1280, "height": 800}, reduced_motion="reduce")
            rmp = rm.new_page()
            rmp.goto(URL, wait_until="networkidle")
            rmp.wait_for_timeout(1500)
            check(rmp.locator("canvas").count() == 1, "still renders under prefers-reduced-motion")
            rmp.screenshot(path=str(SHOTS / "reduced_motion.jpg"), type="jpeg", quality=80)
            rm.close()

            longtasks = page.evaluate("window.__longtasks || []") or []
            ctx.close(); browser.close()
    finally:
        if server:
            server.terminate()

    section("self-contained and performance")
    local = {urlparse(BASE).netloc, ""}
    external = sorted(h for h in request_hosts if h not in local)
    check(not external, f"no external request domains (saw {sorted(request_hosts)})")
    check(not net_errors, f"no failed resource requests ({len(net_errors)})")
    check(not errors, f"console clean ({len(errors)} errors)")
    worst_p95 = max((d["p95"] for d in perf.values()), default=0.0)
    worst_max = max((d["max"] for d in perf.values()), default=0.0)
    check(worst_p95 <= FRAME_FLOOR_MS, f"frame p95 {worst_p95} ms <= {FRAME_FLOOR_MS} ms (30 FPS floor)")
    check(worst_max < STALL_MS, f"no >{STALL_MS:.0f} ms stall (worst frame {worst_max} ms)")
    boot = [t for t in longtasks if t["at"] <= 1500]
    ingame = [t for t in longtasks if t["at"] > 1500]
    if boot:
        print(f"  boot long tasks: {[t['ms'] for t in boot]} (first-paint decode; see load gate)")
    check(max((t["ms"] for t in ingame), default=0) < STALL_MS,
          f"no in-game main-thread block > {STALL_MS:.0f} ms ({len(ingame)} over 50 ms)")

    size = sum(p.stat().st_size for p in APP.rglob("*") if p.is_file())
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    (EVIDENCE / "automated.json").write_text(json.dumps({
        "url": URL, "normal_speed_run": SLOW, "viewport": "1280x800",
        "passed": passed, "failed": failed,
        "console_errors": errors, "network_errors": net_errors,
        "request_hosts": sorted(request_hosts), "external_hosts": external,
        "frame_ms": perf, "frame_floor_ms": FRAME_FLOOR_MS, "stall_gate_ms": STALL_MS,
        "longtasks_over_50ms": sorted(longtasks, key=lambda t: -t["ms"]),
        "build_bytes": size, "shots": shot_n,
        "shots_dir": str(SHOTS.relative_to(EXAMPLE_ROOT)),
        "run": result,
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nbuild: {size/1048576:.2f} MB | external domains: {external or 'none'}")
    print(f"result: {passed} passed, {failed} failed | {shot_n} frames -> {SHOTS}")
    if not SLOW:
        print("note: accelerated run; timing evidence is invalid. Re-run once with QA_SLOW=1.")
    return 1 if (failed or errors) else 0


if __name__ == "__main__":
    raise SystemExit(main())
