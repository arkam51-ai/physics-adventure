import { LinearSRGBColorSpace, LoadingManager, SRGBColorSpace } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export const MODEL_ASSETS = Object.freeze({
  'bridge-pillar-wide': 'bridge-pillar-wide.glb',
  'building-a': 'building-a.glb',
  'model-9a15be1a-dba9-40e0-b2d7-9a5b0ddef390': '9a15be1a-dba9-40e0-b2d7-9a5b0ddef390.glb',
  'banana-plant': 'banana-plant-with-a-bunch-of-bananas.glb',
  'construction-barrier': 'construction-barrier.glb',
  'copilot3d-scene': 'Copilot3D-e7609421-c809-4b38-bb78-0cd1ffa0f989.glb',
  'detail-awning': 'detail-awning.glb',
  dumpster: 'dumpster.glb',
  'electricity-pole': 'electricity-pole.glb',
  'electricity-side': 'electricity-side.glb',
  garage: 'GARASI MOBIL.glb',
  'grass-field-tree-lowpoly': 'HAMPARAN RUMPUTtree_low_poly_lowpoly.glb',
  honda_fit_gk5: 'honda_fit_gk5.glb',
  'asphalt-road': 'JALAN ASPAL.glb',
  'american-asphalt-road': 'JALAN ASPAL_american_road.glb',
  'tree-lined-road': 'JALAN DENGAN POHON.glb',
  'mountain-road': 'JALAN PEGUNUNGAN.glb',
  'asphalt-highway': 'JALAN RAYA ASPAL.glb',
  'city-street': 'JALAN_KOTA_street.glb',
  bridge: 'JEMBATAN.glb',
  'bridge-2': 'JEMBATAN2.glb',
  'grass-field-simple': 'LAPANGAN RUMPUT_simple_grass_ground_free_low_model.glb',
  'light-curved': 'light-curved.glb',
  'low-detail-building-a': 'low-detail-building-a.glb',
  'mountain-cabin': 'Mountain Cabin by Alex Safayan - cspkBmqAq8g.glb',
  'grass-field-umamusume': 'PADANG RUMPUT_umamusume_grass_field.glb',
  fern: 'PAKIS_fern_grass_01.glb',
  'palm-tree': 'palm-detailed.glb',
  'road-sign': 'RAMBU JALAN.glb',
  'rice-plant': 'rice_plant.glb',
  'student-male': 'student-male.glb',
  'student-female': 'student-female.glb',
  'ponderosa_stand_sketchfab': 'hutan-pinus/ponderosa_stand_sketchfab.glb',
  'road-bend-barrier': 'road-bend-barrier.glb',
  'stone-house-2': 'RUMAH BATU 2house_x_xiv.glb',
  hut: 'RUMAH GUBUK.glb',
  'wooden-stilt-house': 'RUMAH KAYU PANGGUNG_rusty_roof_wooden_house_1_3d_model_free.glb',
  'abandoned-farm-house': 'RUMAH KEBUabandoned_farm_house.glb',
  'kos-building': 'RUMAH KOS_the_closed_ems_building_game_ready.glb',
  'old-house': 'RUMAH TUA.glb',
  'stone-house': 'RUMAH_BATU_rumah8ws.glb',
  'realistic-grass': 'RUMPUT_realistics_grass_06.glb',
  'tropical-plant': 'RUMPUT_tropical_plant.glb',
  'traffic-light-object-hanging': 'traffic-light-object-hanging.glb',
  'tree-lowpoly': 'tree_low_poly_lowpoly.glb'
});

const SPECULAR_GLOSSINESS_VEGETATION = new Set(['realistic-grass', 'tropical-plant', 'rice-plant']);

async function restoreVegetationDiffuseMaterials(name, gltf) {
  if (!SPECULAR_GLOSSINESS_VEGETATION.has(name)) return;

  const materialDefs = gltf.parser.json.materials ?? [];
  const materials = await gltf.parser.getDependencies('material');
  await Promise.all(materialDefs.map(async (definition, index) => {
    const extension = definition.extensions?.KHR_materials_pbrSpecularGlossiness;
    if (!extension) return;

    const diffuseFactor = name === 'rice-plant' && /LeavesRice/i.test(definition.name ?? '')
      ? [0.38, 0.54, 0.22, 1]
      : extension.diffuseFactor ?? [1, 1, 1, 1];
    const params = {};
    if (extension.diffuseTexture) {
      await gltf.parser.assignTexture(params, 'map', extension.diffuseTexture, SRGBColorSpace);
    }

    const targets = new Set([materials[index]]);
    gltf.scene.traverse((object) => {
      if (!object.isMesh) return;
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      objectMaterials.forEach((material) => {
        if (gltf.parser.associations.get(material)?.materials === index) targets.add(material);
      });
    });

    for (const material of targets) {
      material.color.setRGB(
        diffuseFactor[0], diffuseFactor[1], diffuseFactor[2], LinearSRGBColorSpace
      );
      material.opacity = diffuseFactor[3];
      material.metalness = 0;
      if (params.map) material.map = params.map;
      material.needsUpdate = true;
    }
  }));
}

