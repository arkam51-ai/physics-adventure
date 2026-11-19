import * as THREE from 'three';
import { AssetLoader } from '../game/AssetLoader.js';

export const CHARACTER_IDS = Object.freeze(['student-male', 'student-female']);

const NEUTRAL_THUMBNAIL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100"%3E%3Crect width="80" height="100" rx="18" fill="%23dce5ec"/%3E%3Ccircle cx="40" cy="32" r="16" fill="%238b9aa7"/%3E%3Cpath d="M12 91c2-21 12-32 28-32s26 11 28 32" fill="%238b9aa7"/%3E%3C/svg%3E';
const thumbnails = new Map(CHARACTER_IDS.map((id) => [id, NEUTRAL_THUMBNAIL]));
let thumbnailsPromise = null;

// These quaternions were sampled from each asset's Idle clip at 0.45 seconds.
// The preview loader returns the scene only, so the sampled static arm pose is
// applied directly. The opposite arm mirrors the pose across the character's
// sagittal plane; the male accessory-side arm gets a small tested clearance.
const ARM_POSES = Object.freeze({
  'student-male': {
    accessorySideZAdjustment: 0.1,
    relaxedSideReach: 0.16,
    left: {
      Shoulder: [0.135267728, 0.072474379, -0.077614351, 0.985102082],
      Arm: [-0.080263205, 0.054534484, 0.397464484, -0.912472367],
      ForeArm: [0, -0.252913743, 0, 0.967488825],
      Hand: [0.058232401, 0.127478823, -0.106776163, 0.984356105]
    }
  },
  'student-female': {
    accessorySideZAdjustment: 0,
    relaxedSideReach: 0.1,
    left: {
      Shoulder: [-0.024749956, -0.054799903, -0.032899942, 0.997648237],
      Arm: [0.009700032, -0.022050072, 0.56585188, -0.824152707],
      ForeArm: [0.007250055, -0.229501785, 0.005750045, 0.973257558],
      Hand: [0.0066, -0.114600003, -0.025599999, 0.993099988]
    }
  }
});

// Only the verified dominant fabric groups are recolored. Lighter trim/edge
// groups and the inner shirt/tie mesh are intentionally left untouched.
const NAVY_FABRIC_GROUPS = Object.freeze({
  'student-male': {
    'attach-coat-mesh': [
      { source: [0.23455, 0.20156, 0.17465], count: 1836 },
      { source: [0.15593, 0.13563, 0.11697], count: 852 }
    ],
    'attach-bottom-mesh': [
      { source: [0.14996, 0.13287, 0.11193], count: 1164 }
    ]
  },
  'student-female': {
    'attach-coat-mesh': [
      { source: [0.19807, 0.19462, 0.1912], count: 1944 },
      { source: [0.13287, 0.13014, 0.13014], count: 960 }
    ],
    'attach-bottom-mesh': [
      { source: [0.17465, 0.17465, 0.17144], count: 1056 },
      { source: [0.09306, 0.09306, 0.09084], count: 360 }
    ]
  }
});

const NAVY_BASE = new THREE.Color('#142744');
const COLOR_MATCH_EPSILON = 0.00002;

