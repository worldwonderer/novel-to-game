// Grey-box renderer. Flat coloured shapes, no art: the core loop must be
// verified in this state before any engraved work. Every element here is
// later restyled by the engraved layer; the skin layer swaps generated
// plates in underneath the drawn figures on each image's own onload.

import { STRINGS } from './strings.js';
import {
  COTTAGE, DOOR, STY, POOL, MILK_HOUSE, WELL, OUTHOUSE, WOODPILE, GARDEN,
  WOOD_EDGE, LANE_GATE, HOVEL_MOUTH, DOOR_APRON, PLATE, OBSTACLES,
} from './engine/constants.js';
import { activeCones } from './engine/schedule.js';
import { availableAction } from './engine/sim.js';
import { coneBand } from './engine/sim.js';

export const PAL = {
  paper: '#e9e0cb', plate: '#d6c9ae', ink: '#2a2119', ink2: '#5a4c3c',
  nightDeep: '#161e2e', nightMid: '#2c3a52', snow: '#c6cfdb',
  cone: '#93a8c6', amber: '#d8913f', taper: '#f0cd82', red: '#a83218',
  creature: '#14100c', cottager: '#8a7a66',
};

const FONT_BODY = 'Georgia, "Times New Roman", serif';
const FONT_DISP = 'Georgia, "Times New Roman", serif';

export function fontBody(px) { return `${px}px ${FONT_BODY}`; }
export function fontDisp(px) { return `${px}px ${FONT_DISP}`; }

// ---------------------------------------------------------------- helpers

function rect(ctx, x0, y0, x1, y1, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0); }
}
function disc(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function wedge(ctx, x, y, angle, halfAngle, reach, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, reach, angle - halfAngle, angle + halfAngle);
  ctx.closePath(); ctx.fill();
}
function text(ctx, str, x, y, px, colour, align = 'left', font = null) {
  ctx.fillStyle = colour;
  ctx.font = font || fontBody(px);
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}
function wavy(ctx, x, y, w, colour) {
  ctx.strokeStyle = colour; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= w; i += 4) ctx.lineTo(x + i, y + Math.sin(i / 4) * 1.5);
  ctx.stroke();
}

