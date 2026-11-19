import * as THREE from 'three';

function addMesh(parent, geometry, material, position, scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addLimb(parent, start, end, radius, material) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = to.clone().sub(from);
  const segment = addMesh(
    parent,
    new THREE.CylinderGeometry(radius * 0.88, radius, direction.length(), 10),
    material,
    from.clone().add(to).multiplyScalar(0.5).toArray()
  );
  segment.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  addMesh(parent, new THREE.SphereGeometry(radius, 12, 8), material, start);
  addMesh(parent, new THREE.SphereGeometry(radius * 0.88, 12, 8), material, end);
}

function makeBadgeShape() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i += 1) {
    const angle = Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 === 0 ? 0.055 : 0.025;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

export class Player {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'student-driver';
    this.upperBody = new THREE.Group();
    this.upperBody.position.y = 0.24;
    this.group.add(this.upperBody);

    const materials = {
      skin: new THREE.MeshStandardMaterial({ color: 0xc9895d, roughness: 0.82 }),
      shirt: new THREE.MeshStandardMaterial({ color: 0xf6f8fa, roughness: 0.78 }),
      pants: new THREE.MeshStandardMaterial({ color: 0x626e80, roughness: 0.88 }),
      hair: new THREE.MeshStandardMaterial({ color: 0x211c20, roughness: 0.9 }),
      hairLight: new THREE.MeshStandardMaterial({ color: 0x352a2a, roughness: 0.86 }),
      tie: new THREE.MeshStandardMaterial({ color: 0x3569b5, roughness: 0.68 }),
      badge: new THREE.MeshStandardMaterial({ color: 0xf1bf50, metalness: 0.18, roughness: 0.58 }),
      badgeCenter: new THREE.MeshStandardMaterial({ color: 0x3774c8, roughness: 0.6 }),
      white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 }),
      iris: new THREE.MeshStandardMaterial({ color: 0x493128, roughness: 0.42 }),
      pupil: new THREE.MeshStandardMaterial({ color: 0x171b22, roughness: 0.35 }),
      mouth: new THREE.MeshStandardMaterial({ color: 0x713b37, roughness: 0.75 }),
      backpack: new THREE.MeshStandardMaterial({ color: 0x3569dd, roughness: 0.76 }),
      backpackTrim: new THREE.MeshStandardMaterial({ color: 0x244b9e, roughness: 0.8 })
    };

    this.buildBody(materials);
    this.buildHead(materials);
    this.buildBackpack(materials);
  }

  buildBody(materials) {
    addMesh(
      this.upperBody,
      new THREE.BoxGeometry(0.76, 0.9, 0.44),
      materials.shirt,
      [0, 1.59, -0.28],
      [1, 1, 0.96]
    );
    for (const side of [-1, 1]) {
      addMesh(
        this.upperBody,
        new THREE.SphereGeometry(0.2, 14, 10),
        materials.shirt,
        [side * 0.32, 1.78, -0.27],
        [1.12, 0.82, 1.18]
      );
    }
    addMesh(this.upperBody, new THREE.CylinderGeometry(0.12, 0.14, 0.15, 12), materials.skin, [0, 1.91, -0.1]);

    addMesh(this.upperBody, new THREE.BoxGeometry(0.1, 0.31, 0.045), materials.tie, [0, 1.56, 0.104]);
    addMesh(this.upperBody, new THREE.BoxGeometry(0.13, 0.1, 0.06), materials.tie, [0, 1.73, 0.11]);
    addMesh(this.upperBody, new THREE.BoxGeometry(0.28, 0.065, 0.045), materials.tie, [0, 1.99, -0.525]);
    addMesh(this.upperBody, new THREE.BoxGeometry(0.09, 0.12, 0.04), materials.tie, [0, 1.91, -0.535]);
    for (const side of [-1, 1]) {
      const collar = addMesh(
        this.upperBody,
        new THREE.BoxGeometry(0.17, 0.095, 0.045),
        materials.shirt,
        [side * 0.095, 1.99, -0.52]
      );
      collar.rotation.z = side * -0.3;
    }

    addMesh(this.group, new THREE.BoxGeometry(0.43, 0.22, 0.34), materials.pants, [0, 1.16, -0.1]);
    for (const x of [-0.13, 0.13]) {
      addLimb(this.group, [x, 1.13, -0.1], [x, 0.57, 0.03], 0.12, materials.pants);
      addMesh(this.group, new THREE.SphereGeometry(0.14, 12, 8), materials.pants, [x, 0.55, 0.08], [1, 0.55, 1.35]);
    }

    for (const side of [-1, 1]) {
      const shoulder = [side * 0.38, 1.78, -0.26];
      const elbow = [side * 0.48, 1.65, 0.08];
      const hand = [side * 0.35, 1.58, 0.43];
      addMesh(
        this.upperBody,
        new THREE.SphereGeometry(0.17, 14, 10),
        materials.shirt,
        shoulder,
        [1, 0.82, 1.16]
      );
      addLimb(this.upperBody, shoulder, elbow, 0.13, materials.shirt);
      addLimb(this.upperBody, elbow, hand, 0.08, materials.skin);
      addMesh(this.upperBody, new THREE.SphereGeometry(0.09, 12, 8), materials.skin, hand);
    }

    addMesh(this.upperBody, new THREE.CircleGeometry(0.075, 24), materials.badge, [-0.2, 1.66, -0.04]);
    addMesh(this.upperBody, new THREE.CircleGeometry(0.055, 24), materials.badgeCenter, [-0.2, 1.66, -0.045]);
    addMesh(this.upperBody, makeBadgeShape(), materials.white, [-0.2, 1.66, -0.048]);
  }

  buildHead(materials) {
    addMesh(this.upperBody, new THREE.SphereGeometry(0.31, 20, 16), materials.skin, [0, 2.04, -0.1], [0.91, 1.05, 0.88]);
    addMesh(this.upperBody, new THREE.SphereGeometry(0.1, 14, 10), materials.skin, [-0.275, 2.02, -0.1], [0.48, 0.72, 0.68]);
    addMesh(this.upperBody, new THREE.SphereGeometry(0.1, 14, 10), materials.skin, [0.275, 2.02, -0.1], [0.48, 0.72, 0.68]);

    addMesh(this.upperBody, new THREE.SphereGeometry(0.315, 20, 14), materials.hair, [0, 2.08, -0.23], [0.98, 1.03, 0.58]);
    addMesh(this.upperBody, new THREE.SphereGeometry(0.32, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), materials.hair, [0, 2.09, -0.1]);
    addMesh(this.upperBody, new THREE.SphereGeometry(0.16, 14, 10), materials.hairLight, [0.02, 2.31, 0.015], [1.25, 0.6, 0.9]);
    for (const x of [-0.16, 0, 0.16]) {
      addMesh(this.upperBody, new THREE.SphereGeometry(0.105, 12, 8), materials.hair, [x, 2.23, 0.105], [1.1, 0.67, 0.75]);
    }

    for (const x of [-0.105, 0.105]) {
      addMesh(this.upperBody, new THREE.SphereGeometry(0.066, 14, 10), materials.white, [x, 2.045, 0.154], [0.85, 1, 0.55]);
      addMesh(this.upperBody, new THREE.SphereGeometry(0.037, 12, 8), materials.iris, [x, 2.04, 0.184], [0.9, 1, 0.55]);
      addMesh(this.upperBody, new THREE.SphereGeometry(0.02, 10, 8), materials.pupil, [x, 2.04, 0.201], [0.9, 1, 0.55]);
      addMesh(this.upperBody, new THREE.SphereGeometry(0.009, 8, 6), materials.white, [x - 0.009, 2.058, 0.212]);

      const brow = addMesh(
        this.upperBody,
        new THREE.CapsuleGeometry(0.018, 0.09, 3, 8),
        materials.hair,
        [x, 2.145, 0.151],
        [0.72, 1, 0.72]
      );
      brow.rotation.z = x < 0 ? -0.12 : 0.12;
    }

    addMesh(this.upperBody, new THREE.SphereGeometry(0.045, 12, 8), materials.skin, [0, 1.995, 0.19], [0.78, 0.85, 0.9]);
    const smile = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.09, 1.94, 0.16),
      new THREE.Vector3(-0.045, 1.915, 0.189),
      new THREE.Vector3(0, 1.91, 0.195),
      new THREE.Vector3(0.045, 1.915, 0.189),
      new THREE.Vector3(0.09, 1.94, 0.16)
    ]);
    addMesh(this.upperBody, new THREE.TubeGeometry(smile, 12, 0.012, 6, false), materials.mouth, [0, 0, 0]);
  }

  buildBackpack(materials) {
    addMesh(this.upperBody, new THREE.BoxGeometry(0.58, 0.67, 0.28), materials.backpack, [0, 1.53, -0.68]);
    addMesh(this.upperBody, new THREE.BoxGeometry(0.44, 0.23, 0.065), materials.backpackTrim, [0, 1.34, -0.855]);
    addMesh(this.upperBody, new THREE.BoxGeometry(0.2, 0.08, 0.04), materials.badge, [0, 1.63, -0.845]);
    for (const x of [-0.23, 0.23]) {
      addLimb(this.upperBody, [x * 0.72, 1.82, -0.4], [x * 0.72, 1.37, -0.4], 0.045, materials.backpackTrim);
    }
  }
}
