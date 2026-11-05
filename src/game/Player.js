import * as THREE from 'three';

export class Player {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'student-driver';

    const shirt = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.62, 0.46),
      new THREE.MeshStandardMaterial({ color: 0xf3f6f7 })
    );
    shirt.position.set(0, 1.56, -0.1);
    shirt.castShadow = true;
    this.group.add(shirt);

    const tie = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.3, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x8795a7 })
    );
    tie.position.set(0, 1.57, 0.14);
    this.group.add(tie);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.31, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xc9895d })
    );
    head.position.set(0, 2.04, -0.1);
    head.castShadow = true;
    this.group.add(head);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x283345 })
    );
    hair.position.set(0, 2.1, -0.1);
    this.group.add(hair);
  }
}
