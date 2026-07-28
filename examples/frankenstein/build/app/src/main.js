// Boot, input, the fixed-timestep loop, and the scene manager.
// Engine phases (night / walk / door) are simulated by the engine at a fixed
// 60 Hz tick; scene-paced phases (title, cold open, dawn read, seen,
// aftermath, epilogue, after-run) are driven here from the same tick.

import { createRun } from './engine/state.js';
import * as engine from './engine/sim.js';
import { MINUTE_TICKS, FAST_MINUTE_TICKS, PLATE, HOVEL_MOUTH, DOOR } from './engine/constants.js';
import { STRINGS, glossWords } from './strings.js';
import * as R from './render.js';

const params = new URLSearchParams(location.search);
const seed = params.get('seed') || 'hovel-01';
const fast = params.get('fast') === '1';

const canvas = document.getElementById('plate');
const ctx = canvas.getContext('2d');

// ---------------------------------------------------------------- options

const OPTIONS_KEY = 'hovel.options';
const options = Object.assign(
  { textScale: 1, inkHeavy: false, sound: true, murmur: true, reducedMotion: false },
  JSON.parse(localStorage.getItem(OPTIONS_KEY) || '{}'));
function saveOptions() { localStorage.setItem(OPTIONS_KEY, JSON.stringify(options)); }

// ---------------------------------------------------------------- run state

let state = createRun(seed);
state.minuteTicks = fast ? FAST_MINUTE_TICKS : MINUTE_TICKS;
state.phase = 'title';

// Scene bookkeeping (not simulation state).
const scene = {
  buttons: [],
  focus: 0,
  coldTime: 0,
  coldHeld: false,
  minted: [],          // minted-word animations { word, t }
  speech: null,        // current overheard utterance { speaker, text, t }
  titleBeat: 0,
  epilogueStep: 0,
  holdTicks: 0,
  queuedAction: null,  // mouse: walk to an actionable and act on arrival
  listenedUtterance: 0,
  moonGone: 0,
};
function resetScene() {
  scene.buttons = []; scene.focus = 0; scene.coldTime = 0; scene.minted = [];
  scene.speech = null; scene.titleBeat = 0; scene.epilogueStep = 0;
  scene.holdTicks = 0; scene.queuedAction = null; scene.listenedUtterance = 0;
  scene.moonGone = 0;
}

function restart() {
  state = createRun(seed);
  state.minuteTicks = fast ? FAST_MINUTE_TICKS : MINUTE_TICKS;
  state.phase = 'title';
  resetScene();
}

// ---------------------------------------------------------------- input

const keys = new Set();
const edges = { action: false, drop: false, exit: false, journal: false, advance: false };
let mouse = { x: 0, y: 0, down: false, clicked: false };

function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (PLATE.w / r.width),
    y: (e.clientY - r.top) * (PLATE.h / r.height),
  };
}

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  keys.add(k);
  if (k === 'e' || k === ' ') { edges.action = true; e.preventDefault(); }
  if (k === 'q') edges.drop = true;
  if (k === 'x') edges.exit = true;
  if (k === 'j') edges.journal = true;
  if (k === 'enter') edges.advance = true;
  if (k === 'arrowup' || k === 'w') scene.focus--;
  if (k === 'arrowdown' || k === 's') scene.focus++;
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
canvas.addEventListener('mousemove', (e) => { const p = canvasPos(e); mouse.x = p.x; mouse.y = p.y; });
canvas.addEventListener('mousedown', (e) => { const p = canvasPos(e); mouse = { x: p.x, y: p.y, down: true, clicked: true }; });
window.addEventListener('mouseup', () => { mouse.down = false; });

function inputVector() {
  let kx = 0, ky = 0;
  if (keys.has('arrowleft') || keys.has('a')) kx -= 1;
  if (keys.has('arrowright') || keys.has('d')) kx += 1;
  if (keys.has('arrowup') || keys.has('w')) ky -= 1;
  if (keys.has('arrowdown') || keys.has('s')) ky += 1;
  return { kx, ky };
}

function consumeEdges() {
  const e = { ...edges };
  edges.action = edges.drop = edges.exit = edges.journal = edges.advance = false;
  mouse.clicked = false;
  return e;
}

// ---------------------------------------------------------------- prompts

const P = STRINGS.prompts;

