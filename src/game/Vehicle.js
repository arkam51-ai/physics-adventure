import * as THREE from 'three';
import { Player } from './Player.js';

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function measureModel(model) {
  model.updateMatrixWorld(true);
  const meshes = [];
  model.traverse((child) => {
    if (!child.isMesh) return;
    const bounds = new THREE.Box3().setFromObject(child);
    if (bounds.isEmpty()) return;
    meshes.push({
      child,
      bounds,
      center: bounds.getCenter(new THREE.Vector3()),
      size: bounds.getSize(new THREE.Vector3())
    });
  });
  if (meshes.length === 0) throw new Error('Model GLB tidak memiliki mesh yang dapat diukur.');

  const axes = ['x', 'y', 'z'];
  const medians = axes.map((axis) => median(meshes.map((mesh) => mesh.center[axis])));
  const deviations = axes.map((axis, index) =>
    median(meshes.map((mesh) => Math.abs(mesh.center[axis] - medians[index])))
  );
  const medianSizes = axes.map((axis) => median(meshes.map((mesh) => mesh.size[axis])));
  const limits = axes.map((axis, index) =>
    Math.max(deviations[index] * 4.5, medianSizes[index] * 4, 1e-5)
  );
  for (const mesh of meshes) {
    mesh.outlierAxes = axes.filter((axis, index) =>
      Math.abs(mesh.center[axis] - medians[index]) > limits[index]
    );
  }
  const inliers = meshes.filter((mesh) => mesh.outlierAxes.length === 0);
  if (inliers.length < meshes.length * 0.75) {
    throw new Error('Sebagian besar mesh GLB berada di luar kelompok geometri utama; orientasi tidak dapat dipastikan.');
  }

  const bounds = new THREE.Box3();
  for (const mesh of inliers) bounds.union(mesh.bounds);
  return {
    meshes,
    inliers,
    outliers: meshes.filter((mesh) => !inliers.includes(mesh)),
    bounds
  };
}

function repairDetachedDisplays(measurement) {
  const center = measurement.bounds.getCenter(new THREE.Vector3());
  let repaired = 0;
  for (const mesh of measurement.outliers) {
    if (!/sunburst_display/i.test(mesh.child.name)) continue;
    const offset = new THREE.Vector3();
    for (const axis of mesh.outlierAxes) offset[axis] = center[axis] - mesh.center[axis];
    const parent = mesh.child.parent;
    if (parent) {
      const target = parent.localToWorld(mesh.child.position.clone()).add(offset);
      mesh.child.position.copy(parent.worldToLocal(target));
    } else {
      mesh.child.position.add(offset);
    }
    repaired += 1;
  }
  return repaired;
}

