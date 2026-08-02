import assert from 'node:assert/strict';
import test from 'node:test';

import {resolveScenarioReference, validateProjectTrialCasting} from './tts-casting.mjs';

const profile = (castingId, gender) => ({
  casting_id: castingId,
  role: 'character',
  gender_presentation: gender,
  age_presentation: 'adult',
  delivery: 'clear and restrained',
  must_not_sound_like: 'a generic narrator',
});

test('project trials require explicit speaker casting and distinct voice references', () => {
  const scenarios = [
    {
      id: 'female-character', scope: 'project-trial', source: 'generate', speaker: 'A',
      reference_env: 'FISH_REFERENCE_ID_CHARACTER_A', voice_profile: profile('character-a', 'female'),
    },
    {
      id: 'male-character', scope: 'project-trial', source: 'generate', speaker: 'B',
      reference_env: 'FISH_REFERENCE_ID_CHARACTER_B', voice_profile: profile('character-b', 'male'),
    },
  ];
  assert.equal(validateProjectTrialCasting(scenarios), true);
  assert.throws(
    () => validateProjectTrialCasting([{...scenarios[1], reference_env: scenarios[0].reference_env}, scenarios[0]]),
    /already assigned to another character/,
  );
});

test('a named character voice never falls back to a generic language voice', () => {
  const scenario = {id: 'character-a', language: 'zh-Hans', reference_env: 'FISH_REFERENCE_ID_CHARACTER_A'};
  assert.throws(
    () => resolveScenarioReference({scenario, environment: {FISH_REFERENCE_ID_ZH: 'generic-zh'}}),
    /do not replace character casting with a generic language voice/,
  );
  assert.deepEqual(
    resolveScenarioReference({scenario, environment: {FISH_REFERENCE_ID_CHARACTER_A: 'specific-a'}}),
    {referenceId: 'specific-a', referenceEnv: 'FISH_REFERENCE_ID_CHARACTER_A'},
  );
});

test('QA matrix scenarios may retain language-level fallback voices', () => {
  assert.deepEqual(
    resolveScenarioReference({
      scenario: {id: 'matrix-zh', language: 'zh-Hans'},
      environment: {FISH_REFERENCE_ID: 'generic', FISH_REFERENCE_ID_ZH: 'generic-zh'},
    }),
    {referenceId: 'generic-zh', referenceEnv: 'FISH_REFERENCE_ID_ZH'},
  );
});