function yardPrompt() {
  const a = engine.availableAction(state);
  switch (a) {
    case 'putDown': return P.putDown;
    case 'takeLoad': return P.takeLoad;
    case 'water': return P.water;
    case 'path': return P.path;
    case 'take': return P.take;
    case 'forage': return P.forage;
    case 'search': return P.search;
    case 'goIn': return P.goIn;
    default: return state.creature.carrying ? P.letLie : null;
  }
}
function hovelPrompt() {
  const a = engine.availableAction(state);
  if (a === 'lesson') return P.lesson;
  if (a === 'stopListen') return P.stopListen;
  if (state.tonight && state.tonight.listening) return P.stopListen;
  return `${P.listen} · ${P.liftPlank}`;
}

// ---------------------------------------------------------------- scenes

function setButtons(labels) {
  scene.buttons = labels.map((label, i) => ({ id: label, label, focus: i === ((scene.focus % labels.length) + labels.length) % labels.length }));
}
function activateButton(id) {
  if (state.phase === 'title') {
    if (id === STRINGS.title.verbs[0]) { state.phase = 'coldOpen'; state.phaseTick = 0; }
    else if (id === STRINGS.title.verbs[1]) { state.phase = 'options'; state.phaseTick = 0; scene.focus = 0; }
    else if (id === STRINGS.title.verbs[2]) { state.phase = 'about'; state.phaseTick = 0; }
  } else if (state.phase === 'options') {
    state.phase = 'title'; state.phaseTick = 0; scene.focus = 0;
  } else if (state.phase === 'about') {
    state.phase = 'title'; state.phaseTick = 0; scene.focus = 0;
  } else if (state.phase === 'afterRun') {
    restart();
  }
}

function clickButtons(e) {
  for (const b of scene._hit || []) {
    if (e.x >= b.x && e.x <= b.x + b.w && e.y >= b.y && e.y <= b.y + b.h) {
      activateButton(b.id);
      return true;
    }
  }
  return false;
}

// What the mouse click means in the yard: act if it lands on the current
// actionable, else walk there.
function yardClick(e) {
  const a = engine.availableAction(state);
  if (a) {
    // If the creature is already in reach, the edge acts now; else queue: walk, then act.
    engine.applyClick ? null : null;
  }
  if (state.creature.inHovel) {
    // The cold slot, lower right: lift the plank and go out.
    if (e.x > 860 && e.y > 440) { return { exit: true }; }
    return { action: true }; // the chink: listen / lesson
  }
  return { target: { x: e.x, y: e.y } };
}

// The queued context action: after a click on an actionable object, act when
// the creature arrives.
function maybeQueuedAction(input) {
  if (!scene.queuedAction) return input;
  const q = scene.queuedAction;
  if (Math.hypot(state.creature.x - q.x, state.creature.y - q.y) < 8) {
    scene.queuedAction = null;
    return { ...input, action: true };
  }
  if (!state.creature.moving && !state.target) scene.queuedAction = null;
  return input;
}

// ---------------------------------------------------------------- per-phase

function tickTitle(input) {
  scene.titleBeat = Math.min(6, Math.floor(state.phaseTick / 45));
  setButtons(STRINGS.title.verbs);
  if (input.advance) activateButton(scene.buttons[((scene.focus % 3) + 3) % 3].id);
  if (input.clicked) clickButtons(input);
}

function tickOptions(input) {
  // One plate of toggles; arrow keys or click; last button goes back.
  const rows = ['textScale', 'ink', 'sound', 'murmur', 'motion', 'back'];
  if (input.focusDelta) scene.focus += input.focusDelta;
  const f = ((scene.focus % rows.length) + rows.length) % rows.length;
  if (input.advance || input.clicked) {
    if (f === 0) { options.textScale = options.textScale >= 1.5 ? 1 : options.textScale + 0.25; saveOptions(); }
    else if (f === 1) { options.inkHeavy = !options.inkHeavy; saveOptions(); }
    else if (f === 2) { options.sound = !options.sound; saveOptions(); }
    else if (f === 3) { options.murmur = !options.murmur; saveOptions(); }
    else if (f === 4) { options.reducedMotion = !options.reducedMotion; saveOptions(); }
    else { state.phase = 'title'; state.phaseTick = 0; scene.focus = 0; }
  }
}