// Gloss an utterance against the player's vocabulary: known words print,
// unknown words are engraved wavy rules of the same length.
export function glossText(ctx, str, wordsKnown, x, y, px, colour, align = 'center') {
  const known = new Set(wordsKnown.map(w => w.toLowerCase()));
  const words = str.split(' ');
  ctx.font = fontBody(px);
  const widths = words.map(w => Math.max(ctx.measureText(w).width, w.length * px * 0.42));
  const gap = px * 0.35;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  let cx = align === 'center' ? x - total / 2 : x;
  for (let i = 0; i < words.length; i++) {
    const bare = words[i].replace(/[^a-z'’-]/gi, '').toLowerCase();
    if (known.has(bare)) text(ctx, words[i], cx, y, px, colour);
    else wavy(ctx, cx, y - px * 0.3, widths[i], PAL.ink2);
    cx += widths[i] + gap;
  }
}

// ---------------------------------------------------------------- the plate

export function drawHolding(ctx, state, opts = {}) {
  const daylight = !!opts.daylight;
  // Ground.
  rect(ctx, 0, 0, PLATE.w, PLATE.h, daylight ? PAL.paper : PAL.nightDeep);
  // Snow field (moonlit) / plain paper by day.
  rect(ctx, 40, 40, PLATE.w - 40, PLATE.h - 40, daylight ? PAL.plate : PAL.nightMid);
  // The near wood edge.
  ctx.strokeStyle = daylight ? PAL.ink2 : PAL.snow; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 160); ctx.lineTo(230, 200); ctx.lineTo(120, 260);
  ctx.stroke();
  disc(ctx, WOOD_EDGE.x, WOOD_EDGE.y, 6, state.portmanteauFound ? PAL.ink2 : (daylight ? PAL.ink : PAL.snow));
  // Garden beds.
  rect(ctx, GARDEN.x - 45, GARDEN.y - 35, GARDEN.x + 45, GARDEN.y + 35,
    daylight ? '#c9b892' : '#3a4a66', PAL.ink2);
  for (let i = 0; i < state.freeThawDays; i++) {
    ctx.strokeStyle = PAL.ink2; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(GARDEN.x - 40, GARDEN.y - 20 + i * 14); ctx.lineTo(GARDEN.x + 40, GARDEN.y - 20 + i * 14); ctx.stroke();
  }
  // The path: door apron to lane gate. Stippled when cleared (this night or thaw).
  const cleared = state.night >= 5 || (state.tonight && state.tonight.pathCleared);
  ctx.strokeStyle = cleared ? (daylight ? PAL.ink : PAL.snow) : (daylight ? PAL.ink2 : '#54627e');
  ctx.lineWidth = cleared ? 4 : 2;
  ctx.beginPath(); ctx.moveTo(DOOR_APRON.x, DOOR_APRON.y); ctx.lineTo(LANE_GATE.x, LANE_GATE.y); ctx.stroke();
  // Pool — the only unhatched white ellipse.
  ctx.fillStyle = PAL.snow;
  ctx.beginPath(); ctx.ellipse(POOL.x, POOL.y, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
  // Obstacles and landmarks.
  rect(ctx, COTTAGE.x0, COTTAGE.y0, COTTAGE.x1, COTTAGE.y1, daylight ? '#cbbf9f' : '#4a5a78', PAL.ink);
  rect(ctx, 606, 272, 654, 298, daylight ? '#bfae8c' : '#3d4c68', PAL.ink); // hovel
  // sty: low curved wall, walkable ground
  ctx.strokeStyle = daylight ? PAL.ink2 : PAL.snow; ctx.lineWidth = 2;
  ctx.strokeRect(508, 228, 24, 24);
  if (state.tonight && state.tonight.pigDriven) disc(ctx, STY.x, STY.y, 5, PAL.cottager);
  else disc(ctx, STY.x, STY.y, 4, daylight ? PAL.ink2 : '#7c8aa6');
  rect(ctx, 696, 238, 724, 264, daylight ? '#bfae8c' : '#3d4c68', PAL.ink); // milk-house
  rect(ctx, 463, 293, 477, 307, daylight ? '#bfae8c' : '#3d4c68', PAL.ink); // well
  rect(ctx, 296, 470, 324, 500, daylight ? '#bfae8c' : '#3d4c68', PAL.ink); // outhouse
  rect(ctx, 454, 418, 506, 440, daylight ? '#b39d72' : '#5a6a88', PAL.ink); // woodpile
  // The load by the outhouse, or dropped where it lies.
  if (state.tonight && state.tonight.loadAvailable && !daylight) {
    rect(ctx, OUTHOUSE.x - 12, OUTHOUSE.y - 34, OUTHOUSE.x + 12, OUTHOUSE.y - 24, PAL.amber, PAL.ink);
  }
  if (state.tonight && state.tonight.loadDroppedAt) {
    const d = state.tonight.loadDroppedAt;
    rect(ctx, d.x - 10, d.y - 5, d.x + 10, d.y + 5, PAL.amber, PAL.ink);
  }
  // The pile at the door IS Firing: one course per point, 0..4.
  drawPile(ctx, state.firing, daylight);
  // Felix's tools on the nail: the dusk read of his day.
  if (state.felixFreeToday) {
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(716, 414); ctx.lineTo(716, 424); ctx.moveTo(720, 414); ctx.lineTo(720, 424); ctx.stroke();
  }
  // Lane gate.
  ctx.strokeStyle = PAL.ink2; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(LANE_GATE.x - 12, LANE_GATE.y); ctx.lineTo(LANE_GATE.x + 12, LANE_GATE.y); ctx.stroke();
}

function drawPile(ctx, firing, daylight) {
  for (let i = 0; i < firing; i++) {
    rect(ctx, DOOR.x + 8, DOOR.y + 6 - i * 6, DOOR.x + 34, DOOR.y + 10 - i * 6,
      daylight ? '#8a6f4d' : '#a08c68', PAL.ink);
  }
}

export function drawCreature(ctx, state) {
  const c = state.creature;
  if (c.inHovel) return;
  disc(ctx, c.x, c.y, c.carrying ? 15 : 13, PAL.creature);
  if (c.carrying) rect(ctx, c.x - 14, c.y - 20, c.x + 14, c.y - 12, PAL.amber, PAL.ink);
}

export function drawCottagers(ctx, state) {
  for (const cone of activeCones(state)) {
    const wide = cone.wide || cone.dawnDoor;
    const outerR = wide ? 260 : 150, outerA = wide ? 0.96 : 0.56;
    const innerR = wide ? 165 : 95, innerA = wide ? 0.52 : 0.35;
    wedge(ctx, cone.x, cone.y, cone.angle, outerA, outerR, withAlpha(PAL.cone, 0.18));
    wedge(ctx, cone.x, cone.y, cone.angle, innerA, innerR, withAlpha(PAL.cone, 0.30));
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cone.x, cone.y);
    ctx.arc(cone.x, cone.y, outerR, cone.angle - outerA, cone.angle + outerA);
    ctx.closePath(); ctx.stroke();
    disc(ctx, cone.x, cone.y, 8, cone.owner === 'felix' ? '#6a5a48' : '#7a6a58');
  }
}

export function withAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// The moon arc: the game's only permanent HUD element. No digits, ever.
export function drawMoonArc(ctx, state) {
  const cx = PLATE.w * 0.875, cy = PLATE.h * 0.085, r = 52;
  const frac = state.nightLength > 0 ? Math.max(0, 1 - state.minute / state.nightLength) : 1;
  ctx.strokeStyle = PAL.snow; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * frac); ctx.stroke();
  if (frac > 0 && frac < 1) {
    const a = Math.PI + Math.PI * frac;
    disc(ctx, cx + r * Math.cos(a), cy + r * Math.sin(a), 7, PAL.snow);
  }
  if (frac <= 2 / Math.max(1, state.nightLength) && frac > 0) {
    ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * frac); ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function drawPrompt(ctx, str, opts) {
  if (!str) return;
  const px = Math.round(15 * (opts.textScale || 1));
  rect(ctx, 0, PLATE.h * 0.88, PLATE.w, PLATE.h * 0.96, withAlpha(PAL.paper, 0.88));
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, PLATE.h * 0.88); ctx.lineTo(PLATE.w, PLATE.h * 0.88);
  ctx.moveTo(0, PLATE.h * 0.96); ctx.lineTo(PLATE.w, PLATE.h * 0.96); ctx.stroke();
  text(ctx, str, PLATE.w / 2, PLATE.h * 0.935, px, PAL.ink, 'center');
}

