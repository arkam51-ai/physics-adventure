import * as THREE from 'three';
import { Player } from './Player.js';

function box(parent, size, color, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color, roughness: 0.62 }));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export class Vehicle {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    box(this.group, [1.9, 0.55, 3.2], 0xff7538, [0, 0.66, 0]);
    box(this.group, [1.35, 0.65, 1.45], 0x7bd8ff, [0, 1.18, -0.15]);
    box(this.group, [0.42, 0.18, 0.08], 0xfff1a8, [-0.62, 0.67, 1.63]);
    box(this.group, [0.42, 0.18, 0.08], 0xfff1a8, [0.62, 0.67, 1.63]);
    box(this.group, [0.4, 0.2, 0.08], 0xf74449, [-0.62, 0.67, -1.63]);
    box(this.group, [0.4, 0.2, 0.08], 0xf74449, [0.62, 0.67, -1.63]);
    box(this.group, [0.72, 0.22, 0.18], 0xffc549, [0, 1.08, -1.05]);

    this.wheels = [];
    this.frontWheels = [];
    for (const x of [-0.92, 0.92]) {
      for (const z of [-1, 1]) {
        const mount = new THREE.Group();
        mount.position.set(x, 0.42, z);
        this.group.add(mount);
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.39, 0.39, 0.22, 16),
          new THREE.MeshStandardMaterial({ color: 0x263346, roughness: 0.86 })
        );
        wheel.rotation.z = Math.PI / 2;
        mount.add(wheel);
        wheel.castShadow = true;
        this.wheels.push({ mesh: wheel, mount, isFront: z > 0 });
        if (z > 0) this.frontWheels.push(mount);
      }
    }

    this.driver = new Player();
    this.group.add(this.driver.group);
    const backpack = box(this.group, [0.48, 0.58, 0.28], 0x3569dd, [-0.37, 1.52, -0.48]);
    backpack.rotation.y = -0.12;
  }

  update(lane, speed, dt, steering = 0) {
    this.group.position.x += (lane - this.group.position.x) * Math.min(1, dt * 8);
    const steeringAngle = steering * 0.2;
    this.group.rotation.y += (steeringAngle - this.group.rotation.y) * Math.min(1, dt * 8);
    for (const { mesh, mount, isFront } of this.wheels) {
      mesh.rotation.x -= speed * dt * 1.4;
      if (isFront) mount.rotation.y += (steeringAngle - mount.rotation.y) * Math.min(1, dt * 10);
    }
  }
}
