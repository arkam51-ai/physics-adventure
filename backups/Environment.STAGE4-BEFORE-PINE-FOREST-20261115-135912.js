import * as THREE from 'three';
import { RouteSpline } from './RouteSpline.js';

const ROUTES = {
  glb: {
    name: 'Kolaka Utara → Kolaka',
    region: 'KOLAKA UTARA · KOLAKA',
    surface: 'coast',
    sea: [[0, 142], [224, 332]],
    cityZones: [[8, 74, 3], [164, 292, 8]],
    terrainProfile: { type: 'coast', hillStart: 278, hillEnd: 350, maxRelief: 4.5 },
    hills: 2.4,
    treeSpacing: 10,
    controlPoints: [
      [0, 0, -30], [0, 0, 0], [2, 0.25, 45], [5, 0.35, 82],
      [4, 0.05, 118], [0, -0.2, 154], [-4.5, -0.1, 190],
      [-5, 0.2, 226], [-1.5, 0.35, 262], [3, 0.15, 298],
      [2, -0.1, 332], [0, 0, 360]
    ],
    signLabels: [
      'PESISIR KOLAKA UTARA', 'PERMUKIMAN PESISIR', 'JALAN ASPAL MULUS',
      'TAMBALAN RINGAN', 'KAWASAN PERBUKITAN', 'JALAN LURUS · GLB',
      'MEMASUKI KOLAKA', 'KAWASAN PERKOTAAN', 'PESISIR KOLAKA', 'KOTA KOLAKA'
    ]
  },
  glbb: {
    name: 'Kolaka → Kolaka Timur',
    region: 'KOLAKA · KOLAKA TIMUR',
    surface: 'mountain',
    sea: [],
    cityZones: [[8, 54, 2], [142, 180, 2], [252, 300, 3]],
    terrainProfile: { type: 'mountain', maxRelief: 19 },
    hills: 15,
    treeSpacing: 7,
    controlPoints: [
      [0, 0, -30], [0, 0, 0], [-3, 0.7, 38], [-5, 2.4, 76],
      [-2, 4.1, 112], [3, 4.5, 148], [4, 2.8, 184],
      [1, 0.3, 220], [-3, -1.6, 256], [-2, -2.2, 292],
      [1, -0.6, 328], [1, 0, 360]
    ],
    signLabels: [
      'KAKI PEGUNUNGAN', 'TANJAKAN BERTAHAP', 'JALUR PERBUKITAN',
      'TANJAKAN · GLBB', 'PUNCAK PERBUKITAN', 'TURUNAN BERTAHAP',
      'JALUR HUTAN TROPIS', 'KONTUR BERGELOMBANG', 'MENUJU KOLAKA TIMUR', 'KAWASAN KOLAKA TIMUR'
    ]
  },
  'glbb-accelerated': {
    name: 'Kolaka Timur → Konawe',
    region: 'KOLAKA TIMUR · KONAWE',
    surface: 'mountain',
    sea: [],
    cityZones: [[8, 48, 2], [146, 184, 2], [250, 300, 3]],
    terrainProfile: { type: 'plain', maxRelief: 1.2 },
    hills: 16,
    treeSpacing: 7,
    controlPoints: [
      [0, 0, -30], [0, 0, 0], [3, 0.5, 38], [6, 1.8, 76],
      [4, 3.5, 112], [-1, 4.1, 148], [-5, 2.8, 184],
      [-3, 0.7, 220], [2, -1.2, 256], [5, -1.6, 292],
      [2, -0.5, 328], [0, 0, 360]
    ],
    signLabels: [
      'JALUR KOLAKA TIMUR', 'TANJAKAN BERTAHAP', 'PERBUKITAN HIJAU',
      'JALUR MENANJAK', 'PUNCAK PERBUKITAN', 'TURUNAN RINGAN',
      'HUTAN TROPIS', 'KONTUR BERGELOMBANG', 'MENUJU KONAWE', 'KAWASAN KONAWE'
    ]
  },
  'glbb-braking': {
    name: 'Konawe → Konawe Selatan',
    region: 'KONAWE · KONAWE SELATAN',
    surface: 'mountain',
    sea: [],
    cityZones: [[8, 50, 2], [142, 180, 2], [248, 300, 3]],
    terrainProfile: { type: 'valley', start: 48, end: 306, maxRelief: 14, riverOffset: -56 },
    hills: 17,
    treeSpacing: 7,
    controlPoints: [
      [0, 0, -30], [0, 0, 0], [-4, 0.6, 38], [-7, 2.4, 76],
      [-4, 4.2, 112], [2, 4.8, 148], [6, 3.2, 184],
      [4, 0.4, 220], [-1, -1.8, 256], [-5, -2.4, 292],
      [-2, -0.7, 328], [0, 0, 360]
    ],
    signLabels: [
      'DATARAN KONAWE', 'TANJAKAN', 'JALUR BERLIKU',
      'KURANGI KECEPATAN', 'PUNCAK JALUR', 'ZONA PENGEREMAN',
      'TURUNAN BERTAHAP', 'HUTAN KONAWE SELATAN', 'MENUJU KONAWE SELATAN', 'KAWASAN KONAWE SELATAN'
    ]
  },
  'grand-prix': {
    name: 'Konawe Selatan → Kendari',
    region: 'KONAWE SELATAN · KENDARI',
    surface: 'mountain',
    sea: [[276, 336]],
    cityZones: [[12, 54, 3], [112, 166, 5], [224, 310, 8]],
    terrainProfile: { type: 'urban-plain', urbanStart: 108, urbanEnd: 298, maxRelief: 5 },
    hills: 13,
    treeSpacing: 7,
    controlPoints: [
      [0, 0, -30], [0, 0, 0], [4, 0.35, 40], [8, 0.65, 78],
      [6, 0.45, 114], [0, 0.15, 150], [-7, -0.1, 186],
      [-10, -0.35, 222], [-5, 0.2, 258], [2, 0.65, 294],
      [4, 0.3, 328], [0, 0, 360]
    ],
    signLabels: [
      'DATARAN KONAWE SELATAN', 'PERMUKIMAN WARGA', 'JALUR PERBUKITAN',
      'KAKI PEGUNUNGAN', 'TANJAKAN BERTAHAP', 'KAWASAN HUTAN',
      'MENUJU KENDARI', 'PERMUKIMAN KONAWE SELATAN', 'MEMASUKI KENDARI', 'KOTA KENDARI'
    ]
  }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};
const seeded = (value) => {
  const result = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return result - Math.floor(result);
};
const WATER_PLACEMENT_ASSETS = new Set(['bridge', 'bridge-2', 'bridge-pillar-wide']);
const LOW_COVER_ASSETS = new Set(['fern', 'realistic-grass', 'tropical-plant']);
const SETTLEMENT_ASSETS = new Set([
  'wooden-stilt-house',
  'old-house',
  'stone-house',
  'stone-house-2',
  'mountain-cabin',
  'hut',
  'abandoned-farm-house',
  'building-a',
  'low-detail-building-a',
  'kos-building'
]);
const LEVEL_3_PADDY_BLOCKS = [
  { start: 38, end: 70, inner: 13.4, outer: 21.4, seed: 301 },
  { start: 76, end: 112, inner: 13.8, outer: 22.4, seed: 307 },
  { start: 118, end: 154, inner: 13.2, outer: 21.8, seed: 313 },
  { start: 160, end: 192, inner: 13.8, outer: 22.2, seed: 317 },
  { start: 198, end: 234, inner: 13.3, outer: 22.6, seed: 331 },
  { start: 240, end: 272, inner: 13.7, outer: 21.6, seed: 337 },
  { start: 278, end: 312, inner: 13.4, outer: 22.1, seed: 347 }
];
const TUNED_LOW_COVER_MATERIALS = new WeakSet();

function getLowCoverMaterial(material) {
  if (TUNED_LOW_COVER_MATERIALS.has(material)) return material;

  if ('roughness' in material) material.roughness = Math.max(material.roughness ?? 0, 0.86);
  if ('metalness' in material) material.metalness = 0;
  if ('specularIntensity' in material) material.specularIntensity = Math.min(material.specularIntensity, 0.22);
  if (material.normalScale) material.normalScale.multiplyScalar(0.55);
  material.needsUpdate = true;
  TUNED_LOW_COVER_MATERIALS.add(material);
  return material;
}

function makeMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.88, ...options });
}

function isPonderosaVegetationMesh(object) {
  return object.isMesh && /^(tree_copy|Ponderosa Pine|FlorasynthTree)/.test(object.name);
}

function getPonderosaVegetationRole(object) {
  const labels = [
    object.name,
    object.geometry?.name,
    ...(Array.isArray(object.material) ? object.material : [object.material]).map((material) => material?.name)
  ].filter(Boolean).join(' ');
  if (/branches/i.test(labels)) return 'branches';
  if (/foliage|leaves/i.test(labels)) return 'foliage';
  return null;
}

function getPonderosaTreeInstances(model) {
  const treeCopyGroups = new Map();
  const namedMeshes = [];
  model.traverse((child) => {
    if (!isPonderosaVegetationMesh(child)) return;
    if (child.name.startsWith('tree_copy')) {
      const key = child.matrixWorld.elements.map((value) => value.toFixed(6)).join(',');
      const group = treeCopyGroups.get(key) ?? [];
      group.push(child);
      treeCopyGroups.set(key, group);
      return;
    }
    namedMeshes.push(child);
  });

  const instances = [];
  for (const members of treeCopyGroups.values()) {
    const base = members.find((member) => getPonderosaVegetationRole(member) === 'branches');
    if (!base) {
      throw new Error('Instance tree_copy tidak memiliki mesh branches sebagai pangkal.');
    }
    instances.push({ members, base });
  }

  const namedBranches = namedMeshes.filter(
    (mesh) => getPonderosaVegetationRole(mesh) === 'branches'
  );
  const namedFoliage = namedMeshes.filter(
    (mesh) => getPonderosaVegetationRole(mesh) === 'foliage'
  );
  const usedFoliage = new Set();
  for (const base of namedBranches) {
    const baseBounds = new THREE.Box3().setFromObject(base);
    const baseCenter = baseBounds.getCenter(new THREE.Vector3());
    const family = base.name.startsWith('FlorasynthTree') ? 'FlorasynthTree' : 'Ponderosa Pine';
    let match = null;
    let matchDistance = Infinity;
    for (const foliage of namedFoliage) {
      if (usedFoliage.has(foliage)) continue;
      if (!foliage.name.startsWith(family)) continue;
      const foliageCenter = new THREE.Box3().setFromObject(foliage)
        .getCenter(new THREE.Vector3());
      const distance = Math.hypot(
        baseCenter.x - foliageCenter.x,
        baseCenter.z - foliageCenter.z
      );
      if (distance < matchDistance) {
        match = foliage;
        matchDistance = distance;
      }
    }
    if (match && matchDistance <= 1) {
      usedFoliage.add(match);
      instances.push({ members: [base, match], base });
    } else {
      instances.push({ members: [base], base });
    }
  }
  if (usedFoliage.size !== namedFoliage.length) {
    throw new Error('Mesh foliage ponderosa tidak dapat dipasangkan dengan instance tree.');
  }
  return instances;
}

