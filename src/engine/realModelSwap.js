import * as THREE from 'three';
import { loadAnatomyModel } from './modelLoader.js';
import { ensureAnatomyLegend, styleAnatomyMesh } from './anatomyVisuals.js';

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

function prepareImportedMeshes(meshes, structureKey, system, targetGroup) {
  meshes.forEach((mesh) => {
    targetGroup.attach(mesh);
    mesh.userData.structureKey = structureKey;
    mesh.userData.system = system;
    mesh.userData.isRealAnatomy = true;
    styleAnatomyMesh(mesh, structureKey, system);
  });
}

/**
 * Replace one procedural teaching structure with a real GLB.
 *
 * The resulting registrationMatrix maps the original BodyParts3D coordinate
 * system into the current Anatomica teaching scene. That matrix can then be
 * reused by anatomically related BodyParts3D structures (for example scapula
 * and clavicle) that have no procedural fallback of their own. This preserves
 * their shared source-space relationships instead of independently centering
 * every imported structure.
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

  const registrationMatrix = model.matrixWorld.clone();
  prepareImportedMeshes(importedMeshes, structureKey, manifestItem.system, targetGroup);

  fallbackObjects.filter((object) => object?.isObject3D).forEach((object) => {
    object.userData.replacedByReal = true;
    object.visible = false;
  });

  fallbackObjects.push({ visible: false, isReplacementSentinel: true });

  return { meshes: importedMeshes, registrationMatrix };
}

async function loadUsingSharedRegistration({
  structureKey,
  manifestItem,
  targetGroup,
  registrationMatrix,
}) {
  if (!registrationMatrix || !manifestItem?.path || manifestItem.status === 'pending-source') return null;

  const model = await loadAnatomyModel({ structureKey, path: manifestItem.path });
  if (!model) return null;

  model.applyMatrix4(registrationMatrix);
  model.updateMatrixWorld(true);
  const importedMeshes = meshesIn(model);
  if (!importedMeshes.length) return null;

  prepareImportedMeshes(importedMeshes, structureKey, manifestItem.system, targetGroup);
  return importedMeshes;
}

export async function hydrateRealModels({ manifest, groups, fallbackRegistry, onSwap }) {
  ensureAnatomyLegend();

  const registrations = new Map();
  const deferred = [];

  // First load structures that already have procedural anchors. Besides being
  // immediately useful, these establish source→scene registration matrices.
  for (const [structureKey, item] of Object.entries(manifest.structures)) {
    const fallbackObjects = fallbackRegistry.get(structureKey) ?? [];
    const targetGroup = groups[item.system];
    if (!targetGroup || item.status === 'pending-source') continue;

    if (!fallbackObjects.length) {
      deferred.push([structureKey, item]);
      continue;
    }

    const result = await swapInRealModel({
      structureKey,
      manifestItem: item,
      targetGroup,
      fallbackObjects,
    });

    if (!result) continue;
    registrations.set(structureKey, result.registrationMatrix);
    if (onSwap) onSwap(structureKey, item, result.meshes);
  }

  // Structures such as scapula/clavicle do not need fake placeholders. They
  // can explicitly inherit an already-established BodyParts3D registration.
  for (const [structureKey, item] of deferred) {
    const referenceKey = item.registrationReference;
    const registrationMatrix = referenceKey ? registrations.get(referenceKey) : null;
    const targetGroup = groups[item.system];
    if (!registrationMatrix || !targetGroup) continue;

    const meshes = await loadUsingSharedRegistration({
      structureKey,
      manifestItem: item,
      targetGroup,
      registrationMatrix,
    });

    if (meshes?.length && onSwap) onSwap(structureKey, item, meshes);
  }
}
