import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { upperLimbStructures } from './data/upperLimb.js';
import { modelManifest } from './data/modelManifest.js';
import { brachialPlexus } from './data/brachialPlexus.js';
import { quizQuestions } from './data/quizQuestions.js';
import { clinicalCases, clinicalCaseById, clinicalCaseKeys } from './data/clinicalCases.js';
import { nerveDeficits, nerveDeficitById, nerveDeficitKeys, lesionLevelById } from './data/nerveDeficits.js';
import { localizationChallenges, localizationChallengeById, localizationChallengesForDifficulty } from './data/localizationChallenges.js';
import { clearLearnerProgress, loadLearnerProgress, recordLocalizationSession, saveLearnerProgress, summarizeLearnerProgress } from './learning/progressStore.js';
import { buildMasteryDashboard } from './learning/masteryDashboard.js';
import { buildRemediationSession, remediationFocusLabel } from './learning/remediation.js';
import { hydrateRealModels } from './engine/realModelSwap.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <header>
        <p class="eyebrow">ANATOMICA v0.3</p>
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
        <button id="clinical-btn" class="tool clinical-accent">Clinical cases</button>
        <button id="nerve-deficit-btn" class="tool nerve-accent">Nerve deficits</button>
        <button id="localization-challenge-btn" class="tool challenge-accent">Localization challenge</button>
        <button id="mastery-dashboard-btn" class="tool mastery-accent">Mastery dashboard</button>
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

      <section id="clinical-card" class="learning-card" hidden>
        <div class="card-head">
          <div>
            <span class="label">Clinical intelligence</span>
            <strong>Upper-limb cases</strong>
          </div>
          <span class="status-pill">${clinicalCases.length} cases</span>
        </div>
        <p id="clinical-case-subtitle" class="quiz-prompt">Select a case to connect anatomy with mechanism, deficit, and examination.</p>
        <div id="clinical-case-list" class="branch-list"></div>
        <div class="details clinical-case-details" aria-live="polite">
          <div><span>Mechanism</span><b id="clinical-mechanism"></b></div>
          <div><span>Expected deficit</span><b id="clinical-deficit"></b></div>
          <div><span>Exam clue</span><b id="clinical-exam"></b></div>
          <div class="clinical-pearl"><span>Clinical pearl</span><b id="clinical-pearl"></b></div>
        </div>
      </section>

      <section id="nerve-deficit-card" class="learning-card" hidden>
        <div class="card-head">
          <div>
            <span class="label">Neurologic localization</span>
            <strong>Nerve deficit explorer</strong>
          </div>
          <span class="status-pill">${nerveDeficits.length} nerves</span>
        </div>
        <p id="nerve-deficit-subtitle" class="quiz-prompt">Choose a nerve to connect motor loss, sensory territory, lesion sites, and examination.</p>
        <div id="nerve-deficit-list" class="branch-list study-grid"></div>
        <div class="details nerve-deficit-details" aria-live="polite">
          <div><span>Roots</span><b id="nerve-deficit-roots"></b></div>
          <div><span>Motor pattern</span><b id="nerve-deficit-motor"></b></div>
          <div><span>Sensory territory</span><b id="nerve-deficit-sensory"></b></div>
          <div><span>Common lesion sites</span><b id="nerve-deficit-sites"></b></div>
          <div><span>Exam</span><b id="nerve-deficit-exam"></b></div>
          <div class="clinical-pearl"><span>Clinical pearl</span><b id="nerve-deficit-pearl"></b></div>
        </div>
        <div class="sensory-schematic">
          <span class="section-label">Sensory map · schematic</span>
          <div id="sensory-region-chips" class="sensory-region-chips"></div>
          <p>Educational territory summary only; not a patient-specific sensory map.</p>
        </div>
        <div class="lesion-localizer">
          <div class="motor-sim-head">
            <div>
              <span class="section-label">Lesion localization</span>
              <strong>Where is the nerve injured?</strong>
            </div>
            <span id="lesion-level-pill" class="status-pill">Select level</span>
          </div>
          <p class="motor-sim-intro">Compare proximal and distal lesion patterns using structures represented in the current Anatomica build.</p>
          <div id="lesion-level-list" class="branch-list"></div>
          <div class="details lesion-level-details" aria-live="polite">
            <div><span>Motor pattern</span><b id="lesion-level-motor"></b></div>
            <div><span>Sensory pattern</span><b id="lesion-level-sensory"></b></div>
            <div class="clinical-pearl"><span>Localization clue</span><b id="lesion-level-clue"></b></div>
          </div>
          <p class="simulator-note">Localization patterns are educational simplifications; exact findings depend on fascicular anatomy and lesion severity.</p>
        </div>
        <div class="motor-simulator">
          <div class="motor-sim-head">
            <div>
              <span class="section-label">Functional examination</span>
              <strong>Motor Test Simulator</strong>
            </div>
            <span id="motor-test-state-pill" class="status-pill">Lesion pattern</span>
          </div>
          <p class="motor-sim-intro">Select an exam maneuver, then compare expected activation with the lesion pattern.</p>
          <div id="motor-test-list" class="branch-list study-grid"></div>
          <div class="motor-state-toggle" aria-label="Motor simulation state">
            <button id="motor-normal-btn" class="tool" type="button">Normal activation</button>
            <button id="motor-lesion-btn" class="tool active" type="button">Lesion pattern</button>
          </div>
          <div id="motor-test-readout" class="motor-test-readout">
            <span id="motor-test-label" class="label"></span>
            <strong id="motor-test-instruction"></strong>
            <div><span>Expected response</span><b id="motor-test-response"></b></div>
          </div>
          <p class="simulator-note">Activation highlighting only. Anatomica does not deform unrigged anatomy to imitate movement.</p>
        </div>
      </section>

      <section id="localization-challenge-card" class="learning-card" hidden>
        <div class="card-head">
          <div>
            <span class="label">Clinical reasoning</span>
            <strong>Localization Challenge</strong>
          </div>
          <span id="challenge-score" class="status-pill">0 / 0</span>
        </div>
        <div class="challenge-session-controls">
          <span class="section-label">Session mode</span>
          <div class="challenge-difficulty-grid" role="group" aria-label="Challenge difficulty">
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="easy" type="button">Easy</button>
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="intermediate" type="button">Intermediate</button>
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="advanced" type="button">Advanced</button>
            <button class="tool challenge-difficulty-button active" data-challenge-difficulty="adaptive" type="button">Adaptive</button>
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="review" type="button">Review due</button>
          </div>
          <p id="challenge-mode-note" class="challenge-mode-note">Adaptive mode uses all cases and brings another case from a missed nerve forward when possible.</p>
        </div>
        <div class="challenge-persistent-progress" aria-live="polite">
          <div class="challenge-persistent-head">
            <span class="section-label">Progress on this browser</span>
            <button id="challenge-clear-progress" class="challenge-clear-progress" type="button">Clear</button>
          </div>
          <div class="challenge-persistent-stats">
            <div><span>Sessions</span><b id="challenge-lifetime-sessions">0</b></div>
            <div><span>Accuracy</span><b id="challenge-lifetime-accuracy">—</b></div>
            <div><span>Due review</span><b id="challenge-review-count">0</b></div>
          </div>
          <p id="challenge-persistent-focus">Complete a session to build a mastery profile.</p>
          <p class="challenge-storage-note">Stored only in this browser. No account or cloud sync.</p>
        </div>
        <p id="challenge-progress" class="challenge-progress">Case 1 of ${localizationChallenges.length}</p>
        <strong id="challenge-title" class="challenge-title"></strong>
        <p id="challenge-stem" class="quiz-prompt"></p>
        <div id="challenge-findings" class="challenge-finding-chips"></div>

        <div class="challenge-answer-block">
          <span class="section-label">1 · Choose the nerve</span>
          <div id="challenge-nerve-options" class="branch-list study-grid"></div>
        </div>
        <div class="challenge-answer-block">
          <span class="section-label">2 · Choose the lesion level</span>
          <div id="challenge-level-options" class="branch-list"></div>
        </div>

        <button id="challenge-submit" class="tool full challenge-submit" type="button" disabled>Submit localization</button>
        <div id="challenge-feedback" class="challenge-feedback" hidden aria-live="polite">
          <strong id="challenge-feedback-title"></strong>
          <p id="challenge-feedback-answer"></p>
          <p id="challenge-feedback-explanation"></p>
        </div>
        <button id="challenge-next" class="tool full" type="button" hidden>Next case</button>
        <div id="challenge-session-summary" class="challenge-session-summary" hidden aria-live="polite">
          <span class="section-label">Session complete</span>
          <strong id="challenge-summary-score"></strong>
          <p id="challenge-summary-focus"></p>
          <div id="challenge-nerve-summary" class="challenge-nerve-summary"></div>
          <div class="challenge-missed-block">
            <span class="section-label">Missed localizations</span>
            <div id="challenge-missed-list" class="challenge-missed-list"></div>
          </div>
          <button id="challenge-restart" class="tool full" type="button">Start another session</button>
        </div>
        <p class="simulator-note">Educational reasoning exercise only. The 3D answer reveal uses the current modeled anatomy and does not represent patient-specific diagnosis.</p>
      </section>

      <section id="mastery-dashboard-card" class="learning-card mastery-dashboard-card" hidden>
        <div class="card-head">
          <div>
            <span class="label">Learning analytics</span>
            <strong>Mastery dashboard</strong>
          </div>
          <span class="status-pill">Browser local</span>
        </div>
        <p class="mastery-intro">Track longitudinal localization performance without an account or backend.</p>

        <div class="mastery-overview-stats">
          <div><span>Sessions</span><b id="mastery-total-sessions">0</b></div>
          <div><span>Accuracy</span><b id="mastery-overall-accuracy">—</b></div>
          <div><span>Due review</span><b id="mastery-due-review">0</b></div>
        </div>

        <div class="mastery-momentum">
          <span class="section-label">Recent momentum</span>
          <b id="mastery-momentum-text">Complete at least two sessions to establish a trend.</b>
        </div>

        <div class="mastery-section">
          <span class="section-label">Recent session accuracy</span>
          <div id="mastery-session-trend" class="mastery-session-trend"></div>
        </div>

        <div class="mastery-section">
          <span class="section-label">Lesion mastery states</span>
          <div class="mastery-state-grid">
            <div class="strong"><span>Strong</span><b id="mastery-count-strong">0</b></div>
            <div class="practicing"><span>Practicing</span><b id="mastery-count-practicing">0</b></div>
            <div class="developing"><span>Developing</span><b id="mastery-count-developing">0</b></div>
            <div class="unseen"><span>Unseen</span><b id="mastery-count-unseen">0</b></div>
          </div>
        </div>

        <div class="mastery-section">
          <span class="section-label">All lesion patterns</span>
          <div id="mastery-lesion-grid" class="mastery-lesion-grid"></div>
        </div>

        <div class="mastery-section">
          <span class="section-label">Weakest practiced concepts</span>
          <div id="mastery-weakest-list" class="mastery-weakest-list"></div>
        </div>

        <button id="mastery-review-btn" class="tool full mastery-review-btn" type="button">No review due</button>
        <button id="mastery-clear-progress" class="mastery-clear-button" type="button">Clear saved progress</button>
        <p class="simulator-note">Mastery labels summarize practice performance only. Progress stays in this browser and can be cleared at any time.</p>
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
let clinicalMode = false;
let activeClinicalCaseId = clinicalCases[0]?.id ?? null;
let nerveDeficitMode = false;
let activeNerveDeficitId = nerveDeficits[0]?.id ?? null;
let activeLesionLevelId = nerveDeficits[0]?.lesionLevels?.[0]?.id ?? null;
let activeMotorTestId = nerveDeficits[0]?.motorTests?.[0]?.id ?? null;
let motorSimulationState = 'lesion';
let localizationChallengeMode = false;
let masteryDashboardMode = false;
let remediationFocus = null;
let localizationChallengeDifficulty = 'adaptive';
let localizationChallengeSessionIds = [];
let localizationChallengeSessionPosition = 0;
let localizationChallengeCorrect = 0;
let localizationChallengeAttempts = 0;
let localizationChallengeAnswered = false;
let localizationChallengePerformance = {};
let localizationChallengeMisses = [];
let localizationChallengeSessionResults = [];
let localizationChallengeSessionRecorded = false;
let learnerProgress = loadLearnerProgress();
let selectedChallengeNerveId = null;
let selectedChallengeLevelId = null;
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
  if (except !== 'clinical') {
    clinicalMode = false;
    document.querySelector('#clinical-btn').classList.remove('active');
    document.querySelector('#clinical-card').hidden = true;
  }
  if (except !== 'nerve-deficit') {
    nerveDeficitMode = false;
    document.querySelector('#nerve-deficit-btn').classList.remove('active');
    document.querySelector('#nerve-deficit-card').hidden = true;
  }
  if (except !== 'localization-challenge') {
    localizationChallengeMode = false;
    document.querySelector('#localization-challenge-btn').classList.remove('active');
    document.querySelector('#localization-challenge-card').hidden = true;
  }
  if (except !== 'mastery-dashboard') {
    masteryDashboardMode = false;
    document.querySelector('#mastery-dashboard-btn').classList.remove('active');
    document.querySelector('#mastery-dashboard-card').hidden = true;
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
  if (localizationChallengeMode || masteryDashboardMode) return;
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


const clinicalCaseList = document.querySelector('#clinical-case-list');
clinicalCases.forEach((caseItem) => {
  const button = document.createElement('button');
  button.className = 'branch-button clinical-case-button';
  button.type = 'button';
  button.dataset.caseId = caseItem.id;
  button.innerHTML = `<b>${caseItem.name}</b><span>${caseItem.subtitle}</span>`;
  button.addEventListener('click', () => renderClinicalCase(caseItem.id));
  clinicalCaseList.appendChild(button);
});

function renderClinicalCase(caseId) {
  const caseItem = clinicalCaseById(caseId);
  if (!caseItem) return;
  activeClinicalCaseId = caseItem.id;

  document.querySelectorAll('.clinical-case-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.caseId === caseItem.id);
  });

  document.querySelector('#clinical-case-subtitle').textContent = caseItem.subtitle;
  document.querySelector('#clinical-mechanism').textContent = caseItem.mechanism;
  document.querySelector('#clinical-deficit').textContent = caseItem.deficit;
  document.querySelector('#clinical-exam').textContent = caseItem.exam;
  document.querySelector('#clinical-pearl').textContent = caseItem.pearl;

  const visibleKeys = new Set(clinicalCaseKeys(caseItem));
  const enabledSystems = { skeleton: false, muscles: false, nerves: false, vessels: false, ligaments: false };
  allMeshes().forEach((mesh) => {
    if (visibleKeys.has(mesh.userData.structureKey) && enabledSystems[mesh.userData.system] != null) {
      enabledSystems[mesh.userData.system] = true;
    }
  });
  Object.entries(enabledSystems).forEach(([system, visible]) => setSystemVisibility(system, visible, false));
  allMeshes().forEach((mesh) => { mesh.visible = visibleKeys.has(mesh.userData.structureKey); });

  clearHighlight();
  (caseItem.affectedKeys ?? []).forEach((key) => highlightStructure(key, 0x9b6727, 0.78));
  (caseItem.lesionKeys ?? []).forEach((key) => highlightStructure(key, 0xa8323c, 0.98));

  const primaryKey = caseItem.lesionKeys?.[0];
  const primaryMesh = primaryKey ? allMeshes().find((mesh) => mesh.userData.structureKey === primaryKey && mesh.visible) : null;
  if (primaryMesh) {
    selectedMesh = primaryMesh;
    renderInfo(primaryKey);
  }

  setModeBadge(`Clinical · ${caseItem.name}`);
  fitCameraToMeshes(allMeshes().filter((mesh) => visibleKeys.has(mesh.userData.structureKey)), caseItem.padding ?? 1.28);
}

