import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { upperLimbStructures } from './data/upperLimb.js';
import { modelManifest } from './data/modelManifest.js';
import { brachialPlexus } from './data/brachialPlexus.js';
import { quizQuestions } from './data/quizQuestions.js';
import { hydrateRealModels } from './engine/realModelSwap.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <header>
        <p class="eyebrow">ANATOMICA v0.2</p>
        <h1>Upper Limb Explorer</h1>
        <p class="subtitle">Explore structure, function, pathways, and clinical relevance in an interactive 3D model.</p>
      </header>

      <section>
        <span class="section-label">Systems</span>
        <div class="system-list" aria-label="Anatomical systems">
          <button class="system active" data-system="skeleton">Skeleton</button>
          <button class="system" data-system="muscles">Muscles</button>
          <button class="system" data-system="nerves">Nerves</button>
          <button class="system" data-system="vessels">Vessels</button>
          <button class="system" data-system="ligaments">Ligaments</button>
        </div>
      </section>

      <section class="opacity-card">
        <div class="opacity-head">
          <span class="section-label">Transparency</span>
          <span id="opacity-value">100%</span>
        </div>
        <input id="opacity-slider" type="range" min="15" max="100" value="100" step="5" aria-label="Selected system opacity" />
        <p id="opacity-system">Skeleton selected</p>
      </section>

      <section class="tool-row" aria-label="Viewer tools">
        <button id="isolate-btn" class="tool">Isolate</button>
        <button id="restore-btn" class="tool">Restore</button>
        <button id="reset-view-btn" class="tool">Reset view</button>
        <button id="rotator-btn" class="tool">Rotator cuff</button>
        <button id="forearm-btn" class="tool">Forearm</button>
        <button id="hand-btn" class="tool">Wrist & hand</button>
        <button id="plexus-btn" class="tool">Brachial plexus</button>
        <button id="quiz-btn" class="tool accent">Quiz mode</button>
      </section>

      <section id="forearm-card" class="learning-card" hidden>
        <div class="card-head">
          <div>
            <span class="label">Compartment explorer</span>
            <strong>Forearm muscles</strong>
          </div>
          <span class="status-pill">19 muscles</span>
        </div>
        <p class="quiz-prompt">Move from superficial groups to the deep digital flexors and thumb extensors.</p>
        <div class="branch-list study-grid">
          <button id="forearm-anterior-superficial" class="branch-button" type="button"><b>Anterior superficial</b><span>Flexor · pronator</span></button>
          <button id="forearm-anterior-deep" class="branch-button" type="button"><b>Anterior deep</b><span>FDS · FDP · FPL · PQ</span></button>
          <button id="forearm-posterior-superficial" class="branch-button" type="button"><b>Posterior superficial</b><span>Wrist · finger extensors</span></button>
          <button id="forearm-posterior-deep" class="branch-button" type="button"><b>Posterior deep</b><span>Thumb · index · supinator</span></button>
        </div>
      </section>

      <section id="hand-card" class="learning-card" hidden>
        <div class="card-head">
          <div>
            <span class="label">Clinical region explorer</span>
            <strong>Wrist & hand</strong>
          </div>
          <span class="status-pill">6 views</span>
        </div>
        <p id="hand-view-description" class="quiz-prompt">Study all 27 hand bones with the distal radius and ulna.</p>
        <div class="branch-list study-grid">
          <button id="hand-skeleton" class="branch-button" type="button"><b>Hand skeleton</b><span>Carpals · metacarpals · phalanges</span></button>
          <button id="hand-carpal-tunnel" class="branch-button" type="button"><b>Carpal tunnel</b><span>Median nerve · flexors · retinaculum</span></button>
          <button id="hand-snuffbox" class="branch-button" type="button"><b>Snuffbox</b><span>Scaphoid · thumb tendons · radial artery</span></button>
          <button id="hand-tendons" class="branch-button" type="button"><b>Tendon testing</b><span>FDS · FDP · FPL · extensors</span></button>
          <button id="hand-intrinsics" class="branch-button" type="button"><b>Intrinsic hand</b><span>Thenar · hypothenar · interossei</span></button>
          <button id="hand-blood" class="branch-button" type="button"><b>Blood supply</b><span>Radial · ulnar · palmar arches</span></button>
        </div>
      </section>

      <section id="plexus-card" class="learning-card" hidden>
        <div class="card-head">
          <div>
            <span class="label">Pathway explorer</span>
            <strong>Brachial plexus</strong>
          </div>
          <span class="status-pill">C5–T1</span>
        </div>
        <div class="plexus-flow">
          <div><span>Roots</span><b>${brachialPlexus.roots.join(' · ')}</b></div>
          <div><span>Trunks</span><b>Upper · Middle · Lower</b></div>
          <div><span>Divisions</span><b>Anterior · Posterior</b></div>
          <div><span>Cords</span><b>Lateral · Posterior · Medial</b></div>
        </div>
        <div id="plexus-branches" class="branch-list"></div>
      </section>

      <section id="quiz-card" class="learning-card" hidden>
        <div class="card-head">
          <div>
            <span class="label">Practice</span>
            <strong>Identify the structure</strong>
          </div>
          <span id="quiz-score" class="status-pill">0 / 0</span>
        </div>
        <p id="quiz-prompt" class="quiz-prompt"></p>
        <p id="quiz-feedback" class="quiz-feedback">Click the correct structure in the 3D viewer.</p>
        <button id="next-question" class="tool full" type="button">Next question</button>
      </section>

      <section id="info-card" class="info-card" aria-live="polite">
        <span class="label">Selected structure</span>
        <strong id="selected-name">Humerus</strong>
        <p id="selected-description"></p>
        <div id="details" class="details"></div>
        <div id="clinical" class="clinical"></div>
      </section>

      <p class="hint">Drag to rotate · Scroll to zoom · Right-drag to pan · Click a structure to study it</p>
    </aside>

    <main class="viewer-wrap">
      <canvas id="viewer" aria-label="Interactive 3D upper limb anatomy viewer"></canvas>
      <div id="viewer-badge" class="viewer-badge">Educational build · checking anatomical assets</div>
      <div id="mode-badge" class="mode-badge" hidden></div>
    </main>
  </div>
