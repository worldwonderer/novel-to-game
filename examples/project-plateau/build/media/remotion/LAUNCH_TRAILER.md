# Project Plateau Remotion launch trailer — 2026-08-04

## Recorded inputs

- Same-route gameplay clip SHA-256: `5497d8741d56949858b15c530846ebd8aff66fc8faf652f1aa22966818f2dc87`
- Normalized narration SHA-256: `d2df95402739af4d27db7bf0a3ef376282677248b1b1c13fdbf91c49c24482a4`
- Result still SHA-256: `1bbdf73b5843026beb38789e386be6993b7260593baa5af6cbd86313c26b0fb0`
- Procedural soundtrack SHA-256: `60f5d90f999122c9b158f00c47eec519f2e4f54736fc28d95e285abb1356e2f7`

The gameplay source is the input-only Strong-result route. The edit uses disclosed cuts at natural 1x playback and
does not replace gameplay with staged state.

## Reproduction

Run from this directory:

```text
npm run verify:voiceover
npm run render
npm run verify
npm run compress:github
npm run verify:github
```

The resulting files are 36 seconds at 1920×1080 and 30 FPS, using H.264, `yuv420p`, AAC 48 kHz stereo and fast-start
MP4 layout. The GitHub copy stays below 10,000,000 bytes.

- GitHub delivery SHA-256: `80134eff2437f1f789f772002fc7b68832f42f9edda894e563c4c221ad192eb9`
- GitHub delivery bytes: `9,314,632`

Public attachment:
<https://github.com/user-attachments/assets/830f3fd1-0332-4ad0-898a-c538349657ff>

This record establishes reproducible inputs and encoding facts only. It does not certify narration naturalness,
rights clearance, subjective fun or publication quality.
