import * as THREE from 'three';
import { createMistLayer } from './atmosphere-mist.js';
import { createRidge } from './atmosphere-ridges.js';
import {
  SUN_DIRECTION,
  createCloudBanks,
  createCloudVeil,
  createDisplaySky,
} from './atmosphere-sky.js';
import { createOverheadCloudField } from './overhead-cloud-field.js';

export function createAtmosphere(scene) {
  const group = new THREE.Group();
  group.name = 'world.atmosphere';
  const cloudVeil = createCloudVeil();
  const overheadCloudField = createOverheadCloudField(SUN_DIRECTION);
  const cloudDeck = overheadCloudField.mesh;
  const cloudBanks = createCloudBanks();
  group.add(
    createDisplaySky(),
    cloudVeil,
    cloudDeck,
    cloudBanks,
    createRidge('world.atmosphere.far-ridge', -154, 74, -18, [12, 31], 0x394840, 811),
    createRidge('world.atmosphere.near-ridge', -104.5, 65, -16, [8, 23], 0x3c4a35, 419, true),
    createMistLayer('world.atmosphere.mist-near', -47, 0.035, 0x77948d, 241),
    createMistLayer('world.atmosphere.mist-mid', -82, 0.062, 0x759695, 517),
    createMistLayer('world.atmosphere.mist-far', -116, 0.092, 0x72969b, 881),
  );
  group.userData.applyCloudShadowsTo = (targetScene) => overheadCloudField.applyTo(targetScene);
  group.userData.update = (elapsed, reducedMotion = false, quality = 'balanced') => {
    const normalizedQuality = ['low', 'balanced', 'high'].includes(quality) ? quality : 'balanced';
    const cloudTime = reducedMotion ? 0 : elapsed;
    cloudVeil.material.uniforms.time.value = cloudTime;
    overheadCloudField.update(elapsed, reducedMotion, normalizedQuality);
    cloudBanks.userData.updateVolumes(elapsed, reducedMotion, normalizedQuality);
    cloudBanks.userData.volumes.visible = normalizedQuality !== 'low';
    cloudBanks.userData.fallback.visible = normalizedQuality === 'low';
  };
  scene.add(group);
  return group;
}

export { RIDGE_SURFACE_PROFILE } from './atmosphere-ridges.js';
export { SUN_DIRECTION, applyAtmosphereEnvironment } from './atmosphere-sky.js';