// ---------------------------------------------------------------- the hovel

// The hovel interior is the read-out screen: aperture with the room, the
// slot with the pile, the heap, the plank of scratches.
export function drawHovel(ctx, state, view, opts) {
  rect(ctx, 0, 0, PLATE.w, PLATE.h, PAL.nightDeep);
  // low roof line
  rect(ctx, 0, 0, PLATE.w, 90, '#0c1220');
  // straw
  rect(ctx, 0, 560, PLATE.w, PLATE.h, '#1a2338');
  // The aperture (the chink) with the room inside.
  const ax = 160, ay = 150, aw = 430, ah = 330;
  drawRoom(ctx, state, ax, ay, aw, ah, view, opts);
  // The cold slot, lower right: the yard strip and the pile at the door.
  const sx = 900, sy = 480, sw = 260, sh = 90;
  rect(ctx, sx, sy, sx + sw, sy + sh, view === 'dawn' ? PAL.plate : PAL.nightMid, PAL.ink);
  for (let i = 0; i < state.firing; i++) {
    rect(ctx, sx + 150, sy + sh - 14 - i * 10, sx + 200, sy + sh - 8 - i * 10, '#a08c68', PAL.ink);
  }
  // The heap of his own food on the straw.
  const heap = Math.min(12, state.ownFood);
  if (heap > 0) {
    ctx.fillStyle = '#6a5a3c';
    ctx.beginPath();
    ctx.moveTo(220, 720);
    ctx.lineTo(220 + 30 + heap * 8, 720);
    ctx.lineTo(220 + 15 + heap * 4, 720 - 10 - heap * 6);
    ctx.closePath(); ctx.fill();
  }
  // The plank, and the scratches that ARE Words: grouped in fives, five groups to a row.
  rect(ctx, 460, 620, 860, 730, '#3a3020', PAL.ink2);
  drawScratches(ctx, state.words, 480, 640);
  // The journal bundle.
  if (state.words >= 62 && !state.journalRead) {
    rect(ctx, 880, 660, 930, 700, '#8a7a5c', PAL.ink);
  }
  if (state.journalRead) rect(ctx, 880, 660, 930, 700, '#b0a37e', PAL.ink);
}

function drawScratches(ctx, words, x0, y0) {
  ctx.strokeStyle = PAL.paper; ctx.lineWidth = 1.5;
  let i = 0;
  for (let row = 0; row < 4 && i < words; row++) {
    for (let g = 0; g < 5 && i < words; g++) {
      const gx = x0 + g * 72, gy = y0 + row * 24;
      for (let k = 0; k < 5 && i < words; k++, i++) {
        ctx.beginPath();
        ctx.moveTo(gx + k * 10, gy);
        ctx.lineTo(gx + k * 10 + 3, gy + 14);
        ctx.stroke();
      }
    }
  }
}