`;

const canvas = document.querySelector('#viewer');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e13);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(3.2, 1.4, 5.3);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.4, 0);
controls.minDistance = 1.2;
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
  ligaments: new THREE.Group(),
};
Object.values(anatomicalGroups).forEach((group) => scene.add(group));

const systemOpacity = { skeleton: 1, muscles: 1, nerves: 1, vessels: 1, ligaments: 1 };
const systemVisibility = { skeleton: true, muscles: false, nerves: false, vessels: false, ligaments: false };
const fallbackRegistry = new Map();
const replacedStructures = new Set();
let activeSystem = 'skeleton';
let selectedMesh = null;
let plexusMode = false;
let rotatorMode = false;
let forearmMode = false;
let forearmCompartment = 'anterior-superficial';
let handMode = false;
let handView = 'skeleton';
let quizMode = false;
let quizIndex = 0;
let quizCorrect = 0;
let quizAttempts = 0;
let quizAnswered = false;
let realAssetCount = 0;

function addFallback(structureKey, object) {
  const list = fallbackRegistry.get(structureKey) ?? [];
  list.push(object);
  fallbackRegistry.set(structureKey, list);
}

function capsuleBetween(start, end, radius, material) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const geometry = new THREE.CapsuleGeometry(radius, Math.max(direction.length() - radius * 2, 0.05), 8, 20);
  const mesh = new THREE.Mesh(geometry, material.clone());
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
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
  mesh.userData.system = groupName;
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

register(capsuleBetween(new THREE.Vector3(-0.05, 2.0, 0.43), new THREE.Vector3(0.42, -1.75, 0.42), 0.045, materials.nerve), 'medianNerve', 'nerves');
register(capsuleBetween(new THREE.Vector3(-0.28, 2.05, 0.34), new THREE.Vector3(-0.08, 0.25, 0.36), 0.038, materials.nerve), 'musculocutaneousNerve', 'nerves');
register(capsuleBetween(new THREE.Vector3(0.2, 1.9, -0.4), new THREE.Vector3(0.48, -1.65, -0.28), 0.04, materials.nerve), 'radialNerve', 'nerves');
register(capsuleBetween(new THREE.Vector3(0.18, 1.72, 0.28), new THREE.Vector3(0.04, -1.82, 0.28), 0.038, materials.nerve), 'ulnarNerve', 'nerves');
register(capsuleBetween(new THREE.Vector3(-0.05, 2.22, -0.18), new THREE.Vector3(-0.42, 1.65, -0.05), 0.04, materials.nerve), 'axillaryNerve', 'nerves');
register(capsuleBetween(new THREE.Vector3(0.08, 1.85, 0.48), new THREE.Vector3(0.28, 0.12, 0.48), 0.055, materials.artery), 'brachialArtery', 'vessels');
register(capsuleBetween(new THREE.Vector3(-0.34, 1.72, 0.5), new THREE.Vector3(0.62, -1.62, 0.45), 0.05, materials.vein), 'cephalicVein', 'vessels');

Object.entries(systemVisibility).forEach(([system, visible]) => { anatomicalGroups[system].visible = visible; });

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2.15, 64),
  new THREE.MeshStandardMaterial({ color: 0x141922, roughness: 1, transparent: true, opacity: 0.65 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.4;
scene.add(floor);

function allMeshes() {
  const meshes = [];
  Object.values(anatomicalGroups).forEach((group) => group.traverse((object) => {
    if (object.isMesh) meshes.push(object);
  }));
  return meshes;
}

function meshesForStructure(structureKey) {
  return allMeshes().filter((mesh) => mesh.userData.structureKey === structureKey && mesh.visible);
}

function fitCameraToMeshes(meshes, padding = 1.22) {
  const visibleMeshes = meshes.filter((mesh) => mesh?.isMesh && mesh.visible && mesh.parent?.visible !== false);
  if (!visibleMeshes.length) return;
  const box = new THREE.Box3();
  visibleMeshes.forEach((mesh) => box.expandByObject(mesh));
  if (box.isEmpty()) return;
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(maxDim) || maxDim <= 0) return;
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const distance = Math.max(((maxDim * 0.5) / Math.tan(fov * 0.5)) * padding, 1.45);
  controls.target.copy(center);
  camera.position.set(center.x + distance * 0.72, center.y + distance * 0.18, center.z + distance);
  camera.near = Math.max(distance / 120, 0.02);
  camera.far = Math.max(distance * 20, 50);
  camera.updateProjectionMatrix();
  controls.update();
}

function fitCameraToAnatomy(padding = 1.22) {
  fitCameraToMeshes(allMeshes(), padding);
}

function applySystemOpacity(system, opacity) {
  const group = anatomicalGroups[system];
  if (!group) return;
  group.traverse((object) => {
    if (!object.isMesh || !object.material) return;
    object.material.transparent = opacity < 1;
    object.material.opacity = opacity;
    object.material.depthWrite = opacity >= 0.6;
    object.material.needsUpdate = true;
  });
}

function clearHighlight() {
  allMeshes().forEach((mesh) => {
    if (!mesh.material?.emissive) return;
    mesh.material.emissive.setHex(mesh.userData.baseEmissive ?? 0x000000);
    mesh.material.emissiveIntensity = mesh.userData.baseEmissiveIntensity ?? 0;
  });
}

function highlightStructure(structureKey, color = 0x5577aa, intensity = 0.55) {
  meshesForStructure(structureKey).forEach((mesh) => {
    if (!mesh.material?.emissive) return;
    mesh.material.emissive.setHex(color);
    mesh.material.emissiveIntensity = intensity;
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
  if (data.origin) details.push(`<div><span>Origin</span><b>${data.origin.join('; ')}</b></div>`);
  if (data.insertion) details.push(`<div><span>Insertion</span><b>${data.insertion.join('; ')}</b></div>`);
  if (data.innervation) details.push(`<div><span>Innervation</span><b>${data.innervation}</b></div>`);
  if (data.actions) details.push(`<div><span>Action</span><b>${data.actions.join(', ')}</b></div>`);
  document.querySelector('#details').innerHTML = details.join('');
  document.querySelector('#clinical').innerHTML = data.clinical ? `<span>Clinical link</span><p>${data.clinical}</p>` : '';
}

function setSelected(mesh) {
  const key = mesh?.userData?.structureKey;
  if (!key) return;
  selectedMesh = mesh;
  clearHighlight();
  highlightStructure(key);
  renderInfo(key);
}

function syncSystemButton(system) {
  const button = document.querySelector(`[data-system="${system}"]`);
  button?.classList.toggle('active', systemVisibility[system]);
}

function setSystemVisibility(system, visible, persist = true) {
  if (!anatomicalGroups[system]) return;
  if (persist) systemVisibility[system] = visible;
  anatomicalGroups[system].visible = visible;
  if (persist) syncSystemButton(system);
}

function restoreAll() {
  Object.entries(anatomicalGroups).forEach(([system, group]) => {
    group.visible = systemVisibility[system];
    group.traverse((child) => {
      if (!child.isMesh) return;
      const key = child.userData.structureKey;
      child.visible = child.userData.isRealAnatomy || !replacedStructures.has(key);
    });
    syncSystemButton(system);
  });
  clearHighlight();
  if (selectedMesh?.userData?.structureKey) highlightStructure(selectedMesh.userData.structureKey);
}

function setModeBadge(text = '') {
  const badge = document.querySelector('#mode-badge');
  badge.textContent = text;
  badge.hidden = !text;
}

function deactivateStudyModes(except = '') {
  if (except !== 'rotator') {
    rotatorMode = false;
    document.querySelector('#rotator-btn').classList.remove('active');
  }
  if (except !== 'forearm') {
    forearmMode = false;
    document.querySelector('#forearm-btn').classList.remove('active');
    document.querySelector('#forearm-card').hidden = true;
  }
  if (except !== 'hand') {
    handMode = false;
    document.querySelector('#hand-btn').classList.remove('active');
    document.querySelector('#hand-card').hidden = true;
  }
  if (except !== 'plexus') {
    plexusMode = false;
    document.querySelector('#plexus-btn').classList.remove('active');
    document.querySelector('#plexus-card').hidden = true;
  }
  if (except !== 'quiz') {
    quizMode = false;
    document.querySelector('#quiz-btn').classList.remove('active');
    document.querySelector('#quiz-card').hidden = true;
  }
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(allMeshes().filter((mesh) => mesh.visible && mesh.parent?.visible !== false), false);
  const hit = hits[0]?.object;
  if (!hit) return;
  if (quizMode) return answerQuiz(hit.userData.structureKey);
  setSelected(hit);
});

document.querySelectorAll('.system').forEach((button) => {
  button.addEventListener('click', () => {
    const system = button.dataset.system;
    activeSystem = system;
    document.querySelector('#opacity-slider').value = String(Math.round(systemOpacity[system] * 100));
    document.querySelector('#opacity-value').textContent = `${Math.round(systemOpacity[system] * 100)}%`;
    document.querySelector('#opacity-system').textContent = `${button.textContent} selected`;
    setSystemVisibility(system, !systemVisibility[system]);
  });
});

document.querySelector('#opacity-slider').addEventListener('input', (event) => {
  const opacity = Number(event.target.value) / 100;
  systemOpacity[activeSystem] = opacity;
  document.querySelector('#opacity-value').textContent = `${event.target.value}%`;
  applySystemOpacity(activeSystem, opacity);
});

document.querySelector('#isolate-btn').addEventListener('click', () => {
  const key = selectedMesh?.userData?.structureKey;
  if (!key) return;
  allMeshes().forEach((mesh) => { mesh.visible = mesh.userData.structureKey === key; });
  Object.values(anatomicalGroups).forEach((group) => { group.visible = true; });
  clearHighlight();
  highlightStructure(key);
  setModeBadge(`Isolated · ${upperLimbStructures[key]?.name ?? key}`);
  fitCameraToMeshes(meshesForStructure(key), 1.35);
});

document.querySelector('#restore-btn').addEventListener('click', () => {
  deactivateStudyModes();
  restoreAll();
  setModeBadge('');
  fitCameraToAnatomy();
});

document.querySelector('#reset-view-btn').addEventListener('click', () => fitCameraToAnatomy());

const rotatorKeys = ['supraspinatus', 'infraspinatus', 'teresMinor', 'subscapularis'];
const shoulderSkeletonKeys = ['humerus', 'scapula', 'clavicle'];
const shoulderStudyKeys = [...shoulderSkeletonKeys, 'deltoid', ...rotatorKeys];

document.querySelector('#rotator-btn').addEventListener('click', () => {
  const nextState = !rotatorMode;
  deactivateStudyModes('rotator');
  rotatorMode = nextState;
  document.querySelector('#rotator-btn').classList.toggle('active', rotatorMode);

  if (rotatorMode) {
    setSystemVisibility('skeleton', true, false);
    setSystemVisibility('muscles', true, false);
    setSystemVisibility('nerves', false, false);
    setSystemVisibility('vessels', false, false);
    setSystemVisibility('ligaments', false, false);
    allMeshes().forEach((mesh) => {
      const key = mesh.userData.structureKey;
      if (mesh.userData.system === 'skeleton') mesh.visible = shoulderSkeletonKeys.includes(key);
      else if (mesh.userData.system === 'muscles') mesh.visible = shoulderStudyKeys.includes(key);
      else mesh.visible = false;
    });
    clearHighlight();
    rotatorKeys.forEach((key) => highlightStructure(key, 0x7f303f, 0.6));
    setModeBadge('Rotator Cuff · SITS');
    fitCameraToMeshes(allMeshes().filter((mesh) => shoulderStudyKeys.includes(mesh.userData.structureKey)), 1.35);
  } else {
    restoreAll();
    setModeBadge('');
    fitCameraToAnatomy();
  }
});

const forearmSkeletonKeys = ['humerus', 'radius', 'ulna'];
const forearmViews = {
  'anterior-superficial': {
    label: 'Anterior · superficial',
    color: 0x7d3d2e,
    keys: ['pronatorTeres', 'flexorCarpiRadialis', 'palmarisLongus', 'flexorCarpiUlnaris'],
  },
  'anterior-deep': {
    label: 'Anterior · deep',
    color: 0x8b4732,
    keys: ['flexorDigitorumSuperficialis', 'flexorDigitorumProfundus', 'flexorPollicisLongus', 'pronatorQuadratus'],
  },
  'posterior-superficial': {
    label: 'Posterior · superficial',
    color: 0x69364d,
    keys: ['brachioradialis', 'extensorCarpiRadialisLongus', 'extensorCarpiRadialisBrevis', 'extensorDigitorum', 'extensorDigitiMinimi', 'extensorCarpiUlnaris'],
  },
  'posterior-deep': {
    label: 'Posterior · deep',
    color: 0x5d3b68,
    keys: ['supinator', 'abductorPollicisLongus', 'extensorPollicisBrevis', 'extensorPollicisLongus', 'extensorIndicis'],
  },
};
const allForearmKeys = Object.values(forearmViews).flatMap((view) => view.keys);

function renderForearmCompartment(compartment) {
  const view = forearmViews[compartment] ?? forearmViews['anterior-superficial'];
  forearmCompartment = compartment;
  Object.keys(forearmViews).forEach((key) => {
    document.querySelector(`#forearm-${key}`)?.classList.toggle('active', key === compartment);
  });

  setSystemVisibility('skeleton', true, false);
  setSystemVisibility('muscles', true, false);
  setSystemVisibility('nerves', false, false);
  setSystemVisibility('vessels', false, false);
  setSystemVisibility('ligaments', false, false);

  allMeshes().forEach((mesh) => {
    const key = mesh.userData.structureKey;
    if (mesh.userData.system === 'skeleton') mesh.visible = forearmSkeletonKeys.includes(key);
    else if (mesh.userData.system === 'muscles') mesh.visible = view.keys.includes(key);
    else mesh.visible = false;
  });

  clearHighlight();
  view.keys.forEach((key) => highlightStructure(key, view.color, 0.55));
  setModeBadge(`Forearm · ${view.label}`);
  fitCameraToMeshes(allMeshes().filter((mesh) => [...forearmSkeletonKeys, ...view.keys].includes(mesh.userData.structureKey)), 1.25);
}