function tickColdOpen(input) {
  const held = keys.has('e') || keys.has(' ') || mouse.down || input.advance;
  if (held) scene.coldTime += 1 / 60;
  // 0:00 aperture · 0:06 the guitar · 0:14 Felix with the load · 0:18 the taper
  // goes out and the view pulls back · 0:22 the plank lifts · then the yard.
  if (scene.coldTime >= 23) {
    engine.startNight(state);
  }
}

function tickNight(input) {
  const v = inputVector();
  const e = {
    kx: v.kx, ky: v.ky,
    target: input.clicked && !state.creature.inHovel ? { x: input.x, y: input.y } : null,
    action: input.action,
    drop: input.drop,
    exit: input.exit || (input.clicked && state.creature.inHovel && input.x > 860 && input.y > 440),
    journal: input.journal,
  };
  if (input.clicked && state.creature.inHovel && !(input.x > 860 && input.y > 440)) e.action = true;
  engine.tick(state, e);
  drainEvents();
}

function tickDawnRead(input) {
  engine.tick(state, {});
  if (input.action || input.advance || input.clicked) {
    engine.advanceFromDawn(state);
    resetScene();
  }
}

function tickWalk(input) {
  const v = inputVector();
  engine.tick(state, {
    kx: v.kx, ky: v.ky,
    target: input.clicked ? { x: input.x, y: input.y } : null,
    action: input.action,
  });
}

function tickDoor(input) {
  engine.tick(state, { action: input.action || input.clicked });
  drainEvents();
}

function tickSeen(input) {
  engine.tick(state, {});
  // 2 s hold with no interface, then the card; any key moves to the epilogue.
  if (state.phaseTick > 120 && scene.epilogueStep === 0) scene.epilogueStep = 1;
  if (scene.epilogueStep === 1 && (input.action || input.advance || input.clicked)) {
    state.phase = 'epilogue';
    state.phaseTick = 0;
    scene.epilogueStep = 0;
  }
}

function tickAftermath(input) {
  engine.tick(state, {});
  // Felix, the stick, then the withheld hand: hold the context action.
  const held = keys.has('e') || keys.has(' ') || mouse.down;
  if (held) scene.holdTicks++;
  if (scene.holdTicks >= 42 || state.phaseTick > 60 * 12) { // 700 ms, or it passes
    state.phase = 'epilogue';
    state.phaseTick = 0;
    scene.epilogueStep = 0;
    scene.holdTicks = 0;
  }
}

function tickEpilogue(input) {
  engine.tick(state, {});
  const step = scene.epilogueStep;
  const adv = input.action || input.advance || input.clicked;
  const steps = epilogueSteps();
  if (step < steps.length) {
    const s = steps[step];
    if (s.hold) {
      const held = keys.has('e') || keys.has(' ') || mouse.down;
      if (held) scene.holdTicks++;
      scene.moonGone = Math.min(1, scene.holdTicks / (s.hold * 60));
      if (scene.moonGone >= 1) { scene.epilogueStep++; scene.holdTicks = 0; }
    } else if (adv || state.phaseTick > s.minTicks) {
      scene.epilogueStep++;
      state.phaseTick = 0;
    }
  } else {
    state.phase = 'afterRun';
    state.phaseTick = 0;
  }
}

function epilogueSteps() {
  const m = engine.epilogueModel(state);
  if (m.ending === 'want') {
    return [
      { kind: 'gone', minTicks: 60 * 6 },
      { kind: 'dark', minTicks: 60 * 4 },
      { kind: 'moonset', hold: 5 },
      { kind: 'fire', minTicks: 60 * 3 },
      { kind: 'closing', minTicks: 60 * 8 },
    ];
  }
  return [
    { kind: 'lane', minTicks: 60 * 8 },
    { kind: 'dark', minTicks: 60 * 4 },
    { kind: 'moonset', hold: 5 },
    { kind: 'fire', minTicks: 60 * 3 },
    { kind: 'closing', minTicks: 60 * 8 },
  ];
}

function tickAfterRun(input) {
  setButtons([STRINGS.cards.restart]);
  if (input.advance || input.action) activateButton(STRINGS.cards.restart);
  if (input.clicked) clickButtons(input);
}

