# Project Plateau evidence retention policy

## Current roots

Only current claims protect files:

1. `qa/verification.json` — executed suites and the one complete route.
2. `qa/release-gates.json` — release-only facts.
3. `build/asset-ledger.json` — adopted assets and fallbacks.
4. `build/evidence/visual-upgrade/generated/manifest.json` and
   `build/evidence/visual-upgrade/reviews-freeze.json` — current visual closure.
5. `build/source-inputs.json` — publishable input identity.

A referenced file is retained only while it remains reachable from one of these roots and supports a current claim.

## Do not retain

- numbered iteration families, superseded reviews and before/fix rounds;
- per-click screenshots, duplicate state/browser pairs and raw performance traces;
- generated dependencies, caches, dist output, editor/tool state and local deployment state;
- raw or intermediate media that a checked-in script and small manifest can reproduce.

The canonical complete route lives at `build/evidence/current-run/`. Release visuals live under
`build/evidence/visual-upgrade/generated/`. Historical evidence is available from Git history and may not satisfy a
current release gate.

## Safety

Secrets such as `build/app/.env.local` are ignored, never read for cleanup classification and never deleted by batch
cleanup. Unknown files, symlinks, rights-unclear assets and irreproducible source material require explicit review.
