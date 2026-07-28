// The skin layer. Every generated image enters the game through a visual key and
// nothing else references a file path. A key that has not loaded — missing file,
// generation never returned, decode failed — renders as a grey box carrying its own
// key name, the run continues, and the key reports as pending (ART_DIRECTION §15).
//
// Nothing here blocks: images load asynchronously and each one appears the frame
// after it decodes. The greybox is the ground state, not an error state.

const KEYS = {
  'plate/paper': 'assets/plate_paper.webp',
  'plate/title': 'assets/plate_title.webp',
  'plate/room': 'assets/plate_room.webp',
  'plate/hovel': 'assets/plate_hovel.webp',
  'plate/door': 'assets/plate_door.webp',
  'plate/fire': 'assets/plate_fire.webp',
};

// Release-gated per §16.1: absent means the build fails its release gate. It does
// not mean the build fails to run.
const GATED = new Set(Object.keys(KEYS));

const entries = new Map();

export function load() {
  for (const [key, src] of Object.entries(KEYS)) {
    const e = { img: new Image(), ready: false, failed: false };
    e.img.onload = () => { e.ready = true; };
    e.img.onerror = () => { e.failed = true; };
    e.img.src = src;
    entries.set(key, e);
  }
}

/** The decoded image for a key, or null while it is pending or failed. */
export function plate(key) {
  const e = entries.get(key);
  return e && e.ready ? e.img : null;
}

/** Keys still on their greybox fallback — what the completion record has to list. */
export function pending() {
  return [...entries.entries()].filter(([, e]) => !e.ready).map(([k]) => k);
}

export function gatedPending() {
  return pending().filter(k => GATED.has(k));
}

/**
 * Draw a keyed plate into a rect. Returns true if the real plate was drawn, false if
 * the caller should draw its own greybox underneath. The key name is stamped on the
 * greybox so a missing asset is legible on screen instead of looking like a design.
 */
export function drawPlate(ctx, key, x, y, w, h) {
  const img = plate(key);
  if (img) {
    ctx.drawImage(img, x, y, w, h);
    return true;
  }
  return false;
}

/** The key-name stamp for a greybox. Small, secondary, never over a real plate. */
export function stampKey(ctx, key, x, y) {
  ctx.save();
  ctx.font = '11px Georgia, serif';
  ctx.fillStyle = 'rgba(42,33,25,0.55)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(key, x + 6, y + 6);
  ctx.restore();
}
