import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import test from 'node:test';
import * as THREE from 'three';
import { createAtmosphere } from '../src/atmosphere.js';
import { PRODUCT_BUDGET, SCENE_BUDGET, percentile, seededRandom } from '../src/config.js';
import { createWorld, pterodactylAttackPose, terrainHeight } from '../src/world.js';

const root = new URL('../', import.meta.url);

test('foundation exposes the locked viewport and performance budgets', () => {
  assert.deepEqual(PRODUCT_BUDGET.targetViewport, [1440, 900]);
  assert.deepEqual(PRODUCT_BUDGET.minimumViewport, [1280, 720]);
  assert.equal(PRODUCT_BUDGET.medianFps, 45);
  assert.equal(PRODUCT_BUDGET.onePercentLowFps, 30);
  assert.equal(PRODUCT_BUDGET.ttiMs, 8000);
});

test('procedural placement is deterministic for a recorded seed', () => {
  const first = seededRandom(139);
  const second = seededRandom(139);
  assert.deepEqual(
    Array.from({ length: 12 }, first),
    Array.from({ length: 12 }, second),
  );
});

test('representative scene contains all declared subject and pressure groups', () => {
  assert.equal(SCENE_BUDGET.adultIguanodons, 2);
  assert.equal(SCENE_BUDGET.youngIguanodons, 3);
  assert.ok(SCENE_BUDGET.pterodactyls >= 1);
  assert.ok(SCENE_BUDGET.trees + SCENE_BUDGET.ferns >= 400);
});

test('the family asset exposes two adults, three young and both authored behaviors', () => {
  const scene = new THREE.Scene();
  const world = createWorld(scene);
  const family = world.assetSnapshot().family;
  assert.equal(family.adults, 2);
  assert.equal(family.young, 3);
  assert.deepEqual(family.behaviors, ['graze', 'branch-pull', 'young-play']);
  assert.equal(family.branchPresent, true);

  world.update(1, false, { familyMoment: 'glade-branch-pull' });
  assert.equal(world.familySnapshot().moment, 'glade-branch-pull');
});

test('family actions remain planted while anatomical pivots and branch contact carry motion', () => {
  const scene = new THREE.Scene();
  const world = createWorld(scene);
  const young = world.family[2];
  world.update(2, false, { familyMoment: 'glade-young-play' });
  const firstYoungPose = {
    x: young.position.x,
    z: young.position.z,
    head: young.userData.rig.headPivot.rotation.z,
    tail: young.userData.rig.tailPivots.at(-1).rotation.y,
  };
  world.update(2.5, false, { familyMoment: 'glade-young-play' });
  assert.equal(young.position.x, young.userData.baseX, 'play must not slide the creature root');
  assert.equal(young.position.z, young.userData.baseZ, 'play must keep planted route contact');
  assert.ok(Math.abs(young.userData.rig.headPivot.rotation.z - firstYoungPose.head) > 0.02);
  assert.ok(Math.abs(young.userData.rig.tailPivots.at(-1).rotation.y - firstYoungPose.tail) > 0.02);

  const branch = scene.getObjectByName('subject.iguanodon_family.feeding_branch');
  const pullingAdult = world.family[1];
  world.update(3, false, { familyMoment: 'glade-branch-pull' });
  const firstBranch = branch.userData.branchPivot.rotation.z;
  const firstHead = pullingAdult.userData.rig.headPivot.rotation.z;
  world.update(3.72, false, { familyMoment: 'glade-branch-pull' });
  assert.ok(Math.abs(branch.userData.branchPivot.rotation.z - firstBranch) > 0.1);
  assert.ok(Math.abs(pullingAdult.userData.rig.headPivot.rotation.z - firstHead) > 0.06);
});