// The room through the chink. One composition; state reads as substitution.
function drawRoom(ctx, state, ax, ay, aw, ah, view, opts) {
  // grey-box room plate; the skin layer swaps plate/room under this later
  rect(ctx, ax, ay, ax + aw, ay + ah, '#efe6d2', PAL.ink);
  const dawn = view === 'dawn';
  // The hearth and the fire that scales with Firing.
  const hx = ax + 40, hy = ay + ah - 90;
  rect(ctx, hx - 10, hy - 40, hx + 60, hy + 40, '#c9bda6', PAL.ink2);
  const big = state.firing >= 2;
  ctx.fillStyle = PAL.amber;
  ctx.beginPath();
  ctx.moveTo(hx + 10, hy + 30);
  ctx.lineTo(hx + 40, hy + 30);
  ctx.lineTo(hx + 25, hy + (big ? -30 : 5));
  ctx.closePath(); ctx.fill();
  // The board, carrying Store alone.
  const bx = ax + 190, by = ay + ah - 120;
  rect(ctx, bx, by, bx + 180, by + 16, '#b8a888', PAL.ink2);
  const plates = state.store >= 5 ? 4 : state.store >= 3 ? 3 : 2;
  for (let i = 0; i < plates; i++) disc(ctx, bx + 25 + i * 45, by - 6, 12, '#efe6d2');
  // Figures (blobs at fixed positions; attitudes come with the engraved layer).
  // De Lacey: chair by the hearth, always present.
  disc(ctx, hx + 80, hy + 10, 14, PAL.cottager);
  // Agatha at his feet, or at the board.
  disc(ctx, state.night >= 4 ? bx + 40 : hx + 110, state.night >= 4 ? by - 30 : hy + 35, 12, '#7a6a58');
  // Felix: absent (stool empty) / at the table / chair at the window (unease 3).
  if (state.walkSlipped) { disc(ctx, ax + aw - 70, ay + 80, 13, '#6a5a48'); rect(ctx, ax + aw - 90, ay + 92, ax + aw - 78, ay + 96, '#6a5a48'); }
  else if (state.felixFreeToday) disc(ctx, bx + 150, by - 30, 13, '#6a5a48');
  // Safie from night 4: the only solid black head-mass.
  if (state.night >= 4) disc(ctx, bx + 90, by - 30, 12, '#1a1512');
  // The taper on the sill (unease >= 2) and the stick (unease 3, latched).
  if (state.unease >= 2) disc(ctx, ax + aw - 30, ay + 40, 6, PAL.taper);
  if (state.walkSlipped) {
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(hx + 100, hy + 30); ctx.lineTo(hx + 106, hy - 20); ctx.stroke();
  }
  // The bundle of firing inside the door (Firing >= 2).
  if (state.firing >= 2) rect(ctx, ax + aw - 60, ay + ah - 60, ax + aw - 20, ay + ah - 44, '#a08c68', PAL.ink);
  // The first white flower (the thaw) — degradable, drawn as a dot here.
  if (state.night >= 5) disc(ctx, bx + 165, by - 8, 5, PAL.snow);
}

// ---------------------------------------------------------------- cards & title

export function drawCard(ctx, lines, opts, buttons = []) {
  rect(ctx, 0, 0, PLATE.w, PLATE.h, PAL.nightDeep);
  const x0 = PLATE.w * 0.22, y0 = PLATE.h * 0.30, x1 = PLATE.w * 0.78, y1 = PLATE.h * 0.70;
  rect(ctx, x0, y0, x1, y1, PAL.paper, PAL.ink);
  const px = Math.round(22 * (opts.textScale || 1));
  lines.forEach((ln, i) => {
    text(ctx, ln, PLATE.w / 2, y0 + 60 + i * (px + 18), i === 0 ? 30 : px, PAL.ink, 'center',
      i === 0 ? fontDisp(30) : null);
  });
  const bs = [];
  buttons.forEach((b, i) => {
    const by = y1 - 60 - (buttons.length - 1 - i) * 44;
    text(ctx, b.label, PLATE.w / 2, by, Math.round(19 * (opts.textScale || 1)), b.focus ? PAL.ink : PAL.ink2, 'center');
    if (b.focus) {
      ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.5;
      const w = ctx.measureText(b.label).width;
      ctx.beginPath(); ctx.moveTo(PLATE.w / 2 - w / 2, by + 6); ctx.lineTo(PLATE.w / 2 + w / 2, by + 6); ctx.stroke();
    }
    bs.push({ id: b.id, x: PLATE.w / 2 - 140, y: by - 24, w: 280, h: 34 });
  });
  return bs;
}