function disposeModelResources(scene, disposedResources) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  const scenes = Array.isArray(scene) ? scene : [scene];
  for (const root of scenes) {
    root?.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of objectMaterials) {
        if (!material) continue;
        materials.add(material);
        for (const value of Object.values(material)) {
          if (value?.isTexture) textures.add(value);
        }
      }
    });
  }

  for (const texture of textures) {
    if (disposedResources.textures.has(texture)) continue;
    disposedResources.textures.add(texture);
    texture.dispose();
  }
  for (const material of materials) {
    if (disposedResources.materials.has(material)) continue;
    disposedResources.materials.add(material);
    material.dispose();
  }
  for (const geometry of geometries) {
    if (disposedResources.geometries.has(geometry)) continue;
    disposedResources.geometries.add(geometry);
    geometry.dispose();
  }
}

export class AssetLoader {
  constructor({ onProgress } = {}) {
    this.onProgress = onProgress;
    this.disposed = false;
    const manager = new LoadingManager();
    this.manager = manager;
    manager.onStart = (url, itemsLoaded, itemsTotal) => {
      this.reportProgress({
        source: 'asset-loader', type: 'resource-start', url, itemsLoaded, itemsTotal
      });
    };
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.reportProgress({
        source: 'asset-loader', type: 'resource-complete', url, itemsLoaded, itemsTotal
      });
    };
    manager.onError = (url) => {
      this.reportProgress({ source: 'asset-loader', type: 'resource-error', url });
    };
    manager.setURLModifier((url) => {
      const file = url.split(/[\\/]/).pop()?.toLowerCase();
      if (file === 'colormap.png' || file === 'variation-b.png') {
        return `${import.meta.env.BASE_URL}textures/${file}`;
      }
      return url;
    });
    this.loader = new GLTFLoader(manager);
    this.loader.setMeshoptDecoder(MeshoptDecoder);
    this.models = new Map();
    this.loadedModels = new Map();
    this.disposedResources = {
      geometries: new WeakSet(),
      materials: new WeakSet(),
      textures: new WeakSet()
    };
  }

  reportProgress(event) {
    if (this.disposed || typeof this.onProgress !== 'function') return;
    try {
      this.onProgress(event);
    } catch (error) {
      console.warn('Pelaporan progres aset gagal.', error);
    }
  }

  load(name) {
    if (this.disposed) return Promise.reject(new Error('AssetLoader sudah dihancurkan.'));
    const file = MODEL_ASSETS[name];
    if (!file) return Promise.reject(new Error(`Aset model "${name}" tidak terdaftar.`));
    if (this.models.has(name)) {
      this.reportProgress({ source: 'asset-loader', type: 'asset-reused', name });
      return this.models.get(name);
    }

    this.reportProgress({ source: 'asset-loader', type: 'asset-start', name, file });

    const request = new Promise((resolve, reject) => {
      this.loader.load(
        `${import.meta.env.BASE_URL}models/${file}`,
        (gltf) => {
          this.reportProgress({ source: 'asset-loader', type: 'asset-decoded', name, file });
          restoreVegetationDiffuseMaterials(name, gltf)
            .then(() => {
              const scenes = gltf.scenes?.length ? gltf.scenes : [gltf.scene];
              if (this.disposed) disposeModelResources(scenes, this.disposedResources);
              else this.loadedModels.set(name, scenes);
              this.reportProgress({ source: 'asset-loader', type: 'asset-prepared', name, file });
              resolve(gltf.scene);
            })
            .catch((error) => {
              disposeModelResources(gltf.scenes?.length ? gltf.scenes : [gltf.scene], this.disposedResources);
              this.reportProgress({ source: 'asset-loader', type: 'asset-failed', name, file, error });
              reject(error);
            });
        },
        (event) => {
          this.reportProgress({
            source: 'asset-loader', type: 'asset-download', name, file,
            loaded: event.loaded, total: event.total, lengthComputable: event.lengthComputable
          });
        },
        (error) => {
          this.reportProgress({ source: 'asset-loader', type: 'asset-failed', name, file, error });
          reject(new Error(`Gagal memuat model ${file}.`, { cause: error }));
        }
      );
    });
    this.models.set(name, request);
    request.catch(() => this.models.delete(name));
    return request;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const loadedModels = [...this.loadedModels.values()];
    this.models.clear();
    this.loadedModels.clear();
    for (const model of loadedModels) {
      disposeModelResources(model, this.disposedResources);
    }
  }
}
