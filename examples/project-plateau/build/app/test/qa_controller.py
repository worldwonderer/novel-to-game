#!/usr/bin/env python3
"""Verify the browser controller contract through the real DOM event boundary."""

from __future__ import annotations

import json
import math
import os
from pathlib import Path
import socket
import subprocess
import time
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright


APP = Path(__file__).resolve().parent.parent
BUILD = APP.parent
EVIDENCE = BUILD / "evidence" / "controller"
BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:4173")
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")

POINTER_LOCK_SHIM = """
(() => {
  let lockedElement = null;
  Object.defineProperty(Document.prototype, 'pointerLockElement', {
    configurable: true,
    get() { return lockedElement; },
  });
  HTMLCanvasElement.prototype.requestPointerLock = function requestPointerLock() {
    lockedElement = this;
    document.dispatchEvent(new Event('pointerlockchange'));
    return Promise.resolve();
  };
  Document.prototype.exitPointerLock = function exitPointerLock() {
    lockedElement = null;
    document.dispatchEvent(new Event('pointerlockchange'));
  };
})();
"""

POINTER_LOCK_REJECTION = """
(() => {
  Object.defineProperty(Document.prototype, 'pointerLockElement', {
    configurable: true,
    get() { return null; },
  });
  HTMLCanvasElement.prototype.requestPointerLock = function requestPointerLock() {
    const error = new DOMException('Pointer lock denied by the browser', 'NotAllowedError');
    queueMicrotask(() => document.dispatchEvent(new Event('pointerlockerror')));
    return Promise.reject(error);
  };
})();
"""


def start_server() -> subprocess.Popen[str] | None:
    parsed = urlparse(BASE_URL)
    with socket.socket() as probe:
        try:
            probe.connect((parsed.hostname or "127.0.0.1", parsed.port or 4173))
            return None
        except OSError:
            pass
    process = subprocess.Popen(
        ["npm", "run", "start", "--", "--host", "127.0.0.1", "--port", "4173"],
        cwd=APP,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        text=True,
    )
    for _ in range(80):
        with socket.socket() as probe:
            try:
                probe.connect(("127.0.0.1", 4173))
                return process
            except OSError:
                if process.poll() is not None:
                    raise RuntimeError("Vite exited before the controller check")
                time.sleep(0.1)
    process.terminate()
    raise RuntimeError("Vite did not become ready for the controller check")


def enter_field(page) -> None:
    page.get_by_role("button", name="Enter the basin").click()
    page.get_by_role("button", name="Begin field work").click()
    page.wait_for_timeout(180)