document.querySelector('#clinical-btn').addEventListener('click', () => {
  const nextState = !clinicalMode;
  deactivateStudyModes('clinical');
  clinicalMode = nextState;
  document.querySelector('#clinical-btn').classList.toggle('active', clinicalMode);
  document.querySelector('#clinical-card').hidden = !clinicalMode;
  if (clinicalMode) renderClinicalCase(activeClinicalCaseId);
  else {
    restoreAll();
    setModeBadge('');
    fitCameraToAnatomy();
  }
});


const nerveDeficitList = document.querySelector('#nerve-deficit-list');
nerveDeficits.forEach((item) => {
  const button = document.createElement('button');
  button.className = 'branch-button nerve-deficit-button';
  button.type = 'button';
  button.dataset.nerveId = item.id;
  button.innerHTML = `<b>${item.name}</b><span>${item.roots}</span>`;
  button.addEventListener('click', () => renderNerveDeficit(item.id));
  nerveDeficitList.appendChild(button);
});


function motorTestById(item, testId) {
  return item?.motorTests?.find((test) => test.id === testId) ?? item?.motorTests?.[0] ?? null;
}

function lesionLevelFocusKeys(item, level) {
  return new Set([
    item?.nerveKey,
    ...(level?.affectedMotorKeys ?? []),
    ...(level?.sparedMotorKeys ?? []),
    ...(level?.contextKeys ?? []),
  ].filter(Boolean));
}