function drainEvents() {
  for (const ev of state.events.splice(0)) {
    if (ev.type === 'word') {
      const w = STRINGS.vocab[Math.min(ev.words - 1, STRINGS.vocab.length - 1)];
      scene.minted.push({ word: w, t: 0 });
      scene.speech = null;
    } else if (ev.type === 'listenStart') {
      const u = STRINGS.overheard.listening[state.listensCompleted % STRINGS.overheard.listening.length];
      scene.speech = { ...u, t: 0 };
    } else if (ev.type === 'portmanteau') {
      scene.speech = { speaker: null, text: STRINGS.moments.portmanteau, t: 0, narration: true };
    } else if (ev.type === 'journal') {
      scene.speech = { speaker: null, text: STRINGS.moments.journalRead, t: 0, narration: true };
    }
  }
}

// ---------------------------------------------------------------- render

function render() {
  ctx.clearRect(0, 0, PLATE.w, PLATE.h);
  const opts = { textScale: options.textScale, inkHeavy: options.inkHeavy };
  switch (state.phase) {
    case 'title': {
      const btns = scene.buttons.map((b, i) => ({ ...b, focus: i === ((scene.focus % 3) + 3) % 3 }));
      scene._hit = R.drawTitle(ctx, state, opts, scene.titleBeat, btns);
      break;
    }
    case 'options': renderOptions(opts); break;
    case 'about': renderAbout(opts); break;
    case 'coldOpen': renderColdOpen(opts); break;
    case 'night': renderNight(opts); break;
    case 'dawnRead': renderDawn(opts); break;
    case 'walk': renderWalk(opts); break;
    case 'door': renderDoor(opts); break;
    case 'seen': renderSeen(opts); break;
    case 'aftermath': renderAftermath(opts); break;
    case 'epilogue': renderEpilogue(opts); break;
    case 'afterRun': renderAfterRun(opts); break;
  }
  // Transient minted words, in their lane.
  for (const m of scene.minted) {
    m.t += 1 / 60;
    const y = 480 - m.t * 60;
    if (m.t < 1.6) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, 2 - m.t);
      ctx.fillStyle = R.withAlpha(R.PAL.nightDeep, 0.4);
      ctx.beginPath(); ctx.ellipse(735, y - 6, 46, 15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = R.PAL.ink; ctx.lineWidth = 2;
      ctx.fillStyle = R.PAL.paper;
      ctx.font = R.fontBody(18);
      ctx.textAlign = 'center';
      ctx.strokeText(m.word, 735, y);
      ctx.fillText(m.word, 735, y);
      ctx.restore();
    }
  }
  scene.minted = scene.minted.filter(m => m.t < 1.6);
  if (scene.speech) {
    scene.speech.t += 1 / 60;
    if (scene.speech.t > 4) scene.speech = null;
  }
}

function renderOptions(opts) {
  const O = STRINGS.options;
  const rows = [
    `${O.textSize}: ${O.textSizeValues[options.textScale === 1 ? 0 : options.textScale === 1.25 ? 1 : 2]}`,
    `${O.ink}: ${O.inkValues[options.inkHeavy ? 1 : 0]}`,
    `${O.sound}: ${O.onOff[options.sound ? 1 : 0]}`,
    `${O.murmur}: ${O.onOff[options.murmur ? 1 : 0]}`,
    `${O.motion}: ${O.onOff[options.reducedMotion ? 1 : 0]}`,
    O.back,
  ];
  const f = ((scene.focus % rows.length) + rows.length) % rows.length;
  scene._hit = R.drawCard(ctx, [O.title, ...rows.map((r, i) => (i === f ? `— ${r} —` : r))], opts, []);
}

function renderAbout(opts) {
  scene._hit = R.drawCard(ctx, STRINGS.about, opts, [{ id: 'back', label: STRINGS.about[2], focus: true }]);
}

function renderColdOpen(opts) {
  // The chink, and nothing else. One prompt, four words.
  const t = scene.coldTime;
  R.drawHovel(ctx, state, 'dusk', opts);
  if (t < 18) {
    // the room, closer: overlay a large aperture while we hold
  }
  R.drawPrompt(ctx, P.keepWatching, opts);
}

function renderNight(opts) {
  if (state.creature.inHovel) {
    R.drawHovel(ctx, state, 'dusk', opts);
    if (scene.speech) {
      const known = glossWords(state);
      R.glossText(ctx, scene.speech.text, scene.speech.narration ? scene.speech.text.split(' ') : known,
        375, 540, Math.round(18 * (opts.textScale || 1)), R.PAL.paper);
    }
    R.drawPrompt(ctx, hovelPrompt(), opts);
  } else {
    R.drawHolding(ctx, state);
    R.drawCottagers(ctx, state);
    R.drawCreature(ctx, state);
    R.drawMoonArc(ctx, state);
    R.drawPrompt(ctx, yardPrompt(), opts);
  }
}

