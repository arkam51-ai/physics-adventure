import * as THREE from 'three';
import { RouteSpline } from './RouteSpline.js';

const ROUTES = {
  glb: {
    name: 'Kolaka Utara → Kolaka',
    region: 'KOLAKA UTARA · KOLAKA',
    surface: 'coast',
    sea: [[0, 142], [224, 332]],
    cityZones: [[8, 74, 3], [164, 292, 8]],
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
    sea: [],
    cityZones: [[12, 54, 3], [112, 166, 5], [224, 310, 8]],
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
    console.log('MODEL PLACEMENTS:', placements);
    console.log('MODEL NAMES:', names);
    const results = await Promise.allSettled(names.map((name) => assetLoader.load(name)));
    if (this.disposed) return;

    results.forEach((result, index) => {
      const name = names[index];
      if (result.status === 'rejected') {
        console.error(`Model lingkungan "${name}" tidak dapat dimuat.`, result.reason);
        return;
      }
      for (const placement of placements.filter((item) => item.name === name)) {
        try {
          this.addModel(result.value, placement);
        } catch (error) {
          console.error(`Model lingkungan "${name}" tidak dapat ditempatkan.`, error);
        }
      }
    });
  }

  getModelPlacements() {
    const placements = [];
    const add = (name, distance, side, offset, size, yaw = 0) => {
      const point = this.roadPoint(distance, side * offset);
      if (!WATER_PLACEMENT_ASSETS.has(name) && this.isWaterAt(point.x, point.z)) return;
      placements.push({
        name,
        x: point.x,
        z: point.z,
        distance,
        side,
        lateralOffset: offset,
        size,
        yaw
      });
    };

    switch (this.level.id) {
      case 'glb':
        add('wooden-stilt-house', 27, 1, 23, 9, Math.PI);
        add('banana-plant', 43, 1, 15, 4.2, 0.2);
        add('banana-plant', 83, 1, 18, 4.5, -0.25);
        add('banana-plant', 127, 1, 16, 4.1, 0.12);
        add('palm-tree', 65, 1, 27, 7.5, -0.18);
        add('tropical-plant', 119, -1, 13, 3, 0.16);
        add('tropical-plant', 139, 1, 14, 3.2, -0.12);
        add('realistic-grass', 58, -1, 18, 3.4, 0.12);
        add('realistic-grass', 107, 1, 20, 3.2, -0.08);
        add('realistic-grass', 183, 1, 19, 3.6, 0.1);
        add('realistic-grass', 242, -1, 21, 3.3, -0.12);
        add('hut', 170, 1, 22, 7.5, Math.PI);
        add('banana-plant', 199, 1, 17, 4.3, 0.24);
        add('palm-tree', 226, 1, 26, 7.2, -0.2);
        add('stone-house', 254, 1, 25, 9, Math.PI);
        add('banana-plant', 283, -1, 18, 4.1, 0.18);
        break;
      case 'glbb':
        add('ponderosa_stand_sketchfab', 124, -1, 32, 24);
        add('ponderosa_stand_sketchfab', 165, 1, 32, 24, Math.PI * 0.08);
        add('ponderosa_stand_sketchfab', 206, -1, 34, 24, -Math.PI * 0.06);
        add('mountain-cabin', 254, -1, 25, 8.5);
        add('fern', 88, -1, 13, 3.4, 0.16);
        add('fern', 102, 1, 15, 3.1, -0.12);
        add('fern', 220, 1, 14, 3.5, 0.08);
        add('realistic-grass', 78, -1, 18, 3.8);
        add('realistic-grass', 231, 1, 19, 4.1, 0.1);
        break;
      case 'glbb-accelerated':
        for (let distance = 24, index = 0; distance <= 288; distance += 36, index += 1) {
          const side = index % 2 === 0 ? -1 : 1;
          add('tree-lowpoly', distance, side, 19 + (index % 3) * 2, 6.2 + (index % 2) * 0.6, (index % 4) * 0.18);
        }
        for (const fieldStart of [44, 136, 228]) {
          for (const side of [-1, 1]) {
            for (let row = 0; row < 4; row += 1) {
              const distance = fieldStart + row * 7;
              add('rice-plant', distance, side, 15 + (row % 2) * 3, 2.8 + (row % 2) * 0.15, (row % 2) * 0.08);
            }
          }
        }
        add('palm-tree', 72, 1, 28, 7, 0.18);
        add('banana-plant', 116, 1, 18, 4.1, 0.16);
        add('banana-plant', 207, -1, 19, 4.3, -0.2);
        add('tropical-plant', 32, -1, 14, 2.8, -0.1);
        add('tropical-plant', 188, 1, 14, 3, 0.14);
        add('realistic-grass', 58, -1, 21, 3.6);
        add('realistic-grass', 148, 1, 22, 3.6, 0.12);
        add('realistic-grass', 239, -1, 20, 3.8, -0.1);
        add('abandoned-farm-house', 111, -1, 29, 10);
        add('hut', 215, 1, 24, 7.5, Math.PI);
        add('road-sign', 92, -1, 11, 4.2, Math.PI);
        add('road-sign', 267, 1, 11, 4.2);
        break;
      case 'glbb-braking':
        add('road-bend-barrier', 72, 1, 10, 4.2, Math.PI);
        add('construction-barrier', 151, -1, 10, 4.2);
        add('road-bend-barrier', 226, 1, 10, 4.4, Math.PI);
        add('old-house', 42, -1, 26, 8.5);
        add('mountain-cabin', 112, 1, 25, 8.5, Math.PI);
        add('abandoned-farm-house', 180, -1, 27, 9);
        add('stone-house', 260, 1, 26, 8.7, Math.PI);
        add('tree-lowpoly', 34, 1, 22, 7, 0.1);
        add('tree-lowpoly', 93, -1, 24, 6.6, -0.16);
        add('tree-lowpoly', 151, 1, 23, 7.2, 0.18);
        add('tree-lowpoly', 211, -1, 25, 6.8, -0.12);
        add('tree-lowpoly', 286, 1, 22, 7, 0.08);
        add('fern', 55, 1, 14, 3.2);
        add('fern', 197, -1, 15, 3.4, 0.1);
        add('realistic-grass', 128, 1, 19, 3.7, 0.08);
        break;
      case 'grand-prix':
        for (let index = 0; index < 12; index += 1) {
          const distance = 20 + index * 25;
          const side = index % 2 === 0 ? 1 : -1;
          const names = ['building-a', 'low-detail-building-a', 'kos-building'];
          add(names[index % names.length], distance, side, 28 + (index % 3) * 2, 11.5 + (index % 3) * 0.8, side < 0 ? 0 : Math.PI);
        }
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
        add('palm-tree', 40, 1, 24, 6.5, 0.12);
        add('realistic-grass', 75, 1, 23, 3.5);
        add('realistic-grass', 217, -1, 24, 3.6, 0.08);
        break;
      default:
        break;
    }

    if (this.route.surface === 'bay') {
      const addBayPillar = (distance, side, yaw = 0) => add('bridge-pillar-wide', distance, side, 10, 4.5, yaw);
      addBayPillar(82, -1);
      addBayPillar(266, 1, Math.PI);
    }
    return placements;
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
    const ground = this.terrainHeight(targetPoint.x, targetPoint.z);
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
          deltaY: this.terrainHeight(base.x, base.z) - base.y
        };
      });
      for (const { instance, deltaY } of corrections) {
        for (const child of instance.members) moveObjectInWorldY(child, deltaY);
      }
      model.updateMatrixWorld(true);
    }
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.sharedAsset = true;
    });
    this.group.add(model);
  }

  build() {
    this.scene.fog = new THREE.Fog(0xa6defe, 105, 300);
    this.buildTerrain();
    this.buildWater();
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
    const indices = [];
    let vertex = 0;
    for (let row = 0; row <= rows; row += 1) {
      const z = minZ + (maxZ - minZ) * row / rows;
      const shorePoint = this.roadPoint(z, -9);
      const roadYaw = this.roadYaw(z);
      for (let column = 0; column <= columns; column += 1) {
        const x = minX + (maxX - minX) * column / columns;
        const y = this.terrainHeight(x, z);
        positions[vertex * 3] = x;
        positions[vertex * 3 + 1] = y;
        positions[vertex * 3 + 2] = z;
        const altitude = clamp((y - this.roadHeight(z)) / 22, 0, 1);
        const variation = Math.sin(x * 0.047 + z * 0.031) * 0.025 +
          Math.sin(x * 0.13 - z * 0.057) * 0.012;
        const localX = (x - shorePoint.x) * Math.cos(roadYaw) -
          (z - shorePoint.z) * Math.sin(roadYaw);
        const sand = this.route.surface === 'coast'
          ? 1 - smoothstep(1.5, 8, Math.abs(localX))
          : 0;
        const grassColor = [
          clamp(0.24 + altitude * 0.12 + variation, 0, 1),
          clamp(0.43 - altitude * 0.1 + variation, 0, 1),
          clamp(0.18 + altitude * 0.09 + variation, 0, 1)
        ];
        const sandColor = [0.57, 0.48, 0.31];
        for (let channel = 0; channel < 3; channel += 1) {
          colors[vertex * 3 + channel] = THREE.MathUtils.lerp(
            grassColor[channel],
            sandColor[channel],
            sand
          );
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
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const terrain = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })
    );
    terrain.receiveShadow = true;
    this.group.add(terrain);
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
        const bottom = this.terrainHeight(point.x, point.z);
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
