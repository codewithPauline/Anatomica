import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { upperLimbStructures } from './data/upperLimb.js';
import { modelManifest } from './data/modelManifest.js';
import { hydrateRealModels } from './engine/realModelSwap.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <div>
        <p class="eyebrow">ANATOMICA v0.1</p>
        <h1>Upper Limb Explorer</h1>
        <p class="subtitle">Explore structure, function, pathways, and clinical relevance in an interactive 3D model.</p>
      </div>

      <div>
        <span class="section-label">Systems</span>
        <div class="system-list" aria-label="Anatomical systems">
          <button class="system active" data-system="skeleton">Skeleton</button>
          <button class="system" data-system="muscles">Muscles</button>
          <button class="system" data-system="nerves">Nerves</button>
          <button class="system" data-system="vessels">Vessels</button>
        </div>
      </div>

      <div class="tool-row" aria-label="Viewer tools">
        <button id="isolate-btn" class="tool">Isolate</button>
        <button id="restore-btn" class="tool">Restore</button>
        <button id="plexus-btn" class="tool accent">Brachial plexus</button>
      </div>

      <div class="info-card" aria-live="polite">
        <span class="label">Selected structure</span>
        <strong id="selected-name">Humerus</strong>
        <p id="selected-description"></p>
        <div id="details" class="details"></div>
        <div id="clinical" class="clinical"></div>
      </div>

      <p class="hint">Drag to rotate · Scroll to zoom · Right-drag to pan · Click a structure to study it</p>
    </aside>

    <main class="viewer-wrap">
      <canvas id="viewer" aria-label="Interactive 3D upper limb anatomy viewer"></canvas>
      <div id="viewer-badge" class="viewer-badge">Educational prototype · loading validated assets</div>
      <div id="mode-badge" class="mode-badge" hidden>Brachial Plexus Mode</div>
    </main>
  </div>
