import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

import {evaluateAudio, inspectAudio} from './audio-qa.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const config = JSON.parse(await readFile(path.join(root, 'voiceover.json'), 'utf8'));
const sourcePath = path.join(root, 'public', 'voiceover-source.mp3');
const normalizedPath = path.join(root, 'public', 'voiceover.wav');
const metadataPath = path.join(root, 'public', 'voiceover-source.json');
const outputPath = path.join(root, 'out', 'voiceover-qa.json');

const [source, normalized] = await Promise.all([inspectAudio(sourcePath), inspectAudio(normalizedPath)]);
const sourceEvaluation = evaluateAudio(source, {
  codec: 'mp3',
  sampleRate: config.delivery.sample_rate,
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

let provenance;
try {
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
  provenance = metadata.schemaVersion === 3
    ? {status: 'RECORDED', schemaVersion: 3, requestSha256: metadata.requestSha256, sourceSha256: metadata.sourceSha256}
    : {
        status: 'NOT_RUN',
        reason: `legacy ignored metadata schema ${metadata.schemaVersion}; regenerate with a rotated environment credential before release`,
      };
} catch (error) {
  provenance = {status: 'NOT_RUN', reason: `ignored metadata unavailable: ${error.code || error.message}`};
}

const crossChecks = [
  {
    id: 'source_and_normalized_duration_are_consistent',
    passed: Math.abs(source.durationSeconds - normalized.durationSeconds) <= 2,
    evidence: `${source.durationSeconds}s source; ${normalized.durationSeconds}s normalized`,
  },
];
const report = {
  schemaVersion: 1,
  status:
    sourceEvaluation.passed && normalizedEvaluation.passed && crossChecks.every((item) => item.passed)
      ? 'PASS'
      : 'FAIL',
  scope: 'automated decode, format, duration, signal, clipping, loudness, true-peak and edge-silence checks',
  source: {...source, evaluation: sourceEvaluation},
  normalized: {...normalized, evaluation: normalizedEvaluation},
  crossChecks,
  provenance,
  manualListening: {
    status: 'NOT_RUN',
    reason: 'human intelligibility, pronunciation, acting and creative fit require a recorded listening review',
  },
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
console.log(`${provenance.status} provenance${provenance.reason ? `: ${provenance.reason}` : ''}`);
console.log(`NOT_RUN manual_listening: ${report.manualListening.reason}`);
console.log(`Wrote ${outputPath}`);

if (report.status !== 'PASS') process.exitCode = 1;