test('pterodactyl attack reads as search, fold-dive and close attack from simulation time', () => {
  assert.equal(pterodactylAttackPose(0.38).stage, 'search');
  assert.equal(pterodactylAttackPose(0.72).stage, 'fold-dive');
  assert.equal(pterodactylAttackPose(1.1).stage, 'attack');
  assert.ok(pterodactylAttackPose(0.72).approach > pterodactylAttackPose(0.38).approach + 0.2);
  assert.ok(pterodactylAttackPose(1.1).wingFold > 0.9);

  const scene = new THREE.Scene();
  const world = createWorld(scene);
  const primary = world.pterodactyls[0];
  const projectedShadow = scene.getObjectByName('threat.pterodactyl.projected-shadow');
  assert.equal(projectedShadow.geometry.userData.profile, 'moving-winged-ground-shadow');
  world.update(20, false, {
    threatAwareness: 3,
    attackSeconds: 0.38,
    rifleRaised: true,
    playerPosition: { x: 0, z: 2 },
  });
  const searchPosition = primary.position.clone();
  const searchShadowPosition = projectedShadow.position.clone();
  assert.equal(projectedShadow.visible, true);
  world.update(20.72, false, {
    threatAwareness: 3,
    attackSeconds: 1.1,
    rifleRaised: true,
    playerPosition: { x: 0, z: 2 },
  });
  assert.equal(world.threatSnapshot().attackStage, 'attack');
  assert.ok(primary.position.y < searchPosition.y - 7);
  assert.ok(primary.position.z > searchPosition.z + 7);
  assert.ok(projectedShadow.position.distanceTo(searchShadowPosition) > 7);
  assert.ok(projectedShadow.material.opacity > 0.24);
  assert.ok(world.threatSnapshot().attackProgress > 0.9);

  world.update(21, false, {
    threatAwareness: 2,
    cameraRaised: true,
    familyMoment: 'glade-young-play',
    playerPosition: { x: 0, z: -5 },
  });
  assert.ok(primary.scale.x <= primary.userData.baseScale * 0.35);
  assert.ok(primary.position.x > 7, 'young-play frame keeps the threat in the secondary right lane');
  world.update(21, false, {
    threatAwareness: 2,
    cameraRaised: true,
    familyMoment: 'glade-branch-pull',
    playerPosition: { x: 1, z: -6 },
  });
  assert.ok(primary.position.x < -7, 'branch-pull frame keeps the threat in the secondary left lane');
});

test('atmosphere exposes layered humid depth rather than a flat sky backdrop', () => {
  const scene = new THREE.Scene();
  createAtmosphere(scene);
  for (const layer of ['mist-near', 'mist-mid', 'mist-far']) {
    const mistLayer = scene.getObjectByName(`world.atmosphere.${layer}`);
    assert.ok(mistLayer?.isGroup, layer);
    assert.equal(mistLayer.userData.profile, 'irregular-distance-layered-mist');
    assert.ok(mistLayer.children.length >= 5);
    for (const pocket of mistLayer.children) {
      assert.equal(pocket.material.type, 'ShaderMaterial');
      assert.equal(pocket.material.depthWrite, false);
      assert.equal(pocket.userData.profile, 'low-broken-mist-pocket');
      assert.ok(pocket.scale.y < pocket.scale.x * 0.35, 'mist must stay low and horizontal');
    }
  }
});

test('the glade composition protects a lit family-and-basalt sightline', () => {
  const scene = new THREE.Scene();
  const world = createWorld(scene);
  const composition = world.assetSnapshot().gladeComposition;
  assert.ok(composition.sightlineHalfWidth >= 20);
  assert.equal(composition.sunLanePresent, true);
  assert.equal(composition.shadowCastingSubjects, 5);
  assert.ok(composition.familyWidth >= 14);
});

