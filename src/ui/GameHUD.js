export class GameHUD {
  constructor(root) {
    this.root = root;
  }

  update(state) {
    const set = (id, value) => {
      const element = this.root.querySelector(`#${id}`);
      if (element) element.textContent = value;
    };
    set('hud-speed', `${(state.speed * 3.6).toFixed(0)} km/j`);
    set('hud-acceleration', `${state.acceleration.toFixed(1)} m/s²`);
    set('hud-distance', `${state.distance.toFixed(0)} m`);
    set('hud-time', `${state.elapsed.toFixed(1)} dtk`);
    set('hud-coins', state.coins);
    const progress = this.root.querySelector('#hud-progress');
    if (progress) progress.style.width = `${Math.min(100, state.distance / state.target * 100)}%`;
  }
}
