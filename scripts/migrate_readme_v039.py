from pathlib import Path

path = Path('README.md')
text = path.read_text()

replacements = [
    (
        '## Current milestone — v0.3.8 Targeted Remediation\n\nAnatomica now connects upper-limb, wrist, and hand anatomy to interactive clinical cases, peripheral-nerve localization, lesion-level reasoning, focused motor examination, adaptive clinical-localization sessions, browser-local mastery tracking, longitudinal learning analytics, and targeted remediation. Learners can inspect progress across all 10 modeled lesion patterns, then launch focused same-nerve practice directly from a weak or selected concept on the Mastery Dashboard.\n',
        '## Current milestone — v0.3.9 Alternate Clinical Vignettes\n\nAnatomica now connects upper-limb, wrist, and hand anatomy to interactive clinical cases, peripheral-nerve localization, lesion-level reasoning, focused motor examination, adaptive clinical-localization sessions, browser-local mastery tracking, longitudinal learning analytics, targeted remediation, and alternate clinical presentations. The localization system still measures the same 10 modeled lesion concepts, but each concept now has two possible vignette presentations so repeated practice depends less on memorizing one fixed stem.\n',
    ),
    (
        '- **Targeted Remediation that launches from any lesion or weak-concept card and practices the selected lesion first, followed by same-nerve comparator lesions**\n- Expanded Quiz Mode with more than 50 anatomy and clinical-identification questions\n- Clinical-content, learner-progress, mastery-dashboard, and targeted-remediation validation in CI so anatomy references, review scheduling, analytics summaries, and focused-practice pools are checked automatically\n',
        '- **Targeted Remediation that launches from any lesion or weak-concept card and practices the selected lesion first, followed by same-nerve comparator lesions**\n- **Alternate clinical-vignette presentation layer with 20 total stems across the same 10 lesion concepts, selected once per session and kept stable through feedback and 3D reveal**\n- Expanded Quiz Mode with more than 50 anatomy and clinical-identification questions\n- Clinical-content, learner-progress, mastery-dashboard, targeted-remediation, and challenge-variant validation in CI so anatomy references, review scheduling, analytics summaries, focused-practice pools, and vignette invariants are checked automatically\n',
    ),
    (
        'v0.3.4 turns the localization engine into a scored clinical-reasoning exercise. The current bank contains **10 short vignettes**, one for each lesion pattern represented in the localization model.\n',
        'v0.3.4 turns the localization engine into a scored clinical-reasoning exercise. The scoring model contains **10 lesion concepts**, one for each localization pattern represented in the current nerve model. As of v0.3.9, each concept has a base vignette plus an alternate presentation, producing **20 total vignette presentations across the same 10 scored concepts**.\n',
    ),
    (
        'See [`docs/TARGETED_REMEDIATION.md`](docs/TARGETED_REMEDIATION.md) for the session-building rules, dashboard launch behavior, and limitations.\n\n## Motor Test Simulator\n',
        'See [`docs/TARGETED_REMEDIATION.md`](docs/TARGETED_REMEDIATION.md) for the session-building rules, dashboard launch behavior, and limitations.\n\n### Alternate vignette presentations\n\nv0.3.9 separates **what is being assessed** from **how the case is presented**. Each of the 10 lesion concepts now has two possible clinical presentations: the original vignette and one alternate stem with different wording, mechanism, or framing where clinically appropriate.\n\nAt the start of a session, Anatomica selects one presentation for each included lesion concept and keeps that variant stable throughout answering, feedback, 3D reveal, and session accounting. Progress remains tied to the original challenge ID, nerve, and lesion level, so changing the presentation does not fragment mastery history or spaced-review scheduling.\n\nThe variant layer is used by standard difficulty sessions, Adaptive mode, spaced review, and Targeted Remediation. It is designed to reduce simple wording recognition, not to claim a psychometrically validated item bank.\n\nSee [`docs/CHALLENGE_VARIANTS.md`](docs/CHALLENGE_VARIANTS.md) for the presentation model, validation rules, and limitations.\n\n## Motor Test Simulator\n',
    ),
    (
        'Localization challenges → src/data/localizationChallenges.js\nLearning questions      → src/data/quizQuestions.js\n',
        'Localization challenges → src/data/localizationChallenges.js\nChallenge variants      → src/data/challengeVariants.js\nLearning questions      → src/data/quizQuestions.js\n',
    ),
    (
        '│   │   ├── localizationChallenges.js   # Scored localization vignette bank\n│   │   ├── brachialPlexus.js           # Plexus pathway data\n',
        '│   │   ├── localizationChallenges.js   # Scored localization concept bank\n│   │   ├── challengeVariants.js        # Alternate vignette presentation layer\n│   │   ├── brachialPlexus.js           # Plexus pathway data\n',
    ),
    (
        '│   ├── validate_mastery_dashboard.mjs  # Dashboard analytics validation\n│   └── validate_remediation.mjs        # Targeted-practice pool validation\n',
        '│   ├── validate_mastery_dashboard.mjs  # Dashboard analytics validation\n│   ├── validate_remediation.mjs        # Targeted-practice pool validation\n│   └── validate_challenge_variants.mjs # Vignette-variant invariant validation\n',
    ),
    (
        '│   ├── MASTERY_DASHBOARD.md            # Longitudinal learning analytics\n│   ├── TARGETED_REMEDIATION.md         # Dashboard-to-practice remediation workflow\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations\n',
        '│   ├── MASTERY_DASHBOARD.md            # Longitudinal learning analytics\n│   ├── TARGETED_REMEDIATION.md         # Dashboard-to-practice remediation workflow\n│   ├── CHALLENGE_VARIANTS.md           # Alternate vignette presentation model\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations\n',
    ),
    (
        '- [x] Targeted remediation from lesion-level mastery cards into same-nerve comparator practice\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, dashboard analytics, and remediation-session construction\n',
        '- [x] Targeted remediation from lesion-level mastery cards into same-nerve comparator practice\n- [x] Alternate clinical-vignette presentations for all 10 localization concepts\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, dashboard analytics, remediation-session construction, and challenge-variant invariants\n',
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f'Expected README anchor not found:\n{old[:220]}')
    text = text.replace(old, new, 1)

path.write_text(text)
print('Updated README for v0.3.9 Alternate Clinical Vignettes.')