export function drawTitle(ctx, state, opts, beat, buttons) {
  // grey box for plate/title: the skin layer swaps the generated plate in.
  rect(ctx, 0, 0, PLATE.w, PLATE.h, PAL.paper);
  rect(ctx, 80, 60, PLATE.w - 80, PLATE.h - 180, PAL.plate, PAL.ink);
  // The cottage at night with one lit window, in flat shapes.
  rect(ctx, 480, 260, 800, 460, PAL.nightMid, PAL.ink);
  if (beat >= 4) rect(ctx, 600, 320, 640, 360, PAL.amber, PAL.ink);
  rect(ctx, 140, 380, 240, 440, PAL.nightDeep, PAL.ink); // the hovel, bottom-left
  if (beat >= 5) {
    text(ctx, STRINGS.title.book, PLATE.w / 2, PLATE.h * 0.78, 30, PAL.ink, 'center', fontDisp(30));
    text(ctx, STRINGS.title.slice, PLATE.w / 2, PLATE.h * 0.825, 20, PAL.ink2, 'center');
  }
  if (beat >= 6) {
    return buttons.map((b, i) => {
      const by = PLATE.h * 0.87 + i * 0.001 + i * 34;
      text(ctx, b.label, PLATE.w / 2, by, 19, b.focus ? PAL.ink : PAL.ink2, 'center');
      if (b.focus) {
        ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.5;
        const w = ctx.measureText(b.label).width;
        ctx.beginPath(); ctx.moveTo(PLATE.w / 2 - w / 2, by + 6); ctx.lineTo(PLATE.w / 2 + w / 2, by + 6); ctx.stroke();
      }
      return { id: b.id, x: PLATE.w / 2 - 160, y: by - 24, w: 320, h: 32 };
    });
  }
  return [];
}

// ---------------------------------------------------------------- the door

export function drawDoorScene(ctx, state, opts, subtitle) {
  // grey box for plate/door: elevation, the room from the doorway.
  rect(ctx, 0, 0, PLATE.w, PLATE.h, '#3a2f22');
  rect(ctx, 300, 100, 980, 700, '#efe6d2', PAL.ink);
  // firelight behind De Lacey
  rect(ctx, 340, 480, 430, 620, PAL.amber, PAL.ink2);
  disc(ctx, 385, 555, 26, '#e8a84c');
  // De Lacey by the fire, head toward the voice.
  disc(ctx, 560, 430, 26, PAL.cottager);
  rect(ctx, 534, 456, 586, 560, PAL.cottager);
  // the guitar set aside
  rect(ctx, 620, 520, 660, 560, '#8a6f4d', PAL.ink);
  // the window onto the lane; a figure appears as the walk ends
  rect(ctx, 780, 240, 920, 400, PAL.snow, PAL.ink);
  if (state.door && state.door.clockTicks < 900) {
    rect(ctx, 830, 300, 856, 380, PAL.ink2);
  }
  // daylight across the floor, lengthening with the clock
  if (state.door) {
    const frac = 1 - state.door.clockTicks / (state.door.slots * 30 * 60 || 1);
    ctx.fillStyle = withAlpha(PAL.snow, 0.35);
    ctx.beginPath();
    ctx.moveTo(300, 700); ctx.lineTo(300 + 300 + frac * 380, 700); ctx.lineTo(300 + 140 + frac * 200, 560); ctx.lineTo(300, 560);
    ctx.closePath(); ctx.fill();
  }
  // the creature's shadow across the floor in front of him
  ctx.fillStyle = withAlpha(PAL.creature, 0.5);
  ctx.beginPath(); ctx.ellipse(420, 660, 120, 22, 0, 0, Math.PI * 2); ctx.fill();
  if (subtitle) {
    rect(ctx, PLATE.w * 0.12, PLATE.h * 0.74, PLATE.w * 0.88, PLATE.h * 0.94, withAlpha(PAL.paper, 0.92));
    subtitle.forEach((ln, i) => {
      const px = Math.round(18 * (opts.textScale || 1));
      text(ctx, ln, PLATE.w / 2, PLATE.h * 0.74 + 42 + i * (px + 14), px, PAL.ink, 'center');
    });
  }
}

export function drawViewportFallback(ctx) {
  rect(ctx, 0, 0, PLATE.w, PLATE.h, PAL.nightDeep);
  rect(ctx, PLATE.w * 0.22, PLATE.h * 0.30, PLATE.w * 0.78, PLATE.h * 0.70, PAL.paper, PAL.ink);
  text(ctx, STRINGS.viewport.line, PLATE.w / 2, PLATE.h * 0.46, 26, PAL.ink, 'center', fontDisp(26));
  text(ctx, STRINGS.viewport.size, PLATE.w / 2, PLATE.h * 0.54, 18, PAL.ink2, 'center');
}
