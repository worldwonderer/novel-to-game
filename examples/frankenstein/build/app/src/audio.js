// The audio layer. Every sound enters the game through a key and nothing else
// schedules a node. A key with no authored voice is silent and the run
// continues — the same principle as the skin's greybox and the font stack's
// Georgia: §13.5's gated keys failing to exist is a release-gate failure, not
// a runtime error.
//
// All sound is synthesised in WebAudio at runtime; no audio files ship
// (ART_DIRECTION §13.2, §13.4: "short filtered noise bursts with authored
// envelopes"). Noise is a fixed index hash — never Math.random, and never the
// engine's seeded RNG, which belongs to the rules and would desync replays.
//
// §13.1's rule: everything heard is something the creature could hear from
// where he is. The position stage below is how a cue learns where he is.

// The twelve release-gated keys (ART_DIRECTION §13.5): the four footfalls,
// the load-down, the latch, the hearth bed at its two levels (GAME_DESIGN
// §7.2: small, built high), the taper strike, the dawn bird, the wind, and
// the guitar. Their absence is a build failure at the gate — not a crash here.
const GATED = [
  'footfall/snow', 'footfall/path', 'footfall/earth', 'footfall/straw',
  'load-down', 'latch',
  'hearth/small', 'hearth/high',
  'taper-strike', 'dawn-bird', 'wind', 'guitar',
];
const GATED_SET = new Set(GATED);

// §13.1, as an optional filter stage every cue passes through:
//   hovel — through the wall and the straw: low-pass ~900 Hz, one short dry
//           reflection;
//   yard  — the same sources open, with the yard's own fainter reflection;
//   room  — dry, close, unfiltered (chapter 15, once in the game). The stage
//           knows it; nothing routes here yet — the slice's door scene plays
//           at the threshold, outside.
const POSITIONS = {
  hovel: { lowpass: 900, reflection: { delay: 0.055, gain: 0.16 } },
  yard: { lowpass: null, reflection: { delay: 0.09, gain: 0.07 } },
  room: { lowpass: null, reflection: null },
};

// Deterministic pseudo-noise: a hash of the sample index, the same det() the
// engraving marks use (render.js). Same buffer on every run, every machine.
function det(i, salt = 0) {
  let h = (Math.imul(i + 1, 2654435761) ^ Math.imul(salt + 1, 40503)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1103515245) >>> 0;
  h ^= h >>> 16;
  return (h >>> 8) / 16777216; // 0..1
}

