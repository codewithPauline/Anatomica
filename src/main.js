import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <div>
        <p class="eyebrow">ANATOMICA v0.1</p>
        <h1>Upper Limb Explorer</h1>
        <p class="subtitle">Explore anatomy by system, isolate structures, and connect form to function.</p>
      </div>

      <div class="system-list" aria-label="Anatomical systems">
        <button class="system active" data-system="skeleton">Skeleton</button>
        <button class="system" data-system="muscles">Muscles</button>
        <button class="system" data-system="nerves">Nerves</button>
        <button class="system" data-system="vessels">Vessels</button>
      </div>

      <div class="info-card">
        <span class="label">Selected structure</span>
        <strong id="selected-name">Humerus</strong>
        <p id="selected-description">A long bone of the upper arm connecting the shoulder to the elbow.</p>
      </div>

      <p class="hint">Drag to rotate · Scroll to zoom · Right-drag to pan</p>
    </aside>

    <main class="viewer-wrap">
      <canvas id="viewer" aria-label="Interactive 3D anatomy viewer"></canvas>
      <div class="viewer-badge">Prototype anatomy model</div>
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

function capsuleBetween(start, end, radius, material) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CapsuleGeometry(radius, Math.max(length - radius * 2, 0.05), 8, 20);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return mesh;
}

const bone = new THREE.MeshStandardMaterial({ color: 0xe9ddc4, roughness: 0.72 });
const muscle = new THREE.MeshStandardMaterial({ color: 0x9f4a4a, roughness: 0.68 });
const nerve = new THREE.MeshStandardMaterial({ color: 0xe7c94b, emissive: 0x3a2d00, emissiveIntensity: 0.18 });
const artery = new THREE.MeshStandardMaterial({ color: 0xa83838, roughness: 0.55 });
const vein = new THREE.MeshStandardMaterial({ color: 0x3d5e91, roughness: 0.55 });

// Simplified upper-limb forms; these are placeholders until validated anatomical GLB assets are added.
const shoulder = new THREE.Vector3(0, 2.2, 0);
const elbow = new THREE.Vector3(0.25, 0.1, 0.05);
const wrist = new THREE.Vector3(0.42, -1.9, 0.08);

const humerus = capsuleBetween(shoulder, elbow, 0.22, bone);
humerus.userData = { name: 'Humerus', description: 'A long bone of the upper arm connecting the shoulder to the elbow.' };
anatomicalGroups.skeleton.add(humerus);

const radius = capsuleBetween(new THREE.Vector3(0.15, 0.05, 0.08), new THREE.Vector3(0.62, -1.85, 0.22), 0.11, bone);
radius.userData = { name: 'Radius', description: 'The lateral forearm bone in anatomical position, aligned with the thumb.' };
anatomicalGroups.skeleton.add(radius);

const ulna = capsuleBetween(new THREE.Vector3(0.34, 0.05, -0.03), new THREE.Vector3(0.23, -1.88, -0.12), 0.12, bone);
ulna.userData = { name: 'Ulna', description: 'The medial forearm bone and major stabilizing bone of the elbow joint.' };
anatomicalGroups.skeleton.add(ulna);

const humeralHead = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 20), bone);
humeralHead.position.copy(shoulder);
anatomicalGroups.skeleton.add(humeralHead);

const biceps = capsuleBetween(new THREE.Vector3(-0.18, 1.88, 0.32), new THREE.Vector3(0.12, 0.28, 0.34), 0.3, muscle);
biceps.scale.set(0.82, 1, 0.72);
biceps.userData = { name: 'Biceps brachii', description: 'Flexes the elbow and powerfully supinates the forearm.' };
anatomicalGroups.muscles.add(biceps);

const triceps = capsuleBetween(new THREE.Vector3(0.18, 1.95, -0.31), new THREE.Vector3(0.24, 0.23, -0.25), 0.28, muscle);
triceps.scale.set(0.78, 1, 0.7);
triceps.userData = { name: 'Triceps brachii', description: 'The principal extensor of the elbow joint.' };
anatomicalGroups.muscles.add(triceps);

const medianNerve = capsuleBetween(new THREE.Vector3(-0.05, 2.0, 0.43), new THREE.Vector3(0.42, -1.75, 0.42), 0.045, nerve);
medianNerve.userData = { name: 'Median nerve', description: 'A major terminal branch of the brachial plexus supplying much of the anterior forearm and hand.' };
anatomicalGroups.nerves.add(medianNerve);

const brachialArtery = capsuleBetween(new THREE.Vector3(0.08, 1.85, 0.48), new THREE.Vector3(0.28, 0.12, 0.48), 0.055, artery);
brachialArtery.userData = { name: 'Brachial artery', description: 'The principal arterial supply of the arm, continuing from the axillary artery.' };
anatomicalGroups.vessels.add(brachialArtery);

const cephalicVein = capsuleBetween(new THREE.Vector3(-0.34, 1.72, 0.5), new THREE.Vector3(0.62, -1.62, 0.45), 0.05, vein);
cephalicVein.userData = { name: 'Cephalic vein', description: 'A superficial vein running along the lateral aspect of the upper limb.' };
anatomicalGroups.vessels.add(cephalicVein);

anatomicalGroups.muscles.visible = false;
anatomicalGroups.nerves.visible = false;
anatomicalGroups.vessels.visible = false;

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2.8, 64),
  new THREE.MeshStandardMaterial({ color: 0x141922, roughness: 1, transparent: true, opacity: 0.65 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.4;
scene.add(floor);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedMesh = humerus;

function setSelected(mesh) {
  if (!mesh?.userData?.name) return;
  selectedMesh = mesh;
  document.querySelector('#selected-name').textContent = mesh.userData.name;
  document.querySelector('#selected-description').textContent = mesh.userData.description;
}

renderer.domElement.addEventListener('pointerdown', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(Object.values(anatomicalGroups).flatMap((group) => group.children), false);
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