test('environment landmarks use authored organic and fractured silhouettes instead of stretched primitives', () => {
  const scene = new THREE.Scene();
  createWorld(scene);
  const trunks = scene.getObjectByName('world.connected_route.tree_trunks');
  const canopy = scene.getObjectByName('world.connected_route.canopy');
  const ferns = scene.getObjectByName('world.connected_route.ferns');
  const basalt = scene.getObjectByName('world.connected_route.red_basalt');
  const track = scene.getObjectByName('world.connected_route.three-toed-track');

  assert.equal(trunks.geometry.userData.profile, 'buttressed-bent-branching');
  assert.equal(trunks.geometry.userData.surface, 'directional-bark-plane-variation');
  assert.ok(trunks.geometry.attributes.color);
  assert.equal(trunks.material.vertexColors, true);
  assert.equal(canopy.geometry.userData.profile, 'asymmetric-multi-lobe');
  assert.equal(canopy.geometry.userData.surface, 'broken-canopy-plane-variation');
  assert.ok(canopy.geometry.attributes.color);
  assert.ok(ferns.geometry.userData.frondSegments >= 6);
  assert.equal(ferns.geometry.userData.variant, 'open-rosette');
  assert.equal(ferns.geometry.userData.surface, 'ribbed-frond-color-break');
  assert.ok(ferns.geometry.attributes.color);
  assert.equal(ferns.material.vertexColors, true);
  assert.equal(scene.getObjectByName('world.connected_route.ferns-variant-2').geometry.userData.variant, 'upright-feather');
  assert.equal(scene.getObjectByName('world.connected_route.ferns-variant-3').geometry.userData.variant, 'low-cycad');
  const treeFernTrunks = scene.getObjectByName('world.connected_route.tree-fern-sentinels');
  const treeFernCrowns = scene.getObjectByName('world.connected_route.tree-fern-crowns');
  assert.ok(treeFernTrunks.isInstancedMesh);
  assert.ok(treeFernCrowns.isInstancedMesh);
  assert.equal(treeFernTrunks.count, 12);
  assert.equal(treeFernTrunks.geometry.userData.profile, 'ring-scarred-tree-fern-trunk');
  assert.equal(
    treeFernTrunks.geometry.userData.surface,
    'alternating-leaf-scar-bands-with-buttress-roots',
  );
  assert.equal(treeFernCrowns.count, 4);
  assert.equal(treeFernCrowns.geometry.userData.variant, 'broad-tree-fern-crown');
  assert.equal(
    scene.getObjectByName('world.connected_route.tree-fern-crowns-variant-2').geometry.userData.variant,
    'wind-broken-tree-fern-crown',
  );
  assert.equal(
    scene.getObjectByName('world.connected_route.tree-fern-crowns-variant-3').geometry.userData.variant,
    'dense-low-tree-fern-crown',
  );
  assert.equal(treeFernTrunks.userData.compositionRole, 'sightline-margin-scale-anchor');
  assert.ok(basalt.geometry.userData.fractureRings >= 5);
  assert.equal(basalt.geometry.userData.irregularTop, true);
  assert.equal(track.children.length, 2);
  const trackClods = scene.getObjectByName('world.track.displaced-mud-clods');
  assert.ok(trackClods.isInstancedMesh);
  assert.equal(trackClods.count, 13);
  assert.equal(trackClods.userData.profile, 'irregular-perimeter-displacement');
  assert.equal(track.userData.firstRead, 'three-toed-print');
  assert.equal(track.userData.openingSightline, true);
  assert.ok(track.userData.worldAnchor.scale >= 2 && track.userData.worldAnchor.scale <= 2.15);
  assert.ok(track.userData.worldAnchor.x > -1.8 && track.userData.worldAnchor.x < -1.5);
  assert.equal(track.children[0].geometry.userData.profile, 'deformed-tridactyl-mud-impression');
  assert.equal(track.children[0].geometry.userData.toeCount, 3);
  assert.equal(track.children[0].geometry.userData.longestToe, 'centre');
  assert.equal(track.children[0].geometry.userData.tipProfile, 'rounded-pressure-spread');
  assert.equal(track.children[0].geometry.userData.edgeProfile, 'asymmetric-collapsed-wet-mud');
  assert.equal(track.children[0].geometry.userData.softEdge, true);
  assert.equal(track.children[0].geometry.userData.toeTipDepthVariation, true);
  assert.equal(track.children[0].geometry.userData.physicalRelief, true);
  assert.equal(track.children[0].geometry.userData.terrainCutaway, true);
  assert.equal(track.children[0].geometry.userData.edgeAlpha, true);
  assert.ok(track.children[0].geometry.userData.reliefDepthMeters >= 0.1);
  assert.equal(track.children[0].userData.contactShape, 'terrain-deformed-tridactyl-print');
  const trackHeights = Array.from(
    { length: track.children[0].geometry.attributes.position.count },
    (_, index) => track.children[0].geometry.attributes.position.getY(index),
  );
  assert.ok(Math.max(...trackHeights) - Math.min(...trackHeights) >= 0.08);
  assert.equal(track.children[0].geometry.attributes.color.itemSize, 4);
  const trackAlphas = Array.from(
    { length: track.children[0].geometry.attributes.color.count },
    (_, index) => track.children[0].geometry.attributes.color.getW(index),
  );
  assert.ok(Math.min(...trackAlphas) <= 0.01);
  assert.ok(Math.max(...trackAlphas) >= 0.99);
  assert.ok(track.children[0].geometry.attributes.uv);
  assert.equal(track.children[0].material.type, 'MeshPhysicalMaterial');
  assert.equal(track.children[0].material.depthWrite, false);
  assert.equal(track.children[0].material.bumpMap.name, 'world.material.soil-macro-detail');
  assert.equal(
    scene.getObjectByName('world.connected_route.terrain').geometry.userData.trackSubsurfaceClearance,
    'concealed-cutaway-under-impression',
  );
  assert.ok(scene.getObjectByName('world.connected_route.brook-wet-bank'));
  const brook = scene.getObjectByName('world.connected_route.brook');
  assert.equal(brook.material.userData.surface, 'procedural-ripple-microdetail');
  assert.equal(brook.material.userData.motion, 'animated-downstream-uv-flow');
  assert.equal(
    scene.getObjectByName('world.connected_route.brook-wet-bank').material.userData.surface,
    'feathered-wet-bank-transition',
  );
  assert.equal(brook.material.bumpMap.name, 'world.material.brook-ripple-detail');
  for (const side of ['left', 'right']) {
    const wetEdge = scene.getObjectByName(`world.connected_route.brook-${side}-wet-edge`);
    assert.equal(wetEdge.material.userData.surface, 'collapsed-saturated-brook-edge');
    assert.equal(wetEdge.material.bumpMap.name, 'world.material.soil-macro-detail');
  }
  const driftwood = scene.getObjectByName('world.connected_route.brook-driftwood');
  assert.ok(driftwood.isInstancedMesh);
  assert.equal(driftwood.count, 4);
  assert.equal(driftwood.geometry.userData.profile, 'branched-bank-driftwood');
  assert.equal(driftwood.geometry.userData.surface, 'broken-bark-color-banding');
  assert.ok(driftwood.geometry.attributes.color);
  assert.equal(scene.getObjectByName('world.connected_route.brook-driftwood-variant-2').count, 3);
  assert.equal(scene.getObjectByName('world.connected_route.brook-driftwood-variant-3').count, 3);
  assert.equal(scene.getObjectByName('world.connected_route.brook-glint'), undefined);
  assert.ok(scene.getObjectByName('world.connected_route.brook-stones').isInstancedMesh);
  const ripples = scene.getObjectByName('world.connected_route.brook-ripples');
  assert.ok(ripples.isInstancedMesh);
  assert.equal(ripples.count, 48);
  assert.equal(
    scene.getObjectByName('world.connected_route.track').material.userData.surface,
    'worn-soil-route-not-color-strip',
  );
  const sunLane = scene.getObjectByName('world.iguanodon_glade.sun_lane');
  assert.equal(sunLane.userData.profile, 'feathered-ground-light-with-local-humidity');
  assert.equal(
    scene.getObjectByName('world.iguanodon_glade.sun_lane.humidity-motes').geometry.userData.profile,
    'local-humidity-sun-motes',
  );
  assert.equal(
    scene.getObjectByName('world.iguanodon_glade.sun_lane.humidity-motes').material.type,
    'ShaderMaterial',
  );
  const humidityShafts = scene.getObjectByName('world.iguanodon_glade.sun_lane.humidity-shafts');
  assert.equal(humidityShafts.userData.profile, 'localized-broken-volumetric-planes');
  assert.equal(humidityShafts.children.length, 3);
  assert.ok(humidityShafts.children.every((shaft) => (
    shaft.userData.profile === 'broken-world-space-humidity-shaft'
      && shaft.material.type === 'ShaderMaterial'
      && shaft.material.depthWrite === false
  )));
  assert.equal(scene.getObjectByName('world.atmosphere.humidity-band'), undefined);
  const basaltSeams = scene.getObjectByName('world.connected_route.red-basalt-fracture-seams');
  const basaltSpalls = scene.getObjectByName('world.connected_route.red-basalt-spall-ledges');
  assert.ok(basaltSeams.isInstancedMesh);
  assert.ok(basaltSpalls.isInstancedMesh);
  assert.equal(basaltSeams.count, SCENE_BUDGET.basaltPillars);
  assert.equal(basaltSpalls.count, SCENE_BUDGET.basaltPillars);
  assert.equal(basaltSeams.geometry.userData.profile, 'irregular-column-fracture-seam');
  assert.equal(basaltSpalls.geometry.userData.profile, 'attached-basalt-spall-ledge');
  const basaltCrusts = scene.getObjectByName('world.connected_route.red-basalt-mineral-crusts');
  assert.ok(basaltCrusts.isInstancedMesh);
  assert.equal(basaltCrusts.count, SCENE_BUDGET.basaltPillars * 2);
  assert.equal(basaltCrusts.geometry.userData.profile, 'thin-mineral-weathering-crust');
  assert.ok(basalt.geometry.attributes.uv);
  assert.equal(basalt.material.userData.surface, 'fractured-mineral-banding');
  assert.equal(basalt.material.bumpMap.name, 'world.material.basalt-mineral-fracture-detail');
  assert.notEqual(trunks.geometry.type, 'CylinderGeometry');
  assert.notEqual(basalt.geometry.type, 'CylinderGeometry');
});

