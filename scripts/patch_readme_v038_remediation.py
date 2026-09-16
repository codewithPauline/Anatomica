from pathlib import Path

path = Path('README.md')
text = path.read_text()


def replace_once(old, new, label):
    global text
    if old not in text:
        raise SystemExit(f'{label} anchor not found')
    text = text.replace(old, new, 1)

replace_once(
    '## Current milestone — v0.3.7 Longitudinal Mastery Dashboard',
    '## Current milestone — v0.3.8 Targeted Remediation',
    'milestone heading',
)
replace_once(
    'Anatomica now connects upper-limb, wrist, and hand anatomy to interactive clinical cases, peripheral-nerve localization, lesion-level reasoning, focused motor examination, adaptive clinical-localization sessions, browser-local mastery tracking, and longitudinal learning analytics. Learners can choose a difficulty, work through shuffled vignettes, receive a 3D answer reveal, return for spaced review, and inspect progress across all 10 modeled lesion patterns in a dedicated mastery dashboard.',
    'Anatomica now connects upper-limb, wrist, and hand anatomy to interactive clinical cases, peripheral-nerve localization, lesion-level reasoning, focused motor examination, adaptive clinical-localization sessions, browser-local mastery tracking, longitudinal learning analytics, and targeted remediation. Learners can inspect progress across all 10 modeled lesion patterns, then launch focused same-nerve practice directly from a weak or selected concept on the Mastery Dashboard.',
    'milestone paragraph',
)
replace_once(
    '- **Longitudinal Mastery Dashboard with recent-session accuracy, mastery states across all 10 lesion patterns, weakest-practiced concepts, momentum summaries, and direct due-review access**\n',
    '- **Longitudinal Mastery Dashboard with recent-session accuracy, mastery states across all 10 lesion patterns, weakest-practiced concepts, momentum summaries, and direct due-review access**\n- **Targeted Remediation that launches from any lesion or weak-concept card and practices the selected lesion first, followed by same-nerve comparator lesions**\n',
    'working remediation bullet',
)
replace_once(
    '- Clinical-content, learner-progress, and mastery-dashboard validation in CI so anatomy references, review scheduling, and learning-analytics summaries are checked automatically',
    '- Clinical-content, learner-progress, mastery-dashboard, and targeted-remediation validation in CI so anatomy references, review scheduling, analytics summaries, and focused-practice pools are checked automatically',
    'CI summary',
)
mastery_anchor = 'See [`docs/MASTERY_DASHBOARD.md`](docs/MASTERY_DASHBOARD.md) for the analytics model, display rules, and limitations.\n'
remediation_section = mastery_anchor + '''\n### Targeted remediation\n\nv0.3.8 makes the Mastery Dashboard actionable. Every lesion-pattern row and weak-concept card can launch a focused remediation session directly from the dashboard.\n\nA remediation session starts with the selected lesion pattern, then presents the other modeled lesion levels from the **same peripheral nerve** as comparators. The goal is not to repeat one vignette until it is memorized; it is to practice the distinguishing clues that separate nearby localizations such as radial-groove versus PIN lesions or cubital-tunnel versus Guyon-canal lesions.\n\nRemediation sessions use the same scored challenge, 3D answer reveal, progress recording, and mastery infrastructure as the rest of the localization system. They are intentionally rule-based and limited by the current challenge bank; they do not claim individualized educational diagnosis or validated competency assessment.\n\nSee [`docs/TARGETED_REMEDIATION.md`](docs/TARGETED_REMEDIATION.md) for the session-building rules, dashboard launch behavior, and limitations.\n'''
replace_once(mastery_anchor, remediation_section, 'remediation section')
replace_once(
    'Mastery analytics       → src/learning/masteryDashboard.js\nRendering / modes       → src/main.js + src/engine/',
    'Mastery analytics       → src/learning/masteryDashboard.js\nTargeted remediation    → src/learning/remediation.js\nRendering / modes       → src/main.js + src/engine/',
    'asset architecture remediation',
)
replace_once(
    '│   │   ├── progressStore.js            # Browser-local mastery + spaced review\n│   │   └── masteryDashboard.js         # Longitudinal learning-analytics summaries',
    '│   │   ├── progressStore.js            # Browser-local mastery + spaced review\n│   │   ├── masteryDashboard.js         # Longitudinal learning-analytics summaries\n│   │   └── remediation.js              # Same-nerve targeted-practice session builder',
    'project structure learning',
)
replace_once(
    '│   ├── validate_progress_store.mjs     # Persistence + spaced-review validation\n│   └── validate_mastery_dashboard.mjs  # Dashboard analytics validation',
    '│   ├── validate_progress_store.mjs     # Persistence + spaced-review validation\n│   ├── validate_mastery_dashboard.mjs  # Dashboard analytics validation\n│   └── validate_remediation.mjs        # Targeted-practice pool validation',
    'project structure scripts',
)
replace_once(
    '│   ├── MASTERY_DASHBOARD.md            # Longitudinal learning analytics\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations',
    '│   ├── MASTERY_DASHBOARD.md            # Longitudinal learning analytics\n│   ├── TARGETED_REMEDIATION.md         # Dashboard-to-practice remediation workflow\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations',
    'project structure docs',
)
replace_once(
    '- [x] Longitudinal Mastery Dashboard with recent-session trend, lesion-level mastery states, weakest concepts, and due-review access\n',
    '- [x] Longitudinal Mastery Dashboard with recent-session trend, lesion-level mastery states, weakest concepts, and due-review access\n- [x] Targeted remediation from lesion-level mastery cards into same-nerve comparator practice\n',
    'roadmap remediation',
)
replace_once(
    '- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, and dashboard analytics',
    '- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, dashboard analytics, and remediation-session construction',
    'roadmap validation',
)

path.write_text(text)
print('Updated README for Anatomica v0.3.8 targeted remediation.')
