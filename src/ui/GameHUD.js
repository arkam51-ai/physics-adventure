export class GameHUD {
  constructor(root, maxSpeed) {
    this.root = root;
    this.maxSpeed = Math.max(0, Number(maxSpeed) || 0);
  }

  update(state) {
    const set = (id, value) => {
      const element = this.root.querySelector(`#${id}`);
      if (element) element.textContent = value;
    };
    const speed = Math.max(0, Number(state.speed) || 0);
    const speedRatio = this.maxSpeed > 0 ? Math.min(1, speed / this.maxSpeed) : 0;
    set('hud-speed', `${(speed * 3.6).toFixed(0)} km/j`);
    console.log('ACCELERATION:', state.acceleration);
    const speedometer = this.root.querySelector('.hud-row > .hud-card:first-child');
    if (speedometer) speedometer.style.setProperty('--speed-gauge-progress', `${(speedRatio * 250).toFixed(2)}deg`);
    set('hud-acceleration', `${state.acceleration.toFixed(1)} m/s²`);
    set('hud-distance', `${state.distance.toFixed(0)} m`);
    set('hud-time', `${state.elapsed.toFixed(1)} dtk`);
    set('hud-coins', state.coins);
    const progress = this.root.querySelector('#hud-progress');
    if (progress) progress.style.width = `${Math.min(100, state.distance / state.target * 100)}%`;
  }
}