function renderDawn(opts) {
  R.drawHovel(ctx, state, 'dawn', opts);
  R.drawPrompt(ctx, P.letDayPass, opts);
}

function renderWalk(opts) {
  R.drawHolding(ctx, state, { daylight: true });
  // The three go out at the gate during the first two seconds.
  if (state.walkScene && state.walkScene.stage === 'exit') {
    const t = state.walkScene.stageTick / 120;
    const gx = 640, gy = 545 - t * 60;
    R.drawCreature(ctx, state);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#6a5a48';
      ctx.beginPath(); ctx.arc(gx - 12 + i * 12, gy - i * 8, 7, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    R.drawCreature(ctx, state);
    const near = Math.hypot(state.creature.x - DOOR.x, state.creature.y - DOOR.y) <= 40;
    R.drawPrompt(ctx, near ? P.knock : null, opts);
  }
}

function renderDoor(opts) {
  const d = state.door;
  let subtitle = null;
  if (d) {
    if (d.index === 0 && !d.spoken0) {
      subtitle = [state.walkSlipped ? STRINGS.door.answerWary : STRINGS.door.answer];
      if (!engine.doorCanSpeak(state) && d.exchangeTicks <= 0) {
        subtitle.push(STRINGS.door.sitSilence);
      }
    } else {
      const ex = STRINGS.door.exchanges[d.index];
      if (ex) subtitle = [ex.me, ex.him].filter(Boolean);
    }
    if (d.index >= 5) subtitle = [STRINGS.door.closingTrue];
  }
  R.drawDoorScene(ctx, state, opts, subtitle);
  if (d && engine.doorCanSpeak(state) && d.exchangeTicks <= 0) R.drawPrompt(ctx, P.answer, opts);
  if (d && d.index === 0 && !engine.doorCanSpeak(state)) R.drawPrompt(ctx, null, opts);
}

function renderSeen(opts) {
  // The world frozen; the whitened wedge; then the card.
  R.drawHolding(ctx, state);
  const cones = engine.activeCones(state);
  for (const cone of cones) {
    const wide = cone.wide || cone.dawnDoor;
    R.wedge(ctx, cone.x, cone.y, cone.angle, wide ? 0.96 : 0.56, wide ? 260 : 150, R.withAlpha(R.PAL.paper, 0.85));
  }
  // His shadow across the person who saw him.
  const seer = cones.find(c => c.owner === state.seenBy);
  if (seer) {
    ctx.fillStyle = R.withAlpha(R.PAL.creature, 0.55);
    ctx.beginPath();
    ctx.ellipse(seer.x, seer.y + 14, 40, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  R.drawCreature(ctx, state);
  if (scene.epilogueStep >= 1) {
    const lines = state.seenContext === 'firstlight'
      ? [STRINGS.failure.header, STRINGS.failure.seenFirstLight]
      : state.seenBy === 'agatha'
        ? [STRINGS.failure.header, STRINGS.failure.seenAgatha]
        : [STRINGS.failure.header, STRINGS.failure.seenFelix];
    scene._hit = R.drawCard(ctx, lines, opts, []);
  }
}

function renderAftermath(opts) {
  R.drawDoorScene(ctx, state, opts, null);
  // The withheld hand: a hand opens, rises, holds, lowers.
  const t = Math.min(1, scene.holdTicks / 42);
  ctx.strokeStyle = R.PAL.ink; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(420, 640);
  ctx.lineTo(470 + t * 30, 580 - t * 60);
  ctx.stroke();
  R.drawPrompt(ctx, P.stayHand, opts);
}

function renderEpilogue(opts) {
  const m = engine.epilogueModel(state);
  const steps = epilogueSteps();
  const s = steps[Math.min(scene.epilogueStep, steps.length - 1)];
  switch (s.kind) {
    case 'gone':
      scene._hit = R.drawCard(ctx, [STRINGS.epilogue.gone.line1, STRINGS.epilogue.gone.line2], opts, []);
      break;
    case 'lane': {
      const lines = [...STRINGS.epilogue.lane];
      if (m.satUp) lines.push(STRINGS.epilogue.laneSatUp);
      lines.push(m.beds >= 3 ? STRINGS.epilogue.laneAnswerProduce : STRINGS.epilogue.laneAnswer);
      scene._hit = R.drawCard(ctx, lines, opts, []);
      break;
    }
    case 'dark':
      R.drawHovel(ctx, state, 'dawn', opts);
      ctx.fillStyle = R.withAlpha(R.PAL.nightDeep, 0.85);
      ctx.fillRect(160, 150, 430, 330);
      scene._hit = R.drawCard(ctx, [STRINGS.epilogue.darkDay], opts, []);
      break;
    case 'moonset':
      R.drawHolding(ctx, state);
      R.drawCreature(ctx, state);
      // the arc runs down as the player holds
      ctx.strokeStyle = R.PAL.snow; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(PLATE.w * 0.875, PLATE.h * 0.085, 52, Math.PI, Math.PI + Math.PI * (1 - scene.moonGone)); ctx.stroke();
      R.drawPrompt(ctx, P.waitMoon, opts);
      break;
    case 'fire': {
      // The first red in the game.
      ctx.fillStyle = R.PAL.nightDeep;
      ctx.fillRect(0, 0, PLATE.w, PLATE.h);
      const t = Math.min(1, state.phaseTick / 156);
      ctx.fillStyle = R.PAL.red;
      ctx.beginPath();
      ctx.ellipse(PLATE.w / 2, PLATE.h / 2, 60 + t * 500, 40 + t * 340, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'closing': {
      const lines = closingLines(m);
      scene._hit = R.drawCard(ctx, lines, opts, []);
      break;
    }
  }
}

function closingLines(m) {
  const C = STRINGS.epilogue.closing;
  const lines = [];
  if (m.ending === 'want') {
    lines.push(m.nothingPutBy ? C.theft : C.fed);
  } else {
    lines.push(m.exchange5 ? C.labourTrue : C.labourFalse);
  }
  if (m.nothingPutBy && m.ending !== 'want') lines.push(C.theft);
  if (m.fewLessons && m.ending !== 'want') lines.push(C.fewWords);
  lines.push(m.journal ? C.journal : C.noJournal);
  return lines.slice(0, 3);
}

function renderAfterRun(opts) {
  const btns = [{ id: STRINGS.cards.restart, label: STRINGS.cards.restart, focus: true }];
  scene._hit = R.drawCard(ctx, [STRINGS.cards.endOfRun], opts, btns);
}

// ---------------------------------------------------------------- the loop

const TICK = 1 / 60;
let last = performance.now(), acc = 0, interactive = false;

function frame(now) {
  requestAnimationFrame(frame);
  acc += Math.min(0.25, (now - last) / 1000);
  last = now;
  while (acc >= TICK) {
    acc -= TICK;
    const e = consumeEdges();
    const input = {
      ...e, x: mouse.x, y: mouse.y, clicked: e.clicked,
      focusDelta: 0,
    };
    step(input);
    interactive = true;
  }
  render();
}

function step(input) {
  switch (state.phase) {
    case 'title': tickTitle(input); break;
    case 'options': tickOptions(input); break;
    case 'about': if (input.advance || input.action || input.clicked) { state.phase = 'title'; state.phaseTick = 0; } engine.tick(state, {}); break;
    case 'coldOpen': engine.tick(state, {}); tickColdOpen(input); break;
    case 'night': tickNight(input); break;
    case 'dawnRead': tickDawnRead(input); break;
    case 'walk': tickWalk(input); break;
    case 'door': tickDoor(input); break;
    case 'seen': tickSeen(input); break;
    case 'aftermath': tickAftermath(input); break;
    case 'epilogue': tickEpilogue(input); break;
    case 'afterRun': tickAfterRun(input); break;
  }
}

// Viewport fallback: the game does not reflow.
function fitCanvas() {
  const w = window.innerWidth, h = window.innerHeight;
  const scale = Math.min(w / PLATE.w, h / PLATE.h);
  canvas.style.width = `${Math.floor(PLATE.w * scale)}px`;
  canvas.style.height = `${Math.floor(PLATE.h * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

// The test hook: current state, the tick index, and the active cone set.
window.__game = {
  get state() { return state; },
  get tick() { return state.tick; },
  get phase() { return state.phase; },
  get cones() { return engine.activeCones(state); },
  get interactive() { return interactive; },
  engine,
  restart,
};

requestAnimationFrame(frame);
