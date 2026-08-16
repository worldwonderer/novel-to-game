import assert from 'node:assert/strict';
import test from 'node:test';

import * as THREE from 'three';

import { createAtmosphere } from '../src/atmosphere.js';
import { CANOPY_WIND_PROFILE, createWorld } from '../src/world.js';

test('world facade preserves its public snapshot and wind API', () => {
  const world = createWorld(new THREE.Scene());

  assert.deepEqual(CANOPY_WIND_PROFILE.direction, [0.82, 0, 0.57]);
  assert.equal(typeof world.assetSnapshot, 'function');
  assert.equal(typeof world.brookResponseSnapshot, 'function');
  assert.deepEqual(Object.keys(world.assetSnapshot()), [
    'terrain',
    'brook',
    'brookBoulder',
    'canopyTreeLibrary',
    'vegetation',
    'treeFernLibrary',
    'fernLibrary',
    'nonColumnarRocks',
    'basaltShelf',
    'basaltRubble',
    'fieldCamera',
    'rifle',
    'pterodactyl',
    'cover',
    'heroGingko',
    'family',
    'gladeComposition',
    'degradableGroundAccents',
    'groundCoverLibrary',
    'environmentDensity',
  ]);
  assert.deepEqual(Object.keys(world.brookResponseSnapshot()), ['state', 'position']);
});

test('atmosphere facade preserves lighting, cloud and ridge observations', () => {
  const atmosphere = createAtmosphere(new THREE.Scene());

  assert.equal(
    atmosphere.userData.environmentLighting,
    'bounded-pmrem-physical-sky-dielectric-response',
  );
  assert.equal(typeof atmosphere.userData.cloudFieldSnapshot, 'function');
  assert.equal(typeof atmosphere.userData.ridgeForestSnapshot, 'function');
  assert.equal(atmosphere.userData.ridgeForestSnapshot().ridgeCount, 2);
  assert.equal(
    atmosphere.userData.cloudFieldSnapshot().overheadCoupling.version,
    'world-space-overhead-cloud-and-sun-shadow-v1',
  );
});
