from pathlib import Path

path = Path('README.md')
text = path.read_text()

replacements = [
    (
        '## Current milestone — v0.3.9 Alternate Clinical Vignettes\n\nAnatomica now connects upper-limb, wrist, and hand anatomy to interactive clinical cases, peripheral-nerve localization, lesion-level reasoning, focused motor examination, adaptive clinical-localization sessions, browser-local mastery tracking, longitudinal learning analytics, targeted remediation, and alternate clinical presentations. The localization system still measures the same 10 modeled lesion concepts, but each concept now has two possible vignette presentations so repeated practice depends less on memorizing one fixed stem.\n',
        '## Current milestone — v0.4.0 Confidence-Calibrated Clinical Reasoning\n\nAnatomica now connects upper-limb anatomy to lesion-level clinical reasoning, alternate vignette presentations, adaptive practice, spaced review, targeted remediation, longitudinal mastery analytics, and **self-rated confidence calibration**. A localization response now captures not only whether the learner was correct, but whether that answer was made with low, moderate, or high confidence—allowing the platform to surface high-confidence misses and correct-but-uncertain responses without inventing a proprietary competence score.\n',
    ),
    (
        '- **Alternate clinical-vignette presentation layer with 20 total stems across the same 10 lesion concepts, selected once per session and kept stable through feedback and 3D reveal**\n- Expanded Quiz Mode with more than 50 anatomy and clinical-identification questions\n- Clinical-content, learner-progress, mastery-dashboard, targeted-remediation, and challenge-variant validation in CI so anatomy references, review scheduling, analytics summaries, focused-practice pools, and vignette invariants are checked automatically\n',
        '- **Alternate clinical-vignette presentation layer with 20 total stems across the same 10 lesion concepts, selected once per session and kept stable through feedback and 3D reveal**\n- **Confidence-Calibrated Clinical Reasoning with required Unsure / Moderate / High self-rating, confidence-aware feedback, browser-local persistence, and dashboard summaries by confidence band**\n- Expanded Quiz Mode with more than 50 anatomy and clinical-identification questions\n- Clinical-content, learner-progress, mastery-dashboard, targeted-remediation, challenge-variant, and confidence-calibration validation in CI so anatomy references, review scheduling, analytics summaries, focused-practice pools, vignette invariants, and confidence summaries are checked automatically\n',
    ),
    (
        'Each challenge follows the same sequence:\n\n1. Read the clinical stem and key findings.\n2. Choose the involved peripheral nerve.\n3. Choose the lesion level for that nerve.\n4. Submit the localization.\n5. Receive immediate correct/incorrect feedback and the reasoning behind the answer.\n6. Reveal the correct nerve and lesion pattern in the 3D viewer.\n',
        'Each challenge follows the same sequence:\n\n1. Read the clinical stem and key findings.\n2. Choose the involved peripheral nerve.\n3. Choose the lesion level for that nerve.\n4. Rate confidence as **Unsure**, **Moderate**, or **High**.\n5. Submit the localization.\n6. Receive immediate correct/incorrect feedback, confidence-aware study guidance, and the reasoning behind the answer.\n7. Reveal the correct nerve and lesion pattern in the 3D viewer.\n',
    ),
    (
        'See [`docs/CHALLENGE_VARIANTS.md`](docs/CHALLENGE_VARIANTS.md) for the presentation model, validation rules, and limitations.\n\n## Motor Test Simulator\n',
        'See [`docs/CHALLENGE_VARIANTS.md`](docs/CHALLENGE_VARIANTS.md) for the presentation model, validation rules, and limitations.\n\n### Confidence-calibrated reasoning\n\nv0.4.0 adds a required self-rated confidence step to every localization response. Learners choose **Unsure**, **Moderate**, or **High** before submitting. Confidence does not change whether the localization is scored correct; it adds context to the result.\n\nThe immediate feedback distinguishes useful learning states such as **high-confidence misses** and **correct-but-unsure answers**. The Mastery Dashboard adds a Confidence Calibration panel showing the number of rated responses, accuracy among high-confidence responses, high-confidence misses, correct answers made while unsure, and observed accuracy within each confidence band.\n\nConfidence is stored only in the same browser-local progress record already used by Anatomica. Historical sessions without confidence remain valid and are ignored by confidence summaries. The confidence categories are ordinal self-ratings—not numeric probabilities—and Anatomica does not calculate proprietary calibration scores or claim validated measures of clinical competence.\n\nSee [`docs/CONFIDENCE_CALIBRATION.md`](docs/CONFIDENCE_CALIBRATION.md) for persistence behavior, feedback semantics, dashboard analytics, validation, and limitations.\n\n## Motor Test Simulator\n',
    ),
    (
        'Mastery analytics       → src/learning/masteryDashboard.js\nTargeted remediation    → src/learning/remediation.js\nRendering / modes       → src/main.js + src/engine/\n',
        'Mastery analytics       → src/learning/masteryDashboard.js\nTargeted remediation    → src/learning/remediation.js\nConfidence analytics    → src/learning/confidenceCalibration.js\nRendering / modes       → src/main.js + src/engine/\n',
    ),
    (
        '│   │   ├── masteryDashboard.js         # Longitudinal learning-analytics summaries\n│   │   └── remediation.js              # Same-nerve targeted-practice session builder\n',
        '│   │   ├── masteryDashboard.js         # Longitudinal learning-analytics summaries\n│   │   ├── remediation.js              # Same-nerve targeted-practice session builder\n│   │   └── confidenceCalibration.js    # Confidence-band summaries + feedback\n',
    ),
    (
        '│   ├── validate_remediation.mjs        # Targeted-practice pool validation\n│   └── validate_challenge_variants.mjs # Vignette-variant invariant validation\n',
        '│   ├── validate_remediation.mjs        # Targeted-practice pool validation\n│   ├── validate_challenge_variants.mjs # Vignette-variant invariant validation\n│   └── validate_confidence_calibration.mjs # Confidence analytics validation\n',
    ),
    (
        '│   ├── TARGETED_REMEDIATION.md         # Dashboard-to-practice remediation workflow\n│   ├── CHALLENGE_VARIANTS.md           # Alternate vignette presentation model\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations\n',
        '│   ├── TARGETED_REMEDIATION.md         # Dashboard-to-practice remediation workflow\n│   ├── CHALLENGE_VARIANTS.md           # Alternate vignette presentation model\n│   ├── CONFIDENCE_CALIBRATION.md       # Self-rated confidence analytics + limits\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations\n',
    ),
    (
        '- [x] Alternate clinical-vignette presentations for all 10 localization concepts\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, dashboard analytics, remediation-session construction, and challenge-variant invariants\n',
        '- [x] Alternate clinical-vignette presentations for all 10 localization concepts\n- [x] Confidence-Calibrated Clinical Reasoning with confidence-aware feedback and dashboard analytics\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, dashboard analytics, remediation-session construction, challenge-variant invariants, and confidence calibration\n',
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f'Expected README anchor not found:\n{old[:240]}')
    text = text.replace(old, new, 1)

path.write_text(text)
print('Updated README for v0.4.0 Confidence-Calibrated Clinical Reasoning.')
