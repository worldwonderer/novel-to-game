import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

import {evaluateAudio, inspectAudio} from './audio-qa.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const scope = process.argv.includes('--matrix') ? 'qa-matrix' : 'project-trial';
const outputDir = path.join(root, 'out', 'tts-review-scenarios', scope);
const configText = await readFile(path.join(root, 'tts-review-scenarios.json'), 'utf8');
const config = JSON.parse(configText);
let manifest;
try {
  manifest = JSON.parse(await readFile(path.join(outputDir, 'manifest.json'), 'utf8'));
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(
      `NOT_RUN tts_review_scenarios.${scope}: no generated manifest; ` +
        'run the matching generation command with a rotated credential.',
    );
    process.exit(2);
  }
  throw error;
}
const reviewed = [];
const contractChecks = [
  {
    id: 'manifest_schema',
    passed: manifest.schemaVersion === 2,
    evidence: `${manifest.schemaVersion} == 2`,
  },
  {
    id: 'scenario_config_sha256',
    passed: manifest.scenarioConfigSha256 === createHash('sha256').update(configText).digest('hex'),
    evidence: 'generated samples use the current scenario and casting contract',
  },
];

for (const item of manifest.results) {
  let metrics;
  let evaluation;
  try {
    const target = path.resolve(root, item.file);
    if (!target.startsWith(`${outputDir}${path.sep}`)) {
      throw new Error('audio path leaves the ignored review directory');
    }
    metrics = await inspectAudio(target);
    evaluation = evaluateAudio(metrics, {
      codec: 'mp3',
      sampleRate: 44100,
      minimumSeconds: item.minimumSeconds,
      maximumSeconds: item.maximumSeconds,
      minimumActiveRatio: 0.03,
      maximumClippedRatio: 0.0001,
      maximumTruePeakDbfs: -0.1,
      maximumEdgeSilenceSeconds: 1.5,
    });
    const scenario = config.scenarios.find((candidate) => candidate.id === item.id);
    if (scenario?.scope === 'project-trial') {
      evaluation.checks.push({
        id: 'speaker_casting',
        passed:
          item.speaker === scenario.speaker &&
          JSON.stringify(item.voiceProfile) === JSON.stringify(scenario.voice_profile),
        evidence: `${item.speaker || 'missing'} -> ${scenario.voice_profile?.casting_id || 'missing'}`,
      });
      evaluation.checks.push({
        id: 'scenario_voice_reference',
        passed: item.referenceEnv === scenario.reference_env,
        evidence: `${item.referenceEnv || 'missing'} == ${scenario.reference_env || 'missing'}`,
      });
    }
    evaluation.checks.push({
      id: 'recorded_audio_sha256',
      passed: metrics.sha256 === item.audioSha256,
      evidence: `${metrics.sha256} == ${item.audioSha256}`,
    });
    evaluation.passed = evaluation.checks.every((check) => check.passed);
  } catch (error) {
    metrics = null;
    evaluation = {
      passed: false,
      checks: [{id: 'decode', passed: false, evidence: error.message}],
    };
  }
  reviewed.push({...item, metrics, evaluation});
  for (const check of evaluation.checks) {
    console.log(`${check.passed ? 'PASS' : 'FAIL'} ${item.id}.${check.id}: ${check.evidence}`);
  }
}

if (manifest.scope === 'project-trial') {
  const referenceHashes = manifest.results.map((item) => item.referenceSha256);
  contractChecks.push({
    id: 'distinct_character_references',
    passed:
      referenceHashes.length > 0 &&
      referenceHashes.every(Boolean) &&
      new Set(referenceHashes).size === referenceHashes.length,
    evidence:
      `${new Set(referenceHashes.filter(Boolean)).size} distinct reference(s) for ` +
      `${referenceHashes.length} generated character(s)`,
  });
}

for (const check of contractChecks) {
  console.log(`${check.passed ? 'PASS' : 'FAIL'} contract.${check.id}: ${check.evidence}`);
}

const report = {
  schemaVersion: 1,
  status:
    !manifest.failures?.length &&
    contractChecks.every((check) => check.passed) &&
    reviewed.length > 0 &&
    reviewed.every((item) => item.evaluation.passed)
      ? 'PASS'
      : 'FAIL',
  scope: manifest.scope,
  scenarios: reviewed,
  contractChecks,
  generationFailures: manifest.failures || [],
  manualListening: manifest.manualListening,
};
await mkdir(outputDir, {recursive: true});
await writeFile(path.join(outputDir, 'qa-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`NOT_RUN manual_listening: ${report.manualListening.reason}`);
if (report.status !== 'PASS') process.exitCode = 1;
