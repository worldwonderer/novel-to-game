import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

class NodeFileReader {
  result = null;

  onloadend = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }

  readAsDataURL(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = `data:${blob.type};base64,${Buffer.from(result).toString('base64')}`;
      this.onloadend?.();
    });
  }
}

globalThis.FileReader = NodeFileReader;

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(APP, 'public/assets/basalt-shelf-original-v1.glb');

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const random = seededRandom(18431217);
const BASE_OUTLINE = Object.freeze([
  [-0.98, -0.46],
  [-0.62, -0.92],
  [-0.08, -1],
  [0.55, -0.9],
  [1, -0.5],
  [0.93, 0.08],
  [0.72, 0.72],
  [0.2, 0.96],
  [-0.43, 0.89],
  [-0.91, 0.48],
]);

function closedLoft(rings, outline = BASE_OUTLINE, phase = 0) {
  const vertices = [];
  const indices = [];
  const count = outline.length;
  rings.forEach((ring, ringIndex) => {
    outline.forEach(([outlineX, outlineZ], side) => {
      const wave = 1
        + Math.sin(side * 2.17 + ringIndex * 1.31 + phase) * (ring.jagged ?? 0.035)
        + Math.sin(side * 4.11 - ringIndex * 0.73 + phase * 0.7) * 0.018;
      const twist = ring.twist ?? 0;
      const x = outlineX * ring.scaleX * wave;
      const z = outlineZ * ring.scaleZ * wave;
      vertices.push(
        ring.x + x * Math.cos(twist) - z * Math.sin(twist),
        ring.y,
        ring.z + x * Math.sin(twist) + z * Math.cos(twist),
      );
    });
  });
  for (let ring = 0; ring < rings.length - 1; ring += 1) {
    for (let side = 0; side < count; side += 1) {
      const next = (side + 1) % count;
      const a = ring * count + side;
      const b = ring * count + next;
      const c = (ring + 1) * count + side;
      const d = (ring + 1) * count + next;
      indices.push(a, b, c, b, d, c);
    }
  }
  const bottom = vertices.length / 3;
  vertices.push(rings[0].x, rings[0].y, rings[0].z);
  const topRing = rings.at(-1);
  const top = vertices.length / 3;
  vertices.push(topRing.x, topRing.y, topRing.z);
  const topOffset = (rings.length - 1) * count;
  for (let side = 0; side < count; side += 1) {
    const next = (side + 1) % count;
    indices.push(bottom, next, side);
    indices.push(top, topOffset + side, topOffset + next);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  return geometry;
}

function slab({ x, y, z, scaleX, scaleZ, thickness, twist = 0, phase = 0 }) {
  return closedLoft([
    { x, y: y - thickness * 0.54, z, scaleX: scaleX * 0.94, scaleZ: scaleZ * 0.93, twist },
    { x, y: y + thickness * 0.46, z, scaleX, scaleZ, twist: twist + 0.015 },
  ], BASE_OUTLINE, phase);
}

function mergeBare(parts) {
  const expanded = parts.map((geometry) => {
    const source = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    geometry.dispose();
    for (const attribute of Object.keys(source.attributes)) {
      if (attribute !== 'position') source.deleteAttribute(attribute);
    }
    return source;
  });
  const merged = mergeGeometries(expanded, false);
  expanded.forEach((geometry) => geometry.dispose());
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

function addFaceUvsAndColours(geometry, family) {
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const uvs = new Float32Array(positions.count * 2);
  const colors = new Float32Array(positions.count * 3);
  const deep = new THREE.Color(0x3a2926);
  const red = new THREE.Color(0x875043);
  const oxide = new THREE.Color(0xa06a52);
  const colour = new THREE.Color();
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    const nx = Math.abs(normals.getX(index));
    const ny = Math.abs(normals.getY(index));
    const nz = Math.abs(normals.getZ(index));
    if (ny >= nx && ny >= nz) {
      uvs[index * 2] = x * 0.21;
      uvs[index * 2 + 1] = z * 0.21;
    } else if (nx >= nz) {
      uvs[index * 2] = z * 0.21;
      uvs[index * 2 + 1] = y * 0.21;
    } else {
      uvs[index * 2] = x * 0.21;
      uvs[index * 2 + 1] = y * 0.21;
    }
    const verticalFace = 1 - ny;
    const lowerDarkening = THREE.MathUtils.clamp((0.8 - y) / 1.7, 0, 1);
    const mineralBand = Math.sin(y * 2.43 + x * 1.17 - z * 0.83) * 0.5 + 0.5;
    const oxidation = THREE.MathUtils.clamp(
      0.38 + verticalFace * 0.24 + mineralBand * 0.16 - lowerDarkening * 0.3,
      0.08,
      0.82,
    );
    colour.copy(deep).lerp(red, oxidation);
    if (family === 'spall') colour.lerp(oxide, 0.09 + mineralBand * 0.1);
    colors[index * 3] = colour.r;
    colors[index * 3 + 1] = colour.g;
    colors[index * 3 + 2] = colour.b;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

const massifParts = [
  // The buried plinth is the continuous load path into the ground. Every wall
  // and bench below overlaps it or a lower supported volume.
  closedLoft([
    { x: 0, y: -0.62, z: 0.05, scaleX: 3.72, scaleZ: 2.38, jagged: 0.045 },
    { x: -0.08, y: 0.12, z: 0, scaleX: 3.84, scaleZ: 2.46, jagged: 0.055, twist: 0.025 },
    { x: -0.18, y: 1.32, z: 0.18, scaleX: 3.25, scaleZ: 2.05, jagged: 0.052, twist: 0.04 },
  ], BASE_OUTLINE, 0.4),
  // A wide fractured back wall, not a set of disconnected columns.
  closedLoft([
    { x: -0.32, y: 0.56, z: 0.72, scaleX: 2.92, scaleZ: 1.36, jagged: 0.045 },
    { x: -0.22, y: 2.34, z: 0.78, scaleX: 3.02, scaleZ: 1.31, jagged: 0.055, twist: 0.025 },
    { x: -0.48, y: 4.82, z: 0.86, scaleX: 2.68, scaleZ: 1.16, jagged: 0.065, twist: -0.03 },
    { x: -0.17, y: 7.26, z: 0.82, scaleX: 2.42, scaleZ: 1.08, jagged: 0.062, twist: 0.035 },
    { x: -0.55, y: 9.42, z: 0.78, scaleX: 2.02, scaleZ: 0.96, jagged: 0.07, twist: -0.02 },
    { x: -0.42, y: 10.32, z: 0.72, scaleX: 1.72, scaleZ: 0.82, jagged: 0.08, twist: 0.04 },
  ], BASE_OUTLINE, 1.7),
  // A lower shoulder carries the right-hand bench and breaks the wall skyline.
  closedLoft([
    { x: 2.18, y: 0.42, z: 0.42, scaleX: 1.48, scaleZ: 1.42, jagged: 0.05 },
    { x: 2.12, y: 2.6, z: 0.48, scaleX: 1.42, scaleZ: 1.34, jagged: 0.06, twist: -0.04 },
    { x: 1.98, y: 5.25, z: 0.62, scaleX: 1.24, scaleZ: 1.15, jagged: 0.065, twist: 0.04 },
    { x: 1.84, y: 6.68, z: 0.66, scaleX: 0.96, scaleZ: 0.92, jagged: 0.075, twist: -0.02 },
  ], BASE_OUTLINE, 2.8),
  // Horizontal mineral shelves remain thick, short cantilevers that overlap
  // the back wall rather than impossible plates hanging in open air.
  slab({ x: -0.2, y: 2.55, z: -0.66, scaleX: 3.3, scaleZ: 1.74, thickness: 0.5, twist: -0.035, phase: 3.2 }),
  slab({ x: -0.62, y: 4.92, z: -0.08, scaleX: 2.55, scaleZ: 1.28, thickness: 0.44, twist: 0.045, phase: 4.4 }),
  slab({ x: 1.92, y: 5.18, z: -0.02, scaleX: 1.22, scaleZ: 1.18, thickness: 0.38, twist: -0.06, phase: 5.1 }),
  // A front buttress closes the visible load path below the broad lower shelf.
  closedLoft([
    { x: -1.88, y: 0.2, z: -0.72, scaleX: 1.1, scaleZ: 0.88, jagged: 0.055 },
    { x: -1.78, y: 1.8, z: -0.74, scaleX: 1.03, scaleZ: 0.8, jagged: 0.07, twist: 0.06 },
    { x: -1.72, y: 3.05, z: -0.62, scaleX: 0.82, scaleZ: 0.66, jagged: 0.08, twist: -0.03 },
  ], BASE_OUTLINE, 5.8),
];

const spallSupports = [
  { x: -2.75, y: 1.24, z: -0.82, sx: 0.58, sy: 0.72, sz: 0.52 },
  { x: 2.92, y: 1.22, z: -0.28, sx: 0.66, sy: 0.64, sz: 0.56 },
  { x: -2.18, y: 2.71, z: -1.28, sx: 0.54, sy: 0.55, sz: 0.48 },
  { x: 0.76, y: 2.7, z: -1.42, sx: 0.7, sy: 0.48, sz: 0.52 },
  { x: -1.68, y: 5.04, z: -0.66, sx: 0.48, sy: 0.44, sz: 0.44 },
  { x: 1.05, y: 5.03, z: -0.48, sx: 0.52, sy: 0.42, sz: 0.4 },
];
const spallParts = spallSupports.map((support, index) => closedLoft([
  {
    x: support.x,
    y: support.y,
    z: support.z,
    scaleX: support.sx,
    scaleZ: support.sz,
    jagged: 0.09,
    twist: index * 0.17,
  },
  {
    x: support.x + (random() - 0.5) * 0.12,
    y: support.y + support.sy,
    z: support.z + (random() - 0.5) * 0.1,
    scaleX: support.sx * (0.76 + random() * 0.12),
    scaleZ: support.sz * (0.74 + random() * 0.14),
    jagged: 0.1,
    twist: index * 0.17 + (random() - 0.5) * 0.16,
  },
], BASE_OUTLINE, 6.4 + index));

const massifGeometry = mergeBare(massifParts);
addFaceUvsAndColours(massifGeometry, 'massif');
massifGeometry.userData = {
  profile: 'original-volumetric-fractured-basalt-massif-with-mineral-benches',
  supportModel: 'buried-plinth-to-overlapping-wall-buttress-and-short-cantilever-benches',
  groundPlaneY: 0,
  contactDepthMeters: 0.62,
  shelfCount: 3,
  mainVolumeCount: massifParts.length,
  topology: 'closed-overlapping-load-bearing-volumes',
};

const spallGeometry = mergeBare(spallParts);
addFaceUvsAndColours(spallGeometry, 'spall');
spallGeometry.userData = {
  profile: 'supported-broad-basalt-spalls',
  supportModel: 'resting-on-bedrock-or-horizontal-mineral-bench',
  fragmentCount: spallSupports.length,
  topology: 'closed-supported-volumes',
};

const root = new THREE.Group();
root.name = 'basalt-shelf-original-v1';
root.userData = {
  provenance: 'project-original-deterministic-offline-authored-mesh',
  geologicalReference: 'generic-columnar-basalt-fracture-planes-and-weathering-benches',
  groundPlaneY: 0,
  drawCalls: 2,
  supportModel: 'buried-bedrock-plinth-to-wall-to-benches-to-resting-spalls',
};
const massif = new THREE.Mesh(massifGeometry, new THREE.MeshStandardMaterial({
  name: 'basalt-shelf-massif',
  color: 0x8c5749,
  vertexColors: true,
  roughness: 0.95,
  metalness: 0,
  flatShading: true,
}));
massif.name = 'basalt-shelf-load-bearing-massif';
massif.castShadow = true;
massif.receiveShadow = true;
const spalls = new THREE.Mesh(spallGeometry, new THREE.MeshStandardMaterial({
  name: 'basalt-shelf-supported-spalls',
  color: 0x915d4c,
  vertexColors: true,
  roughness: 0.93,
  metalness: 0,
  flatShading: true,
}));
spalls.name = 'basalt-shelf-supported-spalls';
spalls.castShadow = true;
spalls.receiveShadow = true;
root.add(massif, spalls);

const exporter = new GLTFExporter();
const result = await exporter.parseAsync(root, {
  binary: true,
  onlyVisible: true,
  truncateDrawRange: true,
});
await writeFile(OUTPUT, Buffer.from(result));

const triangles = [massifGeometry, spallGeometry].reduce((total, geometry) => (
  total + (geometry.index ? geometry.index.count : geometry.attributes.position.count) / 3
), 0);
const bounds = new THREE.Box3().setFromObject(root);
console.log(JSON.stringify({
  output: OUTPUT,
  bytes: result.byteLength,
  triangles,
  drawCalls: root.children.length,
  bounds: {
    min: bounds.min.toArray(),
    max: bounds.max.toArray(),
  },
  supportModel: root.userData.supportModel,
  shelfCount: massifGeometry.userData.shelfCount,
  fragments: spallGeometry.userData.fragmentCount,
}, null, 2));
