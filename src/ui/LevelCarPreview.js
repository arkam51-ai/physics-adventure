let previewPromise = null;

export function getLevelCarPreview() {
  if (!previewPromise) {
    previewPromise = renderLevelCarPreview().catch((error) => {
      previewPromise = null;
      throw error;
    });
  }
  return previewPromise;
}

async function renderLevelCarPreview() {
  const [THREE, { AssetLoader }, { Vehicle }] = await Promise.all([
    import('three'),
    import('../game/AssetLoader.js'),
    import('../game/Vehicle.js')
  ]);

  const canvas = document.createElement('canvas');
  const loader = new AssetLoader();
  const scene = new THREE.Scene();
  let renderer = null;
  let vehicle = null;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    vehicle = new Vehicle(scene, loader);
    renderer.setPixelRatio(1);
    renderer.setSize(480, 270, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x7d8998, 2.1));
    const keyLight = new THREE.DirectionalLight(0xfff4e5, 2.4);
    keyLight.position.set(-3, 7, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xdceaff, 1.15);
    fillLight.position.set(4, 4, 2);
    scene.add(fillLight);

    await vehicle.ready;
    vehicle.group.visible = true;

    const bounds = new THREE.Box3().setFromObject(vehicle.carModel);
    const center = bounds.getCenter(new THREE.Vector3());
    const camera = new THREE.PerspectiveCamera(38, canvas.width / canvas.height, 0.01, 100);
    const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * camera.aspect);
    const viewDirection = new THREE.Vector3(0.58, 0.28, 0.76).normalize();
    const forward = viewDirection.clone().negate();
    const cameraRight = forward.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
    const cameraUp = cameraRight.clone().cross(forward).normalize();
    const corner = new THREE.Vector3();
    let distance = 0;
    for (let x = 0; x <= 1; x += 1) {
      for (let y = 0; y <= 1; y += 1) {
        for (let z = 0; z <= 1; z += 1) {
          corner.set(
            x ? bounds.max.x : bounds.min.x,
            y ? bounds.max.y : bounds.min.y,
            z ? bounds.max.z : bounds.min.z
          ).sub(center);
          const towardCamera = corner.dot(viewDirection);
          const fitWidth = Math.abs(corner.dot(cameraRight)) / Math.tan(horizontalHalfFov);
          const fitHeight = Math.abs(corner.dot(cameraUp)) / Math.tan(verticalHalfFov);
          distance = Math.max(distance, towardCamera + fitWidth, towardCamera + fitHeight);
        }
      }
    }
    distance *= 1.1;
    camera.position.copy(center).addScaledVector(viewDirection, distance);
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
    return canvas.toDataURL('image/png');
  } finally {
    vehicle?.dispose();
    loader.dispose();
    renderer?.dispose();
    try {
      renderer?.forceContextLoss();
    } catch {}
  }
}