document.querySelector('#forearm-btn').addEventListener('click', () => {
  const nextState = !forearmMode;
  deactivateStudyModes('forearm');
  forearmMode = nextState;
  document.querySelector('#forearm-btn').classList.toggle('active', forearmMode);
  document.querySelector('#forearm-card').hidden = !forearmMode;
  if (forearmMode) renderForearmCompartment(forearmCompartment);
  else {
    restoreAll();
    setModeBadge('');
    fitCameraToAnatomy();
  }
});

Object.keys(forearmViews).forEach((key) => {
  document.querySelector(`#forearm-${key}`)?.addEventListener('click', () => renderForearmCompartment(key));
});

const carpalKeys = ['scaphoid', 'lunate', 'triquetral', 'pisiform', 'trapezium', 'trapezoid', 'capitate', 'hamate'];
const metacarpalKeys = ['metacarpal1', 'metacarpal2', 'metacarpal3', 'metacarpal4', 'metacarpal5'];
const phalanxKeys = [
  'proximalPhalanxThumb', 'proximalPhalanxIndex', 'proximalPhalanxMiddle', 'proximalPhalanxRing', 'proximalPhalanxLittle',
  'middlePhalanxIndex', 'middlePhalanxMiddle', 'middlePhalanxRing', 'middlePhalanxLittle',
  'distalPhalanxThumb', 'distalPhalanxIndex', 'distalPhalanxMiddle', 'distalPhalanxRing', 'distalPhalanxLittle',
];
const handBoneKeys = [...carpalKeys, ...metacarpalKeys, ...phalanxKeys];
const handSkeletonContextKeys = ['radius', 'ulna', ...handBoneKeys];
const carpalTunnelKeys = ['medianNerve', 'flexorRetinaculum', 'flexorDigitorumSuperficialis', 'flexorDigitorumProfundus', 'flexorPollicisLongus'];
const snuffboxKeys = ['scaphoid', 'trapezium', 'abductorPollicisLongus', 'extensorPollicisBrevis', 'extensorPollicisLongus', 'radialArtery'];
const tendonTestKeys = ['flexorDigitorumSuperficialis', 'flexorDigitorumProfundus', 'flexorPollicisLongus', 'extensorDigitorum', 'extensorDigitiMinimi', 'extensorIndicis', 'abductorPollicisLongus', 'extensorPollicisBrevis', 'extensorPollicisLongus'];
const intrinsicHandKeys = ['abductorPollicisBrevis', 'flexorPollicisBrevis', 'opponensPollicis', 'adductorPollicis', 'abductorDigitiMinimi', 'flexorDigitiMinimiBrevis', 'opponensDigitiMinimi', 'lumbricals', 'palmarInterossei', 'dorsalInterossei'];
const handBloodKeys = ['radialArtery', 'ulnarArtery', 'superficialPalmarArch', 'deepPalmarArch'];
const allHandKeys = [...new Set([...handSkeletonContextKeys, ...carpalTunnelKeys, ...snuffboxKeys, ...tendonTestKeys, ...intrinsicHandKeys, ...handBloodKeys])];