function renderLesionLevelButtons(item) {
  const list = document.querySelector('#lesion-level-list');
  list.innerHTML = '';
  (item.lesionLevels ?? []).forEach((level) => {
    const button = document.createElement('button');
    button.className = 'branch-button lesion-level-button';
    button.type = 'button';
    button.dataset.levelId = level.id;
    button.innerHTML = `<b>${level.label}</b><span>${level.subtitle}</span>`;
    button.addEventListener('click', () => renderLesionLevel(item, level.id, true));
    list.appendChild(button);
  });
}

function renderLesionLevel(item, levelId = activeLesionLevelId, fit = true) {
  const level = lesionLevelById(item, levelId);
  if (!item || !level) return;
  activeLesionLevelId = level.id;

  document.querySelectorAll('.lesion-level-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.levelId === level.id);
  });
  document.querySelector('#lesion-level-pill').textContent = level.label;
  document.querySelector('#lesion-level-motor').textContent = level.motor;
  document.querySelector('#lesion-level-sensory').textContent = level.sensory;
  document.querySelector('#lesion-level-clue').textContent = level.localization;

  renderMotorTest(item, activeMotorTestId, motorSimulationState, false);

  if (fit) {
    const focusKeys = lesionLevelFocusKeys(item, level);
    fitCameraToMeshes(allMeshes().filter((mesh) => focusKeys.has(mesh.userData.structureKey)), item.padding ?? 1.24);
  }
}

function renderMotorTestButtons(item) {
  const list = document.querySelector('#motor-test-list');
  list.innerHTML = '';
  (item.motorTests ?? []).forEach((test) => {
    const button = document.createElement('button');
    button.className = 'branch-button motor-test-button';
    button.type = 'button';
    button.dataset.testId = test.id;
    button.innerHTML = `<b>${test.label}</b><span>Focus exam maneuver</span>`;
    button.addEventListener('click', () => renderMotorTest(item, test.id, motorSimulationState, true));
    list.appendChild(button);
  });
}

