#!/usr/bin/env python3
"""Frankenstein slice — real-browser QA.

Boot -> title -> cold open -> nights -> restart, driven twice (mouse-primary and
keyboard-only; BUILD_BRIEF requires every action to be reachable by keyboard alone),
then a third, full campaign: seed 42, played through nights 1-7 to the walk, the
door, an ending, the epilogue, afterRun and restart (GAME_DESIGN §10, §12).

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

    section(f"[{mode}] enter the run")
    if mode == "keyboard":
        page.keyboard.press("Enter")
    else:
        page.mouse.click(640, 700)          # first title verb sits low-centre
        page.wait_for_timeout(200)
        if phase(page) == "title":
            page.keyboard.press("Enter")     # fall back so the pass still completes
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
        ending: s.ending, seenBy: s.seenBy, exchanges: s.exchangesReached,
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
    (Mouse clicks never reach the sim — main.js consumeEdges drops mouse.clicked —
    so the campaign drives with keys, which BUILD_BRIEF requires to suffice.)"""
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
        press(page)
        s = wait_dawn(page)

        section("[campaign] nights 5-7: the remaining lessons")
        for n in (5, 6, 7):
            start_lesson(page, n)
            need(wait_cond(page, lambda s: s["lessonDone"], 10 * SPEED),
                 f"[campaign] night {n}: the lesson completes")
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