const handViews = {
  skeleton: {
    label: 'Hand Skeleton',
    description: 'Study all 27 hand bones with the distal radius and ulna.',
    skeleton: handSkeletonContextKeys,
    muscles: [], nerves: [], vessels: [], ligaments: [],
    highlight: carpalKeys,
  },
  'carpal-tunnel': {
    label: 'Carpal Tunnel',
    description: 'See the median nerve and long flexors deep to the flexor retinaculum across the carpal arch.',
    skeleton: ['radius', 'ulna', ...carpalKeys, 'metacarpal1', 'metacarpal5'],
    muscles: ['flexorDigitorumSuperficialis', 'flexorDigitorumProfundus', 'flexorPollicisLongus'],
    nerves: ['medianNerve'], vessels: [], ligaments: ['flexorRetinaculum'],
    highlight: ['medianNerve', 'flexorRetinaculum'],
  },
  snuffbox: {
    label: 'Anatomical Snuffbox',
    description: 'Trace APL/EPB laterally and EPL medially over the scaphoid with the radial artery in the floor.',
    skeleton: ['radius', 'scaphoid', 'trapezium', 'metacarpal1'],
    muscles: ['abductorPollicisLongus', 'extensorPollicisBrevis', 'extensorPollicisLongus'],
    nerves: [], vessels: ['radialArtery'], ligaments: [],
    highlight: snuffboxKeys,
  },
  tendons: {
    label: 'Tendon Testing',
    description: 'Compare digital flexors, finger extensors, and the three major extrinsic thumb tendons used in focused hand examination.',
    skeleton: ['radius', 'ulna', ...handBoneKeys],
    muscles: tendonTestKeys, nerves: [], vessels: [], ligaments: [],
    highlight: tendonTestKeys,
  },
  intrinsics: {
    label: 'Intrinsic Hand',
    description: 'Study thenar, hypothenar, lumbrical, and interosseous groups with their median-versus-ulnar motor pattern.',
    skeleton: handBoneKeys,
    muscles: intrinsicHandKeys, nerves: ['medianNerve', 'ulnarNerve'], vessels: [], ligaments: [],
    highlight: intrinsicHandKeys,
  },
  blood: {
    label: 'Hand Blood Supply',
    description: 'Follow radial and ulnar inflow into the deep and superficial palmar arterial arches.',
    skeleton: ['radius', 'ulna', ...handBoneKeys],
    muscles: [], nerves: [], vessels: handBloodKeys, ligaments: [],
    highlight: handBloodKeys,
  },
};