`;

const canvas = document.querySelector('#viewer');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e13);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(4.2, 2.2, 7.2);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.4, 0);
controls.minDistance = 3;
controls.maxDistance = 12;

scene.add(new THREE.HemisphereLight(0xffffff, 0x20252e, 2.5));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
keyLight.position.set(4, 5, 5);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x9db9ff, 1.3);
fillLight.position.set(-4, 1, 2);
scene.add(fillLight);

const anatomicalGroups = {
  skeleton: new THREE.Group(),
  muscles: new THREE.Group(),
  nerves: new THREE.Group(),
  vessels: new THREE.Group(),
};
Object.values(anatomicalGroups).forEach((group) => scene.add(group));

const fallbackRegistry = new Map();
function addFallback(structureKey, object) {
  const items = fallbackRegistry.get(structureKey) ?? [];
  items.push(object);
  fallbackRegistry.set(structureKey, items);
}

function capsuleBetween(start, end, radius, material) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CapsuleGeometry(radius, Math.max(length - radius * 2, 0.05), 8, 20);
  const mesh = new THREE.Mesh(geometry, material.clone());
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return mesh;
}

const materials = {
  bone: new THREE.MeshStandardMaterial({ color: 0xe9ddc4, roughness: 0.72 }),
  muscle: new THREE.MeshStandardMaterial({ color: 0x9f4a4a, roughness: 0.68 }),
  nerve: new THREE.MeshStandardMaterial({ color: 0xe7c94b, emissive: 0x3a2d00, emissiveIntensity: 0.18 }),
  artery: new THREE.MeshStandardMaterial({ color: 0xa83838, roughness: 0.55 }),
  vein: new THREE.MeshStandardMaterial({ color: 0x3d5e91, roughness: 0.55 }),
};

function register(mesh, structureKey, groupName, isFallback = true) {
  mesh.userData.structureKey = structureKey;
  mesh.userData.baseEmissive = mesh.material.emissive?.getHex?.() ?? 0x000000;
  mesh.userData.baseEmissiveIntensity = mesh.material.emissiveIntensity ?? 0;
  anatomicalGroups[groupName].add(mesh);
  if (isFallback) addFallback(structureKey, mesh);
  return mesh;
}

const shoulder = new THREE.Vector3(0, 2.2, 0);
const elbow = new THREE.Vector3(0.25, 0.1, 0.05);
const humerus = register(capsuleBetween(shoulder, elbow, 0.22, materials.bone), 'humerus', 'skeleton');
register(capsuleBetween(new THREE.Vector3(0.15, 0.05, 0.08), new THREE.Vector3(0.62, -1.85, 0.22), 0.11, materials.bone), 'radius', 'skeleton');
register(capsuleBetween(new THREE.Vector3(0.34, 0.05, -0.03), new THREE.Vector3(0.23, -1.88, -0.12), 0.12, materials.bone), 'ulna', 'skeleton');
const humeralHead = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 20), materials.bone.clone());
humeralHead.position.copy(shoulder);
register(humeralHead, 'humerus', 'skeleton');

const biceps = register(capsuleBetween(new THREE.Vector3(-0.18, 1.88, 0.32), new THREE.Vector3(0.12, 0.28, 0.34), 0.3, materials.muscle), 'bicepsBrachii', 'muscles');
biceps.scale.set(0.82, 1, 0.72);
const triceps = register(capsuleBetween(new THREE.Vector3(0.18, 1.95, -0.31), new THREE.Vector3(0.24, 0.23, -0.25), 0.28, materials.muscle), 'tricepsBrachii', 'muscles');
triceps.scale.set(0.78, 1, 0.7);

const medianNerve = register(capsuleBetween(new THREE.Vector3(-0.05, 2.0, 0.43), new THREE.Vector3(0.42, -1.75, 0.42), 0.045, materials.nerve), 'medianNerve', 'nerves');
const musculocutaneousNerve = register(capsuleBetween(new THREE.Vector3(-0.28, 2.05, 0.34), new THREE.Vector3(-0.08, 0.25, 0.36), 0.038, materials.nerve), 'musculocutaneousNerve', 'nerves');
const radialNerve = register(capsuleBetween(new THREE.Vector3(0.2, 1.9, -0.4), new THREE.Vector3(0.48, -1.65, -0.28), 0.04, materials.nerve), 'radialNerve', 'nerves');
register(capsuleBetween(new THREE.Vector3(0.08, 1.85, 0.48), new THREE.Vector3(0.28, 0.12, 0.48), 0.055, materials.artery), 'brachialArtery', 'vessels');
register(capsuleBetween(new THREE.Vector3(-0.34, 1.72, 0.5), new THREE.Vector3(0.62, -1.62, 0.45), 0.05, materials.vein), 'cephalicVein', 'vessels');

anatomicalGroups.muscles.visible = false;
anatomicalGroups.nerves.visible = false;
anatomicalGroups.vessels.visible = false;

const floor = new THREE.Mesh(new THREE.CircleGeometry(2.8, 64), new THREE.MeshStandardMaterial({ color: 0x141922, roughness: 1, transparent: true, opacity: 0.65 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.4;
scene.add(floor);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedMesh = humerus;
let plexusMode = false;
let realAssetCount = 0;

function allMeshes() {
  const meshes = [];
  Object.values(anatomicalGroups).forEach((group) => {
    group.traverse((object) => {
      if (object.isMesh) meshes.push(object);
    });
  });
  return meshes;
}

function clearHighlight() {
  allMeshes().forEach((mesh) => {
    if (!mesh.material?.emissive) return;
    mesh.material.emissive.setHex(mesh.userData.baseEmissive ?? 0x000000);
    mesh.material.emissiveIntensity = mesh.userData.baseEmissiveIntensity ?? 0;
  });
}

function renderInfo(structureKey) {
  const data = upperLimbStructures[structureKey];
  if (!data) return;
  document.querySelector('#selected-name').textContent = data.name;
  document.querySelector('#selected-description').textContent = data.description;

  const details = [];
  if (data.region) details.push(`<div><span>Region</span><b>${data.region}</b></div>`);
  if (data.roots) details.push(`<div><span>Roots</span><b>${data.roots.join(' · ')}</b></div>`);
  if (data.innervation) details.push(`<div><span>Innervation</span><b>${data.innervation}</b></div>`);
  if (data.actions) details.push(`<div><span>Action</span><b>${data.actions.join(', ')}</b></div>`);
  document.querySelector('#details').innerHTML = details.join('');
  document.querySelector('#clinical').innerHTML = data.clinical ? `<span>Clinical link</span><p>${data.clinical}</p>` : '';
}

function setSelected(mesh) {
  const structureKey = mesh?.userData?.structureKey;
  if (!structureKey) return;
  selectedMesh = mesh;
  clearHighlight();
  if (mesh.material?.emissive) {
    mesh.material.emissive.setHex(0x5577aa);
    mesh.material.emissiveIntensity = 0.55;
  }
  renderInfo(structureKey);
}

function restoreAll() {
  Object.entries(anatomicalGroups).forEach(([name, group]) => {
    const button = document.querySelector(`[data-system="${name}"]`);
    group.visible = button?.classList.contains('active') ?? true;
    group.traverse((child) => {
      if (!child.isMesh) return;
      const fallbackHiddenByReal = !child.userData.isRealAnatomy && fallbackRegistry.get(child.userData.structureKey)?.some((item) => item.visible === false && item !== child);
      if (!fallbackHiddenByReal) child.visible = true;
    });
  });
  clearHighlight();
  setSelected(selectedMesh);
}

renderer.domElement.addEventListener('pointerdown', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(allMeshes().filter((mesh) => mesh.visible), false);
  if (hits[0]) setSelected(hits[0].object);
});

document.querySelectorAll('.system').forEach((button) => {
  button.addEventListener('click', () => {
    const system = button.dataset.system;
    const show = !anatomicalGroups[system].visible;
    anatomicalGroups[system].visible = show;
    button.classList.toggle('active', show);
  });
});

document.querySelector('#isolate-btn').addEventListener('click', () => {
  if (!selectedMesh) return;
  const key = selectedMesh.userData.structureKey;
  allMeshes().forEach((mesh) => { mesh.visible = mesh.userData.structureKey === key; });
  Object.values(anatomicalGroups).forEach((group) => { group.visible = true; });
});

document.querySelector('#restore-btn').addEventListener('click', restoreAll);

document.querySelector('#plexus-btn').addEventListener('click', () => {
  plexusMode = !plexusMode;
  document.querySelector('#mode-badge').hidden = !plexusMode;
  document.querySelector('#plexus-btn').classList.toggle('active', plexusMode);
  if (plexusMode) {
    anatomicalGroups.nerves.visible = true;
    document.querySelector('[data-system="nerves"]').classList.add('active');
    [medianNerve, musculocutaneousNerve, radialNerve].forEach((mesh) => {
      mesh.material.emissive.setHex(0x6a5200);
      mesh.material.emissiveIntensity = 0.7;
    });
    setSelected(medianNerve);
  } else {
    clearHighlight();
    setSelected(selectedMesh);
  }
});

renderInfo('humerus');
setSelected(humerus);

hydrateRealModels({
  manifest: modelManifest,
  groups: anatomicalGroups,
  fallbackRegistry,
  onSwap: (structureKey, item, meshes) => {
    realAssetCount += 1;
    document.querySelector('#viewer-badge').textContent = `${realAssetCount} validated GLB structure${realAssetCount === 1 ? '' : 's'} loaded · ${item.sourceLabel ?? structureKey}`;
    if (selectedMesh?.userData?.structureKey === structureKey) setSelected(meshes[0]);
  },
}).then(() => {
  if (realAssetCount === 0) {
    document.querySelector('#viewer-badge').textContent = 'Educational prototype · validated GLBs load automatically when present';
  }
});

function resize() {
  const parent = canvas.parentElement;
  const width = parent.clientWidth;
  const height = parent.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(canvas.parentElement);
resize();

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