function renderMotorTest(item, testId = activeMotorTestId, state = motorSimulationState, fit = true) {
  const test = motorTestById(item, testId);
  const level = lesionLevelById(item, activeLesionLevelId);
  if (!item || !test || !level) return;

  activeMotorTestId = test.id;
  motorSimulationState = state === 'normal' ? 'normal' : 'lesion';

  document.querySelectorAll('.motor-test-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.testId === test.id);
  });
  document.querySelector('#motor-normal-btn').classList.toggle('active', motorSimulationState === 'normal');
  document.querySelector('#motor-lesion-btn').classList.toggle('active', motorSimulationState === 'lesion');
  document.querySelector('#motor-test-state-pill').textContent = motorSimulationState === 'normal' ? 'Normal activation' : 'Lesion pattern';
  document.querySelector('#motor-test-label').textContent = test.label;
  document.querySelector('#motor-test-instruction').textContent = test.instruction;
  document.querySelector('#motor-test-readout').classList.toggle('normal', motorSimulationState === 'normal');
  document.querySelector('#motor-test-readout').classList.toggle('lesion', motorSimulationState === 'lesion');

  const affected = new Set(level.affectedMotorKeys ?? []);
  const spared = new Set(level.sparedMotorKeys ?? []);
  const targetKeys = test.targetKeys ?? [];
  const affectedTargets = targetKeys.filter((key) => affected.has(key));
  const sparedTargets = targetKeys.filter((key) => spared.has(key));
  const variableTargets = targetKeys.filter((key) => !affected.has(key) && !spared.has(key));

  let response = test.normal;
  if (motorSimulationState === 'lesion') {
    if (affectedTargets.length === targetKeys.length && targetKeys.length > 0) {
      response = test.deficit;
    } else if (affectedTargets.length > 0) {
      response = `Partially affected at ${level.label}: ${test.deficit} Some tested targets are spared or variably involved.`;
    } else if (sparedTargets.length === targetKeys.length && targetKeys.length > 0) {
      response = `Expected to be preserved at ${level.label}. ${test.normal}`;
    } else {
      response = `May be variably affected at ${level.label}; exact branch anatomy and lesion position matter.`;
    }
  }
  document.querySelector('#motor-test-response').textContent = response;

  clearHighlight();
  (item.motorKeys ?? []).forEach((key) => highlightStructure(key, 0x725333, 0.22));

  if (motorSimulationState === 'normal') {
    highlightStructure(item.nerveKey, 0x58759a, 0.55);
    targetKeys.forEach((key) => highlightStructure(key, 0x2d7c52, 0.98));
  } else {
    highlightStructure(item.nerveKey, 0x9e3346, 1.0);
    affectedTargets.forEach((key) => highlightStructure(key, 0xa66d2e, 0.92));
    sparedTargets.forEach((key) => highlightStructure(key, 0x2d7c52, 0.88));
    variableTargets.forEach((key) => highlightStructure(key, 0x6b587e, 0.72));
  }

  setModeBadge(`Motor Test · ${item.name} · ${level.label} · ${test.label} · ${motorSimulationState === 'normal' ? 'Normal' : 'Lesion'}`);

  if (fit) {
    const focusKeys = new Set([item.nerveKey, ...targetKeys, ...(level.contextKeys ?? [])]);
    fitCameraToMeshes(allMeshes().filter((mesh) => focusKeys.has(mesh.userData.structureKey)), 1.35);
  }
}

function renderNerveDeficit(id) {
  const item = nerveDeficitById(id);
  if (!item) return;
  activeNerveDeficitId = item.id;

  document.querySelectorAll('.nerve-deficit-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.nerveId === item.id);
  });

  document.querySelector('#nerve-deficit-subtitle').textContent = item.subtitle;
  document.querySelector('#nerve-deficit-roots').textContent = item.roots;
  document.querySelector('#nerve-deficit-motor').textContent = item.motorSummary;
  document.querySelector('#nerve-deficit-sensory').textContent = item.sensorySummary;
  document.querySelector('#nerve-deficit-sites').textContent = item.lesionSites;
  document.querySelector('#nerve-deficit-exam').textContent = item.exam;
  document.querySelector('#nerve-deficit-pearl').textContent = item.pearl;
  document.querySelector('#sensory-region-chips').innerHTML = (item.sensoryRegions ?? [])
    .map((region) => `<span>${region}</span>`)
    .join('');

  const visibleKeys = new Set(nerveDeficitKeys(item));
  const enabledSystems = { skeleton: false, muscles: false, nerves: false, vessels: false, ligaments: false };
  allMeshes().forEach((mesh) => {
    if (visibleKeys.has(mesh.userData.structureKey) && enabledSystems[mesh.userData.system] != null) {
      enabledSystems[mesh.userData.system] = true;
    }
  });
  Object.entries(enabledSystems).forEach(([system, visible]) => setSystemVisibility(system, visible, false));
  allMeshes().forEach((mesh) => { mesh.visible = visibleKeys.has(mesh.userData.structureKey); });

  if (!(item.lesionLevels ?? []).some((level) => level.id === activeLesionLevelId)) {
    activeLesionLevelId = item.lesionLevels?.[0]?.id ?? null;
  }
  if (!(item.motorTests ?? []).some((test) => test.id === activeMotorTestId)) {
    activeMotorTestId = item.motorTests?.[0]?.id ?? null;
  }
  renderLesionLevelButtons(item);
  renderMotorTestButtons(item);
  renderLesionLevel(item, activeLesionLevelId, false);

  const nerveMesh = allMeshes().find((mesh) => mesh.userData.structureKey === item.nerveKey && mesh.visible);
  if (nerveMesh) {
    selectedMesh = nerveMesh;
    renderInfo(item.nerveKey);
  }

  const level = lesionLevelById(item, activeLesionLevelId);
  const focusKeys = lesionLevelFocusKeys(item, level);
  fitCameraToMeshes(allMeshes().filter((mesh) => focusKeys.has(mesh.userData.structureKey)), item.padding ?? 1.22);
}

document.querySelector('#nerve-deficit-btn').addEventListener('click', () => {
  const nextState = !nerveDeficitMode;
  deactivateStudyModes('nerve-deficit');
  nerveDeficitMode = nextState;
  document.querySelector('#nerve-deficit-btn').classList.toggle('active', nerveDeficitMode);
  document.querySelector('#nerve-deficit-card').hidden = !nerveDeficitMode;
  if (nerveDeficitMode) renderNerveDeficit(activeNerveDeficitId);
  else {
    restoreAll();
    setModeBadge('');
    fitCameraToAnatomy();
  }
});


document.querySelector('#motor-normal-btn').addEventListener('click', () => {
  const item = nerveDeficitById(activeNerveDeficitId);
  if (item) renderMotorTest(item, activeMotorTestId, 'normal', true);
});

document.querySelector('#motor-lesion-btn').addEventListener('click', () => {
  const item = nerveDeficitById(activeNerveDeficitId);
  if (item) renderMotorTest(item, activeMotorTestId, 'lesion', true);
});


