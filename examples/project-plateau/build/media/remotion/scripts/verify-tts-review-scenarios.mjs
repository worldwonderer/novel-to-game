import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

import {evaluateAudio, inspectAudio} from './audio-qa.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputDir = path.join(root, 'out', 'tts-review-scenarios');
let manifest;
try {
  manifest = JSON.parse(await readFile(path.join(outputDir, 'manifest.json'), 'utf8'));
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('NOT_RUN tts_review_scenarios: no generated manifest; run tts:trials or tts:matrix with a rotated credential.');
    process.exit(2);
  }
  throw error;
}
const reviewed = [];

for (const item of manifest.results) {
  let metrics;
  let evaluation;
  try {
    const target = path.resolve(root, item.file);
    if (!target.startsWith(`${outputDir}${path.sep}`)) throw new Error('audio path leaves the ignored review directory');
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

const report = {
  schemaVersion: 1,
  status:
    !manifest.failures?.length && reviewed.length > 0 && reviewed.every((item) => item.evaluation.passed)
      ? 'PASS'
      : 'FAIL',
  scope: manifest.scope,
  scenarios: reviewed,
  generationFailures: manifest.failures || [],
  manualListening: manifest.manualListening,
};
await mkdir(outputDir, {recursive: true});
await writeFile(path.join(outputDir, 'qa-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`NOT_RUN manual_listening: ${report.manualListening.reason}`);
if (report.status !== 'PASS') process.exitCode = 1;