// One shared noise buffer per context (the live one and each offline one).
const noiseBuffers = new WeakMap();
function noiseBuffer(ac) {
  let b = noiseBuffers.get(ac);
  if (!b) {
    const n = Math.floor(ac.sampleRate * 0.5);
    b = ac.createBuffer(1, n, ac.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = det(i) * 2 - 1;
    noiseBuffers.set(ac, b);
  }
  return b;
}

// One strike of the latch: a band-passed noise burst with an authored
// envelope, over a short wooden body (a pitched thud dropping as it dies).
function strike(ac, out, when, { band, q, peak, decay, thump }) {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = band;
  bp.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(peak, when + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
  src.connect(bp); bp.connect(g); g.connect(out);
  src.start(when); src.stop(when + decay + 0.03);

  const osc = ac.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(thump, when);
  osc.frequency.exponentialRampToValueAtTime(thump * 0.7, when + decay);
  const og = ac.createGain();
  og.gain.setValueAtTime(0, when);
  og.gain.linearRampToValueAtTime(peak * 0.5, when + 0.004);
  og.gain.exponentialRampToValueAtTime(0.0001, when + decay * 1.4);
  osc.connect(og); og.connect(out);
  osc.start(when); osc.stop(when + decay * 1.5);
}

// Agatha's hand on the latch (§13.3): one latch — the bar lifting, then
// seating ~90 ms later — then silence held. The 1.5 s hold is structural:
// nothing else is scheduled after it (the hearth, the wind and the dawn bird
// are still pending keys), so the silence is the mix, not an envelope.
function latch(ac, out, when) {
  strike(ac, out, when, { band: 1800, q: 1.1, peak: 0.55, decay: 0.045, thump: 340 });
  strike(ac, out, when + 0.09, { band: 1350, q: 1.1, peak: 0.42, decay: 0.06, thump: 260 });
}

// The authored voices. This item authors exactly one; the other eleven gated
// keys stay pending and play silence.
const VOICES = { latch };

const entries = new Map(); // key -> { ready }

// Build the position stage inside any BaseAudioContext (live or offline) and
// return the node a voice should connect into: input -> [low-pass] -> out,
// with the dry reflection tapped off the input.
function positionChain(ac, position, out) {
  const p = POSITIONS[position] || POSITIONS.yard;
  const input = ac.createGain();
  let tail = input;
  if (p.lowpass) {
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = p.lowpass;
    f.Q.value = 0.7;
    tail.connect(f);
    tail = f;
  }
  tail.connect(out);
  if (p.reflection) {
    const d = ac.createDelay(0.3);
    d.delayTime.value = p.reflection.delay;
    const g = ac.createGain();
    g.gain.value = p.reflection.gain;
    input.connect(d); d.connect(g); g.connect(out);
  }
  return input;
}

let ac = null;          // the live AudioContext, created in load()
let master = null;      // the sound on/off switch every live cue goes through
let soundOn = true;
let positionOf = null;  // main.js supplies the creature's listening position
const played = [];      // cues actually scheduled, for the QA harness

export function load() {
  for (const k of GATED) entries.set(k, { ready: k in VOICES });
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return; // no WebAudio: every key still plays, silently
  ac = new AC();
  master = ac.createGain();
  master.gain.value = soundOn ? 1 : 0;
  master.connect(ac.destination);
}

// The autoplay policy: the context is suspended until a real user gesture.
// main.js calls this from the first keydown/mousedown; it is idempotent and
// never throws (a rejected resume would surface as a page error).
export function resume() {
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
}

export function setSound(on) {
  soundOn = !!on;
  if (master) master.gain.value = soundOn ? 1 : 0;
}

// Register the function that reports where the creature is listening from.
export function onPosition(fn) { positionOf = fn; }

// Play a key now, live. Off means really off; a missing or pending key is
// silence and the run continues; a suspended context drops the cue rather
// than queueing it to land late.
export function play(key) {
  if (!soundOn || !ac || !master || ac.state !== 'running') return;
  const v = VOICES[key];
  if (!v) return;
  const position = positionOf ? positionOf() : 'yard';
  const out = positionChain(ac, position, master);
  v(ac, out, ac.currentTime);
  played.push({ key, position });
  if (played.length > 64) played.shift();
}

/** Keys still without an authored voice — what the completion record lists. */
export function pending() {
  return [...entries.entries()].filter(([, e]) => !e.ready).map(([k]) => k);
}

export function gatedPending() {
  return pending().filter(k => GATED_SET.has(k));
}

/** Cues scheduled so far ({key, position}), oldest first. For QA. */
export function playedCues() {
  return played.map(p => ({ ...p }));
}

/** Context state, the switch, and whether a live context exists. For QA. */
export function status() {
  return { context: ac ? ac.state : 'unavailable', soundOn };
}

/**
 * Render a key offline and measure it: the exact voice and position stage the
 * live path uses, inside an OfflineAudioContext, with the same sound on/off
 * gain in front. This is how "it really sounds" is proven where nothing can
 * be heard: a missing key or sound=false renders measurable silence instead
 * of throwing. Returns { rms, peak, samples }.
 */
export async function audition(key, { position = 'hovel', sound = true, seconds = 0.6 } = {}) {
  const AC = typeof window !== 'undefined' &&
    (window.OfflineAudioContext || window.webkitOfflineAudioContext);
  if (!AC) return null;
  const off = new AC(1, Math.ceil(seconds * 44100), 44100);
  const m = off.createGain();
  m.gain.value = sound ? 1 : 0;
  m.connect(off.destination);
  const v = VOICES[key];
  if (v) {
    const out = positionChain(off, position, m);
    v(off, out, 0.05);
  }
  const buf = await off.startRendering();
  const d = buf.getChannelData(0);
  let sum = 0, peak = 0;
  for (let i = 0; i < d.length; i++) {
    const a = Math.abs(d[i]);
    sum += d[i] * d[i];
    if (a > peak) peak = a;
  }
  return { rms: Math.sqrt(sum / d.length), peak, samples: d.length };
}