function handVisibleSet(viewName) {
  const view = handViews[viewName] ?? handViews.skeleton;
  return new Set([...view.skeleton, ...view.muscles, ...view.nerves, ...view.vessels, ...view.ligaments]);
}

function renderHandView(viewName) {
  const view = handViews[viewName] ?? handViews.skeleton;
  handView = viewName;
  Object.keys(handViews).forEach((key) => {
    document.querySelector(`#hand-${key}`)?.classList.toggle('active', key === viewName);
  });
  document.querySelector('#hand-view-description').textContent = view.description;

  const enabledSystems = {
    skeleton: view.skeleton.length > 0,
    muscles: view.muscles.length > 0,
    nerves: view.nerves.length > 0,
    vessels: view.vessels.length > 0,
    ligaments: view.ligaments.length > 0,
  };
  Object.entries(enabledSystems).forEach(([system, visible]) => setSystemVisibility(system, visible, false));

  const visible = handVisibleSet(viewName);
  allMeshes().forEach((mesh) => { mesh.visible = visible.has(mesh.userData.structureKey); });
  clearHighlight();
  view.highlight.forEach((key) => highlightStructure(key, 0x6b587e, 0.65));
  setModeBadge(`Wrist & Hand · ${view.label}`);
  fitCameraToMeshes(allMeshes().filter((mesh) => visible.has(mesh.userData.structureKey)), viewName === 'skeleton' ? 1.18 : 1.28);
}