function getPonderosaMeshBase(mesh) {
  const positions = mesh.geometry?.attributes?.position;
  if (!positions) throw new Error(`Mesh pangkal pohon "${mesh.name}" tidak memiliki posisi.`);
  const point = new THREE.Vector3();
  const base = new THREE.Vector3(Infinity, Infinity, Infinity);
  let lowestY = Infinity;
  for (let index = 0; index < positions.count; index += 1) {
    point.fromBufferAttribute(positions, index).applyMatrix4(mesh.matrixWorld);
    if (point.y < lowestY) {
      lowestY = point.y;
      base.copy(point);
    }
  }
  return base;
}

function moveObjectInWorldY(object, deltaY) {
  const parent = object.parent;
  if (!parent) throw new Error(`Mesh pohon "${object.name}" tidak memiliki parent.`);
  const worldPosition = object.getWorldPosition(new THREE.Vector3());
  worldPosition.y += deltaY;
  object.position.copy(parent.worldToLocal(worldPosition));
}

function getLateralFootprint(bounds, center, lateral) {
  let radius = 0;
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const z of [bounds.min.z, bounds.max.z]) {
      const projection = (x - center.x) * lateral.x + (z - center.z) * lateral.z;
      radius = Math.max(radius, Math.abs(projection));
    }
  }
  return radius;
}

function placeInstance(mesh, index, position, rotation, scale) {
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    new THREE.Vector3(...scale)
  );
  mesh.setMatrixAt(index, matrix);
}