function shuffleChallenges(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function currentLocalizationChallenge() {
  const id = localizationChallengeSessionIds[localizationChallengeSessionPosition];
  return localizationChallengeById(id);
}

function challengeProgressSummary() {
  return summarizeLearnerProgress(learnerProgress, nerveDeficits, localizationChallenges);
}

function reviewChallengePool() {
  const dueIds = challengeProgressSummary().reviewQueue.map((item) => item.id);
  const dueSet = new Set(dueIds);
  const due = localizationChallenges.filter((challenge) => dueSet.has(challenge.id));
  return due.length ? due : localizationChallenges;
}

function renderPersistentChallengeProgress() {
  const summary = challengeProgressSummary();
  document.querySelector('#challenge-lifetime-sessions').textContent = String(summary.sessions);
  document.querySelector('#challenge-lifetime-accuracy').textContent = summary.accuracy == null
    ? '—'
    : `${Math.round(summary.accuracy * 100)}%`;
  document.querySelector('#challenge-review-count').textContent = String(summary.reviewQueue.length);

  const attemptedNerves = summary.nerves
    .filter((item) => item.attempts > 0)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0) || b.attempts - a.attempts);
  const weakest = attemptedNerves[0];
  document.querySelector('#challenge-persistent-focus').textContent = weakest
    ? `Current focus: ${weakest.name} · ${weakest.mastery} · ${Math.round((weakest.accuracy ?? 0) * 100)}% across ${weakest.attempts} attempt${weakest.attempts === 1 ? '' : 's'}.`
    : 'Complete a session to build a mastery profile.';
}

function formatMasterySessionDate(value) {
  if (!value) return 'Session';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Session';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function renderMasteryDashboard() {
  const summary = challengeProgressSummary();
  const dashboard = buildMasteryDashboard(learnerProgress, summary);

  document.querySelector('#mastery-total-sessions').textContent = String(dashboard.totalSessions);
  document.querySelector('#mastery-overall-accuracy').textContent = dashboard.overallAccuracy == null
    ? '—'
    : `${Math.round(dashboard.overallAccuracy * 100)}%`;
  document.querySelector('#mastery-due-review').textContent = String(dashboard.dueReviewCount);

  const momentum = dashboard.momentum;
  let momentumText = 'Complete at least two sessions to establish a trend.';
  if (momentum.direction === 'steady') momentumText = 'Performance is steady across recent sessions.';
  if (momentum.direction === 'up') momentumText = `Recent accuracy is up ${Math.round(Math.abs(momentum.delta) * 100)} percentage points.`;
  if (momentum.direction === 'down') momentumText = `Recent accuracy is down ${Math.round(Math.abs(momentum.delta) * 100)} percentage points — prioritize review.`;
  document.querySelector('#mastery-momentum-text').textContent = momentumText;

  const trend = document.querySelector('#mastery-session-trend');
  trend.innerHTML = dashboard.recentSessions.length
    ? dashboard.recentSessions.map((session) => {
        const percent = session.accuracy == null ? 0 : Math.round(session.accuracy * 100);
        const height = Math.max(8, percent);
        const mode = challengeDifficultyLabel(session.mode);
        return `<div class="mastery-trend-item" title="${mode} · ${percent}%"><div class="mastery-trend-bar-wrap"><span class="mastery-trend-bar" style="height:${height}%"></span></div><b>${percent}%</b><span>${formatMasterySessionDate(session.completedAt)}</span></div>`;
      }).join('')
    : '<p class="mastery-empty">Complete a localization session to start the trend.</p>';

  document.querySelector('#mastery-count-strong').textContent = String(dashboard.masteryCounts.Strong);
  document.querySelector('#mastery-count-practicing').textContent = String(dashboard.masteryCounts.Practicing);
  document.querySelector('#mastery-count-developing').textContent = String(dashboard.masteryCounts.Developing);
  document.querySelector('#mastery-count-unseen').textContent = String(dashboard.masteryCounts.Unseen);

  document.querySelector('#mastery-lesion-grid').innerHTML = dashboard.lesions.map((lesion) => {
    const percent = lesion.accuracy == null ? 0 : Math.round(lesion.accuracy * 100);
    const accuracyLabel = lesion.attempts ? `${percent}% · ${lesion.correct}/${lesion.attempts}` : 'Not practiced';
    const statusClass = lesion.mastery.toLowerCase();
    return `<button type="button" class="mastery-lesion-row ${statusClass}" data-remediate-nerve="${lesion.nerveId}" data-remediate-level="${lesion.levelId}" title="Practice ${lesion.nerveName} · ${lesion.label}"><div class="mastery-lesion-copy"><span>${lesion.nerveName}</span><b>${lesion.label}</b></div><div class="mastery-lesion-score"><em>${lesion.mastery}</em><span>${accuracyLabel}</span><strong class="mastery-practice-cue">Practice</strong></div><div class="mastery-meter"><span style="width:${lesion.attempts ? Math.max(4, percent) : 0}%"></span></div></button>`;
  }).join('');

  document.querySelector('#mastery-weakest-list').innerHTML = dashboard.weakest.length
    ? dashboard.weakest.map((lesion) => {
        const percent = Math.round((lesion.accuracy ?? 0) * 100);
        return `<button type="button" class="mastery-weak-item" data-remediate-nerve="${lesion.nerveId}" data-remediate-level="${lesion.levelId}"><b>${lesion.nerveName} · ${lesion.label}</b><span>${percent}% across ${lesion.attempts} attempt${lesion.attempts === 1 ? '' : 's'} · ${lesion.mastery}</span><em>Practice nerve family →</em></button>`;
      }).join('')
    : '<p class="mastery-empty">No practiced lesion patterns yet.</p>';

  const reviewButton = document.querySelector('#mastery-review-btn');
  reviewButton.disabled = dashboard.dueReviewCount === 0;
  reviewButton.textContent = dashboard.dueReviewCount
    ? `Practice ${dashboard.dueReviewCount} due review${dashboard.dueReviewCount === 1 ? '' : 's'}`
    : 'No review due';

  document.querySelectorAll('[data-remediate-nerve][data-remediate-level]').forEach((button) => {
    button.addEventListener('click', () => {
      launchTargetedRemediation(button.dataset.remediateNerve, button.dataset.remediateLevel);
    });
  });
}


function launchTargetedRemediation(nerveId, levelId) {
  const pool = buildRemediationSession(localizationChallenges, nerveId, levelId);
  if (!pool.length) return;

  remediationFocus = { nerveId, levelId };
  deactivateStudyModes('localization-challenge');
  masteryDashboardMode = false;
  document.querySelector('#mastery-dashboard-btn').classList.remove('active');
  document.querySelector('#mastery-dashboard-card').hidden = true;
  localizationChallengeMode = true;
  document.querySelector('#localization-challenge-btn').classList.add('active');
  document.querySelector('#localization-challenge-card').hidden = false;
  startLocalizationChallengeSession('remediation');
}

function recordCompletedChallengeSession() {
  if (localizationChallengeSessionRecorded || localizationChallengeSessionResults.length === 0) return;
  learnerProgress = recordLocalizationSession(learnerProgress, {
    mode: localizationChallengeDifficulty,
    completedAt: new Date().toISOString(),
    results: localizationChallengeSessionResults,
  });
  learnerProgress = saveLearnerProgress(learnerProgress);
  localizationChallengeSessionRecorded = true;
  renderPersistentChallengeProgress();
}

