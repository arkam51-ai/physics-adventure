
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
    const throttle =
      Number(Boolean(input.up)) -
      Number(Boolean(input.down));

    const previousSpeed = this.speed;
    const maxSpeed = Math.max(Number(level.maxSpeed) || 0, 0);
    const engineAcceleration = Number(level.acceleration) || 0;
    const braking = Number(level.braking) || 0;

    if (throttle > 0) {
      this.acceleration = engineAcceleration;
    } else if (throttle < 0) {
      this.acceleration = -braking;
    } else {
      this.acceleration = -Math.min(
        previousSpeed * 0.12,
        1.2
      );
    }

    const safeDt = Math.max(0, Math.min(dt, 0.05));

    this.speed = Math.max(
      0,
      Math.min(
        maxSpeed,
        previousSpeed + this.acceleration * safeDt
      )
    );

    this.acceleration = safeDt > 0
      ? (this.speed - previousSpeed) / safeDt
      : 0;

    this.position += this.speed * safeDt;

    const steering =
      Number(Boolean(input.left)) -
      Number(Boolean(input.right));

    this.lane = Math.max(
      -3.3,
      Math.min(
        3.3,
        this.lane + steering * 7 * safeDt
      )
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
