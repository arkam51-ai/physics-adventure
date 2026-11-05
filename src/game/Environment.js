import * as THREE from 'three';

function mesh(geometry, color, x, y, z, parent, materialOptions = {}) {
  const object = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color, roughness: 0.88, ...materialOptions })
  );
  object.position.set(x, y, z);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

export class Environment {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.entities = [];
    this.build();
  }

  build() {
    const ground = mesh(new THREE.PlaneGeometry(200, 600), 0x83ce70, 0, -0.08, 230, this.scene);
    ground.rotation.x = -Math.PI / 2;

    const roadGeometry = new THREE.PlaneGeometry(10, 440, 1, 180);
    const roadPositions = roadGeometry.attributes.position;
    for (let i = 0; i < roadPositions.count; i += 1) {
      const worldZ = 215 - roadPositions.getY(i);
      roadPositions.setZ(i, this.roadHeight(worldZ));
    }
    roadGeometry.computeVertexNormals();
    const road = mesh(roadGeometry, 0x414d5d, 0, 0, 215, this.scene);
    road.rotation.x = -Math.PI / 2;
    for (const x of [-5.2, 5.2]) {
      for (let z = 5; z < 440; z += 10) {
        const edge = mesh(new THREE.BoxGeometry(0.22, 0.16, 10.1), 0xf9cf55, x, this.roadHeight(z) + 0.08, z, this.scene);
        edge.rotation.x = -Math.atan(this.roadSlope(z));
        edge.receiveShadow = true;
      }
    }
    for (let z = 5; z < 440; z += 13) {
      const dash = mesh(new THREE.BoxGeometry(0.16, 0.035, 6), 0xffffff, 0, this.roadHeight(z) + 0.03, z, this.scene);
      dash.rotation.x = -Math.atan(this.roadSlope(z));
      dash.castShadow = false;
    }

    const sky = mesh(new THREE.SphereGeometry(320, 24, 16), 0xa6defe, 0, 0, 100, this.scene, { side: THREE.BackSide });
    sky.castShadow = false;
    sky.receiveShadow = false;
    this.scene.fog = new THREE.Fog(0xa6defe, 90, 280);

    for (let i = 0; i < 16; i += 1) {
      const z = i * 27 + 22;
      this.createTree(-9 - (i % 3), z);
      this.createTree(9 + ((i + 1) % 3), z + 12);
      if (i % 3 === 1) this.createHill(i % 2 ? -19 : 19, z + 10, 4 + (i % 2));
    }
    this.createSchool();

    for (let i = 1; i <= 10; i += 1) {
      const z = i * 30;
      const gate = new THREE.Group();
      gate.position.set(0, this.roadHeight(z), z);
      mesh(new THREE.BoxGeometry(0.28, 4, 0.35), 0x398bdc, -4.55, 2, 0, gate);
      mesh(new THREE.BoxGeometry(0.28, 4, 0.35), 0x398bdc, 4.55, 2, 0, gate);
      mesh(new THREE.BoxGeometry(9.4, 0.3, 0.35), 0xffbd3f, 0, 4, 0, gate);
      this.scene.add(gate);
      this.entities.push({ kind: 'checkpoint', object: gate, z, hit: false, index: i - 1 });
    }

    for (let i = 0; i < 30; i += 1) {
      const lane = [-2.5, 0, 2.5][i % 3];
      const z = 15 + i * 11;
      if (i % 5 === 3) {
        const obstacle = mesh(new THREE.BoxGeometry(1.05, 0.9, 0.9), 0xea654f, lane, this.roadHeight(z) + 0.5, z, this.scene);
        this.entities.push({ kind: 'obstacle', object: obstacle, z, lane, hit: false });
      } else {
        const coin = mesh(
          new THREE.TorusGeometry(0.42, 0.13, 8, 18),
          0xffd64b,
          lane,
          this.roadHeight(z) + 1.15,
          z,
          this.scene,
          { metalness: 0.35 }
        );
        coin.rotation.y = Math.PI / 2;
        this.entities.push({ kind: 'coin', object: coin, z, lane, hit: false });
      }
    }
    this.entities.sort((a, b) => a.z - b.z);
    void ground;
    void sky;
  }

  createTree(x, z) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    mesh(new THREE.CylinderGeometry(0.22, 0.3, 2.4, 8), 0x8c5938, 0, 1.2, 0, tree);
    mesh(new THREE.ConeGeometry(1.4, 2.8, 9), 0x2d9c67, 0, 3.3, 0, tree);
    mesh(new THREE.ConeGeometry(1.05, 2.2, 9), 0x43b878, 0, 4.25, 0, tree);
    this.scene.add(tree);
  }

  createHill(x, z, radius) {
    const hill = mesh(new THREE.SphereGeometry(radius, 12, 9), 0x72b965, x, radius * 0.55, z, this.scene);
    hill.scale.y = 0.72;
  }

  createSchool() {
    const building = new THREE.Group();
    building.position.set(-15, 0, 18);
    mesh(new THREE.BoxGeometry(8, 4.5, 6), 0xffe6a1, 0, 2.25, 0, building);
    mesh(new THREE.ConeGeometry(5.4, 2.1, 4), 0xe87558, 0, 5.35, 0, building).rotation.y = Math.PI / 4;
    mesh(new THREE.BoxGeometry(0.3, 0.8, 0.12), 0x5377ba, 0, 3.4, 3.08, building);
    this.scene.add(building);
  }

  roadHeight(distance) {
    if (this.level.id === 'glb') return 0;
    const amplitude = this.level.id === 'glbb' ? 1.5 : 1.1;
    return amplitude * Math.sin(distance / 72);
  }

  roadSlope(distance) {
    return (this.roadHeight(distance + 1) - this.roadHeight(distance - 1)) / 2;
  }

  update(time) {
    for (const entity of this.entities) {
      if (entity.kind === 'coin' && !entity.hit) {
        entity.object.rotation.y += 0.045;
        entity.object.position.y = this.roadHeight(entity.z) + 1.15 + Math.sin(time * 0.003 + entity.z) * 0.12;
      }
    }
  }

  dispose() {
    this.scene.clear();
  }
}
