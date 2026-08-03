#!/usr/bin/env python3
"""Capture the fixed glade visual target at both supported viewports."""

from __future__ import annotations

import hashlib
import base64
import json
from pathlib import Path
import socket
import subprocess
import time

from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parent.parent
PROJECT = APP.parents[1]
OUTPUT = PROJECT / "build" / "evidence" / "visual-upgrade" / "generated"
TARGETS = PROJECT / "design" / "visual-targets"
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
VIEWPORTS = ((1440, 900), (1280, 720))
FROZEN_TIME = 4.25


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_fingerprint() -> str:
    """Bind captures to the same publishable app inputs as verify.py."""
    digest = hashlib.sha256()
    paths = [APP / "index.html", APP / "package.json", APP / "package-lock.json"]
    paths += sorted((APP / "public").rglob("*")) + sorted((APP / "src").rglob("*"))
    for path in paths:
        if path.is_file():
            digest.update(path.relative_to(APP).as_posix().encode())
            digest.update(b"\0")
            digest.update(path.read_bytes())
            digest.update(b"\0")
    return digest.hexdigest()


def start_server() -> tuple[subprocess.Popen[str], str]:
    """Start an owned Vite process without touching the interactive port 4173."""
    with socket.socket() as reservation:
        reservation.bind(("127.0.0.1", 0))
        port = reservation.getsockname()[1]
    process = subprocess.Popen(
        [
            "npm",
            "run",
            "start",
            "--",
            "--host",
            "127.0.0.1",
            "--port",
            str(port),
            "--strictPort",
        ],
        cwd=APP,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        text=True,
    )
    for _ in range(80):
        with socket.socket() as probe:
            try:
                probe.connect(("127.0.0.1", port))
                return process, f"http://127.0.0.1:{port}"
            except OSError:
                if process.poll() is not None:
                    raise RuntimeError("Vite exited before visual capture")
                time.sleep(0.1)
    process.terminate()
    raise RuntimeError("Vite did not become ready for visual capture")


def run(base_url: str) -> dict[str, object]:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for stale in OUTPUT.glob("*.png"):
        stale.unlink()
    errors: list[str] = []
    captures: list[dict[str, object]] = []
    with sync_playwright() as playwright:
        options: dict[str, object] = {"headless": True}
        if CHROME.exists():
            options["executable_path"] = str(CHROME)
        browser = playwright.chromium.launch(**options)
        for width, height in VIEWPORTS:
            page = browser.new_page(viewport={"width": width, "height": height})
            page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
            page.on("pageerror", lambda error: errors.append(f"PAGEERROR: {error}"))
            page.goto(f"{base_url}/?qa=visual-capture", wait_until="networkidle")
            page.wait_for_function("window.__projectPlateau?.ready === true")
            title_frozen = page.evaluate(f"window.__projectPlateau.freezeVisualForTest({FROZEN_TIME})")
            page.wait_for_timeout(50)
            title_path = OUTPUT / f"title-{width}x{height}.png"
            page.screenshot(path=title_path)
            captures.append({
                "id": f"title-{width}x{height}",
                "path": title_path.relative_to(PROJECT).as_posix(),
                "viewport": [width, height],
                "sha256": sha256(title_path),
                "bytes": title_path.stat().st_size,
                "frozenAnimationSeconds": title_frozen,
                "familyMoment": None,
                "threatState": "distant",
            })
            page.evaluate("window.__projectPlateau.setView('glade')")
            frozen = page.evaluate(f"window.__projectPlateau.freezeVisualForTest({FROZEN_TIME})")
            page.wait_for_timeout(100)
            for state_name, awareness in (("family", 2), ("dive", 3)):
                page.evaluate(f"window.__projectPlateau.setThreatVisualForTest({awareness}, '{state_name}')")
                page.wait_for_timeout(50)
                path = OUTPUT / f"{state_name}-{width}x{height}.png"
                page.screenshot(path=path)
                state = page.evaluate("window.__projectPlateau.snapshot()")
                captures.append({
                    "id": f"{state_name}-{width}x{height}",
                    "path": path.relative_to(PROJECT).as_posix(),
                    "viewport": [width, height],
                    "sha256": sha256(path),
                    "bytes": path.stat().st_size,
                    "frozenAnimationSeconds": frozen,
                    "familyMoment": state["familyVisual"]["moment"],
                    "threatState": state["threatVisual"]["state"],
                })
            page.close()

        sheet = browser.new_page(viewport={"width": 1440, "height": 900})
        images = [
            "data:image/png;base64," + base64.b64encode((PROJECT / item["path"]).read_bytes()).decode("ascii")
            for item in captures
        ]
        sheet.set_content(f"""
          <style>*{{box-sizing:border-box}}body{{margin:0;background:#101714;color:#f1e8d0;font:16px system-ui}}
          main{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px}}figure{{margin:0}}img{{width:100%;height:350px;object-fit:contain;background:#0b100e}}figcaption{{margin-bottom:6px;letter-spacing:.08em;font-size:12px}}</style>
          <main>
          <figure><figcaption>TITLE · 1440 × 900</figcaption><img src="{images[0]}"></figure>
          <figure><figcaption>FAMILY · 1440 × 900 · {FROZEN_TIME:.2f}s</figcaption><img src="{images[1]}"></figure>
          <figure><figcaption>DIVE · 1440 × 900 · {FROZEN_TIME:.2f}s</figcaption><img src="{images[2]}"></figure>
          <figure><figcaption>TITLE · 1280 × 720</figcaption><img src="{images[3]}"></figure>
          <figure><figcaption>FAMILY · 1280 × 720 · {FROZEN_TIME:.2f}s</figcaption><img src="{images[4]}"></figure>
          <figure><figcaption>DIVE · 1280 × 720 · {FROZEN_TIME:.2f}s</figcaption><img src="{images[5]}"></figure>
          </main>
        """, wait_until="load")
        sheet_path = OUTPUT / "contact-sheet-supported-viewports.png"
        sheet.screenshot(path=sheet_path)
        sheet.close()
        browser.close()

    assert not errors, errors
    targets = [
        {
            "id": path.stem.split("-", 1)[1],
            "path": path.relative_to(PROJECT).as_posix(),
            "sha256": sha256(path),
            "bytes": path.stat().st_size,
        }
        for path in sorted(TARGETS.glob("*.svg"))
    ]
    assert len(captures) == 6, captures
    assert len({item["sha256"] for item in captures}) == 6, captures
    assert len(targets) == 3, targets
    result = {
        "schemaVersion": 1,
        "command": "npm run capture:visual",
        "sourceFingerprint": source_fingerprint(),
        "scene": "glade-family-under-aerial-pressure",
        "seed": 139,
        "frozenAnimationSeconds": FROZEN_TIME,
        "captures": captures,
        "contactSheet": {
            "path": sheet_path.relative_to(PROJECT).as_posix(),
            "sha256": sha256(sheet_path),
            "bytes": sheet_path.stat().st_size,
        },
        "targets": targets,
        "consoleErrors": errors,
    }
    (OUTPUT / "manifest.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    return result


def main() -> None:
    server, base_url = start_server()
    try:
        result = run(base_url)
    finally:
        server.terminate()
        server.wait(timeout=5)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
