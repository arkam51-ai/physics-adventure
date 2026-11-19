import * as THREE from 'three';

export class RouteSpline {
  constructor(controlPoints, sampleCount = 1560) {
    if (controlPoints.length < 2) {
      throw new Error('Spline lintasan membutuhkan sedikitnya dua titik kontrol.');
    }

    this.curve = new THREE.CatmullRomCurve3(
      controlPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      false,
      'centripetal'
    );
    this.samples = this.curve.getPoints(sampleCount);
    this.samples.sort((a, b) => a.z - b.z);
    this.startDistance = this.samples[0].z;
    this.endDistance = this.samples[this.samples.length - 1].z;

    for (let index = 1; index < this.samples.length; index += 1) {
      if (this.samples[index].z <= this.samples[index - 1].z) {
        throw new Error('Titik kontrol spline harus memiliki progres z yang meningkat.');
      }
    }
  }

  pointAtDistance(distance, target = new THREE.Vector3()) {
    const z = THREE.MathUtils.clamp(distance, this.startDistance, this.endDistance);
    let low = 0;
    let high = this.samples.length - 1;
    while (high - low > 1) {
      const middle = Math.floor((low + high) / 2);
      if (this.samples[middle].z <= z) low = middle;
      else high = middle;
    }
    const start = this.samples[low];
    const end = this.samples[high];
    const blend = (z - start.z) / (end.z - start.z);
    return target.lerpVectors(start, end, blend);
  }

  frameAtDistance(distance) {
    const center = this.pointAtDistance(distance);
    const before = this.pointAtDistance(distance - 0.5);
    const after = this.pointAtDistance(distance + 0.5);
    const tangent = after.sub(before).normalize();
    const horizontalLength = Math.hypot(tangent.x, tangent.z);
    const side = new THREE.Vector3(
      tangent.z / horizontalLength,
      0,
      -tangent.x / horizontalLength
    );
    return { center, tangent, side };
  }
}
