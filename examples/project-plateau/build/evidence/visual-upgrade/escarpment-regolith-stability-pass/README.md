# Escarpment regolith stability pass

## Target

Stop rendering the eastern near-vertical heightfield cell as ordinary soil. Classify the visible
surface from the slope the rendered mesh actually carries, expose the existing source basalt above
the loose-regolith angle of repose, and retain transported fragments only on the stable downslope
toe. Do not change navigation, collision height, light, fog, exposure or asset support.

## Accepted physical model

- The old 0.35 m analytic slope probe measured only about **0.12** at either endpoint of the narrow
  escarpment transition. The final 1.25 m terrain cell spans that entire rise and its rendered normal
  measures a gradient of about **1.43**. Surface classification now reads the final heightfield normal
  rather than the under-resolved endpoint probe.
- Loose regolith begins to fail above **34°** (`gradient 0.674509`); the field reaches full source-
  bedrock exposure at **55°** (`gradient 1.428148`). The gate is also restricted to the actual eastern
  face and the same three-source longitudinal continuity that raises the shoulder.
- Weathered fragments accumulate only west/downhill of that face, on slopes below the loose-material
  stability limit, over a bounded **6.5 m** toe reach. Deterministic breakup prevents a rectangular
  colour strip, while unrelated steep terrain receives neither basalt exposure nor colluvium.
- The accepted mesh records bedrock exposure `0..1` and colluvium `0..0.9102`. The existing basalt
  albedo/roughness/height package supplies both; no extra light or painted shadow is introduced.
- Bedrock optical relief is limited to **58%** of the generic mineral relief. This keeps the authored
  source-joint direction without turning a continuous rock face into an exaggerated ribbed curtain.

## Rejected iterations

- `rejected-overstrong-columnar-relief/`: correct angle-of-repose classification and source coupling,
  but the full 0.21 m optical relief repeated the basalt's directional joints too strongly across the
  whole face.
- `rejected-expensive-cross-joint-projection/`: correlated colour, roughness and height added a second
  orthogonal triplanar projection. It delivered little fixed-camera improvement while reducing the
  measured 1% low from **54.2** to **39.1 FPS**, so complexity was not retained for its own sake.

## Accepted browser evidence

`after/report.json` records:

- complete Strong result and clean restart: **PASS**;
- bedrock/colluvium runtime ranges and fixed escarpment cameras: **PASS**;
- WebGL console errors: **0**;
- unchanged 24,505-vertex terrain/collision topology and unchanged daylight contract;
- 180-frame heavy-scene sample: **59.9 median FPS**, **39.2 FPS 1% low**,
  **25.5 ms worst frame**.

The evidence proves a materially coherent source-rock transition and stable-toe field. It does not
prove final production geology: the eastern shoulder still needs broader authored fracture and
weathering variation beyond the three existing exposure modules.
