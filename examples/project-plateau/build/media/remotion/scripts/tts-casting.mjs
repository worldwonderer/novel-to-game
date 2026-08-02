const REFERENCE_ENV = /^FISH_REFERENCE_ID_[A-Z0-9_]+$/;

const REQUIRED_PROFILE_FIELDS = [
  'casting_id',
  'role',
  'gender_presentation',
  'age_presentation',
  'delivery',
  'must_not_sound_like',
];

export function validateProjectTrialCasting(scenarios) {
  const trials = scenarios.filter((scenario) => scenario.scope === 'project-trial');
  const castingIds = new Set();
  const generatedReferenceEnvs = new Set();

  for (const scenario of trials) {
    if (!scenario.speaker?.trim()) throw new Error(`${scenario.id}: speaker is required for a project trial.`);
    const profile = scenario.voice_profile;
    if (!profile || typeof profile !== 'object') throw new Error(`${scenario.id}: voice_profile is required.`);
    for (const field of REQUIRED_PROFILE_FIELDS) {
      if (!String(profile[field] || '').trim()) throw new Error(`${scenario.id}: voice_profile.${field} is required.`);
    }
    if (castingIds.has(profile.casting_id)) {
      throw new Error(`${scenario.id}: casting_id ${profile.casting_id} is already assigned to another trial.`);
    }
    castingIds.add(profile.casting_id);

    if (scenario.source !== 'generate') continue;
    if (!REFERENCE_ENV.test(scenario.reference_env || '')) {
      throw new Error(`${scenario.id}: a scenario-specific FISH_REFERENCE_ID_* reference_env is required.`);
    }
    if (generatedReferenceEnvs.has(scenario.reference_env)) {
      throw new Error(`${scenario.id}: ${scenario.reference_env} is already assigned to another character.`);
    }
    generatedReferenceEnvs.add(scenario.reference_env);
  }
  return true;
}

export function resolveScenarioReference({scenario, environment = process.env}) {
  if (scenario.reference_env) {
    const referenceId = environment[scenario.reference_env];
    if (!referenceId) {
      throw new Error(`${scenario.id}: ${scenario.reference_env} is required; do not replace character casting with a generic language voice.`);
    }
    return {referenceId, referenceEnv: scenario.reference_env};
  }

  const generic = environment.FISH_REFERENCE_ID;
  const chinese = environment.FISH_REFERENCE_ID_ZH;
  const referenceId = scenario.language?.startsWith('zh') ? chinese || generic : generic || chinese;
  if (!referenceId) {
    throw new Error(`${scenario.id}: FISH_REFERENCE_ID or FISH_REFERENCE_ID_ZH is required for this QA-matrix voice.`);
  }
  return {
    referenceId,
    referenceEnv: scenario.language?.startsWith('zh') && chinese ? 'FISH_REFERENCE_ID_ZH' : generic ? 'FISH_REFERENCE_ID' : 'FISH_REFERENCE_ID_ZH',
  };
}
