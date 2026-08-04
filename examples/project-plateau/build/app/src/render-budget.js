export const MAX_RENDER_PIXEL_RATIO = 1.25;

export function renderPixelRatio(devicePixelRatio = 1) {
  return Math.min(Math.max(Number(devicePixelRatio) || 1, 1), MAX_RENDER_PIXEL_RATIO);
}

export function renderIntervalForState({
  runActive = false,
  cameraMode = 'title',
  paused = false,
  hidden = false,
} = {}) {
  if (hidden) return 250;
  if (paused || cameraMode === 'terminal') return 1000 / 15;
  if (!runActive && cameraMode === 'title') return 1000 / 30;
  return 1000 / 60;
}

export function shouldRenderFrame(now, lastRenderedAt, interval) {
  return now - lastRenderedAt >= Math.max(0, interval - 0.75);
}

export function advanceRenderSchedule(now, previousDeadline, interval) {
  if (!Number.isFinite(previousDeadline) || now - previousDeadline > interval * 4) return now;
  const elapsedIntervals = Math.max(1, Math.floor((now - previousDeadline) / interval));
  return previousDeadline + elapsedIntervals * interval;
}
