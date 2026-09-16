from pathlib import Path


def replace_exact(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing README anchor: {label}')
    return text.replace(old, new, 1)


path = Path('README.md')
text = path.read_text()

text = replace_exact(
    text,
    '## Current milestone — v0.3.4 Clinical Intelligence + Localization Challenges',
    '## Current milestone — v0.3.5 Adaptive Clinical Reasoning',
    'milestone heading',
)

text = replace_exact(
    text,
    'Anatomica now connects upper-limb, wrist, and hand anatomy to interactive clinical cases, peripheral-nerve localization, lesion-level reasoning, focused motor examination, and scored clinical-localization challenges. Learners can move from an injury pattern to a named nerve, compare proximal versus distal lesion sites, test how expected findings change with localization, and then apply that knowledge in vignette-based reasoning exercises.',
    'Anatomica now connects upper-limb, wrist, and hand anatomy to interactive clinical cases, peripheral-nerve localization, lesion-level reasoning, focused motor examination, and adaptive clinical-localization sessions. Learners can choose a difficulty, work through shuffled vignettes, receive a 3D answer reveal, and finish with performance feedback that identifies missed nerve and lesion-level patterns.',
    'milestone summary',
)

text = replace_exact(
    text,
    '- **Clinical Localization Challenge Mode with 10 scored nerve-and-lesion vignettes and post-answer 3D reveal**',
    '- **Adaptive Localization Challenge Mode with Easy / Intermediate / Advanced / Adaptive sessions, shuffled cases, per-nerve performance tracking, and post-answer 3D reveal**',
    'working challenge bullet',
)

anchor = '''The current challenge set tests high-yield discriminators such as preserved versus weak triceps, sensory loss versus a pure motor pattern, spared dorsal ulnar-hand sensation, spared thenar-eminence sensation, and the abnormal OK-sign pattern.

See [`docs/LOCALIZATION_CHALLENGE_MODE.md`](docs/LOCALIZATION_CHALLENGE_MODE.md) for the assessment design, validation rules, and limitations.'''
replacement = '''The current challenge set tests high-yield discriminators such as preserved versus weak triceps, sensory loss versus a pure motor pattern, spared dorsal ulnar-hand sensation, spared thenar-eminence sensation, and the abnormal OK-sign pattern.

### Adaptive sessions

v0.3.5 adds four session modes: **Easy**, **Intermediate**, **Advanced**, and **Adaptive**. Cases are shuffled at the start of each session. Adaptive mode uses the full challenge bank and, after an incorrect response, moves another unanswered case from the same nerve earlier in the queue when one is available.

At the end of a session, Anatomica reports overall accuracy, performance by peripheral nerve, and the exact lesion levels missed. The summary is intentionally descriptive rather than diagnostic or predictive; it is designed to help a learner decide what to review next.

This adaptation is deterministic rule-based tutoring logic, not a machine-learning model.

See [`docs/LOCALIZATION_CHALLENGE_MODE.md`](docs/LOCALIZATION_CHALLENGE_MODE.md) for the assessment design, validation rules, and limitations, and [`docs/ADAPTIVE_CHALLENGE_SESSIONS.md`](docs/ADAPTIVE_CHALLENGE_SESSIONS.md) for the session engine and performance-summary behavior.'''
text = replace_exact(text, anchor, replacement, 'adaptive challenge section')

text = replace_exact(
    text,
    '│   ├── LOCALIZATION_CHALLENGE_MODE.md  # Clinical reasoning assessment design\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations',
    '│   ├── LOCALIZATION_CHALLENGE_MODE.md  # Clinical reasoning assessment design\n│   ├── ADAPTIVE_CHALLENGE_SESSIONS.md  # Difficulty, shuffling + session feedback\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations',
    'docs tree',
)

text = replace_exact(
    text,
    '- [x] Clinical Localization Challenge Mode with scored 3D answer reveal\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, and localization challenges',
    '- [x] Clinical Localization Challenge Mode with scored 3D answer reveal\n- [x] Adaptive challenge sessions with difficulty modes, shuffling, targeted follow-up, and performance summaries\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, and localization challenges',
    'roadmap adaptive item',
)

path.write_text(text)
