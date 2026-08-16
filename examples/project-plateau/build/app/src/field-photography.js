import { FAMILY_LAYOUT } from './environment-layout.js';

export const FAMILY_BEHAVIOR_CYCLE_SECONDS = 10;

const CLEAR_HEADING_RADIANS = 0.34;
const EDGE_HEADING_RADIANS = 0.68;

const familyCenter = centerOf(FAMILY_LAYOUT);
const youngPlayCenter = centerOf(
  FAMILY_LAYOUT.filter(({ behaviorRole }) => behaviorRole === 'young-play'),
);
const branchPullCenter = centerOf(
  FAMILY_LAYOUT.filter(({ behaviorRole }) => behaviorRole === 'branch-pull'),
);

function centerOf(subjects) {
  const divisor = Math.max(1, subjects.length);
  return Object.freeze({
    x: subjects.reduce((total, subject) => total + subject.x, 0) / divisor,
    z: subjects.reduce((total, subject) => total + subject.z, 0) / divisor,
  });
}

function wrapAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function targetHeading(position, target) {
  const deltaX = target.x - position.x;
  const deltaZ = target.z - position.z;
  return Math.atan2(-deltaX, -deltaZ);
}

function compositionForTarget(state, target) {
  const error = Math.abs(wrapAngle((state.heading ?? 0) - targetHeading(state.position, target)));
  if (error <= CLEAR_HEADING_RADIANS) return 'clear';
  if (error <= EDGE_HEADING_RADIANS) return 'edge';
  return 'empty';
}

function hasCaptured(state, frameKey) {
  return state.plates.some((plate) => plate.status === 'exposed' && plate.frameKey === frameKey);
}

function emptySubjectFrame(familyMoment) {
  return {
    key: 'empty-subject',
    points: 0,
    label: 'EMPTY — the living subject is outside the plate.',
    exposure: 0,
    composition: 'empty',
    subject: null,
    behavior: null,
    familyMoment,
  };
}

function edgeSubjectFrame(familyMoment) {
  return {
    key: 'family-edge',
    points: 1,
    label: 'FORM — a living shape reaches the plate edge.',
    exposure: 1,
    composition: 'edge',
    subject: 'iguanodon-family',
    behavior: null,
    familyMoment,
  };
}

export function familyMomentForState(state) {
  if (state.reachedGlade && state.threatAwareness >= 3) return 'glade-alarm';
  if (!state.observedBehavior) return 'glade-routine';
  const rawClock = Number.isFinite(state.familyBehaviorSeconds) ? state.familyBehaviorSeconds : 0;
  const clock = ((rawClock % FAMILY_BEHAVIOR_CYCLE_SECONDS) + FAMILY_BEHAVIOR_CYCLE_SECONDS)
    % FAMILY_BEHAVIOR_CYCLE_SECONDS;
  if (clock >= 0.8 && clock < 4.6) return 'glade-young-play';
  if (clock >= 5.2 && clock < 9) return 'glade-branch-pull';
  return 'glade-routine';
}

function familyTargetForMoment(moment) {
  if (moment === 'glade-young-play') return youngPlayCenter;
  if (moment === 'glade-branch-pull') return branchPullCenter;
  return familyCenter;
}

function familyFrameForState(state, baseFrame) {
  const familyMoment = familyMomentForState(state);
  const composition = compositionForTarget(state, familyTargetForMoment(familyMoment));
  if (composition === 'empty') return emptySubjectFrame(familyMoment);
  if (composition === 'edge') return edgeSubjectFrame(familyMoment);

  if (state.zone !== 'iguanodon-glade') {
    return { ...baseFrame, composition, subject: 'iguanodon-family', behavior: null, familyMoment };
  }
  if (!state.observedBehavior || familyMoment === 'glade-routine') {
    return {
      key: 'glade-form',
      points: 1,
      label: 'FORM — the family stands clear; no behavior is committed.',
      exposure: 2,
      composition,
      subject: 'iguanodon-family',
      behavior: null,
      familyMoment,
    };
  }
  if (familyMoment === 'glade-alarm') {
    return {
      key: 'glade-alarm',
      points: 1,
      label: 'ALARM — the family is disturbed; natural behavior is lost.',
      exposure: 2,
      composition,
      subject: 'iguanodon-family',
      behavior: 'alarm',
      familyMoment,
    };
  }

  const behavior = familyMoment === 'glade-young-play' ? 'young-play' : 'branch-pull';
  if (hasCaptured(state, familyMoment)) {
    return {
      key: familyMoment === 'glade-young-play' ? 'glade-young-repeat' : 'glade-branch-repeat',
      points: 1,
      label: `REPEAT — ${behavior === 'young-play' ? 'young play' : 'branch pull'} is already in the case.`,
      exposure: 2,
      composition,
      subject: 'iguanodon-family',
      behavior,
      familyMoment,
    };
  }
  return {
    key: familyMoment,
    points: 2,
    label: behavior === 'young-play'
      ? 'BEHAVIOR — young play, clear and undisturbed.'
      : 'BEHAVIOR — the adult pulls the branch, clear and undisturbed.',
    exposure: 2,
    composition,
    subject: 'iguanodon-family',
    behavior,
    familyMoment,
  };
}

export function frameForState(state) {
  const familyMoment = familyMomentForState(state);
  const frames = {
    fort: {
      key: 'empty-fort', points: 0, label: 'EMPTY — no living subject in frame.', exposure: 0,
      composition: 'empty', subject: null, behavior: null, familyMoment,
    },
    'brook-blind': state.examinedTrack
      ? {
        key: 'brook-partial', points: 1, label: 'PARTIAL — foliage hides the flank.', exposure: 1,
        composition: 'edge', subject: 'iguanodon-family', behavior: null, familyMoment,
      }
      : {
        key: 'brook-unread', points: 0, label: 'UNCLEAR — the track has not been read.', exposure: 1,
        composition: 'unread', subject: null, behavior: null, familyMoment,
      },
    'canopy-overlook': {
      key: 'canopy-flank', points: 1, label: 'FORM — a full flank clears the fern.', exposure: 1,
      composition: 'clear', subject: 'iguanodon-family', behavior: null, familyMoment,
    },
    'basalt-shelf': {
      key: 'basalt-scale', points: 2, label: 'CONTEXT — basalt gives scale.', exposure: 2,
      composition: 'clear', subject: 'iguanodon-family', behavior: null, familyMoment,
    },
    'iguanodon-glade': {
      key: 'glade-form', points: 1, label: 'FORM — the family stands clear.', exposure: 2,
      composition: 'clear', subject: 'iguanodon-family', behavior: null, familyMoment,
    },
    'covered-return': {
      key: 'return-occluded', points: 1, label: 'PARTIAL — thorn hides the body.', exposure: 1,
      composition: 'edge', subject: 'iguanodon-family', behavior: null, familyMoment,
    },
    'exposed-creek': {
      key: 'creek-scale', points: 2, label: 'CONTEXT — the open creek gives scale.', exposure: 2,
      composition: 'clear', subject: 'iguanodon-family', behavior: null, familyMoment,
    },
  };
  const frame = frames[state.zone];
  if (!frame) return frames.fort;
  if (state.zone === 'brook-blind' || state.zone === 'fort') return { ...frame };
  return familyFrameForState(state, frame);
}