document.querySelector('#hand-btn').addEventListener('click', () => {
  const nextState = !handMode;
  deactivateStudyModes('hand');
  handMode = nextState;
  document.querySelector('#hand-btn').classList.toggle('active', handMode);
  document.querySelector('#hand-card').hidden = !handMode;
  if (handMode) renderHandView(handView);
  else {
    restoreAll();
    setModeBadge('');
    fitCameraToAnatomy();
  }
});

Object.keys(handViews).forEach((key) => {
  document.querySelector(`#hand-${key}`)?.addEventListener('click', () => renderHandView(key));
});

const branchContainer = document.querySelector('#plexus-branches');
brachialPlexus.terminalBranches.forEach((branch) => {
  const button = document.createElement('button');
  button.className = 'branch-button';
  button.innerHTML = `<b>${branch.name}</b><span>${branch.cord} · ${branch.roots.join('–')}</span>`;
  button.addEventListener('click', () => {
    setSystemVisibility('nerves', true);
    clearHighlight();
    highlightStructure(branch.structureKey, 0x8b6b00, 0.85);
    const mesh = meshesForStructure(branch.structureKey)[0];
    if (mesh) setSelected(mesh);
  });
  branchContainer.appendChild(button);
});

const plexusKeys = ['musculocutaneousNerve', 'medianNerve', 'ulnarNerve', 'axillaryNerve', 'radialNerve'];
document.querySelector('#plexus-btn').addEventListener('click', () => {
  const nextState = !plexusMode;
  deactivateStudyModes('plexus');
  plexusMode = nextState;
  document.querySelector('#plexus-btn').classList.toggle('active', plexusMode);
  document.querySelector('#plexus-card').hidden = !plexusMode;
  if (plexusMode) {
    restoreAll();
    setSystemVisibility('nerves', true);
    clearHighlight();
    plexusKeys.forEach((key) => highlightStructure(key, 0x6a5200, 0.7));
    setModeBadge('Brachial Plexus Mode');
  } else {
    clearHighlight();
    if (selectedMesh) highlightStructure(selectedMesh.userData.structureKey);
    setModeBadge('');
  }
});

