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
    this.loadingPreviewScene = new THREE.Scene();
    this.loadingPreviewScene.background = new THREE.Color(0x14283c);
    this.loadingPreviewCamera = new THREE.OrthographicCamera(-75, 75, 75, -75, 0.1, 400);
    this.loadingPreviewCamera.position.set(0, 90, 110);
    // Keep the route profile below the centered loading percentage and bar.
    this.loadingPreviewCamera.lookAt(0, 45, 0);
    this.loadingPreviewActive = false;
    this.addLights();
    this.loadingAttempt = 0;
    this.loadingFrameRequest = 0;
    this.loadingFailed = false;
    this.loadingProgress = { completed: 0, total: 0, percent: 0 };
    this.assetLoader = new AssetLoader({ onProgress: (event) => this.reportAssetProgress(event) });
    this.physics = new PhysicsEngine();
    this.keys = { up: false, down: false, left: false, right: false };
    this.running = false;
    this.paused = false;
    this.destroyed = false;
    this.frameRequest = 0;
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
    this.running = false;
    if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
    this.frameRequest = 0;
    if (this.loadingFrameRequest) cancelAnimationFrame(this.loadingFrameRequest);
    this.loadingFrameRequest = 0;
    const attempt = ++this.loadingAttempt;
    this.loadingFailed = false;
    this.loadingProgress = { completed: 0, total: 0, percent: 0 };
    this.callbacks.onLoadingStart?.();
    this.reportLoadingProgress({ phase: 'start' });
    this.stopScene();
    this.level = level;
    this.physics.reset();
    this.coins = 0;
    this.elapsed = 0;
    this.nextCheckpoint = 0;
    this.keys = { up: false, down: false, left: false, right: false };
    try {
      this.environment = new Environment(this.scene, level);
      const environment = this.environment;
      this.loadingPreviewScene.add(environment.createLoadingPreview());
      this.loadingPreviewActive = true;
      this.renderLoadingPreview();
      const environmentReady = environment.loadModels(
        this.assetLoader,
        (event) => this.handleEnvironmentProgress(event, attempt, environment)
      );
      this.vehicle = new Vehicle(this.scene, this.assetLoader);
      const vehicle = this.vehicle;
      const vehicleReady = vehicle.ready.then((ready) => {
        if (!ready || !this.isCurrentLoadingAttempt(attempt, environment, vehicle)) return false;
        vehicle.group.visible = false;
        this.loadingProgress.completed += 1;
        this.reportLoadingProgress({ phase: 'vehicle-ready', asset: 'honda_fit_gk5' });
        return true;
      });

      const [environmentResult, vehicleIsReady] = await Promise.all([environmentReady, vehicleReady]);
      if (!vehicleIsReady || environmentResult?.cancelled ||
        !this.isCurrentLoadingAttempt(attempt, environment, vehicle)) return false;
      if (
        !environment.group.parent || !vehicle.group.parent || !vehicle.carModel ||
        environment.disposed || vehicle.disposed || this.renderer.getContext().isContextLost()
      ) {
        throw new Error('Scene final belum siap untuk ditampilkan.');
      }

      this.setRouteStartCamera(environment, this.camera);
      this.setRouteStartVehicle(environment, vehicle);
      if (typeof this.renderer.compileAsync !== 'function') {
        throw new Error('Renderer tidak mendukung persiapan material asinkron.');
      }
      await this.renderer.compileAsync(this.scene, this.camera);
      if (!this.isCurrentLoadingAttempt(attempt, environment, vehicle)) return false;
      if (this.renderer.getContext().isContextLost()) {
        throw new Error('Konteks WebGL hilang saat menyiapkan scene final.');
      }
      this.loadingProgress.completed += 1;
      this.reportLoadingProgress({ phase: 'scene-prepared' });
      this.callbacks.onLoadingCommitStart?.();
      environment.group.visible = true;
      vehicle.group.visible = true;
      this.renderer.render(this.scene, this.camera);
      this.loadingPreviewActive = false;
      environment.disposeLoadingPreview();
      this.loadingProgress.completed += 1;
      this.reportLoadingProgress({ phase: 'ready', complete: true });
      this.queueGameStart(attempt, environment, vehicle);
      return true;
    } catch (error) {
      if (!this.destroyed && attempt === this.loadingAttempt) {
        this.loadingFailed = true;
        this.callbacks.onLoadingError?.(error);
      }
      return false;
    }
  }

  isCurrentLoadingAttempt(attempt, environment, vehicle) {
    return !this.destroyed && !this.loadingFailed && attempt === this.loadingAttempt &&
      this.environment === environment && this.vehicle === vehicle && !environment.disposed;
  }

  handleEnvironmentProgress(event, attempt, environment) {
    if (this.destroyed || this.loadingFailed || attempt !== this.loadingAttempt ||
      this.environment !== environment || environment.disposed) return;

    if (event.type === 'plan') {
      this.loadingProgress.total = event.total + 4;
      this.loadingProgress.completed = 1;
      this.reportLoadingProgress({
        phase: 'environment-plan', assets: event.assets, totalAssets: event.total
      });
      this.renderLoadingPreview();
      return;
    }

    if (event.type === 'asset-loaded') {
      this.loadingProgress.completed += 1;
      this.reportLoadingProgress({
        phase: 'environment-asset-loaded', asset: event.name, state: event.state,
        optional: true, completedAssets: event.completed, totalAssets: event.total
      });
    }
  }

  renderLoadingPreview() {
    if (this.destroyed || !this.loadingPreviewActive) return;
    this.renderer.render(this.loadingPreviewScene, this.loadingPreviewCamera);
  }

  setRouteStartCamera(environment, camera) {
    const cameraPoint = environment.roadPoint(-11, 0);
    const lookPoint = environment.roadPoint(8, 0);
    camera.position.set(cameraPoint.x, 7 + cameraPoint.y, cameraPoint.z);
    camera.lookAt(lookPoint.x, 1 + lookPoint.y, lookPoint.z);
  }

  setRouteStartVehicle(environment, vehicle) {
    const distance = 0;
    const roadPoint = environment.roadPoint(distance, 0);
    vehicle.group.position.set(roadPoint.x, environment.roadHeight(distance), roadPoint.z);
    vehicle.group.rotation.set(
      -Math.atan(environment.roadSlope(distance)),
      environment.roadYaw(distance),
      0
    );
  }

  reportAssetProgress(event) {
    if (this.destroyed || !this.loadingProgress) return;
    this.callbacks.onLoadingProgress?.({
      source: 'asset-loader', ...event, ...this.loadingProgress
    });
  }

  reportLoadingProgress(event = {}) {
    const { completed, total } = this.loadingProgress;
    const calculated = total > 0 ? Math.floor((completed / total) * 100) : 0;
    const next = event.complete ? 100 : Math.min(99, calculated);
    this.loadingProgress.percent = Math.max(this.loadingProgress.percent, next);
    this.callbacks.onLoadingProgress?.({
      source: 'game', ...event,
      completed,
      total,
      percent: this.loadingProgress.percent
    });
  }

  queueGameStart(attempt, environment, vehicle) {
    const begin = () => {
      if (!this.isCurrentLoadingAttempt(attempt, environment, vehicle) || !vehicle.group.visible) return;
      this.loadingFrameRequest = 0;
      this.callbacks.onLoadingReady?.();
      this.running = true;
      this.paused = false;
      this.clock.start();
      this.frame();
    };

    this.loadingFrameRequest = requestAnimationFrame(begin);
  }

  frame() {
    this.frameRequest = 0;
    if (!this.running) return;
    this.frameRequest = requestAnimationFrame(this.frame);
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

  freeze() {
    if (this.destroyed || this.frozen) return;
    this.running = false;
    if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
    this.frameRequest = 0;
    this.paused = true;
    this.keys = { up: false, down: false, left: false, right: false };
    this.mousePointerId = null;
    this.frozen = true;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    this.canvas.removeEventListener('pointerdown', this.onMouseDown);
    this.canvas.removeEventListener('pointermove', this.onMouseMove);
    this.canvas.removeEventListener('pointerup', this.onMouseUp);
    this.canvas.removeEventListener('pointercancel', this.onMouseUp);
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
    if (!this.running) return;
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
    if (this.destroyed) return;
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    const previewHalfHeight = 75;
    this.loadingPreviewCamera.left = -previewHalfHeight * width / height;
    this.loadingPreviewCamera.right = previewHalfHeight * width / height;
    this.loadingPreviewCamera.top = previewHalfHeight;
    this.loadingPreviewCamera.bottom = -previewHalfHeight;
    this.loadingPreviewCamera.updateProjectionMatrix();
    if (this.loadingPreviewActive) this.renderLoadingPreview();
    else if (this.frozen && !this.destroyed) this.renderer.render(this.scene, this.camera);
  }

  stopScene() {
    this.loadingPreviewActive = false;
    this.environment?.dispose();
    this.vehicle?.dispose();
    this.environment = null;
    this.vehicle = null;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.running = false;
    this.loadingAttempt += 1;
    if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
    this.frameRequest = 0;
    if (this.loadingFrameRequest) cancelAnimationFrame(this.loadingFrameRequest);
    this.loadingFrameRequest = 0;
    this.callbacks.onLoadingDismiss?.();
    this.stopScene();
    this.assetLoader.dispose();
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
    this.canvas.remove();
  }
}
