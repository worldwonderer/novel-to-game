import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildNormalizationPlan,
  buildVoiceoverRequestContract,
  evaluateVoiceoverProvenance,
  evaluateVoiceoverRelease,
  sha256,
} from './voiceover-contract.mjs';

const config = {
  model: 's2.1-pro-free',
  language: 'en-US',
  text: 'A short test line.',
  delivery: {format: 'mp3', sample_rate: 44100, mp3_bitrate: 192, temperature: 0.7, top_p: 0.7, speed: 1},
  mix: {maximum_seconds: 8, target_lufs: -16, true_peak_db: -2},
};

test('voiceover provenance binds the provider response to the normalized asset', () => {
  const requestContract = buildVoiceoverRequestContract(config, 'reference-a');
  const sourceSha256 = sha256('source-audio');
  const normalizedSha256 = sha256('normalized-audio');
  const plan = buildNormalizationPlan(config, 4, sourceSha256);
  const metadata = {
    schemaVersion: 4,
    provider: 'fish-audio',
    endpoint: requestContract.endpoint,
    model: config.model,
    textSha256: requestContract.textSha256,
    requestSha256: requestContract.requestSha256,
    sourceSha256,
    referenceSha256: requestContract.referenceSha256,
    normalizedSha256,
    normalizationSha256: plan.normalizationSha256,
  };
  assert.equal(
    evaluateVoiceoverProvenance({
      metadata,
      config,
      requestContract,
      sourceSha256,
      normalizedSha256,
      normalizationSha256: plan.normalizationSha256,
    }).status,
    'RECORDED',
  );
  assert.equal(
    evaluateVoiceoverProvenance({
      metadata: {...metadata, sourceSha256: sha256('tampered')},
      config,
      requestContract,
      sourceSha256,
      normalizedSha256,
      normalizationSha256: plan.normalizationSha256,
    }).status,
    'INVALID',
  );
});

test('technical audio cannot become release-approved without hash-bound rights and listening evidence', () => {
  const referenceSha256 = sha256('reference-a');
  const sourceSha256 = sha256('source-audio');
  const normalizedSha256 = sha256('normalized-audio');
  assert.equal(
    evaluateVoiceoverRelease({
      review: {
        schemaVersion: 1,
        releaseStatus: 'BLOCKED',
        rights: {status: 'NOT_RUN'},
        listening: {status: 'NOT_RUN'},
      },
      referenceSha256,
      sourceSha256,
      normalizedSha256,
    }).status,
    'BLOCKED',
  );
  assert.equal(
    evaluateVoiceoverRelease({
      review: {
        schemaVersion: 1,
        releaseStatus: 'APPROVED',
        rights: {status: 'APPROVED', evidence: 'asset-ledger.json#voice', approvedReferenceSha256: referenceSha256},
        listening: {
          status: 'APPROVED',
          reviewer: 'human-reviewer',
          reviewedAt: '2026-08-01T00:00:00Z',
          approvedSourceSha256: sourceSha256,
          approvedNormalizedSha256: normalizedSha256,
        },
      },
      referenceSha256,
      sourceSha256,
      normalizedSha256,
    }).status,
    'APPROVED',
  );
  assert.equal(
    evaluateVoiceoverRelease({
      review: {
        schemaVersion: 1,
        releaseStatus: 'BLOCKED',
        rights: {status: 'APPROVED', evidence: 'asset-ledger.json#voice', approvedReferenceSha256: referenceSha256},
        listening: {
          status: 'APPROVED',
          reviewer: 'human-reviewer',
          reviewedAt: '2026-08-01T00:00:00Z',
          approvedSourceSha256: sourceSha256,
          approvedNormalizedSha256: normalizedSha256,
        },
      },
      referenceSha256,
      sourceSha256,
      normalizedSha256,
    }).status,
    'BLOCKED',
  );
});
