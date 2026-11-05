import * as THREE from 'three';
import { Environment } from './Environment.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { Vehicle } from './Vehicle.js';

export class Game {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa6defe);
    this.camera = new THREE.PerspectiveCamera(54, 1, 0.1, 600);
    this.camera.position.set(0, 7, -11);
    this.camera.lookAt(0, 1, 8);
    this.addLights();
    this.physics = new PhysicsEngine();
    this.keys = { up: false, down: false, left: false, right: false };
    this.running = false;
    this.paused = false;
    this.frame = this.frame.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWindowBlur = this.onWindowBlur.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
    window.addEventListener('resize', this.onResize);
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(canvas);
    this.onResize();
    this.clock = new THREE.Clock();
  }

  addLights() {
    this.scene.background = new THREE.Color(0xa6defe);
    this.scene.add(new THREE.HemisphereLight(0xe9f8ff, 0x55714b, 2));
    const sun = new THREE.DirectionalLight(0xfff4d6, 3.1);
    sun.position.set(-15, 28, -5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(sun);
  }

  start(level) {
    this.stopScene();
    this.addLights();
    this.level = level;
    this.physics.reset();
    this.coins = 0;
    this.elapsed = 0;
    this.nextCheckpoint = 0;
    this.keys = { up: false, down: false, left: false, right: false };
    this.environment = new Environment(this.scene, level);
    this.vehicle = new Vehicle(this.scene);
    this.running = true;
    this.paused = false;
    this.clock.start();
    this.frame();
  }

  frame() {
    if (!this.running) return;
    requestAnimationFrame(this.frame);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.paused) {
      this.elapsed += dt;
      const state = this.physics.update(this.keys, dt, this.level);
      this.vehicle.update(state.lane, state.speed, dt, state.steering);
      this.vehicle.group.position.y = this.environment.roadHeight(state.distance);
      this.vehicle.group.position.z = state.distance;
      this.camera.position.x += (state.lane * 0.25 - this.camera.position.x) * Math.min(1, dt * 2);
      this.camera.position.y = 7 + this.environment.roadHeight(state.distance);
      this.camera.position.z = state.distance - 11;
      this.camera.lookAt(state.lane * 0.18, 1 + this.environment.roadHeight(state.distance + 8), state.distance + 8);
      this.environment.update(performance.now());
      this.checkEntities(state);
      const completed = !this.paused && state.distance >= this.level.distance;
      this.callbacks.onUpdate?.({
        ...state,
        elapsed: this.elapsed,
        coins: this.coins,
        target: this.level.distance
      });
      if (completed) {
        this.running = false;
        this.callbacks.onFinish?.({ distance: state.distance, elapsed: this.elapsed, coins: this.coins });
      }
    }
    this.renderer.render(this.scene, this.camera);
  }

  checkEntities(state) {
    for (const entity of this.environment.entities) {
      if (entity.hit) continue;
      if (entity.kind === 'checkpoint' && state.distance >= entity.z) {
        entity.hit = true;
        this.nextCheckpoint += 1;
        this.paused = true;
        this.callbacks.onCheckpoint?.(entity.index);
        break;
      }
      if (Math.abs(state.distance - entity.z) > 1.8 || Math.abs(state.lane - (entity.lane ?? 0)) > 1.45) continue;
      if (entity.kind === 'coin') {
        entity.hit = true;
        entity.object.visible = false;
        this.coins += 1;
        this.callbacks.onCoin?.(this.coins);
      } else if (entity.kind === 'obstacle') {
        entity.hit = true;
        this.physics.speed *= 0.55;
        this.callbacks.onObstacle?.();
      }
    }
  }

  setPaused(paused) {
    this.paused = paused;
    this.keys = { up: false, down: false, left: false, right: false };
    if (!paused) this.clock.getDelta();
  }

  setControl(control, pressed) {
    if (control in this.keys) this.keys[control] = pressed;
  }

  onKeyDown(event) {
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (event.code === 'Space') {
      event.preventDefault();
      this.callbacks.onPauseRequest?.();
    }
    if (map[event.code]) {
      event.preventDefault();
      this.setControl(map[event.code], true);
    }
  }

  onKeyUp(event) {
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (map[event.code]) this.setControl(map[event.code], false);
  }

  onWindowBlur() {
    this.keys = { up: false, down: false, left: false, right: false };
  }

  onResize() {
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  stopScene() {
    this.environment?.dispose();
    this.vehicle?.group.removeFromParent();
    this.environment = null;
    this.vehicle = null;
  }

  destroy() {
    this.running = false;
    this.stopScene();
    this.resizeObserver.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
