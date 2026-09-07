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
  objects.filter((object) => object?.isObject3D).forEach((object) => box.expandByObject(object));
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  return { box, size, center };
}

function dominantAxis(size) {
  if (size.x >= size.y && size.x >= size.z) return new THREE.Vector3(1, 0, 0);
  if (size.y >= size.x && size.y >= size.z) return new THREE.Vector3(0, 1, 0);
  return new THREE.Vector3(0, 0, 1);
}

/**
 * Try to replace a procedural structure with a GLB from the manifest.
 * Missing GLBs are intentionally non-fatal: the teaching fallback remains.
 *
 * Registration is deliberately lightweight for the v0.1 viewer:
 * 1. align the imported structure's dominant longitudinal axis to the
 *    fallback structure's dominant axis,
 * 2. scale it to the fallback envelope,
 * 3. center it on the fallback structure.
 *
 * BodyParts3D upper-limb bones use a shared anatomical coordinate system in
 * which their long axis is predominantly Z, while the current teaching arm is
 * predominantly Y. Performing the axis alignment before scaling prevents real
 * bones from appearing sideways when they replace the procedural geometry.
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
  fallbackObjects.filter((object) => object?.isObject3D).forEach((object) => object.updateMatrixWorld(true));

  const importedMeshes = meshesIn(model);
  if (!importedMeshes.length) return null;

  const fallback = boxMetrics(fallbackObjects);
  const imported = boxMetrics(importedMeshes);

  const importedAxis = dominantAxis(imported.size);
  const fallbackAxis = dominantAxis(fallback.size);
  const axisRotation = new THREE.Quaternion().setFromUnitVectors(importedAxis, fallbackAxis);
  model.quaternion.premultiply(axisRotation);
  model.updateMatrixWorld(true);

  const aligned = boxMetrics(importedMeshes);
  const importedMax = Math.max(aligned.size.x, aligned.size.y, aligned.size.z);
  const fallbackMax = Math.max(fallback.size.x, fallback.size.y, fallback.size.z);

  if (importedMax > 0 && fallbackMax > 0) {
    model.scale.setScalar(fallbackMax / importedMax);
    model.updateMatrixWorld(true);
  }

  const afterScale = boxMetrics(importedMeshes);
  model.position.add(fallback.center.clone().sub(afterScale.center));
  model.updateMatrixWorld(true);

  importedMeshes.forEach((mesh) => {
    targetGroup.attach(mesh);
    mesh.userData.structureKey = structureKey;
    mesh.userData.isRealAnatomy = true;
    mesh.material = mesh.material.clone();
    if ('roughness' in mesh.material) mesh.material.roughness = Math.max(mesh.material.roughness ?? 0.55, 0.45);
    mesh.userData.baseEmissive = mesh.material.emissive?.getHex?.() ?? 0x000000;
    mesh.userData.baseEmissiveIntensity = mesh.material.emissiveIntensity ?? 0;
  });

  fallbackObjects.filter((object) => object?.isObject3D).forEach((object) => {
    object.userData.replacedByReal = true;
    object.visible = false;
  });

  // Existing restore logic checks whether another hidden entry exists for the
  // same structure. Keep a non-rendering sentinel in the registry so even a
  // single-mesh fallback (for example radius/ulna) cannot reappear after swap.
  fallbackObjects.push({ visible: false, isReplacementSentinel: true });

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