function createSignTexture(title, subtitle) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 192;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas tidak tersedia untuk membuat rambu lintasan.');
  context.fillStyle = '#176047';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#f6f1d6';
  context.lineWidth = 9;
  context.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#fffdf1';
  context.font = '700 58px Arial, sans-serif';
  context.fillText(title.toUpperCase(), canvas.width / 2, 70, 710);
  context.fillStyle = '#d7efd9';
  context.font = '600 34px Arial, sans-serif';
  context.fillText(subtitle.toUpperCase(), canvas.width / 2, 137, 710);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createAsphaltTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas tidak tersedia untuk membuat tekstur jalan.');
  context.fillStyle = '#41484e';
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 1800; i += 1) {
    const shade = Math.floor(72 + seeded(i + 731) * 55);
    const alpha = 0.08 + seeded(i + 1843) * 0.16;
    context.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`;
    const radius = 0.35 + seeded(i + 91) * 1.15;
    context.fillRect(
      seeded(i + 13) * canvas.width,
      seeded(i + 57) * canvas.height,
      radius * 2,
      radius
    );
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createTerrainTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas tidak tersedia untuk tekstur terrain.');
  // A neutral repeating microtexture lets vertex colors carry the regional palette.
  context.fillStyle = '#f0efe8';
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < 6800; index += 1) {
    const shade = Math.floor(176 + seeded(index + 1901) * 70);
    const alpha = 0.035 + seeded(index + 2381) * 0.11;
    const warm = seeded(index + 2801) > 0.58;
    context.fillStyle = warm
      ? `rgba(${shade}, ${shade - 5}, ${shade - 15}, ${alpha})`
      : `rgba(${shade - 4}, ${shade}, ${shade - 8}, ${alpha})`;
    const width = 0.7 + seeded(index + 3301) * 3.8;
    const height = 0.5 + seeded(index + 3701) * 2.2;
    context.fillRect(seeded(index + 4101) * 256, seeded(index + 4703) * 256, width, height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export class Environment {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.route = ROUTES[level.id] ?? ROUTES.glb;
    this.spline = new RouteSpline(this.route.controlPoints);
    this.entities = [];
    this.disposed = false;
    this.group = new THREE.Group();
    this.group.name = `route-environment-${level.id}`;
    this.previousFog = scene.fog;
    this.scene.add(this.group);
    this.build();
  }

  async loadModels(assetLoader) {
    const placements = this.getModelPlacements();
    const names = [...new Set(placements.map(({ name }) => name))];
    const results = await Promise.allSettled(names.map((name) => assetLoader.load(name)));
    if (this.disposed) return;

    results.forEach((result, index) => {
      const name = names[index];
      if (result.status === 'rejected') {
        console.error(`Model lingkungan "${name}" tidak dapat dimuat.`, result.reason);
        return;
      }
      const addedModels = [];
      for (const placement of placements.filter((item) => item.name === name)) {
        try {
          addedModels.push(this.addModel(result.value, placement));
        } catch (error) {
          console.error(`Model lingkungan "${name}" tidak dapat ditempatkan.`, error);
        }
      }
      if (name !== 'ponderosa_stand_sketchfab' && addedModels.length > 1) {
        this.instanceModelBatch(addedModels, name);
      }
    });
  }

  instanceModelBatch(models, assetName) {
    const batches = new Map();
    let meshCount = 0;
    for (const model of models) {
      let supported = true;
      model.traverse((child) => {
        if (!child.isMesh) return;
        if (
          child.isSkinnedMesh ||
          child.morphTargetInfluences ||
          Object.keys(child.geometry?.morphAttributes ?? {}).length > 0
        ) supported = false;
      });
      if (!supported) return;
      model.updateMatrixWorld(true);
      model.traverse((child) => {
        if (!child.isMesh || !child.geometry || !child.material) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const key = `${child.geometry.uuid}:${materials.map((material) => material.uuid).join(',')}`;
        const batch = batches.get(key) ?? {
          geometry: child.geometry,
          material: child.material,
          entries: []
        };
        batch.entries.push(child);
        batches.set(key, batch);
        meshCount += 1;
      });
    }
    if (meshCount === 0) return;

    this.group.updateWorldMatrix(true, true);
    const groupInverse = this.group.matrixWorld.clone().invert();
    for (const batch of batches.values()) {
      const instances = new THREE.InstancedMesh(
        batch.geometry,
        batch.material,
        batch.entries.length
      );
      const riceTints = assetName === 'rice-plant' && !Array.isArray(batch.material) &&
        /LeavesRice/i.test(batch.material.name ?? '')
        ? [0x9db96a, 0xb2c97b, 0x88a85e, 0xb7bd70].map((hex) => new THREE.Color(hex))
        : null;
      batch.entries.forEach((mesh, index) => {
        mesh.updateWorldMatrix(true, false);
        const relativeMatrix = groupInverse.clone().multiply(mesh.matrixWorld);
        instances.setMatrixAt(index, relativeMatrix);
        if (riceTints) {
          instances.setColorAt(index, riceTints[Math.floor(seeded(index * 17 + batch.entries.length) * riceTints.length)]);
        }
      });
      instances.instanceMatrix.needsUpdate = true;
      if (instances.instanceColor) instances.instanceColor.needsUpdate = true;
      const castsVegetationShadow = !LOW_COVER_ASSETS.has(assetName) && assetName !== 'rice-plant';
      instances.castShadow = castsVegetationShadow;
      instances.receiveShadow = castsVegetationShadow;
      instances.userData.sharedAsset = true;
      instances.computeBoundingSphere();
      this.group.add(instances);
    }
    for (const model of models) this.group.remove(model);
  }

  getModelPlacements() {
    const placements = [];
    const add = (name, distance, side, offset, size, yaw = 0) => {
      const point = this.roadPoint(distance, side * offset);
      if (!WATER_PLACEMENT_ASSETS.has(name) && this.isWaterAt(point.x, point.z)) return;
      placements.push({ name, x: point.x, z: point.z, distance, side, lateralOffset: offset, size, yaw });
    };
    const addEdgeCover = (start, end, spacing, innerOffset, seedOffset, plantAt = 0) => {
      let clusterIndex = 0;
      for (let clusterStart = start; clusterStart <= end; clusterIndex += 1) {
        const stride = spacing * (2.7 + seeded(seedOffset + clusterIndex * 19) * 1.5);
        const count = 2 + Math.floor(seeded(seedOffset + clusterIndex * 31 + 5) * 3);
        for (const side of [-1, 1]) {
          const sideSeed = seedOffset + clusterIndex * 127 + side * 17;
          const center = clusterStart + (seeded(sideSeed + 3) - 0.5) * spacing * 1.3;
          for (let plantIndex = 0; plantIndex < count; plantIndex += 1) {
            const seed = seeded(sideSeed + plantIndex * 23 + 11);
            const distance = center + (plantIndex - (count - 1) / 2) * spacing * 0.72 +
              (seeded(sideSeed + plantIndex * 29 + 17) - 0.5) * spacing * 0.9;
            const offset = innerOffset + seed * 7.2;
            add('realistic-grass', distance, side, offset, 2.9 + seed * 1.05, (seed - 0.5) * 1.1);
            if ((plantIndex + clusterIndex + (side > 0 ? 1 : 0)) % 3 === plantAt) {
              add(
                'tropical-plant',
                distance + spacing * (0.18 + seeded(sideSeed + plantIndex * 37) * 0.32),
                side,
                offset + 3 + seed * 2.5,
                2.8 + seed * 1.2,
                (0.5 - seed) * 1.25
              );
            }
          }
        }
        clusterStart += stride;
      }
    };
    const addSettlementCluster = ({
      center,
      count,
      sides,
      assets,
      offsetRange,
      sizeRange,
      zone,
      seed
    }) => {
      const plants = new Set([
        'banana-plant', 'palm-tree', 'ponderosa_stand_sketchfab', 'tree-lowpoly',
        'fern', 'realistic-grass', 'tropical-plant', 'rice-plant'
      ]);
      const alongStep = 9.5 + seeded(seed + 3) * 3;
      for (let index = 0; index < count; index += 1) {
        const variation = seeded(seed + index * 29 + 7);
        const centeredIndex = index - (count - 1) / 2;
        const baseDistance = center + centeredIndex * alongStep + (variation - 0.5) * 4.4;
        const side = sides[index % sides.length];
        const asset = assets[Math.floor(seeded(seed + index * 47 + 13) * assets.length)];
        const size = sizeRange[0] + seeded(seed + index * 53 + 17) * (sizeRange[1] - sizeRange[0]);
        const yaw = (side > 0 ? Math.PI : 0) + (seeded(seed + index * 61 + 23) - 0.5) * 0.28;
        let placed = false;

        for (let attempt = 0; attempt < 4 && !placed; attempt += 1) {
          const distance = clamp(
            baseDistance + (attempt === 0 ? 0 : (seeded(seed + index * 71 + attempt) - 0.5) * attempt * 5),
            zone[0],
            zone[1]
          );
          const offset = offsetRange[0] + seeded(seed + index * 83 + attempt * 11) *
            (offsetRange[1] - offsetRange[0]) + attempt * 1.5;
          const signedOffset = side * offset;
          const halfFootprint = size * 0.31;
          const point = this.roadPoint(distance, signedOffset);
          if (this.isWaterAt(point.x, point.z)) continue;

          if (this.level.id === 'glbb-braking') {
            const riverOffset = this.route.terrainProfile.riverOffset + Math.sin(distance * 0.019) * 3.5;
            if (Math.abs(signedOffset - riverOffset) < halfFootprint + 8) continue;
          }
          if (this.level.id === 'grand-prix' && distance + halfFootprint > 267) continue;

          const paddyZones = this.level.id === 'glbb-accelerated'
            ? LEVEL_3_PADDY_BLOCKS
            : [];
          if (paddyZones.some(({ start, end, outer }) =>
            distance + halfFootprint >= start && distance - halfFootprint <= end &&
            offset - halfFootprint < outer + 2
          )) continue;

          const samples = [
            this.roadPoint(distance - halfFootprint, signedOffset - side * halfFootprint),
            this.roadPoint(distance - halfFootprint, signedOffset + side * halfFootprint),
            this.roadPoint(distance + halfFootprint, signedOffset - side * halfFootprint),
            this.roadPoint(distance + halfFootprint, signedOffset + side * halfFootprint)
          ];
          if (samples.some((sample) => this.isWaterAt(sample.x, sample.z))) continue;
          const heights = samples.map((sample) => this.visualTerrainHeight(sample.x, sample.z));
          if (Math.max(...heights) - Math.min(...heights) > Math.max(2.4, size * 0.3)) continue;

          const collides = placements.some((existing) => {
            if (plants.has(existing.name)) return false;
            const existingPoint = this.roadPoint(
              existing.distance,
              (existing.side ?? 1) * (existing.lateralOffset ?? 0)
            );
            const clearance = SETTLEMENT_ASSETS.has(existing.name)
              ? (size + existing.size) * 0.43
              : size * 0.34 + existing.size * 0.22 + 1.5;
            return Math.hypot(point.x - existingPoint.x, point.z - existingPoint.z) < clearance;
          });
          if (collides) continue;

          add(asset, distance, side, offset, size, yaw);
          placed = true;
        }
      }
    };

    switch (this.level.id) {
      case 'glb': {
        add('banana-plant', 43, 1, 16, 4.8, 0.2);
        add('banana-plant', 83, 1, 18, 4.6, -0.25);
        add('banana-plant', 127, 1, 17, 4.8, 0.12);
        add('palm-tree', 65, 1, 34, 10.5, -0.18);
        add('tropical-plant', 119, 1, 15, 3.8, 0.16);
        add('tropical-plant', 139, 1, 21, 4.1, -0.12);
        add('banana-plant', 199, 1, 17, 4.7, 0.24);
        add('palm-tree', 226, 1, 36, 10, -0.2);
        add('banana-plant', 283, 1, 19, 4.5, 0.18);
        for (let index = 0; index < 14; index += 1) {
          const distance = 12 + index * 20;
          const variation = seeded(index + 17);
          add('realistic-grass', distance, 1, 12 + variation * 3, 3.4 + variation * 0.8, variation * 0.45);
          if (index % 2 === 0) add('tropical-plant', distance + 8, 1, 20 + (index % 3) * 5, 3.7 + variation * 0.8, -variation * 0.35);
          if (index % 3 === 1) add('realistic-grass', distance + 5, 1, 32 + (index % 4) * 4, 3.2 + variation * 0.6, variation * 0.28);
        }
        addEdgeCover(14, 316, 8, 12.5, 107);
        break;
      }
      case 'glbb': {
        add('ponderosa_stand_sketchfab', 124, -1, 32, 24);
        add('ponderosa_stand_sketchfab', 165, 1, 32, 24, Math.PI * 0.08);
        add('ponderosa_stand_sketchfab', 206, -1, 34, 24, -Math.PI * 0.06);
        for (let index = 0; index < 13; index += 1) {
          const distance = 18 + index * 23;
          for (const side of [-1, 1]) {
            const variation = seeded(index * 3 + side * 11);
            if (index % 3 !== 1) add('realistic-grass', distance, side, 12 + variation * 4, 3.4 + variation * 0.7, variation * 0.4);
            if (index % 3 === 0) add('fern', distance + 8, side, 20 + variation * 6, 3.2 + variation * 0.4, -variation * 0.28);
          }
        }
        addEdgeCover(12, 326, 9, 13, 211, 1);
        for (let distance = 20; distance <= 320; distance += 18) {
          const variation = seeded(distance + 307);
          add('fern', distance + variation * 3, distance % 2 ? -1 : 1, 20 + variation * 5, 3.1 + variation * 0.35, variation * 0.4);
        }
        break;
      }
      case 'glbb-accelerated': {
        for (let index = 0; index < 11; index += 1) {
          const distance = 24 + index * 26;
          const side = index % 2 === 0 ? -1 : 1;
          add('tree-lowpoly', distance, side, 27 + (index % 4) * 5, 8.8 + (index % 3) * 0.6, (index % 4) * 0.18);
        }
        for (const block of LEVEL_3_PADDY_BLOCKS) {
          for (const side of [-1, 1]) {
            for (let row = 0; row < 3; row += 1) {
              const rowSeed = block.seed + row * 47 + (side > 0 ? 19 : 0);
              const rowOffset = block.inner + 1.15 + row * ((block.outer - block.inner - 2.3) / 2);
              for (let distance = block.start + 1.4; distance < block.end - 1.2;) {
                const variation = seeded(rowSeed + Math.floor(distance * 17));
                const densityThreshold = 0.2 + seeded(block.seed + row * 79) * 0.18 + (row % 2) * 0.05;
                if (variation > densityThreshold) {
                  add(
                    'rice-plant', distance, side,
                    rowOffset + (seeded(rowSeed + Math.floor(distance * 31)) - 0.5) * 0.28,
                    1.62 + variation * 0.26,
                    (seeded(rowSeed + Math.floor(distance * 43)) - 0.5) * 0.18
                  );
                }
                distance += 2.8 + seeded(rowSeed + Math.floor(distance * 59)) * 1.35;
              }
            }
          }
        }
        add('palm-tree', 72, 1, 36, 10, 0.18);
        add('banana-plant', 116, 1, 20, 4.7, 0.16);
        add('banana-plant', 207, -1, 21, 4.8, -0.2);
        add('road-sign', 92, -1, 11, 4.2, Math.PI);
        add('road-sign', 267, 1, 11, 4.2);
        for (let index = 0; index < 16; index += 1) {
          const distance = 20 + index * 18;
          if ([42, 62, 134, 154, 226, 246].some((edge) => Math.abs(distance - edge) < 8)) continue;
          const side = index % 2 === 0 ? 1 : -1;
          const variation = seeded(index + 31);
          add('realistic-grass', distance, side, 22 + variation * 9, 3.5 + variation * 0.8, variation * 0.4);
          if (index % 2 === 0) add('tropical-plant', distance + 6, -side, 25 + variation * 8, 3.5 + variation * 0.8, -variation * 0.3);
        }
        for (const [start, end] of [[20, 36], [64, 128], [156, 220], [250, 326]]) {
          addEdgeCover(start, end, 8, 23, start + 401);
        }
        break;
      }
      case 'glbb-braking': {
        add('road-bend-barrier', 72, 1, 10, 4.2, Math.PI);
        add('construction-barrier', 151, -1, 10, 4.2);
        add('road-bend-barrier', 226, 1, 10, 4.4, Math.PI);
        for (let index = 0; index < 9; index += 1) {
          const distance = 22 + index * 32;
          const side = index % 2 === 0 ? 1 : -1;
          const variation = seeded(index + 51);
          add('tree-lowpoly', distance, side, 26 + variation * 8, 8.5 + variation * 1.1, variation * 0.5);
        }
        for (let index = 0; index < 12; index += 1) {
          const distance = 16 + index * 25;
          const side = index % 2 === 0 ? -1 : 1;
          const variation = seeded(index + 79);
          add('realistic-grass', distance, side, 13 + variation * 7, 3.5 + variation * 0.7, variation * 0.35);
          if (index % 3 === 0) add('fern', distance + 9, -side, 17 + variation * 6, 3.2 + variation * 0.35, -variation * 0.3);
        }
        addEdgeCover(14, 326, 9, 18, 509, 2);
        break;
      }
      case 'grand-prix': {
        add('detail-awning', 45, -1, 18, 5, 0);
        add('detail-awning', 95, 1, 18, 5.2, Math.PI);
        add('detail-awning', 195, -1, 19, 5, 0);
        add('detail-awning', 245, 1, 19, 5.2, Math.PI);
        for (let distance = 16, index = 0; distance <= 286; distance += 38, index += 1) {
          add('electricity-pole', distance, index % 2 === 0 ? -1 : 1, 16, 8, (index % 2) * Math.PI);
        }
        add('electricity-side', 82, 1, 17, 7, Math.PI);
        add('electricity-side', 210, -1, 17, 7);
        add('traffic-light-object-hanging', 142, 1, 16, 5, Math.PI);
        add('light-curved', 48, -1, 16, 6);
        add('light-curved', 246, 1, 18, 6, Math.PI);
        add('dumpster', 102, 1, 19, 3);
        add('dumpster', 250, -1, 20, 3.2, Math.PI);
        add('construction-barrier', 193, -1, 14, 4.2);
        add('palm-tree', 40, 1, 31, 9.5, 0.12);
        for (const [distance, side] of [[42, 1], [91, -1], [174, 1], [232, -1]]) {
          add('tree-lowpoly', distance, side, 45 + (distance % 3) * 2, 8.8 + (distance % 2) * 0.4, (distance % 5) * 0.12);
        }
        for (let index = 0; index < 15; index += 1) {
          const distance = 12 + index * 20;
          const side = index % 2 === 0 ? 1 : -1;
          const variation = seeded(index + 103);
          add('realistic-grass', distance, side, 20 + variation * 9, 3.3 + variation * 0.8, variation * 0.4);
          if (index % 2 === 0) add('tropical-plant', distance + 9, -side, 25 + variation * 8, 3.2 + variation * 0.7, -variation * 0.32);
        }
        addEdgeCover(12, 320, 10, 19, 613, 0);
        break;
      }
      default:
        break;
    }

    if (this.route.surface === 'bay') {
      const addBayPillar = (distance, side, yaw = 0) => add('bridge-pillar-wide', distance, side, 10, 4.5, yaw);
      addBayPillar(82, -1);
      addBayPillar(266, 1, Math.PI);
    }

    const settlementClusters = {
      glb: [
        { center: 25, count: 3, sides: [1, 1, -1], assets: ['wooden-stilt-house', 'old-house', 'stone-house'], offsetRange: [23, 35], sizeRange: [8.5, 10.5], zone: [10, 65], seed: 7301 },
        { center: 72, count: 2, sides: [-1, -1], assets: ['old-house', 'stone-house'], offsetRange: [24, 36], sizeRange: [8, 10], zone: [58, 92], seed: 7311 },
        { center: 119, count: 2, sides: [1, 1], assets: ['wooden-stilt-house', 'old-house'], offsetRange: [25, 37], sizeRange: [8.5, 10.5], zone: [103, 139], seed: 7321 },
        { center: 170, count: 4, sides: [1, 1, -1, 1], assets: ['building-a', 'kos-building', 'stone-house'], offsetRange: [23, 34], sizeRange: [11, 14], zone: [155, 190], seed: 7331 },
        { center: 211, count: 5, sides: [-1, -1, 1, -1, 1], assets: ['building-a', 'kos-building', 'stone-house'], offsetRange: [22, 34], sizeRange: [11, 14], zone: [192, 231], seed: 7341 },
        { center: 246, count: 3, sides: [1, 1, -1], assets: ['building-a', 'kos-building', 'stone-house'], offsetRange: [22, 33], sizeRange: [10.5, 13.5], zone: [232, 263], seed: 7351 },
        { center: 282, count: 2, sides: [1, -1], assets: ['wooden-stilt-house', 'old-house'], offsetRange: [23, 36], sizeRange: [8.5, 10.5], zone: [267, 296], seed: 7361 }
      ],
      glbb: [
        { center: 31, count: 2, sides: [-1, -1], assets: ['old-house', 'stone-house'], offsetRange: [26, 38], sizeRange: [8, 10], zone: [12, 53], seed: 8201 },
        { center: 79, count: 2, sides: [1, 1], assets: ['old-house', 'stone-house'], offsetRange: [27, 40], sizeRange: [8, 10], zone: [62, 100], seed: 8211 },
        { center: 108, count: 1, sides: [1], assets: ['mountain-cabin'], offsetRange: [32, 42], sizeRange: [10.5, 12], zone: [101, 118], seed: 8221 },
        { center: 239, count: 3, sides: [-1, -1, 1], assets: ['old-house', 'stone-house'], offsetRange: [27, 40], sizeRange: [8, 10], zone: [220, 255], seed: 8231 },
        { center: 279, count: 2, sides: [1, 1], assets: ['old-house', 'stone-house'], offsetRange: [27, 40], sizeRange: [8.5, 10.5], zone: [259, 298], seed: 8241 }
      ],
      'glbb-accelerated': [
        { center: 28, count: 2, sides: [1, 1], assets: ['wooden-stilt-house', 'old-house'], offsetRange: [34, 44], sizeRange: [8.5, 10.5], zone: [10, 39], seed: 9301 },
        { center: 96, count: 2, sides: [-1, -1], assets: ['old-house', 'stone-house'], offsetRange: [34, 45], sizeRange: [8, 10], zone: [79, 113], seed: 9311 },
        { center: 180, count: 2, sides: [1, 1], assets: ['old-house', 'stone-house'], offsetRange: [34, 45], sizeRange: [8, 10], zone: [163, 211], seed: 9321 },
        { center: 269, count: 2, sides: [-1, -1], assets: ['wooden-stilt-house', 'old-house'], offsetRange: [34, 45], sizeRange: [8.5, 10.5], zone: [251, 297], seed: 9331 }
      ],
      'glbb-braking': [
        { center: 28, count: 2, sides: [-1, -1], assets: ['old-house', 'stone-house'], offsetRange: [25, 36], sizeRange: [8.5, 10.5], zone: [10, 49], seed: 10401 },
        { center: 96, count: 2, sides: [1, 1], assets: ['old-house', 'stone-house'], offsetRange: [36, 47], sizeRange: [8, 10], zone: [77, 112], seed: 10411 },
        { center: 116, count: 1, sides: [1], assets: ['mountain-cabin'], offsetRange: [37, 48], sizeRange: [10.5, 12], zone: [112, 130], seed: 10421 },
        { center: 208, count: 2, sides: [1, 1], assets: ['old-house', 'stone-house'], offsetRange: [36, 47], sizeRange: [8, 10], zone: [190, 225], seed: 10431 },
        { center: 267, count: 2, sides: [1, 1], assets: ['old-house', 'stone-house'], offsetRange: [36, 47], sizeRange: [8.5, 10.5], zone: [250, 296], seed: 10441 }
      ],
      'grand-prix': [
        { center: 29, count: 2, sides: [1, 1], assets: ['wooden-stilt-house', 'old-house'], offsetRange: [29, 40], sizeRange: [8.5, 10.5], zone: [12, 47], seed: 11501 },
        { center: 67, count: 2, sides: [-1, -1], assets: ['old-house', 'stone-house'], offsetRange: [29, 41], sizeRange: [8.5, 10.5], zone: [50, 91], seed: 11511 },
        { center: 128, count: 3, sides: [1, 1, -1], assets: ['building-a', 'low-detail-building-a', 'kos-building', 'stone-house'], offsetRange: [23, 34], sizeRange: [12, 15], zone: [108, 150], seed: 11521 },
        { center: 170, count: 4, sides: [-1, -1, 1, -1], assets: ['building-a', 'low-detail-building-a', 'kos-building', 'stone-house'], offsetRange: [23, 34], sizeRange: [12, 15], zone: [151, 190], seed: 11531 },
        { center: 211, count: 4, sides: [1, 1, -1, 1], assets: ['building-a', 'low-detail-building-a', 'kos-building', 'stone-house'], offsetRange: [23, 34], sizeRange: [12, 15], zone: [191, 231], seed: 11541 },
        { center: 248, count: 3, sides: [-1, -1, 1], assets: ['building-a', 'low-detail-building-a', 'kos-building', 'stone-house'], offsetRange: [23, 34], sizeRange: [12, 15], zone: [231, 257], seed: 11551 }
      ]
    }[this.level.id] ?? [];
    for (const cluster of settlementClusters) addSettlementCluster(cluster);

    return this.clusterVegetationPlacements(placements);
  }

  clusterVegetationPlacements(placements) {
    const canopyAssets = new Set([
      'banana-plant',
      'palm-tree',
      'ponderosa_stand_sketchfab',
      'tree-lowpoly'
    ]);
    const undergrowthAssets = new Set(['fern', 'realistic-grass', 'tropical-plant']);
    const vegetationAssets = new Set([
      ...canopyAssets,
      ...undergrowthAssets,
      'rice-plant'
    ]);
    const structuralPlacements = placements.filter(({ name }) => !vegetationAssets.has(name));
    const vegetationPlacements = placements.filter(({ name }) => vegetationAssets.has(name));
    const occupiedStructures = structuralPlacements.map((placement) => ({
      placement,
      point: this.roadPoint(placement.distance, (placement.side ?? 1) * placement.lateralOffset)
    }));
    const basePlants = [];
    const seedFor = (placement, index, salt = 0) => seeded(
      Math.round(placement.distance * 31) + index * 149 + (placement.side ?? 1) * 71 + salt
    );
    const makeVariant = (source, distanceShift, lateralShift, sizeFactor, yawShift) => {
      const variant = {
        ...source,
        distance: clamp(source.distance + distanceShift, 2, 330),
        lateralOffset: Math.max(8, source.lateralOffset + lateralShift),
        size: source.size * sizeFactor,
        yaw: source.yaw + yawShift
      };
      const point = this.roadPoint(variant.distance, (variant.side ?? 1) * variant.lateralOffset);
      if (this.isWaterAt(point.x, point.z)) return null;
      if (
        this.level.id === 'glbb-accelerated' &&
        variant.name !== 'rice-plant' &&
        LEVEL_3_PADDY_BLOCKS.some(({ start, end, outer }) =>
          variant.distance >= start - 2 && variant.distance <= end + 2 &&
          variant.lateralOffset >= 11 && variant.lateralOffset <= outer + 1
        )
      ) return null;
      if (
        this.level.id === 'glbb-braking' &&
        variant.side === -1 && variant.lateralOffset >= 46 && variant.lateralOffset <= 67 &&
        variant.distance >= 48 && variant.distance <= 306
      ) return null;
      if (this.level.id === 'grand-prix' && variant.distance >= 268) return null;
      variant.x = point.x;
      variant.z = point.z;
      return variant;
    };
    const isClearOfStructures = (candidate) => {
      const point = this.roadPoint(candidate.distance, (candidate.side ?? 1) * candidate.lateralOffset);
      return occupiedStructures.every(({ placement, point: structurePoint }) => {
        const clearance = Math.max(3, candidate.size * 0.3 + placement.size * 0.2);
        return Math.hypot(point.x - structurePoint.x, point.z - structurePoint.z) >= clearance;
      });
    };

    vegetationPlacements.forEach((placement, index) => {
      if (placement.name === 'rice-plant') {
        basePlants.push(placement);
        return;
      }
      const seed = seedFor(placement, index);
      const varied = makeVariant(
        placement,
        (seed - 0.5) * 7.2,
        (seedFor(placement, index, 13) - 0.5) * 5.4,
        0.86 + seedFor(placement, index, 29) * 0.3,
        (seedFor(placement, index, 43) - 0.5) * 1.35
      );
      const candidate = varied && isClearOfStructures(varied) ? varied : placement;
      basePlants.push(candidate);
    });

    const canopyPlacements = basePlants.filter(({ name }) => canopyAssets.has(name));
    const groundcoverPlacements = basePlants.filter(({ name }) => undergrowthAssets.has(name));
    const acceptedCanopies = canopyPlacements.map((placement) => ({
      placement,
      point: this.roadPoint(placement.distance, (placement.side ?? 1) * placement.lateralOffset)
    }));
    const acceptedGroundcover = groundcoverPlacements.map((placement) => ({
      placement,
      point: this.roadPoint(placement.distance, (placement.side ?? 1) * placement.lateralOffset)
    }));
    const clusters = [];
    const lowPlants = this.level.id === 'glbb' || this.level.id === 'glbb-braking'
      ? ['fern', 'realistic-grass']
      : this.level.id === 'glbb-accelerated'
        ? ['realistic-grass']
        : ['tropical-plant', 'realistic-grass'];

    canopyPlacements.forEach((anchor, index) => {
      const seed = seedFor(anchor, index, 97);
      const companionCount = anchor.name === 'tree-lowpoly'
        ? (seed > 0.76 ? 2 : 1)
        : anchor.name === 'banana-plant'
          ? (seed > 0.72 ? 2 : 1)
          : anchor.name === 'palm-tree' && seed > 0.42
            ? 1
            : 0;

      for (let companion = 0; companion < companionCount; companion += 1) {
        const variantSeed = seedFor(anchor, index, 151 + companion * 37);
        const sign = variantSeed > 0.5 ? 1 : -1;
        const variant = makeVariant(
          anchor,
          sign * (5 + variantSeed * 7),
          (seedFor(anchor, index, 173 + companion * 41) - 0.5) * 13,
          0.82 + seedFor(anchor, index, 191 + companion * 43) * 0.32,
          (seedFor(anchor, index, 211 + companion * 47) - 0.5) * 2.1
        );
        if (!variant || !isClearOfStructures(variant)) continue;
        const point = this.roadPoint(variant.distance, variant.side * variant.lateralOffset);
        const clearance = Math.max(5.5, (variant.size + anchor.size) * 0.37);
        if (acceptedCanopies.some(({ point: other }) =>
          Math.hypot(point.x - other.x, point.z - other.z) < clearance
        )) continue;
        if (acceptedCanopies.some(({ placement }) =>
          placement.side !== variant.side && Math.abs(placement.distance - variant.distance) < 5
        )) continue;
        clusters.push(variant);
        acceptedCanopies.push({ placement: variant, point });
      }

      const lowCount = anchor.name === 'ponderosa_stand_sketchfab'
        ? 2
        : seed > 0.64 ? 2 : 1;
      for (let lowIndex = 0; lowIndex < lowCount; lowIndex += 1) {
        const lowSeed = seedFor(anchor, index, 251 + lowIndex * 53);
        const lowName = lowPlants[Math.floor(lowSeed * lowPlants.length)];
        const source = {
          ...anchor,
          name: lowName,
          size: 2.7 + seedFor(anchor, index, 271 + lowIndex * 59) * 1.1
        };
        const lowVariant = makeVariant(
          source,
          (seedFor(anchor, index, 293 + lowIndex * 61) - 0.5) * 15,
          (seedFor(anchor, index, 307 + lowIndex * 67) - 0.5) * 12,
          0.9 + seedFor(anchor, index, 331 + lowIndex * 71) * 0.2,
          (seedFor(anchor, index, 347 + lowIndex * 73) - 0.5) * 2.8
        );
        if (!lowVariant || !isClearOfStructures(lowVariant)) continue;
        const point = this.roadPoint(lowVariant.distance, lowVariant.side * lowVariant.lateralOffset);
        if (acceptedGroundcover.some(({ point: other }) =>
          Math.hypot(point.x - other.x, point.z - other.z) < 2.8
        )) continue;
        clusters.push(lowVariant);
        acceptedGroundcover.push({ placement: lowVariant, point });
      }
    });

    return [...structuralPlacements, ...basePlants, ...clusters];
  }

  addModel(source, placement) {
    const model = source.clone(true);
    const isGlbbPonderosa = this.level.id === 'glbb' &&
      placement.name === 'ponderosa_stand_sketchfab';
    let anchorMeshes = [];
    let treeInstances = [];

    if (isGlbbPonderosa) {
      const terrain = model.getObjectByName('terrain');
      if (!terrain?.isMesh) {
        throw new Error('Model ponderosa GLB tidak memiliki mesh terrain yang dapat dipisahkan.');
      }
      terrain.removeFromParent();
    }

    model.rotation.y = this.roadYaw(placement.distance) + placement.yaw;
    model.updateMatrixWorld(true);
    let originalBounds = new THREE.Box3().setFromObject(model);
    let originalSize = originalBounds.getSize(new THREE.Vector3());

    if (isGlbbPonderosa) {
      treeInstances = getPonderosaTreeInstances(model);
      const vegetationEntries = [];
      const vegetationBounds = new THREE.Box3();
      for (const instance of treeInstances) {
        const childBounds = new THREE.Box3();
        for (const child of instance.members) childBounds.expandByObject(child);
        vegetationEntries.push({ instance, bounds: childBounds });
        vegetationBounds.union(childBounds);
      }
      if (vegetationEntries.length === 0 || vegetationBounds.isEmpty()) {
        throw new Error('Model ponderosa GLB tidak memiliki vegetasi untuk anchor lokal.');
      }
      const vegetationCenter = vegetationBounds.getCenter(new THREE.Vector3());
      const vegetationSize = vegetationBounds.getSize(new THREE.Vector3());
      const anchorRadius = Math.max(vegetationSize.x, vegetationSize.z) * 0.1;
      const anchorInstances = vegetationEntries
        .filter(({ bounds }) => {
          const center = bounds.getCenter(new THREE.Vector3());
          return Math.hypot(
            center.x - vegetationCenter.x,
            center.z - vegetationCenter.z
          ) <= anchorRadius;
        })
        .map(({ instance }) => instance);
      anchorMeshes = anchorInstances.flatMap(({ members }) => members);
      if (anchorMeshes.length === 0) {
        throw new Error('Model ponderosa GLB tidak memiliki vegetasi di sekitar anchor lokal.');
      }
      const retainedMeshes = new Set(anchorMeshes);
      const discardedMeshes = [];
      model.traverse((child) => {
        if (child.isMesh && !retainedMeshes.has(child)) discardedMeshes.push(child);
      });
      for (const child of discardedMeshes) child.removeFromParent();
      treeInstances = anchorInstances;
      model.updateMatrixWorld(true);
      originalBounds = new THREE.Box3().setFromObject(model);
      originalSize = originalBounds.getSize(new THREE.Vector3());
    }

    const largestDimension = Math.max(originalSize.x, originalSize.y, originalSize.z);
    if (!Number.isFinite(largestDimension) || largestDimension <= 0) {
      throw new Error(`Ukuran model "${placement.name}" tidak valid.`);
    }

    const targetDimension = isGlbbPonderosa ? originalSize.y : largestDimension;
    const targetSize = isGlbbPonderosa ? placement.size * 0.5 : placement.size;
    model.scale.setScalar(targetSize / targetDimension);
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const frame = this.spline.frameAtDistance(placement.distance);
    const lateralRadius = getLateralFootprint(bounds, center, frame.side);
    const minimumLateralOffset = 5.5 + 1.25 + lateralRadius;
    const lateralOffset = Math.max(placement.lateralOffset ?? 0, minimumLateralOffset);
    const targetPoint = this.roadPoint(placement.distance, (placement.side ?? 1) * lateralOffset);
    let placementMinY = bounds.min.y;
    if (isGlbbPonderosa) {
      const anchorBounds = new THREE.Box3();
      for (const child of anchorMeshes) {
        anchorBounds.expandByObject(child);
      }
      if (anchorBounds.isEmpty()) {
        throw new Error('Bounds anchor vegetasi ponderosa tidak valid.');
      }
      placementMinY = anchorBounds.min.y;
    }
    const ground = this.visualTerrainHeight(targetPoint.x, targetPoint.z);
    model.position.set(
      targetPoint.x - center.x,
      ground - placementMinY,
      targetPoint.z - center.z
    );
    if (isGlbbPonderosa) {
      model.updateMatrixWorld(true);
      const corrections = treeInstances.map((instance) => {
        const base = getPonderosaMeshBase(instance.base);
        return {
          instance,
          deltaY: this.visualTerrainHeight(base.x, base.z) - base.y
        };
      });
      for (const { instance, deltaY } of corrections) {
        for (const child of instance.members) moveObjectInWorldY(child, deltaY);
      }
      model.updateMatrixWorld(true);
    }
    model.traverse((child) => {
      if (!child.isMesh) return;
      if (LOW_COVER_ASSETS.has(placement.name)) {
        child.material = Array.isArray(child.material)
          ? child.material.map(getLowCoverMaterial)
          : getLowCoverMaterial(child.material);
      }
      const castsVegetationShadow = !LOW_COVER_ASSETS.has(placement.name) &&
        placement.name !== 'rice-plant';
      child.castShadow = castsVegetationShadow;
      child.receiveShadow = castsVegetationShadow;
      child.userData.sharedAsset = true;
    });
    this.group.add(model);
    return model;
  }

  build() {
    this.scene.fog = new THREE.Fog(0xa6defe, 105, 300);
    this.buildTerrain();
    this.buildVisualRiver();
    this.buildWater();
    this.buildRiceFields();
    this.buildRoad();
    this.buildMountains();
    this.buildVegetation();
    this.buildBuildings();
    this.buildBridges();
    this.buildCheckpoints();
    this.buildSurfaceDetails();
    this.buildEntities();
  }

  buildTerrain() {
    const columns = 56;
    const rows = 102;
    const minX = -112;
    const maxX = 112;
    const minZ = -18;
    const maxZ = 336;
    const positions = new Float32Array((columns + 1) * (rows + 1) * 3);
    const colors = new Float32Array(positions.length);
    const uvs = new Float32Array((columns + 1) * (rows + 1) * 2);
    const indices = [];
    let vertex = 0;
    for (let row = 0; row <= rows; row += 1) {
      const z = minZ + (maxZ - minZ) * row / rows;
      const shorePoint = this.roadPoint(z, -9);
      const roadYaw = this.roadYaw(z);
      for (let column = 0; column <= columns; column += 1) {
        const x = minX + (maxX - minX) * column / columns;
        const y = this.visualTerrainHeight(x, z);
        positions[vertex * 3] = x;
        positions[vertex * 3 + 1] = y;
        positions[vertex * 3 + 2] = z;
        // About seven world units per tile keeps the grain visible at driving distance.
        uvs[vertex * 2] = x / 7;
        uvs[vertex * 2 + 1] = z / 7;
        const altitude = clamp((y - this.roadHeight(z)) / 22, 0, 1);
        const broadNoise = Math.sin(x * 0.041 + z * 0.027) * 0.5 +
          Math.sin(x * 0.023 - z * 0.052 + 1.7) * 0.32 +
          (seeded(Math.floor(x * 0.19) * 71 + Math.floor(z * 0.17) * 113) - 0.5) * 0.18;
        const variation = broadNoise * 0.035;
        const localX = (x - shorePoint.x) * Math.cos(roadYaw) -
          (z - shorePoint.z) * Math.sin(roadYaw);
        const sand = this.route.surface === 'coast'
          ? (1 - smoothstep(4, 13, Math.abs(localX))) *
            (0.82 + 0.18 * (broadNoise + 0.5))
          : 0;
        const side = Math.abs(localX + 9);
        const wornSoil = smoothstep(7, 13, side) * (1 - smoothstep(24, 38, side)) *
          (0.34 + Math.max(0, broadNoise) * 0.34);
        const rock = this.route.surface === 'mountain'
          ? smoothstep(0.48, 0.92, altitude + Math.max(0, broadNoise) * 0.22) *
            smoothstep(15, 32, side) * 0.68
          : 0;
        const grassColor = [0.25 + altitude * 0.075, 0.37 - altitude * 0.075, 0.21 + altitude * 0.025];
        const soilColor = [0.39, 0.32, 0.23];
        const sandColor = [0.59, 0.49, 0.34];
        const rockColor = [0.39, 0.38, 0.35];
        for (let channel = 0; channel < 3; channel += 1) {
          let color = THREE.MathUtils.lerp(grassColor[channel], soilColor[channel], wornSoil);
          color = THREE.MathUtils.lerp(color, sandColor[channel], sand);
          color = THREE.MathUtils.lerp(color, rockColor[channel], rock);
          colors[vertex * 3 + channel] = clamp(color + variation, 0, 1);
        }
        vertex += 1;
      }
    }
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const a = row * (columns + 1) + column;
        const b = a + 1;
        const d = a + columns + 1;
        const c = d + 1;
        indices.push(a, c, b, a, d, c);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const terrain = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ map: createTerrainTexture(), vertexColors: true, roughness: 1 })
    );
    terrain.receiveShadow = true;
    this.group.add(terrain);
  }

  visualTerrainHeight(x, z) {
    if (this.isWaterAt(x, z)) return -1.2;

    const center = this.roadPoint(z);
    const yaw = this.roadYaw(z);
    const localX = (x - center.x) * Math.cos(yaw) - (z - center.z) * Math.sin(yaw);
    const side = Math.abs(localX);
    const gameplaySurface = this.terrainHeight(x, z);
    const profile = this.route.terrainProfile;
    const noise = clamp(
      0.5 + 0.24 * Math.sin(z * 0.021 + localX * 0.014) +
        0.16 * Math.sin(z * 0.037 - localX * 0.029 + 1.3) +
        0.10 * Math.cos(z * 0.013 + localX * 0.047),
      0,
      1
    );
    const shoulderFade = smoothstep(8, 23, side);
    let relief = 0;

    switch (profile.type) {
      case 'coast': {
        const lowHills = smoothstep(profile.hillStart, profile.hillEnd, z);
        relief = profile.maxRelief * (0.16 + noise * 0.84) * lowHills *
          (0.22 + 0.78 * smoothstep(12, 55, side));
        break;
      }
      case 'mountain': {
        const variedRidges = 0.22 + noise * 0.78;
        const flank = smoothstep(8, 38, side) * (1 - smoothstep(96, 122, side));
        relief = profile.maxRelief * variedRidges * flank;
        break;
      }
      case 'plain':
        relief = 0.16 + profile.maxRelief * noise * 0.84 * shoulderFade;
        break;
      case 'valley': {
        const valleyZone = smoothstep(profile.start, profile.start + 42, z) *
          (1 - smoothstep(profile.end - 46, profile.end, z));
        const valleySides = smoothstep(28, 104, side);
        relief = profile.maxRelief * (0.34 + noise * 0.66) * valleySides * valleyZone;
        const riverCenter = profile.riverOffset + Math.sin(z * 0.019) * 3.5;
        const riverCut = Math.exp(-(((localX - riverCenter) / 10) ** 2));
        relief *= 1 - riverCut * 0.94;
        break;
      }
      case 'urban-plain': {
        const urbanProgress = smoothstep(profile.urbanStart, profile.urbanEnd, z);
        relief = profile.maxRelief * (0.18 + noise * 0.82) * shoulderFade *
          (1 - urbanProgress * 0.86);
        break;
      }
      default:
        relief = 0;
    }

    const roadBlend = smoothstep(5.5, 9, side);
    const visualSurface = this.roadHeight(z) - 0.3 + (0.08 + relief) * roadBlend;
    const regionalBlend = smoothstep(5.5, 20, side);
    return THREE.MathUtils.lerp(gameplaySurface, visualSurface, regionalBlend);
  }

  buildVisualRiver() {
    if (this.route.terrainProfile.type !== 'valley') return;

    const profile = this.route.terrainProfile;
    const rows = 72;
    const halfWidth = 5.2;
    const positions = [];
    const uvs = [];
    const indices = [];
    const start = profile.start + 6;
    const end = profile.end - 6;
    for (let row = 0; row <= rows; row += 1) {
      const z = start + (end - start) * row / rows;
      const centerOffset = profile.riverOffset + Math.sin(z * 0.019) * 3.5;
      for (const sideOffset of [-halfWidth, halfWidth]) {
        const point = this.roadPoint(z, centerOffset + sideOffset);
        positions.push(point.x, this.visualTerrainHeight(point.x, point.z) + 0.055, point.z);
        uvs.push(row / rows * 10, sideOffset / (halfWidth * 2));
      }
    }
    for (let row = 0; row < rows; row += 1) {
      const a = row * 2;
      const b = a + 1;
      const d = a + 2;
      const c = a + 3;
      indices.push(a, c, b, a, d, c);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const river = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0x4b91a0,
        transparent: true,
        opacity: 0.82,
        roughness: 0.3,
        metalness: 0.02,
        side: THREE.DoubleSide
      })
    );
    river.receiveShadow = true;
    this.group.add(river);
  }

  terrainHeight(x, z) {
    const center = this.roadPoint(z);
    const yaw = this.roadYaw(z);
    const localX = (x - center.x) * Math.cos(yaw) - (z - center.z) * Math.sin(yaw);
    const side = Math.abs(localX);
    if (this.isWaterAt(x, z)) return -1.2;
    const roadHeight = this.roadHeight(z);
    const coastalSlope = this.route.surface === 'mountain'
      ? 0
      : 12 * smoothstep(6, 24, Math.max(localX, 0)) *
        (1 - smoothstep(43, 76, Math.max(localX, 0)));
    const shoreFactor = this.route.surface === 'coast' || this.route.surface === 'bay';
    const shore = shoreFactor
      ? 1 - smoothstep(7, 20, side) + smoothstep(7, 20, side) * (this.route.hills / 18)
      : smoothstep(6, 20, side);
    const ridges = this.route.hills * shore *
      smoothstep(8, 30, side) *
      (0.6 + 0.4 * Math.sin(z * 0.028 + Math.sign(localX) * 0.9));
    const contours = Math.sin(z * 0.035 + localX * 0.025) * Math.min(this.route.hills * 0.13, 1.2);
    const terrainBlend = smoothstep(5.5, 9, side);
    return roadHeight - 0.3 + (0.08 + coastalSlope + ridges + contours) * terrainBlend;
  }

  isWaterAt(x, z) {
    const center = this.roadPoint(z);
    const yaw = this.roadYaw(z);
    const localX = (x - center.x) * Math.cos(yaw) - (z - center.z) * Math.sin(yaw);
    if (this.route.surface === 'coast') return localX <= -12;
    if (this.route.surface === 'bay') {
      const river = z >= this.route.sea[0][0] && z <= this.route.sea[0][1];
      const bay = z >= this.route.sea[1][0] && z <= this.route.sea[1][1];
      return river || (bay && localX <= -12);
    }
    if (Math.abs(localX) < 12) return false;
    return this.route.sea.some(([start, end]) => z >= start && z <= end);
  }

  buildWater() {
    const waterMaterial = new THREE.MeshBasicMaterial({
      color: 0x329dca,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide
    });
    for (const [sectionIndex, [start, end]] of this.route.sea.entries()) {
      const rows = Math.max(12, Math.ceil((end - start) / 4));
      const vertices = [];
      const indices = [];
      for (let row = 0; row <= rows; row += 1) {
        const z = start + (end - start) * row / rows;
        const sides = this.route.surface === 'coast' || (this.route.surface === 'bay' && sectionIndex > 0)
          ? [-118, -12]
          : [-118, -12, 12, 118];
        for (const xOffset of sides) {
          const point = this.roadPoint(z, xOffset);
          vertices.push(point.x, -0.18, point.z);
        }
      }
      const columns = vertices.length / 3 / (rows + 1);
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 2) {
          const a = row * columns + column;
          const b = a + 1;
          const d = a + columns;
          const c = d + 1;
          indices.push(a, c, b, a, d, c);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      const water = new THREE.Mesh(geometry, waterMaterial);
      water.receiveShadow = true;
      this.group.add(water);
    }
    if (this.route.surface === 'bay') {
      const glints = new THREE.InstancedMesh(
        new THREE.PlaneGeometry(88, 0.12),
        makeMaterial(0xb7f0e9, { transparent: true, opacity: 0.34, roughness: 0.4 }),
        8
      );
      [65, 81, 97, 230, 250, 270, 290, 310].forEach((z, index) => {
        const point = this.roadPoint(z, -60);
        placeInstance(glints, index, [point.x, -0.12, point.z], [-Math.PI / 2, this.roadYaw(z), 0], [1, 1, 1]);
      });
      glints.instanceMatrix.needsUpdate = true;
      this.group.add(glints);
    }
    if (this.level.id === 'grand-prix') {
      const glints = new THREE.InstancedMesh(
        new THREE.PlaneGeometry(52, 0.12),
        makeMaterial(0xb7f0e9, { transparent: true, opacity: 0.32, roughness: 0.38 }),
        12
      );
      let index = 0;
      for (const z of [282, 292, 302, 312, 322, 332]) {
        for (const side of [-1, 1]) {
          const point = this.roadPoint(z, side * 58);
          placeInstance(glints, index++, [point.x, -0.12, point.z], [-Math.PI / 2, this.roadYaw(z), 0], [1, 1, 1]);
        }
      }
      glints.instanceMatrix.needsUpdate = true;
      this.group.add(glints);
    }
  }

  buildRiceFields() {
    if (this.level.id !== 'glbb-accelerated') return;

    const soilPositions = [];
    const soilColors = [];
    const soilIndices = [];
    const waterPositions = [];
    const waterIndices = [];
    const canalPositions = [];
    const canalUvs = [];
    const canalIndices = [];
    const bundTransforms = [];
    const palette = [0x728b54, 0x7d905b, 0x687e4f, 0x817c54].map((hex) => new THREE.Color(hex));

    const appendGrid = (positions, indices, start, end, side, inner, outer, yOffset, colors = null, tint = null) => {
      const alongSegments = Math.max(2, Math.ceil((end - start) / 2.4));
      const acrossSegments = Math.max(2, Math.ceil((outer - inner) / 2.2));
      const firstIndex = positions.length / 3;
      for (let row = 0; row <= alongSegments; row += 1) {
        const distance = start + (end - start) * row / alongSegments;
        for (let column = 0; column <= acrossSegments; column += 1) {
          const lateral = inner + (outer - inner) * column / acrossSegments;
          const point = this.roadPoint(distance, side * lateral);
          positions.push(point.x, this.visualTerrainHeight(point.x, point.z) + yOffset, point.z);
          if (colors && tint) {
            const shade = 0.94 + seeded(row * 17 + column * 31 + start * 7) * 0.12;
            const color = tint.clone().multiplyScalar(shade);
            colors.push(color.r, color.g, color.b);
          }
        }
      }
      for (let row = 0; row < alongSegments; row += 1) {
        for (let column = 0; column < acrossSegments; column += 1) {
          const a = firstIndex + row * (acrossSegments + 1) + column;
          const b = a + 1;
          const d = a + acrossSegments + 1;
          const c = d + 1;
          indices.push(a, c, b, a, d, c);
        }
      }
    };

    const appendCanal = (side, start, end, inner, outer, transverse = false) => {
      const length = transverse ? outer - inner : end - start;
      const segments = Math.max(2, Math.ceil(length / 1.7));
      const firstIndex = canalPositions.length / 3;
      for (let segment = 0; segment <= segments; segment += 1) {
        const t = segment / segments;
        for (const edge of [-0.24, 0.24]) {
          const distance = transverse ? start + edge : start + (end - start) * t;
          const lateral = transverse ? inner + (outer - inner) * t : inner + edge;
          const point = this.roadPoint(distance, side * lateral);
          canalPositions.push(point.x, this.visualTerrainHeight(point.x, point.z) + 0.08, point.z);
          canalUvs.push(t * 8, edge + 0.5);
        }
      }
      for (let segment = 0; segment < segments; segment += 1) {
        const a = firstIndex + segment * 2;
        canalIndices.push(a, a + 3, a + 1, a, a + 2, a + 3);
      }
    };

    for (const side of [-1, 1]) {
      appendCanal(
        side,
        LEVEL_3_PADDY_BLOCKS[0].start,
        LEVEL_3_PADDY_BLOCKS.at(-1).end,
        12.6,
        12.6
      );
    }

    for (const block of LEVEL_3_PADDY_BLOCKS) {
      const parcelLength = 17 + seeded(block.seed) * 5.5;
      const middle = (block.inner + block.outer) * 0.5;
      const gap = 0.62;
      const bands = [
        [block.inner, middle - gap * 0.5],
        [middle + gap * 0.5, block.outer]
      ];
      for (const side of [-1, 1]) {
        let parcelIndex = 0;
        for (let start = block.start; start < block.end - 0.1;) {
          const end = Math.min(
            block.end,
            start + parcelLength + (seeded(block.seed + parcelIndex * 13) - 0.5) * 3.2
          );
          for (const [inner, outer] of bands) {
            const tint = palette[Math.floor(seeded(block.seed + parcelIndex * 37 + inner) * palette.length)];
            appendGrid(
              soilPositions, soilIndices, start + 0.32, end - 0.32,
              side, inner + 0.3, outer - 0.3, 0.035, soilColors, tint
            );
            if (seeded(block.seed + parcelIndex * 23 + Math.round(inner * 3)) > 0.28) {
              appendGrid(
                waterPositions, waterIndices, start + 0.72, end - 0.72,
                side, inner + 0.64, outer - 0.64, 0.08
              );
            }

            const alongCount = Math.ceil((end - start) / 1.8);
            for (const offset of [inner, outer]) {
              for (let segment = 0; segment < alongCount; segment += 1) {
                const distance = start + (segment + 0.5) * (end - start) / alongCount;
                const point = this.roadPoint(distance, side * offset);
                bundTransforms.push({
                  point,
                  rotation: this.roadYaw(distance),
                  length: Math.min(1.8, end - start)
                });
              }
            }
            const acrossCount = Math.max(2, Math.ceil((outer - inner) / 1.7));
            for (const distance of [start + 0.1, end - 0.1]) {
              for (let segment = 0; segment < acrossCount; segment += 1) {
                const lateral = inner + (outer - inner) * (segment + 0.5) / acrossCount;
                const point = this.roadPoint(distance, side * lateral);
                bundTransforms.push({
                  point,
                  rotation: this.roadYaw(distance) + Math.PI / 2,
                  length: (outer - inner) / acrossCount
                });
              }
              if (distance === start + 0.1) {
                appendCanal(side, distance, distance, inner - 0.78, outer + 0.78, true);
              }
            }
            parcelIndex += 1;
          }
          start = end;
        }
      }
    }

    if (soilIndices.length === 0) return;
    const soilGeometry = new THREE.BufferGeometry();
    soilGeometry.setAttribute('position', new THREE.Float32BufferAttribute(soilPositions, 3));
    soilGeometry.setAttribute('color', new THREE.Float32BufferAttribute(soilColors, 3));
    soilGeometry.setIndex(soilIndices);
    soilGeometry.computeVertexNormals();
    const soil = new THREE.Mesh(
      soilGeometry,
      makeMaterial(0xffffff, { side: THREE.DoubleSide, roughness: 0.94, vertexColors: true })
    );
    soil.receiveShadow = true;
    this.group.add(soil);

    if (waterIndices.length > 0) {
      const waterGeometry = new THREE.BufferGeometry();
      waterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(waterPositions, 3));
      waterGeometry.setIndex(waterIndices);
      waterGeometry.computeVertexNormals();
      const water = new THREE.Mesh(
        waterGeometry,
        new THREE.MeshStandardMaterial({
          color: 0x779e91,
          transparent: true,
          opacity: 0.34,
          roughness: 0.42,
          metalness: 0.01,
          depthWrite: false,
          side: THREE.DoubleSide
        })
      );
      water.receiveShadow = true;
      this.group.add(water);
    }

    if (canalIndices.length > 0) {
      const canalGeometry = new THREE.BufferGeometry();
      canalGeometry.setAttribute('position', new THREE.Float32BufferAttribute(canalPositions, 3));
      canalGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(canalUvs, 2));
      canalGeometry.setIndex(canalIndices);
      canalGeometry.computeVertexNormals();
      const canals = new THREE.Mesh(
        canalGeometry,
        new THREE.MeshStandardMaterial({
          color: 0x648f8a,
          transparent: true,
          opacity: 0.68,
          roughness: 0.48,
          metalness: 0.01,
          depthWrite: false,
          side: THREE.DoubleSide
        })
      );
      canals.receiveShadow = true;
      this.group.add(canals);
    }

    const bunds = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.42, 0.18, 1),
      makeMaterial(0x65764d, { roughness: 0.96 }),
      bundTransforms.length
    );
    bundTransforms.forEach(({ point, rotation, length }, index) => {
      placeInstance(
        bunds,
        index,
        [point.x, this.visualTerrainHeight(point.x, point.z) + 0.1, point.z],
        [0, rotation, 0],
        [1, 1, length]
      );
    });
    bunds.count = bundTransforms.length;
    bunds.instanceMatrix.needsUpdate = true;
    bunds.castShadow = true;
    bunds.receiveShadow = true;
    this.group.add(bunds);
  }
  buildRoad() {
    const across = 6;
    const segments = 300;
    const positions = new Float32Array((across + 1) * (segments + 1) * 3);
    const uvs = new Float32Array((across + 1) * (segments + 1) * 2);
    const indices = [];
    let vertex = 0;
    for (let row = 0; row <= segments; row += 1) {
      const distance = -8 + 328 * row / segments;
      for (let column = 0; column <= across; column += 1) {
        const xOffset = -5 + 10 * column / across;
        const point = this.roadPoint(distance, xOffset);
        const x = point.x;
        positions[vertex * 3] = x;
        positions[vertex * 3 + 1] = point.y;
        positions[vertex * 3 + 2] = point.z;
        uvs[vertex * 2] = column / across;
        uvs[vertex * 2 + 1] = row / 12;
        vertex += 1;
      }
    }
    for (let row = 0; row < segments; row += 1) {
      for (let column = 0; column < across; column += 1) {
        const a = row * (across + 1) + column;
        const b = a + 1;
        const d = a + across + 1;
        const c = d + 1;
        indices.push(a, c, b, a, d, c);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const road = new THREE.Mesh(
      geometry,
      makeMaterial(0xffffff, { map: createAsphaltTexture(), roughness: 0.96 })
    );
    road.receiveShadow = true;
    this.group.add(road);

    this.addRoadMarkings();
  }

  addRoadMarkings() {
    const edgeGeometry = new THREE.BoxGeometry(0.2, 0.055, 1);
    const edgeMaterial = makeMaterial(0xf5f2e7, { roughness: 0.65 });
    const edges = new THREE.InstancedMesh(edgeGeometry, edgeMaterial, 66);
    for (let i = 0; i < 33; i += 1) {
      const z = i * 10 + 3;
      const pitch = -Math.atan(this.roadSlope(z));
      const yaw = this.roadYaw(z);
      for (const [side, index] of [[-1, i * 2], [1, i * 2 + 1]]) {
        const point = this.roadPoint(z, side * 4.78);
        placeInstance(edges, index, [point.x, point.y + 0.035, point.z], [pitch, yaw, 0], [1, 1, 10.1]);
      }
    }
    edges.instanceMatrix.needsUpdate = true;
    edges.receiveShadow = true;
    this.group.add(edges);

    const dashGeometry = new THREE.BoxGeometry(0.16, 0.035, 5.2);
    const dashMaterial = makeMaterial(0xf4c842, { roughness: 0.72 });
    const dashes = new THREE.InstancedMesh(dashGeometry, dashMaterial, 26);
    for (let i = 0; i < 26; i += 1) {
      const z = 6 + i * 12.5;
      const point = this.roadPoint(z);
      placeInstance(
        dashes,
        i,
        [point.x, point.y + 0.032, point.z],
        [-Math.atan(this.roadSlope(z)), this.roadYaw(z), 0],
        [1, 1, 1]
      );
    }
    dashes.instanceMatrix.needsUpdate = true;
    this.group.add(dashes);
    this.buildRoadsideFurniture();
  }

  buildRoadsideFurniture() {
    const count = 54;
    const railPosts = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.11, 0.74, 0.11),
      makeMaterial(0x9ca9aa, { metalness: 0.22, roughness: 0.68 }),
      count
    );
    const guardrail = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.14, 0.19, 1),
      makeMaterial(0xb7c1c2, { metalness: 0.32, roughness: 0.55 }),
      count
    );
    for (let index = 0; index < count; index += 1) {
      const z = index * 6 + 4;
      const yaw = this.roadYaw(z);
      const side = this.route.surface === 'mountain' ? 1 : -1;
      const point = this.roadPoint(z, side * 5.45);
      placeInstance(railPosts, index, [point.x, point.y + 0.42, point.z], [0, yaw, 0], [1, 1, 1]);
      placeInstance(guardrail, index, [point.x, point.y + 0.77, point.z], [-Math.atan(this.roadSlope(z)), yaw, 0], [1, 1, 6.1]);
    }
    for (const object of [railPosts, guardrail]) {
      object.instanceMatrix.needsUpdate = true;
      object.castShadow = true;
      object.receiveShadow = true;
      this.group.add(object);
    }
  }

  buildMountains() {
    // Mountain contours are represented by the continuous buildTerrain() mesh.
  }

  buildVegetation() {
    // Per-route GLB placements replace the former spherical procedural trees.
  }

  urbanDensity(z) {
    const zone = this.route.cityZones.find(([start, end]) => z >= start && z <= end);
    return zone ? zone[2] / 10 : 0;
  }

  buildBuildings() {
    // Route buildings are provided by validated GLB assets.
  }

  buildBridges() {
    const spans = this.route.surface === 'bay'
      ? [
          { start: 58, end: 112, kind: 'river' },
          { start: 218, end: 322, kind: 'bay' }
        ]
      : [];
    for (const span of spans) this.buildBridge(span);
    if (this.route.surface === 'bay') this.buildBayBridgeLandmark();
    if (this.level.id === 'grand-prix') this.buildKendariLandmark();
  }

  buildBridge({ start, end, kind }) {
    const count = Math.floor((end - start) / 5) + 1;
    const post = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.16, 0.82, 0.16),
      makeMaterial(kind === 'bay' ? 0xe9e9df : 0xd6dedb),
      count * 2
    );
    const rail = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.12, 0.2, 1),
      makeMaterial(kind === 'bay' ? 0xf2f0e4 : 0xcbd5d2),
      count * 2
    );
    for (let i = 0; i < count; i += 1) {
      const z = start + i * 5;
      for (const side of [-1, 1]) {
        const index = i * 2 + (side > 0 ? 1 : 0);
        const point = this.roadPoint(z, side * 5.15);
        const yaw = this.roadYaw(z);
        placeInstance(post, index, [point.x, point.y + 0.54, point.z], [0, yaw, 0], [1, 1, 1]);
        placeInstance(rail, index, [point.x, point.y + 0.91, point.z], [-Math.atan(this.roadSlope(z)), yaw, 0], [1, 1, 5.1]);
      }
    }
    post.instanceMatrix.needsUpdate = true;
    rail.instanceMatrix.needsUpdate = true;
    post.castShadow = true;
    rail.castShadow = true;
    this.group.add(post, rail);

    const joints = new THREE.InstancedMesh(
      new THREE.BoxGeometry(10, 0.045, 0.13),
      makeMaterial(0x949c9c, { roughness: 0.9 }),
      Math.floor((end - start) / 12)
    );
    for (let i = 0; i < joints.count; i += 1) {
      const z = start + (i + 1) * 12;
      const point = this.roadPoint(z);
      placeInstance(joints, i, [point.x, point.y + 0.045, point.z], [-Math.atan(this.roadSlope(z)), this.roadYaw(z), 0], [1, 1, 1]);
    }
    joints.instanceMatrix.needsUpdate = true;
    this.group.add(joints);

    const supportCount = Math.max(2, Math.floor((end - start) / 26));
    const supports = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.55, 1, 0.75),
      makeMaterial(0xb9c4c0),
      supportCount * 2
    );
    for (let i = 0; i < supportCount; i += 1) {
      const z = start + (i + 0.5) * (end - start) / supportCount;
      for (const side of [-1, 1]) {
        const point = this.roadPoint(z, side * 4.5);
        const top = point.y;
        const bottom = this.visualTerrainHeight(point.x, point.z);
        const height = Math.max(0.8, top - bottom);
        placeInstance(
          supports,
          i * 2 + (side > 0 ? 1 : 0),
          [point.x, bottom + height / 2, point.z],
            [0, this.roadYaw(z), 0],
          [1, height, 1]
        );
      }
    }
    supports.instanceMatrix.needsUpdate = true;
    supports.castShadow = true;
    this.group.add(supports);
  }

  buildBayBridgeLandmark() {
    const towerGeometry = new THREE.BoxGeometry(0.42, 9.5, 0.42);
    const towerMaterial = makeMaterial(0xe8e5d8);
    const towerCount = 4;
    const towers = new THREE.InstancedMesh(towerGeometry, towerMaterial, towerCount);
    let index = 0;
    for (const z of [239, 281]) {
      const base = this.roadHeight(z);
      for (const side of [-1, 1]) {
        const point = this.roadPoint(z, side * 4.55);
        placeInstance(towers, index++, [point.x, base + 5.35, point.z], [0, this.roadYaw(z), 0], [1, 1, 1]);
      }
    }
    towers.instanceMatrix.needsUpdate = true;
    towers.castShadow = true;
    this.group.add(towers);

    const cablePositions = [];
    for (const z of [239, 281]) {
      const top = this.roadHeight(z) + 10.1;
      for (const side of [-1, 1]) {
        const tower = this.roadPoint(z, side * 4.55);
        for (let i = -3; i <= 3; i += 1) {
          if (i === 0) continue;
          const anchorZ = z + i * 3.6;
          const anchor = this.roadPoint(anchorZ, side * 5.15);
          cablePositions.push(
            tower.x, top, tower.z,
            anchor.x, this.roadHeight(anchorZ) + 1, anchor.z
          );
        }
      }
    }
    const cableGeometry = new THREE.BufferGeometry();
    cableGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cablePositions, 3));
    const cables = new THREE.LineSegments(
      cableGeometry,
      new THREE.LineBasicMaterial({ color: 0xf0eee4 })
    );
    this.group.add(cables);
    for (const z of [239, 281]) {
      const point = this.roadPoint(z);
      const crossbeam = new THREE.Mesh(
        new THREE.BoxGeometry(9.2, 0.3, 0.4),
        makeMaterial(0xd8d8cf)
      );
      crossbeam.position.set(point.x, this.roadHeight(z) + 9.9, point.z);
      crossbeam.rotation.y = this.roadYaw(z);
      this.group.add(crossbeam);
    }
  }

  buildKendariLandmark() {
    const concrete = makeMaterial(0xe8e5dc, { roughness: 0.42, metalness: 0.18 });
    const steel = makeMaterial(0x596b72, { roughness: 0.48, metalness: 0.58 });
    const cableMaterial = new THREE.LineBasicMaterial({ color: 0xf2bd43 });

    const addBeam = (parent, start, end, radius, material) => {
      const a = new THREE.Vector3(...start);
      const b = new THREE.Vector3(...end);
      const direction = b.clone().sub(a);
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, direction.length(), 10),
        material
      );
      beam.position.copy(a).add(b).multiplyScalar(0.5);
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      beam.castShadow = true;
      beam.receiveShadow = true;
      parent.add(beam);
    };

    for (const distance of [286, 318]) {
      const center = this.roadPoint(distance);
      const frame = new THREE.Group();
      frame.name = 'kendari-landmark-pylon';
      frame.position.set(center.x, this.roadHeight(distance), center.z);
      frame.rotation.y = this.roadYaw(distance);

      for (const side of [-1, 1]) {
        addBeam(frame, [side * 7.2, 0, 0], [side * 4.7, 18, 0], 0.48, concrete);
      }
      addBeam(frame, [-4.7, 18, 0], [4.7, 18, 0], 0.52, concrete);
      addBeam(frame, [-6.1, 9, 0], [6.1, 9, 0], 0.22, steel);

      const cablePositions = [];
      for (const side of [-1, 1]) {
        for (const offset of [-17, -13, -9, -5, 5, 9, 13, 17]) {
          cablePositions.push(side * 4.7, 17.6, 0, side * 6.3, 1.05, offset);
        }
      }
      const cableGeometry = new THREE.BufferGeometry();
      cableGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cablePositions, 3));
      frame.add(new THREE.LineSegments(cableGeometry, cableMaterial));
      this.group.add(frame);
    }

    for (const side of [-1, 1]) {
      for (let distance = 279; distance <= 330; distance += 7) {
        const point = this.roadPoint(distance, side * 6.3);
        const girder = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.82, 7.3), steel);
        girder.position.set(point.x, point.y + 0.35, point.z);
        girder.rotation.y = this.roadYaw(distance);
        girder.castShadow = true;
        girder.receiveShadow = true;
        this.group.add(girder);
      }
    }
  }
  buildCheckpoints() {
    const supportMaterial = makeMaterial(0x285e57, { roughness: 0.78 });
    const posts = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.22, 3.7, 0.24),
      supportMaterial,
      2
    );
    const headers = new THREE.InstancedMesh(
      new THREE.BoxGeometry(9.55, 0.2, 0.3),
      supportMaterial,
      1
    );
    const z = this.level.checkpointDistance ?? this.level.distance - 30;
    {
      const roadY = this.roadHeight(z);
      const yaw = this.roadYaw(z);
      const left = this.roadPoint(z, -4.65);
      const right = this.roadPoint(z, 4.65);
      const center = this.roadPoint(z);
      placeInstance(posts, 0, [left.x, roadY + 1.85, left.z], [0, yaw, 0], [1, 1, 1]);
      placeInstance(posts, 1, [right.x, roadY + 1.85, right.z], [0, yaw, 0], [1, 1, 1]);
      placeInstance(headers, 0, [center.x, roadY + 3.72, center.z], [0, yaw, 0], [1, 1, 1]);
      const signMaterial = new THREE.MeshStandardMaterial({
        map: createSignTexture(this.route.region, this.route.signLabels.at(-1)),
        roughness: 0.7,
        side: THREE.DoubleSide
      });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(8.7, 1.18), signMaterial);
      const signPoint = this.roadPoint(z + 0.17);
      sign.position.set(signPoint.x, roadY + 4.55, signPoint.z);
      sign.rotation.y = Math.PI + yaw;
      this.group.add(sign);
      this.entities.push({ kind: 'checkpoint', object: sign, z, hit: false, index: 0 });
    }
    posts.instanceMatrix.needsUpdate = true;
    headers.instanceMatrix.needsUpdate = true;
    posts.castShadow = true;
    headers.castShadow = true;
    this.group.add(posts, headers);
  }

  buildSurfaceDetails() {
    // Keep road geometry and markings; omit artificial patches and cracks.
  }

  buildEntities() {
    const lanes = [-2.5, 0, 2.5];
    for (let i = 0; i < 30; i += 1) {
      const lane = lanes[i % lanes.length];
      const z = 15 + i * 11;
      if (i % 5 === 3) {
        const obstacle = new THREE.Mesh(
          new THREE.BoxGeometry(1.05, 0.9, 0.9),
          makeMaterial(0xea654f, { roughness: 0.75 })
        );
          const point = this.roadPoint(z, lane);
          obstacle.position.set(point.x, point.y + 0.5, point.z);
        obstacle.castShadow = true;
        this.group.add(obstacle);
        this.entities.push({ kind: 'obstacle', object: obstacle, z, lane, hit: false });
      } else {
        const coin = new THREE.Mesh(
          new THREE.TorusGeometry(0.42, 0.13, 8, 18),
          makeMaterial(0xffd64b, { metalness: 0.35, roughness: 0.42 })
        );
        const point = this.roadPoint(z, lane);
        coin.position.set(point.x, point.y + 1.15, point.z);
        coin.rotation.y = Math.PI / 2;
        this.group.add(coin);
        this.entities.push({ kind: 'coin', object: coin, z, lane, hit: false });
      }
    }
    this.entities.sort((a, b) => a.z - b.z);
  }

  roadCenterX(distance) {
    return this.spline.frameAtDistance(distance).center.x;
  }

  roadPoint(distance, lateralOffset = 0) {
    const { center, side } = this.spline.frameAtDistance(distance);
    return {
      x: center.x + lateralOffset * side.x,
      y: center.y,
      z: center.z + lateralOffset * side.z
    };
  }

  roadYaw(distance) {
    const { tangent } = this.spline.frameAtDistance(distance);
    return Math.atan2(tangent.x, tangent.z);
  }

  roadHeight(distance) {
    return this.spline.pointAtDistance(distance).y;
  }

  roadSlope(distance) {
    const { tangent } = this.spline.frameAtDistance(distance);
    return tangent.y / tangent.z;
  }

  update(time) {
    for (const entity of this.entities) {
      if (entity.kind === 'coin' && !entity.hit) {
        entity.object.rotation.y += 0.045;
        const point = this.roadPoint(entity.z, entity.lane);
        entity.object.position.x = point.x;
        entity.object.position.z = point.z;
        entity.object.position.y = this.roadHeight(entity.z) + 1.15 + Math.sin(time * 0.003 + entity.z) * 0.12;
      }
    }
  }

  dispose() {
    this.disposed = true;
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    this.group.traverse((object) => {
      if (object.userData.sharedAsset) return;
      if (object.geometry) geometries.add(object.geometry);
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of objectMaterials) {
        if (!material) continue;
        materials.add(material);
        for (const value of Object.values(material)) {
          if (value?.isTexture) textures.add(value);
        }
      }
    });
    for (const texture of textures) texture.dispose();
    for (const material of materials) material.dispose();
    for (const geometry of geometries) geometry.dispose();
    this.group.removeFromParent();
    this.scene.fog = this.previousFog;
  }
}
