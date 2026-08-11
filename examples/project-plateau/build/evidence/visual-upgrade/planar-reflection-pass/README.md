# Planar-reflection pass

## Evidence boundaries

- `before/` is the verified scene-layout-probe result.
- `after/` is the verified current run with the same established `08-review-brook.jpg` camera and
  the same additional `11-review-brook-detail.jpg` inspection camera.
- Mechanical framebuffer and GL-error checks prove a valid rendered run, not subjective parity.

## Accepted implementation

- One 320×180 mirrored-camera target uses an oblique clip plane at the representative brook surface.
- Camera motion invalidates the capture at a bounded cadence: every 12 rendered frames in balanced
  quality and every 6 in high quality. A static camera does not pay a repeated scene-render cost.
- The brook shader projectively samples the real reflected scene, distorts it with the existing
  flow normals and retains the scene-layout panorama as an explicit fallback.
- Low quality disables both planar capture and the panorama layer.
- Renderer target, viewport, scissor, XR state, shadow-update state and suppressed-object visibility
  are restored in `finally` after every capture attempt.

## Rejected lifecycle ordering

The first spike captured before the primary frame had allocated shadow maps. Chrome reported
`GL_INVALID_OPERATION` sampler-format mismatches and omitted most instanced habitat objects from
later draws. The accepted path refuses frame-zero capture; QA now treats any `GL_INVALID_*` console
message as a failure. Fresh browser runs show no such warning or missing geometry.

## Remaining visual gap

The brook now has real planar parallax, but it still uses one representative horizontal plane for a
terrain-conforming ribbon. It has no SSR fill for off-target content and no visible-scene depth
refraction. Asset silhouettes and authored material fidelity remain the larger overall gap to Web
Ocean.
