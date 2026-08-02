import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

import {evaluateAudio, inspectAudio} from './audio-qa.mjs';
import {
  buildNormalizationPlan,
  buildVoiceoverRequestContract,
  evaluateVoiceoverProvenance,
  evaluateVoiceoverRelease,
} from './voiceover-contract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const releaseMode = process.argv.includes('--release');
const config = JSON.parse(await readFile(path.join(root, 'voiceover.json'), 'utf8'));
const sourcePath = path.join(root, 'public', 'voiceover-source.mp3');
const normalizedPath = path.join(root, 'public', 'voiceover.wav');
const metadataPath = path.join(root, 'public', 'voiceover-source.json');
const reviewPath = path.join(root, 'voiceover-review.json');
const outputPath = path.join(root, 'out', 'voiceover-qa.json');

const [source, normalized] = await Promise.all([inspectAudio(sourcePath), inspectAudio(normalizedPath)]);
const sourceEvaluation = evaluateAudio(source, {
  codec: 'mp3',
  sampleRate: config.delivery.sample_rate,
  bitrate: config.delivery.mp3_bitrate * 1000,
  bitrateTolerance: 4000,
  minimumSeconds: 1,
  minimumActiveRatio: 0.03,
  maximumClippedRatio: 0.0001,
});
const normalizedEvaluation = evaluateAudio(normalized, {
  codec: 'pcm_s16le',
  sampleRate: 48000,
  channels: 2,
  minimumSeconds: 1,
  maximumSeconds: config.mix.maximum_seconds + 0.05,
  minimumActiveRatio: 0.03,
  maximumClippedRatio: 0.0001,
  targetLufs: config.mix.target_lufs,
  lufsTolerance: 1,
  maximumTruePeakDbfs: config.mix.true_peak_db + 0.1,
  maximumEdgeSilenceSeconds: 1,
});

let metadata;
try {
  metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
} catch (error) {
  metadata = {readError: error.code || error.message};
}
let review;
try {
  review = JSON.parse(await readFile(reviewPath, 'utf8'));
} catch (error) {
  review = {readError: error.code || error.message};
}

const referenceId =
  metadata.reference === 'environment-provided-reference'
    ? process.env.FISH_REFERENCE_ID
    : metadata.reference === 'provider-default'
      ? undefined
      : config.voice?.reference_id;
const requestContract = buildVoiceoverRequestContract(config, referenceId);
const normalizationPlan = buildNormalizationPlan(config, source.durationSeconds, source.sha256);
const provenance = evaluateVoiceoverProvenance({
  metadata,
  config,
  requestContract,
  sourceSha256: source.sha256,
  normalizedSha256: normalized.sha256,
  normalizationSha256: normalizationPlan.normalizationSha256,
});
const release = evaluateVoiceoverRelease({
  review,
  referenceSha256: requestContract.referenceSha256,
  sourceSha256: source.sha256,
  normalizedSha256: normalized.sha256,
});

const crossChecks = [
  {
    id: 'source_and_normalized_duration_are_consistent',
    passed: Math.abs(source.durationSeconds - normalized.durationSeconds) <= 2,
    evidence: `${source.durationSeconds}s source; ${normalized.durationSeconds}s normalized`,
  },
];
const automatedPassed =
  sourceEvaluation.passed &&
  normalizedEvaluation.passed &&
  provenance.status === 'RECORDED' &&
  crossChecks.every((item) => item.passed);
const report = {
  schemaVersion: 2,
  status: !automatedPassed
    ? 'FAIL'
    : releaseMode
      ? release.status === 'APPROVED'
        ? 'PASS'
        : 'BLOCKED'
      : 'AUTOMATED_PASS',
  automatedStatus: automatedPassed ? 'PASS' : 'FAIL',
  releaseStatus: release.status,
  scope: 'automated decode, format, bitrate, duration, signal, clipping, loudness, true-peak, edge-silence and provenance checks',
  source: {...source, evaluation: sourceEvaluation},
  normalized: {...normalized, evaluation: normalizedEvaluation},
  crossChecks,
  provenance,
  release,
  manualListening: review.listening || {status: 'NOT_RUN', reason: 'voiceover review file unavailable'},
};

await mkdir(path.dirname(outputPath), {recursive: true});
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

for (const [name, evaluation] of [
  ['source', sourceEvaluation],
  ['normalized', normalizedEvaluation],
]) {
  for (const check of evaluation.checks) {
    console.log(`${check.passed ? 'PASS' : 'FAIL'} ${name}.${check.id}: ${check.evidence}`);
  }
}
for (const check of crossChecks) console.log(`${check.passed ? 'PASS' : 'FAIL'} ${check.id}: ${check.evidence}`);
for (const check of provenance.checks) {
  console.log(`${check.passed ? 'PASS' : 'FAIL'} provenance.${check.id}: ${check.evidence}`);
}
for (const check of release.checks) {
  console.log(`${check.passed ? 'PASS' : 'BLOCKED'} release.${check.id}: ${check.evidence}`);
}
console.log(`${report.status} voiceover; release ${report.releaseStatus}`);
console.log(`Wrote ${outputPath}`);

if (!automatedPassed || (releaseMode && release.status !== 'APPROVED')) process.exitCode = 1;