function findAxlePositions(measurement, longAxis, forwardSign) {
  const sideAxis = longAxis === 'x' ? 'z' : 'x';
  const bounds = measurement.bounds;
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const lateralWidth = size[sideAxis];
  const longitudinalLength = size[longAxis];
  const medianHeight = median(measurement.inliers.map((mesh) => mesh.center.y));
  const candidates = measurement.inliers.filter((mesh) => {
    const lateralOffset = Math.abs(mesh.center[sideAxis] - center[sideAxis]);
    const forwardOffset = (mesh.center[longAxis] - center[longAxis]) * forwardSign;
    return lateralOffset > lateralWidth * 0.25 &&
      mesh.center.y < medianHeight &&
      Math.abs(forwardOffset) > longitudinalLength * 0.15;
  });
  const longitudinalTolerance = longitudinalLength * 0.055;
  const lateralTolerance = lateralWidth * 0.12;
  const verticalTolerance = size.y * 0.08;
  const pairs = [];

  for (const positiveSide of candidates.filter((mesh) => mesh.center[sideAxis] > center[sideAxis])) {
    for (const negativeSide of candidates.filter((mesh) => mesh.center[sideAxis] < center[sideAxis])) {
      const positiveTrack = positiveSide.center[sideAxis] - center[sideAxis];
      const negativeTrack = center[sideAxis] - negativeSide.center[sideAxis];
      if (
        Math.abs(positiveSide.center[longAxis] - negativeSide.center[longAxis]) > longitudinalTolerance ||
        Math.abs(positiveSide.center.y - negativeSide.center.y) > verticalTolerance ||
        Math.abs(positiveTrack - negativeTrack) > lateralTolerance
      ) continue;

      pairs.push({
        coordinate: (positiveSide.center[longAxis] + negativeSide.center[longAxis]) / 2,
        forwardOffset: ((positiveSide.center[longAxis] + negativeSide.center[longAxis]) / 2 - center[longAxis]) * forwardSign,
        height: (positiveSide.center.y + negativeSide.center.y) / 2,
        halfTrack: (positiveTrack + negativeTrack) / 2
      });
    }
  }

  const groups = [];
  for (const pair of pairs.sort((a, b) => a.coordinate - b.coordinate)) {
    let group = groups.find((candidate) =>
      Math.abs(candidate.coordinate - pair.coordinate) <= longitudinalTolerance
    );
    if (!group) {
      group = { pairs: [] };
      groups.push(group);
    }
    group.pairs.push(pair);
    group.coordinate = median(group.pairs.map((entry) => entry.coordinate));
  }

  const selectAxle = (isFront) => {
    const matching = groups.filter((group) => group.pairs[0].forwardOffset * (isFront ? 1 : -1) >
      longitudinalLength * 0.15
    );
    matching.sort((a, b) =>
      median(a.pairs.map((pair) => pair.height)) - median(b.pairs.map((pair) => pair.height))
    );
    const selected = matching[0];
    if (!selected) return null;
    return {
      coordinate: median(selected.pairs.map((pair) => pair.coordinate)),
      halfTrack: median(selected.pairs.map((pair) => pair.halfTrack))
    };
  };

  const front = selectAxle(true);
  const rear = selectAxle(false);
  if (
    !front ||
    !rear ||
    (front.coordinate - rear.coordinate) * forwardSign < longitudinalLength * 0.25
  ) {
    throw new Error('Posisi axle depan/belakang GLB tidak dapat diidentifikasi dengan yakin.');
  }
  return { front, rear, sideAxis };
}