function resetChallengePerformance() {
  localizationChallengePerformance = Object.fromEntries(
    nerveDeficits.map((item) => [item.id, { attempts: 0, correct: 0 }]),
  );
  localizationChallengeMisses = [];
}

function challengeDifficultyLabel(value) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';
}

function challengeModeNote(difficulty) {
  if (difficulty === 'adaptive') {
    return 'Adaptive mode uses all cases and brings another case from a missed nerve forward when possible.';
  }
  if (difficulty === 'review') {
    const due = challengeProgressSummary().reviewQueue.length;
    return due
      ? `Spaced review · ${due} challenge${due === 1 ? '' : 's'} due on this browser.`
      : 'No spaced-review items are due yet, so Review due will use the full challenge bank.';
  }
  if (difficulty === 'remediation' && remediationFocus) {
    const focus = remediationFocusLabel(nerveDeficits, remediationFocus.nerveId, remediationFocus.levelId);
    const count = buildRemediationSession(localizationChallenges, remediationFocus.nerveId, remediationFocus.levelId).length;
    return `Targeted remediation · ${focus.nerveName} · ${focus.levelLabel} first, then ${Math.max(0, count - 1)} same-nerve comparator${count - 1 === 1 ? '' : 's'}.`;
  }
  const count = localizationChallengesForDifficulty(difficulty).length;
  return `${challengeDifficultyLabel(difficulty)} session · ${count} shuffled case${count === 1 ? '' : 's'}.`;
}

function syncChallengeDifficultyButtons() {
  document.querySelectorAll('.challenge-difficulty-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.challengeDifficulty === localizationChallengeDifficulty);
  });
  document.querySelector('#challenge-mode-note').textContent = challengeModeNote(localizationChallengeDifficulty);
}

function startLocalizationChallengeSession(difficulty = localizationChallengeDifficulty) {
  localizationChallengeDifficulty = difficulty;
  let pool;
  if (difficulty === 'review') pool = reviewChallengePool();
  else if (difficulty === 'remediation' && remediationFocus) {
    pool = buildRemediationSession(localizationChallenges, remediationFocus.nerveId, remediationFocus.levelId);
  } else pool = localizationChallengesForDifficulty(difficulty);
  localizationChallengeSessionIds = difficulty === 'remediation'
    ? pool.map((challenge) => challenge.id)
    : shuffleChallenges(pool).map((challenge) => challenge.id);
  localizationChallengeSessionPosition = 0;
  localizationChallengeCorrect = 0;
  localizationChallengeAttempts = 0;
  localizationChallengeAnswered = false;
  localizationChallengeSessionResults = [];
  localizationChallengeSessionRecorded = false;
  selectedChallengeNerveId = null;
  selectedChallengeLevelId = null;
  resetChallengePerformance();
  syncChallengeDifficultyButtons();
  renderPersistentChallengeProgress();
  document.querySelector('#challenge-session-summary').hidden = true;
  renderLocalizationChallenge();
}

function localizationChallengeVisibleKeys(challenge) {
  const item = nerveDeficitById(challenge?.nerveId);
  const level = lesionLevelById(item, challenge?.levelId);
  if (!item || !level) return new Set();
  return new Set([
    item.nerveKey,
    ...(level.affectedMotorKeys ?? []),
    ...(level.sparedMotorKeys ?? []),
    ...(level.contextKeys ?? []),
  ]);
}

function syncChallengeSubmit() {
  const submit = document.querySelector('#challenge-submit');
  submit.disabled = localizationChallengeAnswered || !selectedChallengeNerveId || !selectedChallengeLevelId;
}

function renderChallengeLevelOptions() {
  const container = document.querySelector('#challenge-level-options');
  container.innerHTML = '';
  if (!selectedChallengeNerveId) {
    container.innerHTML = '<p class="challenge-empty">Choose a nerve first.</p>';
    syncChallengeSubmit();
    return;
  }

  const item = nerveDeficitById(selectedChallengeNerveId);
  (item?.lesionLevels ?? []).forEach((level) => {
    const button = document.createElement('button');
    button.className = 'branch-button challenge-level-button';
    button.type = 'button';
    button.dataset.levelId = level.id;
    button.innerHTML = `<b>${level.label}</b><span>${level.subtitle}</span>`;
    button.addEventListener('click', () => {
      if (localizationChallengeAnswered) return;
      selectedChallengeLevelId = level.id;
      document.querySelectorAll('.challenge-level-button').forEach((node) => {
        node.classList.toggle('active', node.dataset.levelId === level.id);
      });
      syncChallengeSubmit();
    });
    container.appendChild(button);
  });
  syncChallengeSubmit();
}

function renderChallengeNerveOptions() {
  const container = document.querySelector('#challenge-nerve-options');
  container.innerHTML = '';
  nerveDeficits.forEach((item) => {
    const button = document.createElement('button');
    button.className = 'branch-button challenge-nerve-button';
    button.type = 'button';
    button.dataset.nerveId = item.id;
    button.innerHTML = `<b>${item.name}</b><span>${item.roots}</span>`;
    button.addEventListener('click', () => {
      if (localizationChallengeAnswered) return;
      selectedChallengeNerveId = item.id;
      selectedChallengeLevelId = null;
      document.querySelectorAll('.challenge-nerve-button').forEach((node) => {
        node.classList.toggle('active', node.dataset.nerveId === item.id);
      });
      renderChallengeLevelOptions();
    });
    container.appendChild(button);
  });
}

function setChallengeCaseVisibility(visible) {
  const ids = [
    'challenge-progress', 'challenge-title', 'challenge-stem', 'challenge-findings',
    'challenge-submit', 'challenge-feedback', 'challenge-next',
  ];
  ids.forEach((id) => {
    const node = document.querySelector(`#${id}`);
    if (node) node.hidden = !visible;
  });
  document.querySelector('#challenge-nerve-options')?.closest('.challenge-answer-block')?.toggleAttribute('hidden', !visible);
  document.querySelector('#challenge-level-options')?.closest('.challenge-answer-block')?.toggleAttribute('hidden', !visible);
}

function setChallengeNeutralViewer() {
  restoreAll();
  Object.keys(anatomicalGroups).forEach((system) => setSystemVisibility(system, system === 'skeleton', false));
  allMeshes().forEach((mesh) => {
    mesh.visible = mesh.userData.system === 'skeleton' && (mesh.userData.isRealAnatomy || !replacedStructures.has(mesh.userData.structureKey));
  });
  clearHighlight();
  fitCameraToMeshes(allMeshes().filter((mesh) => mesh.visible), 1.2);
}

