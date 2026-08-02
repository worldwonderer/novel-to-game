import assert from 'node:assert/strict';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {evaluateAudio, inspectAudio} from './audio-qa.mjs';

function wavFixture({seconds = 0.5, frequency = 440, amplitude = 0.25, sampleRate = 16000} = {}) {
  const samples = Math.round(seconds * sampleRate);
  const pcm = Buffer.alloc(samples * 2);
  for (let index = 0; index < samples; index += 1) {
    const value = Math.round(Math.sin((2 * Math.PI * frequency * index) / sampleRate) * amplitude * 32767);
    pcm.writeInt16LE(value, index * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

test('audio inspection proves that a valid non-silent WAV decodes', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'novel-to-game-audio-qa-'));
  t.after(() => rm(dir, {recursive: true, force: true}));
  const file = path.join(dir, 'tone.wav');
  await writeFile(file, wavFixture());

  const metrics = await inspectAudio(file);
  const result = evaluateAudio(metrics, {
    codec: 'pcm_s16le',
    sampleRate: 16000,
    channels: 1,
    minimumSeconds: 0.4,
  });

  assert.equal(result.passed, true);
  assert.ok(metrics.activeSampleRatio > 0.9);
  assert.ok(metrics.sha256);
});

test('audio evaluation rejects silence and clipping', () => {
  const result = evaluateAudio({
    bytes: 4096,
    durationSeconds: 1,
    activeSampleRatio: 0,
    clippedSampleRatio: 0.5,
    codec: 'pcm_s16le',
    sampleRate: 16000,
    channels: 1,
  });
  assert.equal(result.passed, false);
  assert.deepEqual(
    result.checks.filter((item) => !item.passed).map((item) => item.id),
    ['audible_signal', 'sample_clipping'],
  );
});

test('audio inspection reports a silent file without mistaking it for usable speech', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'novel-to-game-audio-qa-silence-'));
  t.after(() => rm(dir, {recursive: true, force: true}));
  const file = path.join(dir, 'silence.wav');
  await writeFile(file, wavFixture({amplitude: 0}));

  const metrics = await inspectAudio(file);
  const result = evaluateAudio(metrics, {maximumTruePeakDbfs: -0.1});
  assert.equal(result.passed, false);
  assert.equal(metrics.activeSampleRatio, 0);
  assert.ok(result.checks.some((item) => item.id === 'audible_signal' && !item.passed));
});
