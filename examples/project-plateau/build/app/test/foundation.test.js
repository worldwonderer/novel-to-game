import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import * as THREE from 'three';
import { PRODUCT_BUDGET, SCENE_BUDGET, percentile, seededRandom } from '../src/config.js';
import { createWorld } from '../src/world.js';

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

test('the glade composition protects a lit family-and-basalt sightline', () => {
  const scene = new THREE.Scene();
  const world = createWorld(scene);
  const composition = world.assetSnapshot().gladeComposition;
  assert.ok(composition.sightlineHalfWidth >= 20);
  assert.equal(composition.sunLanePresent, true);
  assert.equal(composition.shadowCastingSubjects, 5);
  assert.ok(composition.familyWidth >= 14);
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

test('evidence retention never removes a release-bound resource', () => {
  const project = mkdtempSync(join(tmpdir(), 'plateau-retention-'));
  mkdirSync(join(project, 'qa'), { recursive: true });
  mkdirSync(join(project, 'build/evidence/candidate'), { recursive: true });
  writeFileSync(join(project, 'build/evidence/candidate/manifest.json'), JSON.stringify({
    capture: { path: 'build/evidence/candidate/frame.jpg' },
  }));
  writeFileSync(join(project, 'build/evidence/candidate/frame.jpg'), 'bound');
  writeFileSync(join(project, 'build/evidence/orphan.jpg'), 'orphan');
  writeFileSync(join(project, 'qa/release-gates.json'), JSON.stringify({
    evidence: ['build/evidence/candidate/manifest.json'],
  }));

  const tool = new URL('./evidence_retention', import.meta.url);
  const result = spawnSync('python3', [tool.pathname, '--project', project, '--apply', '--json'], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(readFileSync(join(project, 'build/evidence/candidate/frame.jpg'), 'utf8'), 'bound');
  assert.deepEqual(report.candidates.map(({ path }) => path), ['build/evidence/orphan.jpg']);
});

test('evidence retention defaults to a non-destructive dry run', () => {
  const project = mkdtempSync(join(tmpdir(), 'plateau-retention-dry-'));
  mkdirSync(join(project, 'build/evidence'), { recursive: true });
  writeFileSync(join(project, 'build/evidence/orphan.jpg'), 'orphan');
  const tool = new URL('./evidence_retention', import.meta.url);
  const result = spawnSync('python3', [tool.pathname, '--project', project, '--json'], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).mode, 'dry-run');
  assert.equal(readFileSync(join(project, 'build/evidence/orphan.jpg'), 'utf8'), 'orphan');
});