function renderLocalizationChallenge() {
  const challenge = currentLocalizationChallenge();
  if (!challenge) {
    renderLocalizationChallengeSummary();
    return;
  }

  setChallengeCaseVisibility(true);
  document.querySelector('#challenge-session-summary').hidden = true;
  localizationChallengeAnswered = false;
  selectedChallengeNerveId = null;
  selectedChallengeLevelId = null;
  const total = localizationChallengeSessionIds.length;
  document.querySelector('#challenge-progress').textContent = `Case ${localizationChallengeSessionPosition + 1} of ${total} · ${challengeDifficultyLabel(challenge.difficulty)}`;
  document.querySelector('#challenge-score').textContent = `${localizationChallengeCorrect} / ${localizationChallengeAttempts}`;
  document.querySelector('#challenge-title').textContent = challenge.title;
  document.querySelector('#challenge-stem').textContent = challenge.stem;
  document.querySelector('#challenge-findings').innerHTML = challenge.findings.map((finding) => `<span>${finding}</span>`).join('');
  document.querySelector('#challenge-feedback').hidden = true;
  document.querySelector('#challenge-feedback').className = 'challenge-feedback';
  document.querySelector('#challenge-next').hidden = true;
  document.querySelector('#challenge-next').textContent = localizationChallengeSessionPosition === total - 1 ? 'View session summary' : 'Next case';
  document.querySelector('#challenge-submit').hidden = false;
  document.querySelector('#challenge-submit').disabled = true;

  renderChallengeNerveOptions();
  renderChallengeLevelOptions();
  setChallengeNeutralViewer();
  setModeBadge(`Localization Challenge · ${challengeDifficultyLabel(localizationChallengeDifficulty)} · ${localizationChallengeSessionPosition + 1}/${total}`);
}

function revealLocalizationChallenge(challenge) {
  const item = nerveDeficitById(challenge?.nerveId);
  const level = lesionLevelById(item, challenge?.levelId);
  if (!item || !level) return;

  const visibleKeys = localizationChallengeVisibleKeys(challenge);
  const enabledSystems = { skeleton: false, muscles: false, nerves: false, vessels: false, ligaments: false };
  allMeshes().forEach((mesh) => {
    if (visibleKeys.has(mesh.userData.structureKey) && enabledSystems[mesh.userData.system] != null) {
      enabledSystems[mesh.userData.system] = true;
    }
  });
  Object.entries(enabledSystems).forEach(([system, visible]) => setSystemVisibility(system, visible, false));
  allMeshes().forEach((mesh) => { mesh.visible = visibleKeys.has(mesh.userData.structureKey); });

  clearHighlight();
  highlightStructure(item.nerveKey, 0x9e3346, 1.0);
  (level.affectedMotorKeys ?? []).forEach((key) => highlightStructure(key, 0xa66d2e, 0.92));
  (level.sparedMotorKeys ?? []).forEach((key) => highlightStructure(key, 0x2d7c52, 0.82));

  const nerveMesh = allMeshes().find((mesh) => mesh.userData.structureKey === item.nerveKey && mesh.visible);
  if (nerveMesh) {
    selectedMesh = nerveMesh;
    renderInfo(item.nerveKey);
  }

  setModeBadge(`Challenge Reveal · ${item.name} · ${level.label}`);
  fitCameraToMeshes(allMeshes().filter((mesh) => visibleKeys.has(mesh.userData.structureKey)), item.padding ?? 1.24);
}

function promoteAdaptiveFollowUp(nerveId) {
  if (localizationChallengeDifficulty !== 'adaptive') return;
  const targetPosition = localizationChallengeSessionPosition + 1;
  const followUpPosition = localizationChallengeSessionIds.findIndex((id, index) => {
    if (index <= localizationChallengeSessionPosition) return false;
    return localizationChallengeById(id)?.nerveId === nerveId;
  });
  if (followUpPosition > targetPosition) {
    [localizationChallengeSessionIds[targetPosition], localizationChallengeSessionIds[followUpPosition]] = [
      localizationChallengeSessionIds[followUpPosition],
      localizationChallengeSessionIds[targetPosition],
    ];
  }
}

function recordChallengePerformance(challenge, correct) {
  const stats = localizationChallengePerformance[challenge.nerveId] ?? { attempts: 0, correct: 0 };
  stats.attempts += 1;
  if (correct) stats.correct += 1;
  localizationChallengePerformance[challenge.nerveId] = stats;

  if (!correct) {
    localizationChallengeMisses.push({
      challengeId: challenge.id,
      nerveId: challenge.nerveId,
      levelId: challenge.levelId,
      title: challenge.title,
    });
    promoteAdaptiveFollowUp(challenge.nerveId);
  }
}

function submitLocalizationChallenge() {
  if (localizationChallengeAnswered || !selectedChallengeNerveId || !selectedChallengeLevelId) return;
  const challenge = currentLocalizationChallenge();
  if (!challenge) return;

  localizationChallengeAnswered = true;
  localizationChallengeAttempts += 1;
  const correct = selectedChallengeNerveId === challenge.nerveId && selectedChallengeLevelId === challenge.levelId;
  if (correct) localizationChallengeCorrect += 1;
  recordChallengePerformance(challenge, correct);
  localizationChallengeSessionResults.push({
    challengeId: challenge.id,
    nerveId: challenge.nerveId,
    levelId: challenge.levelId,
    correct,
  });

  const answerNerve = nerveDeficitById(challenge.nerveId);
  const answerLevel = lesionLevelById(answerNerve, challenge.levelId);
  const feedback = document.querySelector('#challenge-feedback');
  feedback.hidden = false;
  feedback.className = `challenge-feedback ${correct ? 'correct' : 'incorrect'}`;
  document.querySelector('#challenge-feedback-title').textContent = correct ? 'Correct localization.' : 'Not quite.';
  document.querySelector('#challenge-feedback-answer').textContent = `Answer: ${answerNerve?.name ?? challenge.nerveId} · ${answerLevel?.label ?? challenge.levelId}`;
  document.querySelector('#challenge-feedback-explanation').textContent = challenge.explanation;
  document.querySelector('#challenge-score').textContent = `${localizationChallengeCorrect} / ${localizationChallengeAttempts}`;
  document.querySelector('#challenge-next').hidden = false;
  syncChallengeSubmit();
  revealLocalizationChallenge(challenge);
}

