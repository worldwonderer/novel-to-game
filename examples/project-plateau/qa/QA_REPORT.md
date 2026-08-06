# Project Plateau QA report

`targetFinish: playable-prototype`
`assuranceProfile: release`
`status: PASS`

## Decision

The current browser candidate is a playable prototype. A real keyboard/mouse path starts from a clean field order,
traverses the plateau, exposes four plates, reaches a Strong field record and restarts to the initial state. Release
identity and visual claims are checked by the repository aggregate validator.

This report does not claim subjective fun, long-term balance, cryptographic reviewer identity or first-time human
comprehension.

## Authoritative paths

| Concern | Evidence |
|---|---|
| Actual command, environment and suites | `qa/verification.json`, `qa/evidence/verify.log` |
| Complete run and restart | `build/evidence/current-run/report.json` and its seven semantic checkpoints |
| Current visual candidate | `build/evidence/visual-upgrade/generated/manifest.json` |
| Frozen independent reviews | `build/evidence/visual-upgrade/reviews-freeze.json` |
| Release asset status | `build/asset-ledger.json` |
| Source inputs | `build/source-inputs.json` |
| Public host | `https://plateau.vibecoco.ai` and `qa/evidence/public-host/report.json` (`HISTORICAL`, not current proof) |
| Voiceover rights | `qa/evidence/voiceover-approval-2026-08-04.md` |

## Required checks

- Launch/render/input/core loop/outcome/restart: **PASS**.
- Target browser, desktop viewports and controller/collision contracts: **PASS**.
- TTS/generated media rights and local asset handoff: **PASS** for the adopted launch voiceover.
- Current visual manifest and required independent review: **PASS**.
- Public host current fingerprint: **HISTORICAL**; the playable-prototype repository claim does not treat it as
  current deployment proof.
- Blocker/major defects: none open.

## Limitations

- Automation is not first-time human navigation or premise-comprehension evidence.
- Pixel/state checks cannot prove anatomy, composition, motion quality, fun or balance.
- The hosted URL must be redeployed and fingerprinted before it can be claimed as the current release candidate.

## Re-run

From `build/app/` run `npm ci && npm run verify`. Then run the repository aggregate validator from the repository
root. Per-click captures, raw performance traces and superseded review rounds are reproducible outputs and are not
retained in Git.