function colorLuminance(rgb) {
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function applyArmPose(model, characterId) {
  const profile = ARM_POSES[characterId];
  if (!profile) return;

  const armSuffixes = ['Shoulder', 'Arm', 'ForeArm', 'Hand'];
  const leftBones = armSuffixes.map((suffix) => model.getObjectByName(`Left${suffix}`));
  const rightBones = armSuffixes.map((suffix) => model.getObjectByName(`Right${suffix}`));
  if ([...leftBones, ...rightBones].some((bone) => !bone?.isBone)) {
    console.warn(`Skeleton karakter ${characterId} tidak memiliki tulang lengan yang diharapkan.`);
    return;
  }

  const accessoryAdjustment = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 0, 1),
    profile.accessorySideZAdjustment
  );

  for (let index = 0; index < armSuffixes.length; index += 1) {
    const suffix = armSuffixes[index];
    const left = new THREE.Quaternion(...profile.left[suffix]).normalize();
    if (characterId === 'student-male' && suffix === 'Arm') left.multiply(accessoryAdjustment).normalize();
    leftBones[index].quaternion.copy(left);
    rightBones[index].quaternion.set(left.x, -left.y, -left.z, left.w).normalize();
  }

  model.updateMatrixWorld(true);
  for (const [side, sign] of [['Left', 1], ['Right', -1]]) {
    const forearm = model.getObjectByName(`${side}ForeArm`);
    const hand = model.getObjectByName(`${side}Hand`);
    const targetDistal = new THREE.Vector3(
      sign * profile.relaxedSideReach,
      -Math.sqrt(1 - profile.relaxedSideReach ** 2),
      0
    );

    // The hand joint's local offset identifies the actual distal axis of each
    // asset. Align the forearm to that axis in world space instead of assuming
    // a particular local rotation axis or that both rigs share one basis.
    const wristAxis = hand.position.clone().normalize();
    const forearmWorld = forearm.getWorldQuaternion(new THREE.Quaternion());
    wristAxis.applyQuaternion(forearmWorld).normalize();
    const forearmDelta = new THREE.Quaternion().setFromUnitVectors(wristAxis, targetDistal);
    const adjustedForearmWorld = forearmDelta.multiply(forearmWorld).normalize();
    const parentWorld = forearm.parent.getWorldQuaternion(new THREE.Quaternion());
    forearm.quaternion.copy(parentWorld.invert().multiply(adjustedForearmWorld)).normalize();
    model.updateMatrixWorld(true);

    // The hand mesh's long axis is local +X on the left and -X on the right.
    // Its narrow local Y axis is the palm normal. First point the fingers down,
    // then twist around that measured axis so the palms face inward naturally.
    const handDistal = new THREE.Vector3(sign, 0, 0);
    const handWorld = hand.getWorldQuaternion(new THREE.Quaternion());
    handDistal.applyQuaternion(handWorld).normalize();
    const handDelta = new THREE.Quaternion().setFromUnitVectors(handDistal, targetDistal);
    let adjustedHandWorld = handDelta.multiply(handWorld).normalize();
    const palmNormal = new THREE.Vector3(0, 1, 0).applyQuaternion(adjustedHandWorld).normalize();
    const inward = new THREE.Vector3(-sign, 0, 0);
    const projectedPalm = palmNormal.addScaledVector(targetDistal, -palmNormal.dot(targetDistal)).normalize();
    const projectedInward = inward.addScaledVector(targetDistal, -inward.dot(targetDistal)).normalize();
    const twistAngle = Math.atan2(
      targetDistal.dot(new THREE.Vector3().crossVectors(projectedPalm, projectedInward)),
      projectedPalm.dot(projectedInward)
    );
    adjustedHandWorld = new THREE.Quaternion().setFromAxisAngle(targetDistal, twistAngle)
      .multiply(adjustedHandWorld).normalize();
    const handParentWorld = hand.parent.getWorldQuaternion(new THREE.Quaternion());
    hand.quaternion.copy(handParentWorld.invert().multiply(adjustedHandWorld)).normalize();
    model.updateMatrixWorld(true);
  }
}