def run() -> dict[str, object]:
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    server = start_server()
    try:
        with sync_playwright() as playwright:
            launch: dict[str, object] = {"headless": True}
            if CHROME.exists():
                launch["executable_path"] = str(CHROME)
            browser = playwright.chromium.launch(**launch)

            context = browser.new_context(viewport={"width": 1440, "height": 900})
            context.add_init_script(POINTER_LOCK_SHIM)
            page = context.new_page()
            page.goto(f"{BASE_URL}/?qa=controller", wait_until="networkidle")
            page.wait_for_function("window.__projectPlateau?.ready === true")

            page.keyboard.down("KeyW")
            enter_field(page)
            origin = page.evaluate("window.__projectPlateau.snapshot()")
            page.wait_for_timeout(420)
            held = page.evaluate("window.__projectPlateau.snapshot()")
            page.keyboard.up("KeyW")
            assert held["player"]["position"] == origin["player"]["position"], held
            assert held["pointerLock"]["active"] is True, held

            page.evaluate(
                "document.dispatchEvent(new MouseEvent('mousemove', "
                "{movementX: 120, movementY: -20}))"
            )
            page.wait_for_timeout(80)
            turned = page.evaluate("window.__projectPlateau.snapshot()")
            assert turned["player"]["heading"] < -0.23, turned
            assert turned["player"]["pitch"] > 0.03, turned
            camera_forward = turned["pointerLock"]["cameraForward"]
            heading = turned["player"]["heading"]
            assert abs(camera_forward["x"] + math.sin(heading)) < 0.002, turned
            assert abs(camera_forward["z"] + math.cos(heading)) < 0.002, turned

            before_move = turned["player"]["position"]
            page.keyboard.down("KeyW")
            page.wait_for_timeout(320)
            page.keyboard.up("KeyW")
            moved = page.evaluate("window.__projectPlateau.snapshot()")
            delta = {
                "x": moved["player"]["position"]["x"] - before_move["x"],
                "z": moved["player"]["position"]["z"] - before_move["z"],
            }
            forward_projection = delta["x"] * camera_forward["x"] + delta["z"] * camera_forward["z"]
            lateral_drift = abs(delta["x"] * camera_forward["z"] - delta["z"] * camera_forward["x"])
            assert forward_projection > 0.7, moved
            assert lateral_drift < 0.02, moved

            page.keyboard.press("Space")
            page.wait_for_timeout(110)
            airborne = page.evaluate("window.__projectPlateau.snapshot()")
            assert airborne["player"]["grounded"] is False, airborne
            assert airborne["player"]["verticalOffset"] > 0.35, airborne
            assert airborne["player"]["verticalVelocity"] > 0, airborne
            page.wait_for_function(
                "window.__projectPlateau.snapshot().player.grounded === true",
                timeout=2000,
            )
            landed = page.evaluate("window.__projectPlateau.snapshot()")
            assert landed["player"]["verticalOffset"] == 0, landed
            assert landed["player"]["verticalVelocity"] == 0, landed

            page.keyboard.down("KeyF")
            assert page.evaluate("window.__projectPlateau.snapshot().player.rifleRaised") is True
            page.evaluate("window.dispatchEvent(new Event('blur'))")
            assert page.evaluate("window.__projectPlateau.snapshot().player.rifleRaised") is False
            page.get_by_role("button", name="Resume field work").click()
            page.wait_for_timeout(100)

            page.mouse.down(button="right")
            assert page.evaluate("window.__projectPlateau.snapshot().player.cameraRaised") is True
            page.evaluate("window.dispatchEvent(new Event('blur'))")
            assert page.evaluate("window.__projectPlateau.snapshot().player.cameraRaised") is False
            page.mouse.up(button="right")
            page.get_by_role("button", name="Resume field work").click()
            page.wait_for_timeout(100)

            page.mouse.down(button="right")
            assert page.evaluate("window.__projectPlateau.snapshot().player.cameraRaised") is True
            shutter_handler_ms = page.evaluate(
                "() => {"
                "  const started = performance.now();"
                "  document.dispatchEvent(new MouseEvent('mousedown', {button: 0}));"
                "  return performance.now() - started;"
                "}"
            )
            assert page.evaluate("Boolean(window.__projectPlateau.snapshot().player.pendingExposure)") is True
            assert shutter_handler_ms < 50, shutter_handler_ms
            page.wait_for_function("window.__projectPlateau.snapshot().ui.capturedPlateImages[0] === true")
            page.mouse.up(button="right")

            page.evaluate("document.exitPointerLock()")
            lost = page.evaluate("window.__projectPlateau.snapshot()")
            assert lost["player"]["paused"] is True, lost
            assert lost["player"]["pauseReason"] == "pointer-lock", lost

            assert "Look [Mouse]" in page.locator("#control-hint").text_content()
            assert "Jump [Space]" in page.locator("#control-hint").text_content()
            screenshot = EVIDENCE / "controller-contract.jpg"
            page.screenshot(path=screenshot, type="jpeg", quality=86)
            context.close()

            rejected_context = browser.new_context(viewport={"width": 1280, "height": 720})
            rejected_context.add_init_script(POINTER_LOCK_REJECTION)
            rejected = rejected_context.new_page()
            rejected.goto(f"{BASE_URL}/?qa=pointer-lock-rejection", wait_until="networkidle")
            rejected.wait_for_function("window.__projectPlateau?.ready === true")
            enter_field(rejected)
            rejected.wait_for_timeout(120)
            denied = rejected.evaluate("window.__projectPlateau.snapshot()")
            assert denied["player"]["paused"] is True, denied
            assert denied["player"]["pauseReason"] == "pointer-lock-unavailable", denied
            assert denied["pointerLock"]["status"] == "unavailable", denied
            assert rejected.get_by_text("POINTER LOCK UNAVAILABLE").is_visible()
            rejected_context.close()
            browser.close()

        report = {
            "status": "PASS",
            "pointerLockMode": "deterministic-browser-shim",
            "nativePointerLock": "NOT_RUN: headed Chrome did not grant pointer lock in the automated desktop session",
            "checks": [
                "pre-run held-key isolation",
                "pointer-lock acquisition boundary",
                "mouse delta to camera orientation",
                "camera-relative W projection",
                "spacebar ballistic jump and grounded landing",
                "focus-loss transient tool reset",
                "non-blocking shutter capture",
                "pointer-lock loss pause",
                "pointer-lock denial failure UI",
            ],
            "evidence": ["build/evidence/controller/controller-contract.jpg"],
        }
        (EVIDENCE / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        return report
    finally:
        if server is not None:
            server.terminate()
            server.wait(timeout=5)


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
