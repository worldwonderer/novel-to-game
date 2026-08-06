# Project Plateau QA report

`targetFinish: playable-prototype`
`assuranceProfile: smoke`
`status: PASS`

## Decision

The current local browser candidate passes the smallest playable-proof contract:
it launches and renders; real keyboard/mouse input completes the core route,
reaches a Strong field record, and restarts from a clean state. Capability checks
cover the continuous 3D runtime, generated assets, public-URL availability, and
exposed accessibility settings.

## Current evidence

| Concern | Evidence |
|---|---|
| Command, source fingerprint and all suites | `qa/verification.json`, `qa/evidence/verify.log` |
| Complete run and restart | `build/evidence/current-run/report.json` and seven semantic checkpoints |
| Adopted asset provenance/fallbacks | `build/asset-ledger.json` |
| Public URL availability only | <https://plateau.vibecoco.ai>, `qa/evidence/public-host/report.json` |

The richer visual manifest, frozen reviews and `qa/release-gates.json` are
historical records. They do not upgrade this current smoke decision.
Promotional TTS is not adopted into the playable build; original runtime Web
Audio and captions are unaffected.

## Limitations

- The hosted URL must be redeployed and fingerprinted before a release claim.
- Independent first-time-player comprehension is not run and blocks delivery or release.
- Automation cannot determine subjective anatomy, composition, motion quality,
  comfort, fun, or balance.

## Re-run

From `build/app/`, run `npm ci && npm run verify`. The verifier regenerates the
current route and hash-bound decision. Per-click captures, raw performance
traces, generated dependencies, and superseded review rounds are not retained.
