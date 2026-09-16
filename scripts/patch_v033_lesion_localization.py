from pathlib import Path


def replace_exact(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing patch anchor: {label}')
    return text.replace(old, new, 1)


main_path = Path('src/main.js')
text = main_path.read_text()

text = replace_exact(
    text,
    "import { nerveDeficits, nerveDeficitById, nerveDeficitKeys } from './data/nerveDeficits.js';",
    "import { nerveDeficits, nerveDeficitById, nerveDeficitKeys, lesionLevelById } from './data/nerveDeficits.js';",
    'nerve deficit import',
)

old_sensory = '''        <div class="sensory-schematic">
          <span class="section-label">Sensory map · schematic</span>
          <div id="sensory-region-chips" class="sensory-region-chips"></div>
          <p>Educational territory summary only; not a patient-specific sensory map.</p>
        </div>
        <div class="motor-simulator">'''

new_sensory = '''        <div class="sensory-schematic">
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
        <div class="motor-simulator">'''
text = replace_exact(text, old_sensory, new_sensory, 'lesion localizer card')

text = replace_exact(
    text,
    "let activeNerveDeficitId = nerveDeficits[0]?.id ?? null;\nlet activeMotorTestId = nerveDeficits[0]?.motorTests?.[0]?.id ?? null;",
    "let activeNerveDeficitId = nerveDeficits[0]?.id ?? null;\nlet activeLesionLevelId = nerveDeficits[0]?.lesionLevels?.[0]?.id ?? null;\nlet activeMotorTestId = nerveDeficits[0]?.motorTests?.[0]?.id ?? null;",
    'lesion level state',
)

start = text.index("function motorTestById(item, testId) {")
end = text.index("\nconst branchContainer = document.querySelector('#plexus-branches');", start)
old_block = text[start:end]

new_block = r'''function motorTestById(item, testId) {
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
'''
text = text[:start] + new_block + text[end:]
main_path.write_text(text)

style_path = Path('src/style.css')
style = style_path.read_text()
style_anchor = '''.sensory-schematic p { margin: 10px 0 0; color: #7f8997; font-size: 11px; line-height: 1.45; }

.motor-simulator {'''
style_replacement = '''.sensory-schematic p { margin: 10px 0 0; color: #7f8997; font-size: 11px; line-height: 1.45; }

.lesion-localizer {
  margin-top: 16px;
  padding: 14px;
  border: 1px solid #3e4858;
  border-radius: 12px;
  background: linear-gradient(180deg, #141a23, #10151c);
}
.lesion-localizer .branch-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.lesion-level-details { margin-top: 14px; }
.lesion-level-details .clinical-pearl { border-top-color: #4a5740; }
.lesion-level-details .clinical-pearl b { color: #d7e2c8; }
.lesion-level-button.active {
  border-color: #7b9369;
  background: linear-gradient(180deg, #263326, #1b281d);
}

.motor-simulator {'''
style = replace_exact(style, style_anchor, style_replacement, 'lesion localizer styles')
style_path.write_text(style)

package_path = Path('package.json')
package_text = package_path.read_text()
package_text = replace_exact(package_text, '"version": "0.3.2"', '"version": "0.3.3"', 'package version')
package_path.write_text(package_text)
