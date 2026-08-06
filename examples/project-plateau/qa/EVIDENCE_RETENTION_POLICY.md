# Project Plateau evidence retention policy

## Current roots

Only current claims protect files:

1. `qa/verification.json` — hash-bound smoke decision and complete route.
2. `build/evidence/current-run/report.json` — semantic run checkpoints.
3. `build/asset-ledger.json` — adopted assets and fallbacks.
4. `qa/evidence/public-host/report.json` — current URL-availability probe.

`qa/release-gates.json` and `build/evidence/visual-upgrade/` are retained
historical context, not current acceptance roots.

## Do not retain

- numbered iteration families, superseded reviews, and before/fix rounds;
- duplicate per-click captures and raw performance traces;
- generated dependencies, caches, dist output, editor/tool state, and local
  deployment state;
- derived media that a checked-in script and small manifest can reproduce.

## Safety

Secrets such as `build/app/.env.local` are ignored, never read for cleanup
classification, and never deleted by batch cleanup. Unknown files, symlinks,
rights-unclear assets, and irreproducible source material require explicit review.
