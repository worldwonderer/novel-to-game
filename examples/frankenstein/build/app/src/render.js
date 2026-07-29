// Grey-box renderer. Flat coloured shapes, no art: the core loop must be
// verified in this state before any engraved work. Every element here is
// later restyled by the engraved layer; the skin layer swaps generated
// plates in underneath the drawn figures on each image's own onload.

import { STRINGS } from './strings.js';
import * as skin from './skin.js';
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

// ART_DIRECTION §9: Libre Caslon Text for body, dialogue and prompts; Libre
// Caslon Display for the title and cards. The faces load through the skin
// layer's font/* keys; until a face resolves (or if it never does) the stack
// falls through to Georgia — the two classes stay distinct either way.
const FONT_BODY = '"Libre Caslon Text", Georgia, "Times New Roman", serif';
const FONT_DISP = '"Libre Caslon Display", Georgia, "Times New Roman", serif';

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
export function wedge(ctx, x, y, angle, halfAngle, reach, fill) {
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

// ------------------------------------------------------- engraving helpers

// Deterministic pseudo-jitter for engraving marks: a hash of the mark's index.
// Never Math.random, and never the engine's seeded RNG — the sim's seed stream
// belongs to the rules, and drawing from it would desync replays. The same
// mark lands the same way on every frame, so nothing flickers.
function det(i, salt = 0) {
  let h = (Math.imul(i + 1, 2654435761) ^ Math.imul(salt + 1, 40503)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1103515245) >>> 0;
  h ^= h >>> 16;
  return (h >>> 8) / 16777216;   // 0..1
}

// The engraving workhorse: parallel ink lines clipped to a rect. Shade is line
// density and brokenness, never a gradient or a soft shadow (ART_DIRECTION
// §16.3). With broken > 0 the lines come out as dashes seeded by line index,
// so the same patch hatches identically on every frame.
export function hatch(ctx, x0, y0, x1, y1, { spacing = 5, angle = 0, colour = PAL.ink, width = 1, broken = 0 } = {}) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const r = Math.hypot(x1 - x0, y1 - y0) / 2 + spacing;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
  ctx.translate(cx, cy); ctx.rotate(angle);
  ctx.strokeStyle = colour; ctx.lineWidth = width;
  let n = 0;
  for (let d = -r; d <= r; d += spacing, n++) {
    ctx.beginPath();
    if (broken > 0) {
      ctx.setLineDash([5 + det(n, 1) * 9, 2 + det(n, 2) * 6 * broken]);
      ctx.lineDashOffset = det(n, 3) * 12;
    }
    ctx.moveTo(-r, d); ctx.lineTo(r, d);
    ctx.stroke();
  }
  ctx.restore();
}

// A board's ragged horizontal edge — the break where the loose plank sits over
// the cold slot. The silhouette is a sawtooth seeded by position along the
// break: the same break every frame, and never a clean 1.5 px rule (TASK 1).
// dir -1: the board mass lies above the edge (teeth hang down); +1: below.
function plankBreak(ctx, x0, x1, y, dir) {
  ctx.fillStyle = PAL.nightDeep;
  ctx.beginPath();
  ctx.moveTo(x0, y + dir * 16);
  ctx.lineTo(x0, y);
  let n = 0;
  for (let x = x0; x < x1 - 6; x += 7, n++) {
    ctx.lineTo(x + 3.5, y - dir * (1.5 + det(n, Math.round(y)) * 8));
    ctx.lineTo(x + 7, y - dir * (0.5 + det(n, 91) * 2.5));
  }
  ctx.lineTo(x1, y);
  ctx.lineTo(x1, y + dir * 16);
  ctx.closePath();
  ctx.fill();
  // the board's face next to the break: broken grain lines on the mass side
  hatch(ctx, x0, dir < 0 ? y - 13 : y + 3, x1, dir < 0 ? y - 3 : y + 13,
    { spacing: 4, angle: 0, colour: withAlpha(PAL.ink2, 0.55), width: 1, broken: 1 });
}

// The slot's end caps: the neighbouring boards' ends, broken off vertical.
// dir -1: the mass lies left of the edge; +1: right.
function plankEnd(ctx, x, y0, y1, dir) {
  ctx.fillStyle = PAL.nightDeep;
  ctx.beginPath();
  ctx.moveTo(x + dir * 8, y0);
  ctx.lineTo(x, y0);
  let n = 0;
  for (let y = y0; y < y1 - 6; y += 7, n++) {
    ctx.lineTo(x - dir * (1.5 + det(n, Math.round(x)) * 6), y + 3.5);
    ctx.lineTo(x - dir * (0.5 + det(n, 37) * 2), y + 7);
  }
  ctx.lineTo(x, y1);
  ctx.lineTo(x + dir * 8, y1);
  ctx.closePath();
  ctx.fill();
}

