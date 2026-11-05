export class PhysicsEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.position = 0;
    this.speed = 0;
    this.acceleration = 0;
    this.lane = 0;
  }

  update(input, dt, level) {
    const throttle = Number(Boolean(input.up)) - Number(Boolean(input.down));
    const engineAcceleration = level.acceleration;
    this.acceleration = throttle > 0
      ? engineAcceleration
      : throttle < 0
        ? -level.braking
        : -Math.min(this.speed * 0.12, 1.2);
    this.speed = Math.max(0, Math.min(level.maxSpeed, this.speed + this.acceleration * dt));
    this.position += this.speed * dt;
    const steering = Number(Boolean(input.left)) - Number(Boolean(input.right));
    this.lane = Math.max(
      -3.3,
      Math.min(3.3, this.lane + steering * 7 * dt)
    );

    return {
      distance: this.position,
      speed: this.speed,
      acceleration: this.acceleration,
      lane: this.lane,
      steering
    };
  }
}
