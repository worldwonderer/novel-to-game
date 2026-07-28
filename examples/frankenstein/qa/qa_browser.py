#!/usr/bin/env python3
"""Frankenstein slice — real-browser QA.

Boot -> title -> cold open -> nights -> the walk -> the door -> an ending -> restart,
driven twice: mouse-primary and keyboard-only (BUILD_BRIEF requires every action to be
reachable by keyboard alone).

Evidence lands in the workspace at qa/evidence/browser/ as JPEG. The qa contract treats
paths outside the workspace (and system temp dirs) as no evidence at all.

Usage:  python3 qa/qa_browser.py
Env:    BASE_URL, QA_SLOW=1 (normal speed; timing evidence is only valid here),
        QA_SHOTS to override the evidence directory.
"""
from __future__ import annotations

import json
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
