import * as THREE from 'three';
import { AssetLoader } from './AssetLoader.js';
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
    this.assetLoader = new AssetLoader();
    this.physics = new PhysicsEngine();
    this.keys = { up: false, down: false, left: false, right: false };
    this.running = false;
    this.paused = false;
    this.destroyed = false;
    this.loadingOverlay = null;
    this.frame = this.frame.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWindowBlur = this.onWindowBlur.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onResize);
    window.visualViewport?.addEventListener('resize', this.onResize);
    canvas.addEventListener('pointerdown', this.onMouseDown);
    canvas.addEventListener('pointermove', this.onMouseMove);
    canvas.addEventListener('pointerup', this.onMouseUp);
    canvas.addEventListener('pointercancel', this.onMouseUp);
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(canvas);
    this.onResize();
    this.clock = new THREE.Clock();
  }

  addLights() {
    this.scene.background = new THREE.Color(0xa6defe);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    this.scene.add(new THREE.HemisphereLight(0xe9f8ff, 0x55714b, 2));
    const sun = new THREE.DirectionalLight(0xfff4d6, 3.1);
    sun.position.set(-15, 28, -5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(sun);
  }

  async start(level) {
    this.stopScene();
    this.level = level;
    this.physics.reset();
    this.coins = 0;
    this.elapsed = 0;
    this.nextCheckpoint = 0;
    this.keys = { up: false, down: false, left: false, right: false };
    this.environment = new Environment(this.scene, level);
    this.environment.loadModels(this.assetLoader);
    this.vehicle = new Vehicle(this.scene, this.assetLoader);
    const vehicle = this.vehicle;
    this.showLoading('Menyiapkan kendaraan...');

    try {
      await vehicle.ready;
    } catch (error) {
      if (!this.destroyed && this.vehicle === vehicle) {
        this.showLoading('Kendaraan gagal dimuat. Silakan coba lagi.');
      }
      return;
    }

    if (this.destroyed || this.vehicle !== vehicle || !vehicle.group.visible) return;
    this.running = true;
    this.paused = false;
    this.clock.start();
    this.hideLoading();
    this.frame();
  }

  showLoading(message) {
    if (!this.loadingOverlay) {
      const overlay = document.createElement('div');
      overlay.setAttribute('role', 'status');
      overlay.style.position = 'absolute';
      overlay.style.zIndex = '6';
      overlay.style.inset = '0';
      overlay.style.display = 'grid';
      overlay.style.placeItems = 'center';
      overlay.style.padding = '24px';
      overlay.style.color = '#ffffff';
      overlay.style.background = 'rgba(18, 38, 58, .72)';
      overlay.style.font = '700 14px/1.5 DM Sans, Segoe UI, sans-serif';
      overlay.style.textAlign = 'center';
      overlay.style.pointerEvents = 'none';
      this.canvas.parentElement?.append(overlay);
      this.loadingOverlay = overlay;
    }
    this.loadingOverlay.textContent = message;
    this.loadingOverlay.hidden = false;
    this.loadingOverlay.style.display = 'grid';
  }

  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.hidden = true;
      this.loadingOverlay.style.display = 'none';
    }
  }

  frame() {
    if (!this.running) return;
    requestAnimationFrame(this.frame);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.paused) {
      this.elapsed += dt;
      const state = this.physics.update(this.keys, dt, this.level);
      this.vehicle.update(
        state.lane,
        state.speed,
        dt,
        state.steering,
        this.environment.roadYaw(state.distance),
        this.environment.roadCenterX(state.distance)
      );
      this.vehicle.group.rotation.x = -Math.atan(this.environment.roadSlope(state.distance));
      this.vehicle.group.position.y = this.environment.roadHeight(state.distance);
      const vehiclePoint = this.environment.roadPoint(state.distance, state.lane);
      this.vehicle.group.position.z = vehiclePoint.z;
      const cameraPoint = this.environment.roadPoint(state.distance - 11, state.lane * 0.25);
      const lookPoint = this.environment.roadPoint(state.distance + 8, state.lane * 0.18);
      const cameraX = cameraPoint.x;
      this.camera.position.x += (cameraX - this.camera.position.x) * Math.min(1, dt * 2);
      this.camera.position.y = 7 + cameraPoint.y;
      this.camera.position.z = cameraPoint.z;
      this.camera.lookAt(
        lookPoint.x,
        1 + lookPoint.y,
        lookPoint.z
      );
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
    const map = {
      ArrowUp: 'up', KeyW: 'up',
      ArrowDown: 'down', KeyS: 'down',
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right'
    };
    if (event.code === 'Space') {
      event.preventDefault();
      if (!event.repeat) this.callbacks.onPauseRequest?.();
    }
    if (map[event.code]) {
      event.preventDefault();
      this.setControl(map[event.code], true);
    }
  }

  onKeyUp(event) {
    const map = {
      ArrowUp: 'up', KeyW: 'up',
      ArrowDown: 'down', KeyS: 'down',
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right'
    };
    if (map[event.code]) this.setControl(map[event.code], false);
  }

  onWindowBlur() {
    this.keys = { up: false, down: false, left: false, right: false };
    this.mousePointerId = null;
  }

  onMouseDown(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !this.running) return;
    event.preventDefault();
    this.mousePointerId = event.pointerId;
    this.mouseStartX = event.clientX;
    this.canvas.setPointerCapture(event.pointerId);
    this.setControl('up', true);
  }

  onMouseMove(event) {
    if (event.pointerId !== this.mousePointerId) return;
    const offset = event.clientX - this.mouseStartX;
    this.setControl('left', offset < -12);
    this.setControl('right', offset > 12);
  }

  onMouseUp(event) {
    if (event.pointerId !== this.mousePointerId) return;
    this.setControl('up', false);
    this.setControl('left', false);
    this.setControl('right', false);
    this.mousePointerId = null;
  }

  onResize() {
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
    this.destroyed = true;
    this.running = false;
    this.loadingOverlay?.remove();
    this.loadingOverlay = null;
    this.stopScene();
    this.resizeObserver.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('orientationchange', this.onResize);
    window.visualViewport?.removeEventListener('resize', this.onResize);
    this.canvas.removeEventListener('pointerdown', this.onMouseDown);
    this.canvas.removeEventListener('pointermove', this.onMouseMove);
    this.canvas.removeEventListener('pointerup', this.onMouseUp);
    this.canvas.removeEventListener('pointercancel', this.onMouseUp);
    this.renderer.dispose();
  }
}