// The chink's ragged silhouette — the clip the room is drawn through
// (ART_DIRECTION §7.1's "ragged aperture", §16.3's "the aperture mask"). The
// path retraces the tooth lines of the four plankBreak/plankEnd calls in
// drawRoom, shifted 2 px into the room: same 7 px step, same det() salts (the
// break's base y, the end's base x, and the shared 91 / 37), so the boards'
// teeth overlap the room's rim by exactly 2 px everywhere — no room pixel
// reaches the boards outside the gap, and no sliver of the plate shows
// between the teeth and the room. Deterministic per frame, like every mark
// seeded by det(). Keep the coordinates and salts in lockstep with those
// four calls.
export function aperturePath(ctx, ax, ay, aw, ah) {
  const x0 = ax - 6, x1 = ax + aw + 6;         // the breaks' span
  const ty = ay + 12, by = ay + ah - 12;       // the breaks' base lines
  const lx = ax + 10, rx = ax + aw - 10;       // the ends' base lines
  const ey0 = ay + 12, ey1 = ay + ah - 12;     // the ends' span
  ctx.beginPath();
  // top edge, left to right (plankBreak ty, dir -1, shifted 2 px down)
  let n = 0;
  for (let x = x0; x < x1 - 6; x += 7, n++) {
    const deep = ty + 2 + (1.5 + det(n, Math.round(ty)) * 8);
    const shallow = ty + 2 + (0.5 + det(n, 91) * 2.5);
    if (x === x0) ctx.moveTo(x + 3.5, deep); else ctx.lineTo(x + 3.5, deep);
    ctx.lineTo(x + 7, shallow);
  }
  // right edge, top to bottom (plankEnd rx, dir +1, shifted 2 px left)
  n = 0;
  for (let y = ey0; y < ey1 - 6; y += 7, n++) {
    ctx.lineTo(rx - 2 - (1.5 + det(n, Math.round(rx)) * 6), y + 3.5);
    ctx.lineTo(rx - 2 - (0.5 + det(n, 37) * 2), y + 7);
  }
  // bottom edge, right to left (plankBreak by, dir +1, shifted 2 px up)
  const bot = [];
  for (let x = x0, m = 0; x < x1 - 6; x += 7, m++) bot.push([x, m]);
  for (let i = bot.length - 1; i >= 0; i--) {
    const [x, m] = bot[i];
    ctx.lineTo(x + 7, by - 2 - (0.5 + det(m, 91) * 2.5));
    ctx.lineTo(x + 3.5, by - 2 - (1.5 + det(m, Math.round(by)) * 8));
  }
  // left edge, bottom to top (plankEnd lx, dir -1, shifted 2 px right)
  const lef = [];
  for (let y = ey0, m = 0; y < ey1 - 6; y += 7, m++) lef.push([y, m]);
  for (let i = lef.length - 1; i >= 0; i--) {
    const [y, m] = lef[i];
    ctx.lineTo(lx + 2 + (0.5 + det(m, 37) * 2), y + 7);
    ctx.lineTo(lx + 2 + (1.5 + det(m, Math.round(lx)) * 6), y + 3.5);
  }
  ctx.closePath();
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

// The pile at the door IS Firing: one course per point, 0..4. One drawing
// serves both of its reads — the yard plan, and the strip of yard seen through
// the cold slot (ART_DIRECTION §7.1, §16.3 "the pile courses") — so the two
// can never drift into separate implementations. `at` carries only the frame
// geometry; the stacking rule is shared.
function drawPile(ctx, firing, daylight, at = {}) {
  const g = { x: DOOR.x + 8, yBase: DOOR.y + 10, w: 26, courseH: 4, step: 6, ...at };
  const fill = daylight ? '#8a6f4d' : '#a08c68';
  for (let i = 0; i < firing; i++) {
    const off = (det(i, 17) - 0.5) * 2;          // courses never stack machine-true
    const y1 = g.yBase - i * g.step, y0 = y1 - g.courseH;
    rect(ctx, g.x + off, y0, g.x + g.w + off, y1, fill, PAL.ink);
    // grain along the course: one broken cut line, two when the course is tall
    const grains = g.courseH >= 6 ? 2 : 1;
    ctx.strokeStyle = withAlpha(PAL.ink, 0.75); ctx.lineWidth = 1;
    for (let k = 0; k < grains; k++) {
      const gy = y0 + (g.courseH * (k + 1)) / (grains + 1);
      ctx.setLineDash([4 + det(i, 50 + k) * 5, 2 + det(i, 60 + k) * 3]);
      ctx.beginPath();
      ctx.moveTo(g.x + off + 2 + det(i, 30 + k) * 4, gy);
      ctx.lineTo(g.x + g.w + off - 2 - det(i, 40 + k) * 4, gy);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // the log end, when the course is big enough to carry it
    if (g.courseH >= 5) {
      ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(g.x + off + 3, (y0 + y1) / 2, 1.8, g.courseH * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
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
  if (!skin.drawPlate(ctx, 'plate/hovel', 0, 0, PLATE.w, PLATE.h)) {
    rect(ctx, 0, 0, PLATE.w, PLATE.h, PAL.nightDeep);
    // low roof line
    rect(ctx, 0, 0, PLATE.w, 90, '#0c1220');
    // straw
    rect(ctx, 0, 560, PLATE.w, PLATE.h, '#1a2338');
    skin.stampKey(ctx, 'plate/hovel', 0, 96);
  }
  // The aperture (the chink) with the room inside.
  const ax = 160, ay = 150, aw = 430, ah = 330;
  drawRoom(ctx, state, ax, ay, aw, ah, view, opts);
  // The cold slot, lower right: the yard strip and the pile at the door.
  drawColdSlot(ctx, state, view);
  // Everything on the straw sits above the prompt band (0.88h = 704). The band is
  // opaque paper; anything drawn under it is simply not readable, and §3.3 puts
  // occlusion tolerance at zero. Heap, plank and bundle are raised to clear it.
  const FLOOR = 690;
  // The heap of his own food on the straw.
  const heap = Math.min(12, state.ownFood);
  if (heap > 0) {
    ctx.fillStyle = '#6a5a3c';
    ctx.beginPath();
    ctx.moveTo(220, FLOOR);
    ctx.lineTo(220 + 30 + heap * 8, FLOOR);
    ctx.lineTo(220 + 15 + heap * 4, FLOOR - 10 - heap * 6);
    ctx.closePath(); ctx.fill();
  }
  // The plank, and the scratches that ARE Words: grouped in fives, five groups to a row.
  // The board is engraved, not filled: grain lines run with the plank, the ends
  // show end-grain, the top edge catches the room's light and the foot sits on
  // a hatched contact shadow. drawScratches itself is left exactly as it was.
  const px0 = 460, py0 = FLOOR - 130, px1 = 860, py1 = FLOOR - 20;
  rect(ctx, px0, py0, px1, py1, '#3a3020');
  hatch(ctx, px0 + 2, py0 + 2, px1 - 2, py1 - 2,
    { spacing: 6, angle: 0, colour: withAlpha(PAL.ink, 0.7), width: 1, broken: 1.1 });
  hatch(ctx, px0, py0, px0 + 10, py1,
    { spacing: 4, angle: Math.PI / 2, colour: withAlpha(PAL.ink, 0.55), width: 1, broken: 0.8 });
  hatch(ctx, px1 - 10, py0, px1, py1,
    { spacing: 4, angle: Math.PI / 2, colour: withAlpha(PAL.ink, 0.55), width: 1, broken: 0.8 });
  for (let k = 0; k < 3; k++) {                 // knots, seeded not random
    const kx = px0 + 50 + det(k, 71) * (px1 - px0 - 100);
    const ky = py0 + 16 + det(k, 72) * (py1 - py0 - 32);
    ctx.strokeStyle = withAlpha(PAL.ink, 0.8); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(kx, ky, 4.5, 2.4, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(kx, ky, 2, 1, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.strokeStyle = PAL.ink2; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px1, py0); ctx.stroke();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(px0, py1); ctx.lineTo(px1, py1); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px0, py1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px1, py0); ctx.lineTo(px1, py1); ctx.stroke();
  hatch(ctx, px0 + 4, py1 + 1, px1 - 4, py1 + 11,
    { spacing: 3, angle: 0, colour: withAlpha(PAL.ink, 0.45), width: 1, broken: 1 });
  drawScratches(ctx, state.words, 480, FLOOR - 110);
  // The journal bundle.
  if (state.words >= 62 && !state.journalRead) drawJournal(ctx, FLOOR, false);
  if (state.journalRead) drawJournal(ctx, FLOOR, true);
}

// The cold slot, lower right: not a swatch but a strip of the yard seen
// through the gap where the loose plank sits — ground, the corner of the
// cottage, and the pile of cut wood at the door (ART_DIRECTION §7.1). The
// gap's edges are the boards' own broken ends, not a stroked rect.
function drawColdSlot(ctx, state, view) {
  const sx = 900, sy = 480, sw = 260, sh = 90;
  const dawn = view === 'dawn';
  const hz = sy + sh - 24;                       // the yard's ground line
  // night air above the yard, then the ground itself: the holding's night
  // plate, carried into lines
  rect(ctx, sx, sy, sx + sw, sy + sh, dawn ? PAL.plate : PAL.nightMid);
  hatch(ctx, sx, sy + 6, sx + sw, hz - 4,
    { spacing: 9, angle: 0, colour: withAlpha(dawn ? PAL.ink2 : PAL.snow, 0.16), width: 1, broken: 1.4 });
  hatch(ctx, sx, hz, sx + sw, sy + sh,
    { spacing: 4, angle: 0, colour: withAlpha(dawn ? PAL.ink2 : PAL.snow, 0.5), width: 1, broken: 0.9 });
  // the corner of the cottage: weatherboards, and the shadow side of the turn
  const wx0 = sx + 14, wx1 = sx + 112;
  rect(ctx, wx0, sy, wx1, hz, dawn ? '#cbbf9f' : '#4a5a78');
  hatch(ctx, wx0, sy, wx1, hz,
    { spacing: 7, angle: Math.PI / 2, colour: withAlpha(PAL.ink, 0.65), width: 1, broken: 0.5 });
  hatch(ctx, wx1 - 18, sy, wx1, hz,
    { spacing: 3.5, angle: Math.PI / 2, colour: withAlpha(PAL.ink, 0.8), width: 1, broken: 0.3 });
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(wx1, sy); ctx.lineTo(wx1, hz); ctx.stroke();
  // the pile of cut wood at the door, against the corner — the same courses
  // the yard plan draws
  drawPile(ctx, state.firing, dawn, { x: sx + 96, yBase: sy + sh - 9, w: 48, courseH: 6, step: 10 });
  hatch(ctx, sx + 92, sy + sh - 8, sx + 152, sy + sh - 2,
    { spacing: 2.5, angle: 0, colour: withAlpha(PAL.ink, 0.6), width: 1, broken: 0.7 });
  // and over everything, the gap itself: the boards' ragged breaks and ends
  plankBreak(ctx, sx - 6, sx + sw + 6, sy + 2, -1);
  plankBreak(ctx, sx - 6, sx + sw + 6, sy + sh - 2, 1);
  plankEnd(ctx, sx + 2, sy + 2, sy + sh - 2, -1);
  plankEnd(ctx, sx + sw - 2, sy + 2, sy + sh - 2, 1);
}

// The journal bundle: a sewn paper parcel on the straw, drawn in lines. While
// unread it stays a dark, cord-tied packet; read, it lies paler with its
// leaves fanned — the two states must read apart at a glance (TASK 4).
function drawJournal(ctx, FLOOR, read) {
  const bx = 880, by = FLOOR - 90, bw = 50, bh = 40;
  rect(ctx, bx, by, bx + bw, by + bh, read ? '#b0a37e' : '#8a7a5c');
  // the parcel's volume: shade gathered toward the foot, in lines
  hatch(ctx, bx + 1, by + bh * 0.5, bx + bw - 1, by + bh - 1,
    { spacing: 3, angle: -0.45, colour: withAlpha(PAL.ink, read ? 0.4 : 0.65), width: 1, broken: 0.7 });
  hatch(ctx, bx + 1, by + 1, bx + bw - 1, by + bh * 0.5,
    { spacing: 5, angle: -0.45, colour: withAlpha(PAL.ink, read ? 0.25 : 0.4), width: 1, broken: 1 });
  if (read) {
    // open leaves: three page edges fanning from the fold
    ctx.strokeStyle = PAL.ink2; ctx.lineWidth = 1;
    for (let k = 0; k < 3; k++) {
      const ly = by + 8 + k * 7;
      ctx.beginPath(); ctx.moveTo(bx + 6, ly); ctx.lineTo(bx + bw - 8 - det(k, 81) * 6, ly + 1); ctx.stroke();
    }
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bx + 6, by + 5); ctx.lineTo(bx + 6, by + bh - 6); ctx.stroke();
  } else {
    // the cord: one wrap each way, and the knot
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.58, by); ctx.lineTo(bx + bw * 0.58, by + bh);
    ctx.moveTo(bx, by + bh * 0.42); ctx.lineTo(bx + bw, by + bh * 0.42);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(bx + bw * 0.58, by + bh * 0.42, 2.4, 0, Math.PI * 2); ctx.stroke();
  }
  // the folded corner
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(bx + bw - 9, by); ctx.lineTo(bx + bw, by + 9); ctx.stroke();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.5;
  ctx.strokeRect(bx, by, bw, bh);
  // contact shadow on the straw, in lines
  hatch(ctx, bx + 3, by + bh + 1, bx + bw + 6, by + bh + 8,
    { spacing: 2.5, angle: 0, colour: withAlpha(PAL.ink, 0.4), width: 1, broken: 1 });
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
// The aperture is the torn gap of §7.1, not a rectangle: the room is clipped
// to aperturePath and the boards' broken edges are laid over the seam — the
// same break language as the cold slot, seeded by det(), identical every
// frame. The straight stroked rule is gone with the rectangle.
function drawRoom(ctx, state, ax, ay, aw, ah, view, opts) {
  ctx.save();
  aperturePath(ctx, ax, ay, aw, ah);
  ctx.clip();
  // plate/room is the empty stage; every figure and state object is drawn on top.
  if (!skin.drawPlate(ctx, 'plate/room', ax, ay, aw, ah)) {
    rect(ctx, ax, ay, ax + aw, ay + ah, '#efe6d2', PAL.ink);
    skin.stampKey(ctx, 'plate/room', ax + 18, ay + 22);   // inside the mask
  }
  const dawn = view === 'dawn';
  // Anchors are fractions of the aperture so the drawn state objects register on
  // plate/room's real features (hearth mouth, board, window) instead of on the
  // positions the greybox happened to use. Measured off the plate itself.
  const A = (fx, fy) => ({ x: ax + fx * aw, y: ay + fy * ah });
  const HEARTH = { mouth: A(0.21, 0.62), floor: A(0.21, 0.79), w: aw * 0.23 };
  const BOARD = { left: A(0.55, 0.60), right: A(0.93, 0.60), top: A(0.55, 0.585) };
  const STOOL = A(0.715, 0.80);
  const WINDOW = A(0.81, 0.33);

  // The fire in the hearth mouth, scaling with Firing. Nothing is drawn when the
  // hearth is cold: the empty mouth is already on the plate.
  if (state.firing > 0) {
    const big = state.firing >= 2;
    const fw = HEARTH.w * (big ? 0.62 : 0.4);
    const fh = ah * (big ? 0.20 : 0.10);
    const g = ctx.createRadialGradient(HEARTH.floor.x, HEARTH.floor.y, 2,
      HEARTH.floor.x, HEARTH.floor.y, fw * 1.6);
    g.addColorStop(0, withAlpha(PAL.amber, 0.95));
    g.addColorStop(1, withAlpha(PAL.amber, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(HEARTH.floor.x, HEARTH.floor.y, fw * 1.6, fh * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.amber;
    ctx.beginPath();
    ctx.moveTo(HEARTH.floor.x - fw / 2, HEARTH.floor.y);
    ctx.lineTo(HEARTH.floor.x + fw / 2, HEARTH.floor.y);
    ctx.lineTo(HEARTH.floor.x, HEARTH.floor.y - fh);
    ctx.closePath(); ctx.fill();
  }
  // The board carries Store alone: plates stand on the real table top.
  const plates = state.store >= 5 ? 4 : state.store >= 3 ? 3 : 2;
  const span = BOARD.right.x - BOARD.left.x;
  for (let i = 0; i < plates; i++) {
    const px = BOARD.left.x + span * ((i + 0.5) / plates);
    disc(ctx, px, BOARD.top.y, Math.max(4, aw * 0.018), '#efe6d2');
    ctx.strokeStyle = PAL.ink2; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(px, BOARD.top.y, Math.max(4, aw * 0.018), 0, Math.PI * 2); ctx.stroke();
  }
  // Figures, at room scale. De Lacey never walks alone; Agatha moves to the board
  // once Safie is in the house.
  const headR = Math.max(5, aw * 0.026);
  const figure = (pt, fill, r = headR) => {
    disc(ctx, pt.x, pt.y, r, fill);
    ctx.fillStyle = fill;
    ctx.fillRect(pt.x - r * 0.8, pt.y + r * 0.6, r * 1.6, r * 2.2);
  };
  figure(A(0.33, 0.62), PAL.cottager);                       // De Lacey, chair by the hearth
  figure(state.night >= 4 ? A(0.62, 0.66) : A(0.40, 0.72), '#7a6a58', headR * 0.9); // Agatha
  if (state.walkSlipped) figure({ x: WINDOW.x, y: WINDOW.y + ah * 0.20 }, '#6a5a48'); // Felix at the window
  else if (state.felixFreeToday) figure(A(0.86, 0.66), '#6a5a48');                    // Felix at the table
  if (state.night >= 4) figure(A(0.74, 0.66), '#1a1512', headR * 0.9);                // Safie
  // The taper on the sill (unease >= 2) and the latched stick (unease 3).
  if (state.unease >= 2) {
    disc(ctx, WINDOW.x, WINDOW.y, Math.max(3, aw * 0.012), PAL.taper);
  }
  if (state.walkSlipped) {
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(STOOL.x, STOOL.y);
    ctx.lineTo(STOOL.x + aw * 0.02, STOOL.y - ah * 0.14);
    ctx.stroke();
  }
  // The bundle of firing inside the door (Firing >= 2).
  if (state.firing >= 2) {
    rect(ctx, ax + aw * 0.90, ay + ah * 0.80, ax + aw * 0.99, ay + ah * 0.86, '#a08c68', PAL.ink);
  }
  // The first white flower (the thaw) — degradable, drawn as a dot here.
  if (state.night >= 5) disc(ctx, BOARD.right.x - aw * 0.03, BOARD.top.y - ah * 0.02, Math.max(3, aw * 0.011), PAL.snow);
  ctx.restore();
  // The boards' broken edges over the seam, exactly the cold slot's language.
  // aperturePath retraces these tooth lines 2 px in, so the teeth always
  // overlap the room's rim — keep the four calls in lockstep with it.
  plankBreak(ctx, ax - 6, ax + aw + 6, ay + 12, -1);
  plankBreak(ctx, ax - 6, ax + aw + 6, ay + ah - 12, 1);
  plankEnd(ctx, ax + 10, ay + 12, ay + ah - 12, -1);
  plankEnd(ctx, ax + aw - 10, ay + 12, ay + ah - 12, 1);
  // A second, staggered ring: the first ring's own outer edges would else be
  // straight rules and the gap would sit in a rectangular dark frame. These
  // breaks cover those edges (each mass overlaps the inner ring's) and their
  // teeth point outward into the plate, so the dark zone's outer silhouette
  // is a tooth line too and the corners step instead of squaring off.
  plankBreak(ctx, ax + 18, ax + aw - 14, ay - 6, 1);
  plankBreak(ctx, ax + 18, ax + aw - 14, ay + ah + 18, -1);
  plankEnd(ctx, ax - 4, ay - 10, ay + ah + 10, 1);
  plankEnd(ctx, ax + aw + 14, ay - 10, ay + ah + 10, -1);
  // plankEnd carries no grain of its own; the side boards run with the
  // plate's vertical planks, so the grain here is vertical, in lines.
  hatch(ctx, ax - 2, ay + 16, ax + 8, ay + ah - 16,
    { spacing: 5, angle: Math.PI / 2, colour: withAlpha(PAL.ink2, 0.5), width: 1, broken: 1 });
  hatch(ctx, ax + aw - 8, ay + 16, ax + aw + 2, ay + ah - 16,
    { spacing: 5, angle: Math.PI / 2, colour: withAlpha(PAL.ink2, 0.5), width: 1, broken: 1 });
}

// ---------------------------------------------------------------- cards & title

// The card's paper, centred on the plate. Card ink must never leave it: the
// paper is the one light ground on a night-deep plate, so a glyph off its
// edge is a glyph lost (QA_REPORT F8). The sheet itself grows with the
// text-size setting — a reader who asks for larger type gets a larger
// sheet, not the same sheet with the shrink ladder quietly eating the
// difference (QA_REPORT F10b) — and it never crosses the air the moon arc
// (bottom edge 0.085h + 52 + stroke ~= 122) and the prompt band (top
// 0.88h = 704) need, nor the plate's side margins.
const CARD_BASE_W = PLATE.w * 0.56;   // 716.8 at textScale 1 — the F8 geometry
const CARD_BASE_H = PLATE.h * 0.40;   // 320, centred on the plate
const CARD_LIMITS = { x0: 96, y0: 132, x1: PLATE.w - 96, y1: 688 };
const CARD_PAD_X = 56;         // inner side margins: ink never nears the deckle
const CARD_PAD_TOP = 24;
const CARD_PAD_BOTTOM = 20;
const CARD_SHRINK = [1, 0.92, 0.85, 0.78, 0.72, 0.66, 0.6, 0.54];

// ART_DIRECTION §9, transcribed: card body 22 px with a floor of 13 px it
// "must never cross"; the first line 30 px (§9 sets it no floor — 14 stays
// as the ladder's last resort); leading 1.5; measure <= 62 characters.
// §9's sizes are "before the text-size multiplier", so both classes take
// the multiplier here.
const CARD_BODY = 22, CARD_BODY_FLOOR = 13;
const CARD_TITLE = 30, CARD_TITLE_FLOOR = 14;
const CARD_LEADING = 1.5;
const CARD_MEASURE = 62;
// The measure turned into pixels is measured, not assumed: 62 characters of
// the game's own prose in the line's own face and size. Caslon sets wider
// than the Georgia stack the layout was tuned against, so any carried-over
// constant would wrap at the wrong place (TASK F10). Exactly CARD_MEASURE
// characters by construction.
const MEASURE_SAMPLE = ('for many months i have lived against your wall and i have learned '
  + 'your speech by listening at the chink').slice(0, CARD_MEASURE);

function cardPaper(scale) {
  const w = Math.min(CARD_BASE_W * scale, CARD_LIMITS.x1 - CARD_LIMITS.x0);
  const h = Math.min(CARD_BASE_H * scale, CARD_LIMITS.y1 - CARD_LIMITS.y0);
  return {
    x0: Math.max(CARD_LIMITS.x0, PLATE.w / 2 - w / 2),
    x1: Math.min(CARD_LIMITS.x1, PLATE.w / 2 + w / 2),
    y0: Math.max(CARD_LIMITS.y0, PLATE.h / 2 - h / 2),
    y1: Math.min(CARD_LIMITS.y1, PLATE.h / 2 + h / 2),
  };
}

// Wrap one logical line to physical lines measuring <= maxWidth AND holding
// <= maxChars characters, word by word (the same measureText walk glossText
// does). §9's two caps both bind: a line breaks at whichever it reaches
// first, so the gate can assert the measure in characters as well as pixels
// and never find a narrow-lettered line sneaking past 62. A single word
// wider than the measure stays whole on its own line — the layout reports
// the overflow rather than breaking the word.
function wrapCardLine(ctx, str, font, maxWidth, maxChars) {
  ctx.font = font;
  const space = ctx.measureText(' ').width;
  const out = [];
  let cur = '', curW = 0;
  for (const w of str.split(' ')) {
    const ww = ctx.measureText(w).width;
    if (cur && (curW + space + ww > maxWidth || cur.length + 1 + w.length > maxChars)) {
      out.push({ str: cur, width: curW });
      cur = w; curW = ww;
    } else {
      cur = cur ? cur + ' ' + w : w;
      curW = curW ? curW + space + ww : ww;
    }
  }
  if (cur) out.push({ str: cur, width: curW });
  return out;
}

// Pure layout for drawCard; measures, never draws. §9's setting: single
// column, left-aligned, ragged right. Every logical line wraps to the
// narrower of the paper's inner width and the 62-character measure in its
// own face, then the ladder steps type down — leading holds at 1.5 at every
// rung — until the block clears the paper's foot and the button zone
// anchored there. Nothing is truncated and nothing leaves the paper; if the
// smallest setting still misfits it is returned as-is and the QA gate fails
// loudly instead of spilling ink onto the night.
export function layoutCard(ctx, lines, opts = {}, buttons = []) {
  const scale = opts.textScale || 1;
  const paper = cardPaper(scale);
  const innerW = (paper.x1 - paper.x0) - CARD_PAD_X * 2;
  const textX = paper.x0 + CARD_PAD_X;
  const textTop0 = paper.y0 + CARD_PAD_TOP;
  // Buttons anchor at the paper's foot (drawCard keeps their geometry); the
  // text block must end above the topmost button's hit zone.
  const textLimit = buttons.length
    ? paper.y1 - 60 - (buttons.length - 1) * 44 - 30
    : paper.y1 - CARD_PAD_BOTTOM;
  // §9's leading, per line size, with one pixel of air as the degenerate
  // floor so a line can never sit on its own ascenders.
  const leadOf = (px) => Math.max(px + 1, Math.round(px * CARD_LEADING));
  let laid = null;
  for (const shrink of CARD_SHRINK) {
    const pxTitle = Math.max(CARD_TITLE_FLOOR, Math.round(CARD_TITLE * scale * shrink));
    const px = Math.max(CARD_BODY_FLOOR, Math.round(CARD_BODY * scale * shrink));
    ctx.font = fontDisp(pxTitle);
    const titleMeasure = ctx.measureText(MEASURE_SAMPLE).width;
    ctx.font = fontBody(px);
    const bodyMeasure = ctx.measureText(MEASURE_SAMPLE).width;
    const phys = [];
    lines.forEach((ln, i) => {
      const disp = i === 0, p = disp ? pxTitle : px;
      const wrapW = Math.min(innerW, disp ? titleMeasure : bodyMeasure);
      for (const w of wrapCardLine(ctx, ln, disp ? fontDisp(p) : fontBody(p), wrapW, CARD_MEASURE)) {
        phys.push({ ...w, px: p, disp, x: textX });
      }
    });
    let baseline = textTop0 + (phys.length ? phys[0].px : 0);
    for (const l of phys) { l.baseline = baseline; baseline += leadOf(l.px); }
    const textTop = phys.length ? phys[0].baseline - 0.8 * phys[0].px : textTop0;
    const textBottom = phys.length
      ? phys[phys.length - 1].baseline + 0.35 * phys[phys.length - 1].px : textTop0;
    laid = {
      lines: phys, shrink, px, pxTitle, leading: leadOf(px), innerW, textX, align: 'left',
      measureChars: CARD_MEASURE,
      paperX0: paper.x0, paperY0: paper.y0, paperX1: paper.x1, paperY1: paper.y1,
      paperTop: paper.y0, paperBottom: paper.y1, padX: CARD_PAD_X,
      textTop, textBottom, textLimit,
      totalH: textBottom - textTop, availH: textLimit - textTop0,
    };
    if (textBottom <= textLimit) return laid;
  }
  return laid;
}

export function drawCard(ctx, lines, opts, buttons = []) {
  const laid = layoutCard(ctx, lines, opts, buttons);
  rect(ctx, 0, 0, PLATE.w, PLATE.h, PAL.nightDeep);
  rect(ctx, laid.paperX0, laid.paperY0, laid.paperX1, laid.paperY1, PAL.paper, PAL.ink);
  for (const ln of laid.lines) {
    text(ctx, ln.str, ln.x, ln.baseline, ln.px, PAL.ink, 'left',
      ln.disp ? fontDisp(ln.px) : null);
  }
  // The foot verbs are §8.4 letterpress buttons, not card text: they stay
  // centred on the paper like the title plate's verbs, hit boxes unchanged.
  const bs = [];
  buttons.forEach((b, i) => {
    const by = laid.paperY1 - 60 - (buttons.length - 1 - i) * 44;
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
  // plate/title through the skin layer; greybox with the key name until it loads.
  if (!skin.drawPlate(ctx, 'plate/paper', 0, 0, PLATE.w, PLATE.h)) {
    rect(ctx, 0, 0, PLATE.w, PLATE.h, PAL.paper);
  }
  // The plate stops at 0.72h so the title block below it clears the platemark.
  // At PLATE.h-180 the 30 px title sat on the border line and the rule cut the
  // letterforms — §3.3 puts occlusion tolerance at zero.
  const tx = 80, ty = 60, tw = PLATE.w - 160, th = PLATE.h * 0.72 - 60;
  if (skin.drawPlate(ctx, 'plate/title', tx, ty, tw, th)) {
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.5;
    ctx.strokeRect(tx, ty, tw, th);
  } else {
    rect(ctx, tx, ty, PLATE.w - 80, PLATE.h * 0.72, PAL.plate, PAL.ink);
    // The cottage at night with one lit window, in flat shapes.
    rect(ctx, 480, 260, 800, 460, PAL.nightMid, PAL.ink);
    if (beat >= 4) rect(ctx, 600, 320, 640, 360, PAL.amber, PAL.ink);
    rect(ctx, 140, 380, 240, 440, PAL.nightDeep, PAL.ink); // the hovel, bottom-left
    skin.stampKey(ctx, 'plate/title', tx, ty);
  }
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
  // plate/door: the room from the doorway. Figures and the clock draw over it.
  if (!skin.drawPlate(ctx, 'plate/door', 0, 0, PLATE.w, PLATE.h)) {
    rect(ctx, 0, 0, PLATE.w, PLATE.h, '#3a2f22');
    rect(ctx, 300, 100, 980, 700, '#efe6d2', PAL.ink);
    skin.stampKey(ctx, 'plate/door', 300, 100);
  }
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
