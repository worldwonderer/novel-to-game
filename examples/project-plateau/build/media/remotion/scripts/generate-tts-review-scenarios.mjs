import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

import {FISH_TTS_ENDPOINT, requestFingerprint, requestFishTts} from './fish-tts-client.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const config = JSON.parse(await readFile(path.join(root, 'tts-review-scenarios.json'), 'utf8'));
const outputDir = path.join(root, 'out', 'tts-review-scenarios');
const scope = process.argv.includes('--matrix') ? 'qa-matrix' : 'project-trial';
const apiKey = process.env.FISH_API_KEY;
const genericReferenceId = process.env.FISH_REFERENCE_ID;
const chineseReferenceId = process.env.FISH_REFERENCE_ID_ZH;

if (!apiKey) throw new Error('FISH_API_KEY is required through the environment; a key pasted into chat must be rotated, not reused.');
if (!genericReferenceId && !chineseReferenceId) {
  throw new Error('FISH_REFERENCE_ID or FISH_REFERENCE_ID_ZH is required so the review voice and its usage rights are explicit.');
}
if (process.env.FISH_VOICE_RIGHTS_ATTESTED !== '1') {
  throw new Error('Set FISH_VOICE_RIGHTS_ATTESTED=1 to attest that the selected review voice may be used.');
}

await mkdir(outputDir, {recursive: true, mode: 0o700});
const results = [];
const failures = [];

for (const scenario of config.scenarios.filter((item) => item.scope === scope && item.source === 'generate')) {
  const referenceId = scenario.language.startsWith('zh')
    ? chineseReferenceId || genericReferenceId
    : genericReferenceId || chineseReferenceId;
  const body = {
    text: scenario.text,
    reference_id: referenceId,
    format: config.defaults.format,
    sample_rate: config.defaults.sample_rate,
    mp3_bitrate: config.defaults.mp3_bitrate,
    temperature: config.defaults.temperature,
    top_p: config.defaults.top_p,
    latency: 'normal',
    normalize: true,
    prosody: {speed: config.defaults.speed, volume: 0, normalize_loudness: true},
  };
  try {
    const result = await requestFishTts({
      apiKey,
      model: config.defaults.model,
      body,
      timeoutMs: 60_000,
      maxAttempts: 3,
    });
    const target = path.join(outputDir, `${scenario.id}.mp3`);
    await writeFile(target, result.audio, {mode: 0o600});
    results.push({
      id: scenario.id,
      status: 'GENERATED_NOT_APPROVED',
      project: scenario.project || null,
      language: scenario.language,
      file: path.relative(root, target),
      provider: 'fish-audio',
      endpoint: FISH_TTS_ENDPOINT,
      model: config.defaults.model,
      textSha256: createHash('sha256').update(scenario.text).digest('hex'),
      requestSha256: requestFingerprint({
        model: config.defaults.model,
        body,
        context: {language: scenario.language},
      }),
      audioSha256: createHash('sha256').update(result.audio).digest('hex'),
      referenceSha256: createHash('sha256').update(referenceId).digest('hex'),
      attempts: result.attempts,
      contentType: result.contentType,
      minimumSeconds: scenario.minimum_seconds,
      maximumSeconds: scenario.maximum_seconds,
      reference: 'environment-provided-rights-attested-reference',
    });
    console.log(`Generated ${scenario.id} (${result.audio.length} bytes, ${result.attempts} attempt(s)).`);
  } catch (error) {
    failures.push({id: scenario.id, status: 'FAILED', reason: error.message});
    console.error(`FAILED ${scenario.id}: ${error.message}`);
  }
}

const manifest = {
  schemaVersion: 1,
  status: failures.length ? (results.length ? 'PARTIAL' : 'FAILED') : 'GENERATED_NOT_APPROVED',
  scope,
  policy: config.policy,
  results,
  failures,
  manualListening: {status: 'NOT_RUN', reason: 'Run verification, then record a human listening review before integration.'},
};
await writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, {mode: 0o600});
console.log(`Wrote ${results.length} review sample(s) to ${outputDir}.`);
if (failures.length) process.exitCode = 1;