function renderLocalizationChallengeSummary() {
  setChallengeCaseVisibility(false);
  recordCompletedChallengeSession();
  const summary = document.querySelector('#challenge-session-summary');
  summary.hidden = false;

  const accuracy = localizationChallengeAttempts
    ? Math.round((localizationChallengeCorrect / localizationChallengeAttempts) * 100)
    : 0;
  document.querySelector('#challenge-score').textContent = `${localizationChallengeCorrect} / ${localizationChallengeAttempts}`;
  document.querySelector('#challenge-summary-score').textContent = `${accuracy}% accuracy · ${localizationChallengeCorrect}/${localizationChallengeAttempts} correct`;

  const attemptedStats = Object.entries(localizationChallengePerformance)
    .filter(([, stats]) => stats.attempts > 0)
    .map(([nerveId, stats]) => ({ nerveId, ...stats, accuracy: stats.correct / stats.attempts }));
  const weakest = attemptedStats.length
    ? [...attemptedStats].sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)[0]
    : null;
  const weakestNerve = weakest ? nerveDeficitById(weakest.nerveId) : null;
  const remediationSummary = localizationChallengeDifficulty === 'remediation' && remediationFocus;
  const remediationLabel = remediationSummary
    ? remediationFocusLabel(nerveDeficits, remediationFocus.nerveId, remediationFocus.levelId)
    : null;
  document.querySelector('#challenge-summary-focus').textContent = localizationChallengeMisses.length
    ? remediationSummary
      ? `Remediation focus remains ${remediationLabel.nerveName} · ${remediationLabel.levelLabel}. Repeat the family if the distinguishing clues are not secure yet.`
      : `Review focus: ${weakestNerve?.name ?? weakest?.nerveId}. Revisit the missed lesion-level clues below, then run another adaptive session.`
    : remediationSummary
      ? `Targeted family complete without misses. Return to the Mastery Dashboard or repeat the family later for retention.`
      : 'No missed localizations in this session. Try a harder or adaptive session to keep testing discrimination between lesion levels.';

  document.querySelector('#challenge-nerve-summary').innerHTML = attemptedStats.map((stats) => {
    const item = nerveDeficitById(stats.nerveId);
    const percent = Math.round(stats.accuracy * 100);
    return `<div><span>${item?.name ?? stats.nerveId}</span><b>${stats.correct}/${stats.attempts}</b><em>${percent}%</em></div>`;
  }).join('');

  document.querySelector('#challenge-missed-list').innerHTML = localizationChallengeMisses.length
    ? localizationChallengeMisses.map((miss) => {
        const item = nerveDeficitById(miss.nerveId);
        const level = lesionLevelById(item, miss.levelId);
        return `<div><b>${item?.name ?? miss.nerveId} · ${level?.label ?? miss.levelId}</b><span>${miss.title}</span></div>`;
      }).join('')
    : '<p class="challenge-empty">No missed localizations.</p>';

  setChallengeNeutralViewer();
  setModeBadge(`Localization Summary · ${challengeDifficultyLabel(localizationChallengeDifficulty)} · ${accuracy}%`);
}

document.querySelectorAll('.challenge-difficulty-button').forEach((button) => {
  button.addEventListener('click', () => {
    if (!localizationChallengeMode) return;
    remediationFocus = null;
    startLocalizationChallengeSession(button.dataset.challengeDifficulty);
  });
});

document.querySelector('#challenge-submit').addEventListener('click', submitLocalizationChallenge);
document.querySelector('#challenge-next').addEventListener('click', () => {
  if (localizationChallengeSessionPosition >= localizationChallengeSessionIds.length - 1) {
    renderLocalizationChallengeSummary();
    return;
  }
  localizationChallengeSessionPosition += 1;
  renderLocalizationChallenge();
});
document.querySelector('#challenge-restart').addEventListener('click', () => {
  startLocalizationChallengeSession(localizationChallengeDifficulty);
});
function clearAllLearnerProgress() {
  if (!window.confirm('Clear all Anatomica localization progress stored in this browser?')) return;
  learnerProgress = clearLearnerProgress();
  renderPersistentChallengeProgress();
  renderMasteryDashboard();
  syncChallengeDifficultyButtons();
}

document.querySelector('#challenge-clear-progress').addEventListener('click', clearAllLearnerProgress);
document.querySelector('#mastery-clear-progress').addEventListener('click', clearAllLearnerProgress);

document.querySelector('#localization-challenge-btn').addEventListener('click', () => {
  const nextState = !localizationChallengeMode;
  deactivateStudyModes('localization-challenge');
  localizationChallengeMode = nextState;
  document.querySelector('#localization-challenge-btn').classList.toggle('active', localizationChallengeMode);
  document.querySelector('#localization-challenge-card').hidden = !localizationChallengeMode;
  if (localizationChallengeMode) {
    if (localizationChallengeDifficulty === 'remediation') {
      remediationFocus = null;
      localizationChallengeDifficulty = 'adaptive';
    }
    startLocalizationChallengeSession(localizationChallengeDifficulty);
  } else {
    restoreAll();
    setModeBadge('');
    fitCameraToAnatomy();
  }
});

document.querySelector('#mastery-dashboard-btn').addEventListener('click', () => {
  const nextState = !masteryDashboardMode;
  deactivateStudyModes('mastery-dashboard');
  masteryDashboardMode = nextState;
  document.querySelector('#mastery-dashboard-btn').classList.toggle('active', masteryDashboardMode);
  document.querySelector('#mastery-dashboard-card').hidden = !masteryDashboardMode;
  if (masteryDashboardMode) {
    renderMasteryDashboard();
    setChallengeNeutralViewer();
    setModeBadge('Mastery Dashboard · Browser-local learning analytics');
  } else {
    restoreAll();
    setModeBadge('');
    fitCameraToAnatomy();
  }
});

document.querySelector('#mastery-review-btn').addEventListener('click', () => {
  if (challengeProgressSummary().reviewQueue.length === 0) return;
  deactivateStudyModes('localization-challenge');
  masteryDashboardMode = false;
  document.querySelector('#mastery-dashboard-btn').classList.remove('active');
  document.querySelector('#mastery-dashboard-card').hidden = true;
  localizationChallengeMode = true;
  document.querySelector('#localization-challenge-btn').classList.add('active');
  document.querySelector('#localization-challenge-card').hidden = false;
  startLocalizationChallengeSession('review');
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
      } else if (clinicalMode) {
        mesh.visible = new Set(clinicalCaseKeys(clinicalCaseById(activeClinicalCaseId))).has(structureKey);
      } else if (nerveDeficitMode) {
        mesh.visible = new Set(nerveDeficitKeys(nerveDeficitById(activeNerveDeficitId))).has(structureKey);
      } else if (localizationChallengeMode) {
        mesh.visible = localizationChallengeAnswered
          ? localizationChallengeVisibleKeys(currentLocalizationChallenge()).has(structureKey)
          : item.system === 'skeleton';
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
  if (localizationChallengeMode) {
    if (localizationChallengeAnswered) revealLocalizationChallenge(currentLocalizationChallenge());
    else renderLocalizationChallenge();
  }
  else if (nerveDeficitMode) renderNerveDeficit(activeNerveDeficitId);
  else if (clinicalMode) renderClinicalCase(activeClinicalCaseId);
  else if (handMode) renderHandView(handView);
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
