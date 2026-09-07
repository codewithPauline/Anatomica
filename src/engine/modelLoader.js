import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

/**
 * Load one anatomical GLB and tag every mesh with the Anatomica structure key.
 * Returns null rather than throwing so the procedural teaching model can remain
 * available while production assets are being added incrementally.
 */
export async function loadAnatomyModel({ structureKey, path }) {
  try {
    const gltf = await loader.loadAsync(path);
    const root = gltf.scene;
    root.traverse((node) => {
      if (!node.isMesh) return;
      node.userData.structureKey = structureKey;
      node.castShadow = true;
      node.receiveShadow = true;
    });
    return root;
  } catch (error) {
    console.info(`[Anatomica] Real model not available yet for ${structureKey}; using teaching fallback.`, error);
    return null;
  }
}

export async function loadManifestModels(manifest, onModelLoaded) {
  const entries = Object.entries(manifest.structures).filter(([, item]) => item.status === 'ready');
  const results = await Promise.all(entries.map(async ([structureKey, item]) => {
    const model = await loadAnatomyModel({ structureKey, path: item.path });
    if (model && onModelLoaded) onModelLoaded(structureKey, item, model);
    return { structureKey, model };
  }));
  return results;
}