function currentQuiz() {
  return quizQuestions[quizIndex % quizQuestions.length];
}

function renderQuiz() {
  const question = currentQuiz();
  document.querySelector('#quiz-prompt').textContent = question.prompt;
  document.querySelector('#quiz-feedback').textContent = 'Click the correct structure in the 3D viewer.';
  document.querySelector('#quiz-feedback').className = 'quiz-feedback';
  document.querySelector('#quiz-score').textContent = `${quizCorrect} / ${quizAttempts}`;
  document.querySelector('#next-question').disabled = true;
  quizAnswered = false;
  clearHighlight();
}

function answerQuiz(structureKey) {
  if (quizAnswered) return;
  quizAnswered = true;
  quizAttempts += 1;
  const question = currentQuiz();
  const correct = structureKey === question.target;
  if (correct) quizCorrect += 1;
  clearHighlight();
  highlightStructure(question.target, correct ? 0x2d7c52 : 0x7c5e20, 0.9);
  const feedback = document.querySelector('#quiz-feedback');
  feedback.textContent = `${correct ? 'Correct.' : `Not quite — the answer is ${question.answer}.`} ${question.explanation}`;
  feedback.className = `quiz-feedback ${correct ? 'correct' : 'incorrect'}`;
  document.querySelector('#quiz-score').textContent = `${quizCorrect} / ${quizAttempts}`;
  document.querySelector('#next-question').disabled = false;
}

