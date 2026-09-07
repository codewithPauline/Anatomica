import * as THREE from 'three';
import { loadAnatomyModel } from './modelLoader.js';

function meshesIn(root) {
  const meshes = [];
  root.traverse((node) => {
    if (node.isMesh) meshes.push(node);
  });
  return meshes;
}

function boxMetrics(objects) {
  const box = new THREE.Box3();
  objects.forEach((object) => box.expandByObject(object));
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  return { box, size, center };
}

/**
 * Try to replace a procedural structure with a GLB from the manifest.
 * Missing GLBs are intentionally non-fatal: the teaching fallback remains.
 *
 * The first-stage registration fits the imported model to the fallback's
 * bounding envelope. This is a visual registration only; production assets
 * must still be anatomically validated before being marked `ready`.
 */
export async function swapInRealModel({
  structureKey,
  manifestItem,
  targetGroup,
  fallbackObjects,
}) {
  if (!manifestItem?.path || manifestItem.status === 'pending-source') return null;

  const model = await loadAnatomyModel({ structureKey, path: manifestItem.path });
  if (!model) return null;

  model.updateMatrixWorld(true);
  fallbackObjects.forEach((object) => object.updateMatrixWorld(true));

  const importedMeshes = meshesIn(model);
  if (!importedMeshes.length) return null;

  const fallback = boxMetrics(fallbackObjects);
  const imported = boxMetrics(importedMeshes);
  const importedMax = Math.max(imported.size.x, imported.size.y, imported.size.z);
  const fallbackMax = Math.max(fallback.size.x, fallback.size.y, fallback.size.z);

  if (importedMax > 0 && fallbackMax > 0) {
    model.scale.setScalar(fallbackMax / importedMax);
    model.updateMatrixWorld(true);
  }

  const afterScale = boxMetrics(importedMeshes);
  model.position.add(fallback.center.clone().sub(afterScale.center));
  model.updateMatrixWorld(true);

  // Flatten meshes into the anatomical system group while preserving their
  // world transforms. This makes existing raycasting/isolate logic work for
  // imported GLBs without requiring special-case traversal elsewhere.
  importedMeshes.forEach((mesh) => {
    targetGroup.attach(mesh);
    mesh.userData.structureKey = structureKey;
    mesh.userData.isRealAnatomy = true;
    mesh.material = mesh.material.clone();
    if ('roughness' in mesh.material) mesh.material.roughness = Math.max(mesh.material.roughness ?? 0.55, 0.45);
    mesh.userData.baseEmissive = mesh.material.emissive?.getHex?.() ?? 0x000000;
    mesh.userData.baseEmissiveIntensity = mesh.material.emissiveIntensity ?? 0;
  });

  fallbackObjects.forEach((object) => { object.visible = false; });
  return importedMeshes;
}

export async function hydrateRealModels({ manifest, groups, fallbackRegistry, onSwap }) {
  const jobs = Object.entries(manifest.structures).map(async ([structureKey, item]) => {
    const fallbackObjects = fallbackRegistry.get(structureKey) ?? [];
    const targetGroup = groups[item.system];
    if (!fallbackObjects.length || !targetGroup) return null;

    const meshes = await swapInRealModel({
      structureKey,
      manifestItem: item,
      targetGroup,
      fallbackObjects,
    });

    if (meshes?.length && onSwap) onSwap(structureKey, item, meshes);
    return meshes;
  });

  return Promise.all(jobs);
}
