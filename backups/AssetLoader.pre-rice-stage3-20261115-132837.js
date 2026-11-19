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

const SPECULAR_GLOSSINESS_VEGETATION = new Set(['realistic-grass', 'tropical-plant']);

async function restoreVegetationDiffuseMaterials(name, gltf) {
  if (!SPECULAR_GLOSSINESS_VEGETATION.has(name)) return;

  const materialDefs = gltf.parser.json.materials ?? [];
  const materials = await gltf.parser.getDependencies('material');
  await Promise.all(materialDefs.map(async (definition, index) => {
    const extension = definition.extensions?.KHR_materials_pbrSpecularGlossiness;
    if (!extension) return;

    const diffuseFactor = extension.diffuseFactor ?? [1, 1, 1, 1];
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

export class AssetLoader {
  constructor() {
    const manager = new LoadingManager();
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
  }

  load(name) {
    const file = MODEL_ASSETS[name];
    if (!file) return Promise.reject(new Error(`Aset model "${name}" tidak terdaftar.`));
    if (this.models.has(name)) return this.models.get(name);

    const request = new Promise((resolve, reject) => {
      this.loader.load(
        `${import.meta.env.BASE_URL}models/${file}`,
        (gltf) => {
          restoreVegetationDiffuseMaterials(name, gltf)
            .then(() => resolve(gltf.scene))
            .catch(reject);
        },
        undefined,
        (error) => reject(new Error(`Gagal memuat model ${file}.`, { cause: error }))
      );
    });
    this.models.set(name, request);
    request.catch(() => this.models.delete(name));
    return request;
  }
}