document.querySelector('#next-question').addEventListener('click', () => {
  quizIndex = (quizIndex + 1) % quizQuestions.length;
  renderQuiz();
});

document.querySelector('#quiz-btn').addEventListener('click', () => {
  const nextState = !quizMode;
  deactivateStudyModes('quiz');
  quizMode = nextState;
  document.querySelector('#quiz-btn').classList.toggle('active', quizMode);
  document.querySelector('#quiz-card').hidden = !quizMode;
  if (quizMode) {
    restoreAll();
    Object.keys(anatomicalGroups).forEach((system) => setSystemVisibility(system, true));
    setModeBadge('Quiz Mode');
    renderQuiz();
    fitCameraToAnatomy(1.18);
  } else {
    clearHighlight();
    if (selectedMesh) highlightStructure(selectedMesh.userData.structureKey);
    setModeBadge('');
  }
});

setSelected(humerus);

hydrateRealModels({
  manifest: modelManifest,
  groups: anatomicalGroups,
  fallbackRegistry,
  onSwap: (structureKey, item, meshes) => {
    replacedStructures.add(structureKey);
    realAssetCount += 1;
    meshes.forEach((mesh) => {
      mesh.userData.system = item.system;
      mesh.userData.isRealAnatomy = true;
      if (forearmMode && allForearmKeys.includes(structureKey)) {
        mesh.visible = forearmViews[forearmCompartment]?.keys.includes(structureKey) ?? false;
      } else if (handMode && allHandKeys.includes(structureKey)) {
        mesh.visible = handVisibleSet(handView).has(structureKey);
      } else {
        mesh.visible = systemVisibility[item.system] ?? false;
      }
    });
    fallbackRegistry.get(structureKey)?.forEach((fallback) => { fallback.visible = false; });
    applySystemOpacity(item.system, systemOpacity[item.system] ?? 1);
    document.querySelector('#viewer-badge').textContent = `${realAssetCount} real anatomical GLB${realAssetCount === 1 ? '' : 's'} · clinical teaching overlays active`;
    if (selectedMesh?.userData?.structureKey === structureKey) setSelected(meshes[0]);
  },
}).then(() => {
  if (handMode) renderHandView(handView);
  else if (forearmMode) renderForearmCompartment(forearmCompartment);
  else fitCameraToAnatomy();
  if (realAssetCount === 0) {
    document.querySelector('#viewer-badge').textContent = 'Educational build · real GLBs load automatically when available';
  }
}).catch((error) => {
  console.error('[Anatomica] Asset hydration failed', error);
  document.querySelector('#viewer-badge').textContent = 'Educational build · asset fallback active';
});

function resize() {
  const parent = canvas.parentElement;
  const width = Math.max(parent.clientWidth, 1);
  const height = Math.max(parent.clientHeight, 1);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
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