function box(parent, size, material, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function beam(parent, start, end, width, material) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = to.clone().sub(from);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, direction.length(), width),
    material
  );
  mesh.position.copy(from.add(to).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function quad(parent, points, material) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(points.flat());
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function makePlateTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 144;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas tidak tersedia untuk membuat pelat kendaraan.');
  context.fillStyle = '#f8fbff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#29364a';
  context.lineWidth = 12;
  context.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.fillStyle = '#172941';
  context.font = 'bold 82px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('PHYSICS', canvas.width / 2, canvas.height / 2 + 3);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class Vehicle {
  constructor(scene, assetLoader) {
    this.disposed = false;
    this.ownedGeometries = new Set();
    this.ownedMaterials = new Set();
    this.ownedTextures = new Set();
    this.group = new THREE.Group();
    this.group.visible = false;
    scene.add(this.group);

    this.body = new THREE.Group();
    this.group.add(this.body);

    this.ready = assetLoader.load('honda_fit_gk5').then((model) => {
      if (this.disposed || !this.group.parent) return false;
      this.useCarModel(model.clone(true));
      return true;
    }).catch((error) => {
      console.error('Gagal menyiapkan model Honda Jazz.', error);
      throw error;
    });

    const paint = new THREE.MeshPhysicalMaterial({
      color: 0xf5f7fa,
      roughness: 0.3,
      metalness: 0.12,
      clearcoat: 0.82,
      clearcoatRoughness: 0.22
    });
    const trim = new THREE.MeshStandardMaterial({ color: 0x202a38, roughness: 0.55, metalness: 0.18 });
    const glass = new THREE.MeshStandardMaterial({
      color: 0x193b5c,
      roughness: 0.22,
      metalness: 0.24,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xc8d1dc, roughness: 0.24, metalness: 0.78 });
    const tire = new THREE.MeshStandardMaterial({ color: 0x20242b, roughness: 0.9 });
    const rubberDetail = new THREE.MeshStandardMaterial({ color: 0x343b45, roughness: 0.84 });
    const headlight = new THREE.MeshStandardMaterial({
      color: 0xe9f7ff,
      emissive: 0x719dc4,
      emissiveIntensity: 0.4,
      roughness: 0.24
    });
    const tailLight = new THREE.MeshStandardMaterial({
      color: 0xe52e3e,
      emissive: 0x8c1020,
      emissiveIntensity: 0.35,
      roughness: 0.28
    });
    const indicator = new THREE.MeshStandardMaterial({ color: 0xffae4a, emissive: 0x8b3c05, roughness: 0.35 });
    const grille = new THREE.MeshStandardMaterial({ color: 0x101720, roughness: 0.68, metalness: 0.12 });
    const plate = new THREE.MeshStandardMaterial({ map: makePlateTexture(), roughness: 0.48 });
    this.modelPlate = box(this.group, [0.76, 0.2, 0.035], plate, [0, 0.78, -1.75]);
    this.modelPlate.rotation.y = Math.PI;
    this.modelPlate.visible = false;

    box(this.body, [1.84, 0.42, 3.46], trim, [0, 0.58, -0.02]);
    box(this.body, [1.9, 0.3, 3.22], paint, [0, 0.76, -0.04]);
    box(this.body, [1.66, 0.22, 1.17], paint, [0, 0.98, 0.98]);
    box(this.body, [1.62, 0.2, 0.76], paint, [0, 0.94, -1.2]);
    box(this.body, [1.86, 0.2, 0.18], paint, [0, 0.87, 1.62]);
    box(this.body, [1.86, 0.2, 0.18], paint, [0, 0.86, -1.64]);

    for (const x of [-0.88, 0.88]) {
      box(this.body, [0.12, 0.31, 2.25], paint, [x, 0.79, -0.04]);
      box(this.body, [0.12, 0.11, 0.7], trim, [x * 0.98, 0.56, 0.1]);
    }

    box(this.body, [1.14, 0.22, 0.06], grille, [0, 0.83, 1.676]);
    box(this.body, [1.28, 0.055, 0.045], chrome, [0, 0.97, 1.67]);
    box(this.body, [0.34, 0.12, 0.055], trim, [0, 0.82, 1.714]);
    box(this.body, [1.9, 0.13, 0.24], trim, [0, 0.58, 1.71]);
    box(this.body, [1.52, 0.055, 0.27], trim, [0, 0.48, 1.79]);
    for (const x of [-0.62, 0.62]) {
      box(this.body, [0.48, 0.16, 0.09], headlight, [x, 1.0, 1.59]);
      box(this.body, [0.19, 0.09, 0.05], indicator, [x * 1.24, 0.78, 1.69]);
      box(this.body, [0.17, 0.2, 0.075], tailLight, [x * 1.28, 1.0, -1.67]);
      box(this.body, [0.22, 0.055, 0.045], headlight, [x * 1.2, 0.57, -1.72]);
    }

    box(this.body, [1.9, 0.13, 0.24], trim, [0, 0.58, -1.72]);
    box(this.body, [1.46, 0.07, 0.11], chrome, [0, 0.7, -1.727]);
    const plateMesh = box(this.body, [0.76, 0.2, 0.035], plate, [0, 0.78, -1.75]);
    plateMesh.rotation.y = Math.PI;

    quad(this.body, [
      [-0.7, 1.12, 0.56],
      [0.7, 1.12, 0.56],
      [0.52, 2.34, -0.32],
      [-0.52, 2.34, -0.32]
    ], glass);
    quad(this.body, [
      [-0.52, 2.34, -0.48],
      [0.52, 2.34, -0.48],
      [0.68, 1.14, -1.24],
      [-0.68, 1.14, -1.24]
    ], glass);

    for (const side of [-1, 1]) {
      const x = side * 0.7;
      quad(this.body, [
        [x, 1.2, -1.14],
        [x, 1.2, 0.42],
        [side * 0.56, 2.32, -0.34],
        [side * 0.56, 2.32, -0.58]
      ], glass);
      beam(this.body, [side * 0.7, 1.1, 0.53], [side * 0.56, 2.34, -0.34], 0.09, paint);
      beam(this.body, [side * 0.7, 1.12, -1.22], [side * 0.56, 2.34, -0.58], 0.09, paint);
      beam(this.body, [side * 0.72, 1.18, 0.4], [side * 0.7, 1.18, -1.12], 0.045, chrome);

      const mirror = new THREE.Group();
      mirror.position.set(side * 0.82, 1.43, 0.46);
      this.body.add(mirror);
      beam(mirror, [0, 0, 0], [side * 0.07, 0.1, 0.02], 0.065, trim);
      const mirrorShell = box(mirror, [0.22, 0.13, 0.18], paint, [side * 0.13, 0.13, 0.04]);
      mirrorShell.rotation.y = side * 0.12;
      box(mirror, [0.015, 0.085, 0.13], glass, [side * 0.245, 0.13, 0.045]);
    }

    box(this.body, [1.12, 0.12, 0.72], paint, [0, 2.52, 0.23]);
    box(this.body, [1.04, 0.045, 0.16], trim, [0, 2.43, 0.56]);
    for (const x of [-0.42, 0.42]) {
      beam(this.body, [x, 2.31, -0.49], [x, 2.52, 0.48], 0.055, paint);
      beam(this.body, [x, 2.31, -0.49], [x * 0.94, 2.5, -0.67], 0.05, paint);
    }

    const spoiler = new THREE.Group();
    spoiler.position.set(0, 0, -1.47);
    this.body.add(spoiler);
    for (const x of [-0.48, 0.48]) {
      beam(spoiler, [x, 1.02, 0], [x, 1.28, -0.1], 0.055, trim);
    }
    box(spoiler, [1.48, 0.09, 0.28], paint, [0, 1.3, -0.1]);
    box(spoiler, [1.18, 0.035, 0.16], trim, [0, 1.24, -0.09]);

    this.wheels = [];
    this.frontWheels = [];
    for (const x of [-0.92, 0.92]) {
      for (const z of [-1, 1]) {
        const mount = new THREE.Group();
        mount.position.set(x, 0.42, z);
        this.group.add(mount);
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.22, 16), tire);
        wheel.rotation.z = Math.PI / 2;
        mount.add(wheel);
        wheel.castShadow = true;

        for (const side of [-1, 1]) {
          const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.025, 16), chrome);
          rim.position.y = side * 0.115;
          wheel.add(rim);
          const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 12), trim);
          hub.position.y = side * 0.135;
          wheel.add(hub);
          for (let spokeIndex = 0; spokeIndex < 5; spokeIndex += 1) {
            const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.035, 0.29), chrome);
            spoke.position.set(0, side * 0.13, 0);
            spoke.rotation.y = (spokeIndex * Math.PI) / 5;
            wheel.add(spoke);
          }
        }
        for (let treadIndex = 0; treadIndex < 12; treadIndex += 1) {
          const tread = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.225, 0.035), rubberDetail);
          tread.position.set(
            Math.sin((treadIndex * Math.PI) / 6) * 0.37,
            0,
            Math.cos((treadIndex * Math.PI) / 6) * 0.37
          );
          tread.rotation.y = (treadIndex * Math.PI) / 6;
          wheel.add(tread);
        }

        this.wheels.push({ mesh: wheel, mount, isFront: z > 0, side: Math.sign(x) });
        if (z > 0) this.frontWheels.push(mount);
      }
    }

    this.wheelArches = [];
    for (const x of [-0.92, 0.92]) {
      for (const z of [-1, 1]) {
        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.055, 6, 16), paint);
        arch.position.set(x * 0.94, 0.42, z);
        arch.rotation.y = Math.PI / 2;
        arch.castShadow = true;
        arch.receiveShadow = true;
        this.group.add(arch);
        this.wheelArches.push({ mesh: arch, isFront: z > 0, side: Math.sign(x) });
      }
    }

    this.driver = new Player();
    this.group.add(this.driver.group);
    this.driver.group.visible = false;
    this.captureOwnedResources();
  }

  captureOwnedResources() {
    this.group.traverse((object) => {
      if (object.geometry) this.ownedGeometries.add(object.geometry);
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of objectMaterials) {
        if (!material) continue;
        this.ownedMaterials.add(material);
        for (const value of Object.values(material)) {
          if (value?.isTexture) this.ownedTextures.add(value);
        }
      }
    });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.group.removeFromParent();
    for (const texture of this.ownedTextures) texture.dispose();
    for (const material of this.ownedMaterials) material.dispose();
    for (const geometry of this.ownedGeometries) geometry.dispose();
    this.ownedTextures.clear();
    this.ownedMaterials.clear();
    this.ownedGeometries.clear();
    this.group.clear();
    this.body.clear();
    this.wheels.length = 0;
    this.frontWheels.length = 0;
    this.wheelArches.length = 0;
    this.driver = null;
    this.carModel = null;
    this.modelPlate = null;
  }

  useCarModel(model) {
    let originalMeasurement = measureModel(model);
    const repairedDisplays = repairDetachedDisplays(originalMeasurement);
    if (repairedDisplays > 0) originalMeasurement = measureModel(model);
    const originalSize = originalMeasurement.bounds.getSize(new THREE.Vector3());
    const sourceCenter = originalMeasurement.bounds.getCenter(new THREE.Vector3());
    const longAxis = originalSize.x > originalSize.z ? 'x' : 'z';
    const widthAxis = longAxis === 'x' ? 'z' : 'x';
    if (originalSize[longAxis] / originalSize[widthAxis] < 1.15) {
      throw new Error('Sumbu panjang GLB tidak dapat dibedakan dengan yakin dari lebarnya.');
    }

    const headlightCenters = [];
    const taillightCenters = [];
    for (const mesh of originalMeasurement.inliers) {
      const materialNames = Array.isArray(mesh.child.material)
        ? mesh.child.material.map((material) => material.name).join(' ')
        : mesh.child.material?.name ?? '';
      const name = `${mesh.child.name} ${materialNames}`;
      if (/low.?beam|head.?light/i.test(name)) headlightCenters.push(mesh.center[longAxis]);
      if (/tail.?light|tail.?lamp/i.test(name)) taillightCenters.push(mesh.center[longAxis]);
    }
    if (headlightCenters.length === 0 || taillightCenters.length === 0) {
      throw new Error('Arah depan GLB tidak dapat diverifikasi dari posisi lampu depan dan belakang.');
    }
    const headlightPosition = median(headlightCenters);
    const taillightPosition = median(taillightCenters);
    if (Math.abs(headlightPosition - taillightPosition) < originalSize[longAxis] * 0.25) {
      throw new Error('Indikator lampu GLB tidak cukup terpisah untuk memastikan arah kendaraan.');
    }
    const forwardSign = Math.sign(headlightPosition - taillightPosition);
    const forward = new THREE.Vector3();
    forward[longAxis] = forwardSign;
    const yaw = -Math.atan2(forward.x, forward.z);
    const axles = findAxlePositions(originalMeasurement, longAxis, forwardSign);

    model.rotation.y = yaw;
    const measurement = measureModel(model);
    const bounds = measurement.bounds;
    const size = bounds.getSize(new THREE.Vector3());
    if (size.z <= size.x || !Number.isFinite(size.z)) {
      throw new Error('Normalisasi GLB tidak menghasilkan orientasi kendaraan menghadap sumbu +Z.');
    }

    const scale = 1.9 / size.x;
    const center = bounds.getCenter(new THREE.Vector3());
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
    this.modelPlate.position.set(0, 0.62, -size.z * scale / 2 - 0.025);
    this.modelPlate.visible = true;

    const mapAxle = (axle, side) => {
      const point = new THREE.Vector3();
      point[longAxis] = axle.coordinate;
      point[axles.sideAxis] = sourceCenter[axles.sideAxis] + axle.halfTrack * side;
      point.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      return {
        x: (point.x - center.x) * scale,
        z: (point.z - center.z) * scale
      };
    };
    for (const wheel of this.wheels) {
      const position = mapAxle(wheel.isFront ? axles.front : axles.rear, wheel.side);
      wheel.mount.position.set(position.x, 0.42, position.z);
    }
    for (const arch of this.wheelArches) {
      const position = mapAxle(arch.isFront ? axles.front : axles.rear, arch.side);
      arch.mesh.position.set(position.x, 0.42, position.z);
    }

    for (const mesh of measurement.meshes) {
      mesh.child.castShadow = true;
      mesh.child.receiveShadow = true;
    }
    const tintedGlass = new THREE.MeshPhysicalMaterial({
      color: 0x101419,
      roughness: 0.24,
      metalness: 0.12,
      clearcoat: 0.55,
      clearcoatRoughness: 0.2
    });
    const redTailLight = new THREE.MeshPhysicalMaterial({
      color: 0xb20d1c,
      emissive: 0x250006,
      emissiveIntensity: 0.22,
      roughness: 0.28,
      metalness: 0.04,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18
    });
    this.ownedMaterials.add(tintedGlass);
    this.ownedMaterials.add(redTailLight);
    model.traverse((child) => {
      if (!child.isMesh) return;
      const name = child.name.toLowerCase();
      if (/glass|windshield|window/.test(name)) child.material = tintedGlass;
      else if (/tail.?light|tail.?lamp|jazz_taillight/.test(name)) child.material = redTailLight;
    });
    if (measurement.outliers.length > 0) {
      console.warn(
        `GLB memiliki ${measurement.outliers.length} mesh jauh dari bounds utama; semua tetap ditampilkan dan hanya dikecualikan dari pengukuran alignment.`,
        measurement.outliers.map((mesh) => mesh.child.name)
      );
    }
    console.info('Orientasi dan ukuran Honda GLB terukur:', {
      sourceDimensions: originalSize.toArray(),
      longAxis,
      forwardSign,
      yaw,
      scale,
      repairedDetachedDisplays: repairedDisplays,
      wheelbase: (axles.front.coordinate - axles.rear.coordinate) * forwardSign * scale
    });

    this.carModel = model;
    this.body.add(model);
    for (const child of this.body.children) {
      if (child !== model) child.visible = false;
    }
    this.body.visible = true;
  }

  update(lane, speed, dt, steering = 0, roadYaw = 0, roadCenterX = 0) {
    const targetX = roadCenterX + lane * Math.cos(roadYaw);
    this.group.position.x += (targetX - this.group.position.x) * Math.min(1, dt * 8);
    const steeringAngle = steering * 0.2;
    const heading = roadYaw + steeringAngle;
    this.group.rotation.y += (heading - this.group.rotation.y) * Math.min(1, dt * 8);
    for (const { mesh, mount, isFront } of this.wheels) {
      mesh.rotation.x -= speed * dt * 1.4;
      if (isFront) mount.rotation.y += (steeringAngle - mount.rotation.y) * Math.min(1, dt * 10);
    }
  }
}