test('every instanced tree keeps its authored root plane in contact with terrain', () => {
  const scene = new THREE.Scene();
  createWorld(scene);
  const trunks = scene.getObjectByName('world.connected_route.tree_trunks');
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  for (let index = 0; index < trunks.count; index += 1) {
    trunks.getMatrixAt(index, matrix);
    matrix.decompose(position, rotation, scale);
    const rootOffset = position.y - terrainHeight(position.x, position.z);
    assert.ok(rootOffset <= 0.001, `tree ${index} root must not float: ${rootOffset}`);
    assert.ok(rootOffset >= -0.05, `tree ${index} root must not be buried: ${rootOffset}`);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(rotation);
    assert.ok(up.y > 0.9999, `tree ${index} inherited a non-yaw tilt: ${up.y}`);
  }
});

test('frame percentile is stable and keeps the slow tail visible', () => {
  const frames = [16, 17, 15, 18, 40, 14, 16, 17, 19, 16];
  assert.equal(percentile(frames, 0.5), 17);
  assert.equal(percentile(frames, 0.99), 40);
  assert.equal(percentile([], 0.5), 0);
});

test('runtime sources contain no remote asset or CDN request', () => {
  const files = ['index.html', ...globSync('src/*.{js,css}', { cwd: root })];
  for (const relative of files) {
    const source = readFileSync(new URL(relative, root), 'utf8');
    assert.doesNotMatch(source, /https?:\/\//i, relative);
    assert.doesNotMatch(source, /(?:src|href)\s*=\s*['"]\/\//i, relative);
    assert.doesNotMatch(source, /url\(\s*['"]?https?:/i, relative);
  }
});

test('the central helper prompt clears the protected silver-frame exposure area', () => {
  const styles = readFileSync(new URL('src/styles.css', root), 'utf8');
  const main = readFileSync(new URL('src/main.js', root), 'utf8');
  assert.match(
    styles,
    /html\s*\{\s*font-size:\s*calc\(16px \* var\(--text-scale\)\);\s*\}/,
    'text scaling must change the rem root rather than only inherited body copy',
  );
  assert.match(styles, /#s0-badge\s*\{\s*display:\s*none;\s*\}/);
  assert.match(main, /document\.documentElement\.dataset\.textScale\s*=\s*presentationSettings\.textScale/);
  assert.match(main, /attackSeconds:\s*player\.attackSeconds/);
  assert.match(main, /controlHint\.hidden\s*=\s*player\.zone\s*===\s*'brook-blind'/);
  assert.match(styles, /html\[data-text-scale="1\.5"\]\s+#control-hint/);
  assert.match(
    styles,
    /\.glass-plate\s*\{[^}]*backdrop-filter:\s*grayscale\(1\)[^}]*opacity:\s*1;/,
    'the title plate must read as a seated silver-black physical object',
  );
  assert.doesNotMatch(
    styles.match(/\.glass-plate\s*\{[^}]*\}/)?.[0] ?? '',
    /mix-blend-mode/,
    'the title plate must not dissolve into the world through screen blending',
  );
  assert.match(
    styles,
    /body\[data-camera="raised"\]\s+#context-prompt\s*\{\s*display:\s*none;\s*\}/,
  );
  assert.match(
    styles,
    /body\[data-rifle="raised"\]\s+#plate-preview\s*\{\s*display:\s*none;\s*\}/,
  );
  assert.match(
    styles,
    /body\[data-camera="raised"\]\s+#control-hint,\s*body\[data-rifle="raised"\]\s+#control-hint\s*\{\s*display:\s*none;\s*\}/,
  );
  assert.match(
    styles,
    /\.terminal-board span\[data-captured="true"\]\s*\{[^}]*background-position:\s*center;[^}]*background-size:\s*cover;[^}]*background-repeat:\s*no-repeat;/,
    'captured plates must override frame-specific fallback background positioning',
  );
});
