from pathlib import Path


def replace_exact(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing patch anchor: {label}')
    return text.replace(old, new, 1)


main_path = Path('src/main.js')
text = main_path.read_text()

text = replace_exact(
    text,
    "import { clinicalCases, clinicalCaseById, clinicalCaseKeys } from './data/clinicalCases.js';\nimport { hydrateRealModels } from './engine/realModelSwap.js';",
    "import { clinicalCases, clinicalCaseById, clinicalCaseKeys } from './data/clinicalCases.js';\nimport { nerveDeficits, nerveDeficitById, nerveDeficitKeys } from './data/nerveDeficits.js';\nimport { hydrateRealModels } from './engine/realModelSwap.js';",
    'nerve deficit import',
)

text = replace_exact(
    text,
    '        <button id="clinical-btn" class="tool clinical-accent">Clinical cases</button>\n        <button id="plexus-btn" class="tool">Brachial plexus</button>',
    '        <button id="clinical-btn" class="tool clinical-accent">Clinical cases</button>\n        <button id="nerve-deficit-btn" class="tool nerve-accent">Nerve deficits</button>\n        <button id="plexus-btn" class="tool">Brachial plexus</button>',
    'nerve deficit button',
)

nerve_card = '''      <section id="nerve-deficit-card" class="learning-card" hidden>
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
      </section>

'''
text = replace_exact(
    text,
    '      <section id="plexus-card" class="learning-card" hidden>',
    nerve_card + '      <section id="plexus-card" class="learning-card" hidden>',
    'nerve deficit card',
)

text = replace_exact(
    text,
    "let clinicalMode = false;\nlet activeClinicalCaseId = clinicalCases[0]?.id ?? null;\nlet quizMode = false;",
    "let clinicalMode = false;\nlet activeClinicalCaseId = clinicalCases[0]?.id ?? null;\nlet nerveDeficitMode = false;\nlet activeNerveDeficitId = nerveDeficits[0]?.id ?? null;\nlet quizMode = false;",
    'nerve deficit state',
)

text = replace_exact(
    text,
    "  if (except !== 'plexus') {\n    plexusMode = false;",
    "  if (except !== 'nerve-deficit') {\n    nerveDeficitMode = false;\n    document.querySelector('#nerve-deficit-btn').classList.remove('active');\n    document.querySelector('#nerve-deficit-card').hidden = true;\n  }\n  if (except !== 'plexus') {\n    plexusMode = false;",
    'nerve deficit deactivation',
)

nerve_logic = r'''
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

  clearHighlight();
  (item.motorKeys ?? []).forEach((key) => highlightStructure(key, 0xa66d2e, 0.78));
  highlightStructure(item.nerveKey, 0x9e3346, 1.0);

  const nerveMesh = allMeshes().find((mesh) => mesh.userData.structureKey === item.nerveKey && mesh.visible);
  if (nerveMesh) {
    selectedMesh = nerveMesh;
    renderInfo(item.nerveKey);
  }

  setModeBadge(`Nerve Deficit · ${item.name}`);
  fitCameraToMeshes(allMeshes().filter((mesh) => visibleKeys.has(mesh.userData.structureKey)), item.padding ?? 1.22);
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

'''
text = replace_exact(
    text,
    "const branchContainer = document.querySelector('#plexus-branches');",
    nerve_logic + "const branchContainer = document.querySelector('#plexus-branches');",
    'nerve deficit logic',
)

text = replace_exact(
    text,
    "      } else if (clinicalMode) {\n        mesh.visible = new Set(clinicalCaseKeys(clinicalCaseById(activeClinicalCaseId))).has(structureKey);\n      } else {",
    "      } else if (clinicalMode) {\n        mesh.visible = new Set(clinicalCaseKeys(clinicalCaseById(activeClinicalCaseId))).has(structureKey);\n      } else if (nerveDeficitMode) {\n        mesh.visible = new Set(nerveDeficitKeys(nerveDeficitById(activeNerveDeficitId))).has(structureKey);\n      } else {",
    'nerve deficit hydration visibility',
)

text = replace_exact(
    text,
    "}).then(() => {\n  if (clinicalMode) renderClinicalCase(activeClinicalCaseId);\n  else if (handMode) renderHandView(handView);",
    "}).then(() => {\n  if (nerveDeficitMode) renderNerveDeficit(activeNerveDeficitId);\n  else if (clinicalMode) renderClinicalCase(activeClinicalCaseId);\n  else if (handMode) renderHandView(handView);",
    'nerve deficit hydration rerender',
)

main_path.write_text(text)

style_path = Path('src/style.css')
style = style_path.read_text()
style = replace_exact(
    style,
    '.tool.clinical-accent.active { background: #452b31; border-color: #a56873; }',
    '.tool.clinical-accent.active { background: #452b31; border-color: #a56873; }\n.tool.nerve-accent { border-color: #6d587d; }\n.tool.nerve-accent.active { background: #352a48; border-color: #8f79ad; }',
    'nerve tool style',
)
style = replace_exact(
    style,
    '.clinical-case-details .clinical-pearl b { color: #e4d7ad; }',
    '.clinical-case-details .clinical-pearl b { color: #e4d7ad; }\n.nerve-deficit-details { margin-top: 18px; }\n.nerve-deficit-details .clinical-pearl { border-top-color: #514269; }\n.nerve-deficit-details .clinical-pearl b { color: #d9c8ee; }\n.sensory-schematic { margin-top: 16px; padding: 14px; border: 1px solid #313849; border-radius: 12px; background: #111720; }\n.sensory-schematic .section-label { margin-bottom: 10px; }\n.sensory-region-chips { display: flex; flex-wrap: wrap; gap: 7px; }\n.sensory-region-chips span { padding: 7px 9px; border: 1px solid #66557c; border-radius: 999px; background: #241d31; color: #dccfee; font-size: 11px; font-weight: 700; }\n.sensory-schematic p { margin: 10px 0 0; color: #7f8997; font-size: 11px; line-height: 1.45; }',
    'nerve detail style',
)
style_path.write_text(style)

package_path = Path('package.json')
package = package_path.read_text()
package = replace_exact(package, '"version": "0.3.0"', '"version": "0.3.1"', 'package version')
package_path.write_text(package)
