from pathlib import Path


def replace_exact(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing patch anchor: {label}')
    return text.replace(old, new, 1)


main_path = Path('src/main.js')
text = main_path.read_text()

old_sensory = '''        <div class="sensory-schematic">
          <span class="section-label">Sensory map · schematic</span>
          <div id="sensory-region-chips" class="sensory-region-chips"></div>
          <p>Educational territory summary only; not a patient-specific sensory map.</p>
        </div>
      </section>'''

new_sensory = '''        <div class="sensory-schematic">
          <span class="section-label">Sensory map · schematic</span>
          <div id="sensory-region-chips" class="sensory-region-chips"></div>
          <p>Educational territory summary only; not a patient-specific sensory map.</p>
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
      </section>'''
text = replace_exact(text, old_sensory, new_sensory, 'motor simulator card')

text = replace_exact(
    text,
    "let activeNerveDeficitId = nerveDeficits[0]?.id ?? null;\nlet quizMode = false;",
    "let activeNerveDeficitId = nerveDeficits[0]?.id ?? null;\nlet activeMotorTestId = nerveDeficits[0]?.motorTests?.[0]?.id ?? null;\nlet motorSimulationState = 'lesion';\nlet quizMode = false;",
    'motor simulation state',
)

motor_logic = r'''
function motorTestById(item, testId) {
  return item?.motorTests?.find((test) => test.id === testId) ?? item?.motorTests?.[0] ?? null;
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
  if (!item || !test) return;

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
  document.querySelector('#motor-test-response').textContent = motorSimulationState === 'normal' ? test.normal : test.deficit;
  document.querySelector('#motor-test-readout').classList.toggle('normal', motorSimulationState === 'normal');
  document.querySelector('#motor-test-readout').classList.toggle('lesion', motorSimulationState === 'lesion');

  clearHighlight();
  (item.motorKeys ?? []).forEach((key) => highlightStructure(key, 0x725333, 0.24));

  if (motorSimulationState === 'normal') {
    highlightStructure(item.nerveKey, 0x58759a, 0.55);
    (test.targetKeys ?? []).forEach((key) => highlightStructure(key, 0x2d7c52, 0.98));
  } else {
    highlightStructure(item.nerveKey, 0x9e3346, 1.0);
    (test.targetKeys ?? []).forEach((key) => highlightStructure(key, 0xa66d2e, 0.9));
  }

  setModeBadge(`Motor Test · ${item.name} · ${test.label} · ${motorSimulationState === 'normal' ? 'Normal' : 'Lesion'}`);

  if (fit) {
    const focusKeys = new Set([item.nerveKey, ...(test.targetKeys ?? [])]);
    fitCameraToMeshes(allMeshes().filter((mesh) => focusKeys.has(mesh.userData.structureKey)), 1.35);
  }
}

'''
text = replace_exact(
    text,
    "function renderNerveDeficit(id) {",
    motor_logic + "function renderNerveDeficit(id) {",
    'motor simulator logic',
)

old_highlight = '''  clearHighlight();
  (item.motorKeys ?? []).forEach((key) => highlightStructure(key, 0xa66d2e, 0.78));
  highlightStructure(item.nerveKey, 0x9e3346, 1.0);

  const nerveMesh = allMeshes().find((mesh) => mesh.userData.structureKey === item.nerveKey && mesh.visible);
  if (nerveMesh) {
    selectedMesh = nerveMesh;
    renderInfo(item.nerveKey);
  }

  setModeBadge(`Nerve Deficit · ${item.name}`);
  fitCameraToMeshes(allMeshes().filter((mesh) => visibleKeys.has(mesh.userData.structureKey)), item.padding ?? 1.22);'''
new_highlight = '''  if (!(item.motorTests ?? []).some((test) => test.id === activeMotorTestId)) {
    activeMotorTestId = item.motorTests?.[0]?.id ?? null;
  }
  renderMotorTestButtons(item);
  renderMotorTest(item, activeMotorTestId, motorSimulationState, false);

  const nerveMesh = allMeshes().find((mesh) => mesh.userData.structureKey === item.nerveKey && mesh.visible);
  if (nerveMesh) {
    selectedMesh = nerveMesh;
    renderInfo(item.nerveKey);
  }

  fitCameraToMeshes(allMeshes().filter((mesh) => visibleKeys.has(mesh.userData.structureKey)), item.padding ?? 1.22);'''
text = replace_exact(text, old_highlight, new_highlight, 'nerve highlight block')

state_events = r'''
document.querySelector('#motor-normal-btn').addEventListener('click', () => {
  const item = nerveDeficitById(activeNerveDeficitId);
  if (item) renderMotorTest(item, activeMotorTestId, 'normal', true);
});

document.querySelector('#motor-lesion-btn').addEventListener('click', () => {
  const item = nerveDeficitById(activeNerveDeficitId);
  if (item) renderMotorTest(item, activeMotorTestId, 'lesion', true);
});

'''
text = replace_exact(
    text,
    "const branchContainer = document.querySelector('#plexus-branches');",
    state_events + "const branchContainer = document.querySelector('#plexus-branches');",
    'motor simulation state events',
)

main_path.write_text(text)

style_path = Path('src/style.css')
style = style_path.read_text()
style_anchor = ".sensory-schematic p { margin: 10px 0 0; color: #7f8997; font-size: 11px; line-height: 1.45; }"
style_addition = style_anchor + r'''
.motor-simulator { margin-top: 16px; padding: 14px; border: 1px solid #334154; border-radius: 14px; background: #101720; }
.motor-sim-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.motor-sim-head .section-label { margin-bottom: 5px; }
.motor-sim-head strong { display: block; color: #e8edf5; font-size: 16px; }
.motor-sim-intro { margin: 10px 0 0; color: #9aa7b8; font-size: 12px; line-height: 1.5; }
.motor-state-toggle { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
.motor-state-toggle .tool { min-height: 40px; font-size: 12px; }
#motor-normal-btn.active { background: #18382a; border-color: #4e8a68; color: #dcf2e4; }
#motor-lesion-btn.active { background: #452a2e; border-color: #9d5964; color: #f4dce0; }
.motor-test-readout { margin-top: 12px; padding: 13px; border: 1px solid #303947; border-radius: 12px; background: #0e141c; }
.motor-test-readout > .label { display: block; margin-bottom: 7px; }
.motor-test-readout > strong { display: block; color: #e5ebf3; font-size: 13px; line-height: 1.5; }
.motor-test-readout > div { display: grid; gap: 5px; margin-top: 11px; padding-top: 10px; border-top: 1px solid #28313e; }
.motor-test-readout > div span { color: #7e8999; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.motor-test-readout > div b { color: #cdd6e2; font-size: 12px; line-height: 1.5; }
.motor-test-readout.normal { border-color: #315e45; }
.motor-test-readout.normal > div b { color: #cfe9d9; }
.motor-test-readout.lesion { border-color: #68434a; }
.motor-test-readout.lesion > div b { color: #ebccd1; }
.simulator-note { margin: 10px 0 0; color: #707d8d; font-size: 10.5px; line-height: 1.45; }
'''
style = replace_exact(style, style_anchor, style_addition, 'motor simulator styles')
style_path.write_text(style)

package_path = Path('package.json')
package = package_path.read_text()
package = replace_exact(package, '"version": "0.3.1"', '"version": "0.3.2"', 'package version')
package_path.write_text(package)