function recolorFabric(model, characterId, detachedGeometries) {
  const meshProfiles = NAVY_FABRIC_GROUPS[characterId];
  if (!meshProfiles) return;

  for (const [meshName, groups] of Object.entries(meshProfiles)) {
    const mesh = model.getObjectByName(meshName);
    if (!mesh?.isSkinnedMesh) {
      console.warn(`Mesh pakaian ${meshName} tidak ditemukan pada ${characterId}.`);
      continue;
    }

    const sourceGeometry = mesh.geometry;
    const sourceColors = sourceGeometry.getAttribute('color');
    if (!sourceColors || sourceColors.itemSize < 3) {
      console.warn(`Warna vertex mesh ${meshName} tidak tersedia pada ${characterId}.`);
      continue;
    }

    const geometry = sourceGeometry.clone();
    const colors = geometry.getAttribute('color');
    const matches = groups.map(() => 0);
    const referenceLuminance = colorLuminance(groups[0].source);
    let allGroupsVerified = true;

    for (let vertex = 0; vertex < colors.count; vertex += 1) {
      const original = [colors.getX(vertex), colors.getY(vertex), colors.getZ(vertex)];
      const groupIndex = groups.findIndex((group) => group.source.every((channel, index) => (
        Math.abs(original[index] - channel) <= COLOR_MATCH_EPSILON
      )));
      if (groupIndex < 0) continue;

      matches[groupIndex] += 1;
      const shade = colorLuminance(groups[groupIndex].source) / referenceLuminance;
      colors.setXYZ(vertex, NAVY_BASE.r * shade, NAVY_BASE.g * shade, NAVY_BASE.b * shade);
    }

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
      if (matches[groupIndex] !== groups[groupIndex].count) allGroupsVerified = false;
    }

    if (!allGroupsVerified) {
      geometry.dispose();
      console.warn(`Kelompok warna mesh ${meshName} berubah; pewarnaan dilewati agar aksen tetap aman.`);
      continue;
    }

    colors.needsUpdate = true;
    mesh.geometry = geometry;
    let sourceStillUsed = false;
    model.traverse((object) => {
      if (object !== mesh && object.geometry === sourceGeometry) sourceStillUsed = true;
    });
    if (!sourceStillUsed) detachedGeometries.add(sourceGeometry);
  }
}

function updateSkinnedBounds(model) {
  model.updateMatrixWorld(true);
  model.traverse((object) => {
    if (!object.isSkinnedMesh) return;
    object.computeBoundingBox();
    object.computeBoundingSphere();
  });
  model.updateMatrixWorld(true);
}

export function isCharacterId(id) {
  return CHARACTER_IDS.includes(id);
}

export function getCharacterThumbnail(id) {
  return thumbnails.get(id) ?? NEUTRAL_THUMBNAIL;
}

export function prepareCharacterThumbnails() {
  if (!thumbnailsPromise) thumbnailsPromise = renderCharacterThumbnails();
  return thumbnailsPromise;
}

async function renderCharacterThumbnails() {
  const loader = new AssetLoader();
  const canvas = document.createElement('canvas');
  const detachedGeometries = new Set();
  let renderer = null;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(256, 320, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0xffffff, 0);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x81909f, 2.1));
    const keyLight = new THREE.DirectionalLight(0xfff2df, 2.5);
    keyLight.position.set(-3, 6, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xdceaff, 1.1);
    fillLight.position.set(4, 3, 2);
    scene.add(fillLight);

    const camera = new THREE.PerspectiveCamera(31, 256 / 320, 0.01, 50);
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);

    for (const id of CHARACTER_IDS) {
      try {
        const model = await loader.load(id);
        applyArmPose(model, id);
        recolorFabric(model, id, detachedGeometries);
        updateSkinnedBounds(model);
        scene.add(model);
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const distance = Math.max(
          size.y / (2 * tanHalfFov),
          size.x / (2 * tanHalfFov * camera.aspect)
        ) * 1.28;

        // The supplied pupil models face +Z and have no root rotation.
        camera.position.set(center.x, center.y + 0.02, center.z + distance);
        camera.lookAt(center.x, center.y, center.z);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        thumbnails.set(id, canvas.toDataURL('image/png'));
        scene.remove(model);
      } catch (error) {
        console.warn(`Thumbnail karakter ${id} tidak dapat dibuat.`, error);
      }
    }
  } catch (error) {
    console.warn('Renderer thumbnail karakter tidak tersedia.', error);
  } finally {
    loader.dispose();
    detachedGeometries.forEach((geometry) => geometry.dispose());
    renderer?.dispose();
    try {
      renderer?.forceContextLoss();
    } catch {}
  }

  return thumbnails;
}
