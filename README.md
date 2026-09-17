# Anatomica

> **Explore the human body from structure to function.**

**Live demo:** https://codewithpauline.github.io/Anatomica/

**Anatomica** is an open-source interactive 3D anatomy and physiology learning platform for medical, nursing, and health-science students. It is designed to connect structural anatomy, functional understanding, clinical reasoning, and active recall inside one explorable 3D environment.

**From cadaver to clinic, in 3D.**

## Current milestone — v0.4.2 Error-Pattern Intelligence

Anatomica now connects upper-limb anatomy to lesion-level clinical reasoning, alternate vignette presentations, adaptive practice, spaced review, longitudinal mastery analytics, confidence-aware remediation, and **choice-aware error-pattern intelligence**. New localization responses preserve the modeled lesion concept the learner actually selected, allowing the Mastery Dashboard to identify repeated confusion pairs and launch focused two-concept drills around distinctions such as radial groove versus PIN or cubital tunnel versus Guyon canal.

### Working now

- Interactive Three.js 3D viewer with orbit, zoom, pan, and automatic camera framing
- Skeletal, muscular, nervous, vascular, and ligament system controls
- Per-system transparency
- Click-to-select anatomy with structure highlighting
- Isolate, restore, and reset-view controls
- Structured anatomy metadata with region, origin, insertion, innervation, roots, actions, and clinical relevance
- Real BodyParts3D GLB loading with procedural teaching fallbacks where validated production geometry is not yet available
- Shared source-space registration for related BodyParts3D structures
- Rotator Cuff study mode
- Brachial Plexus pathway mode covering C5–T1 and the five classic terminal branches
- Forearm Compartments mode with superficial/deep anterior and posterior views
- Wrist & Hand Explorer with six focused learning views
- **Clinical Cases mode with lesion/focus anatomy, affected structures, expected deficits, exam clues, and case-specific camera framing**
- **Nerve Deficit Explorer for median, ulnar, radial, and axillary nerves with motor-structure highlighting and schematic sensory territories**
- **Lesion-Level Localizer with 10 proximal/distal localization patterns across the four nerve profiles**
- **Motor Test Simulator with normal-versus-lesion comparison for 11 focused examination maneuvers**
- **Adaptive Localization Challenge Mode with Easy / Intermediate / Advanced / Adaptive sessions, shuffled cases, per-nerve performance tracking, and post-answer 3D reveal**
- **Persistent browser-local mastery tracking with spaced review, due-review sessions, per-nerve summaries, and learner-controlled data clearing**
- **Longitudinal Mastery Dashboard with recent-session accuracy, mastery states across all 10 lesion patterns, weakest-practiced concepts, momentum summaries, and direct due-review access**
- **Targeted Remediation that launches from any lesion or weak-concept card and practices the selected lesion first, followed by same-nerve comparator lesions**
- **Alternate clinical-vignette presentation layer with 20 total stems across the same 10 lesion concepts, selected once per session and kept stable through feedback and 3D reveal**
- **Confidence-Calibrated Clinical Reasoning with required Unsure / Moderate / High self-rating, confidence-aware feedback, browser-local persistence, and dashboard summaries by confidence band**
- **Confidence-Aware Remediation with an urgency-ordered priority queue based on each lesion concept's latest response, plus direct same-nerve remediation from every priority card**
- **Error-Pattern Intelligence that records the wrong modeled lesion selected, aggregates reverse-direction errors into one confusion pair, flags recurring pairs, and launches two-concept Confusion Drills**
- Expanded Quiz Mode with more than 50 anatomy and clinical-identification questions
- Clinical-content, learner-progress, mastery-dashboard, targeted-remediation, challenge-variant, confidence-calibration, confidence-remediation, and error-pattern validation in CI so anatomy references, review scheduling, analytics summaries, focused-practice pools, vignette invariants, confidence summaries, priority queues, selected-answer persistence, and confusion-pair construction are checked automatically
- GitHub Actions asset conversion, CI build verification, and GitHub Pages deployment

## Clinical Cases

The v0.3 clinical layer includes six high-yield upper-limb scenarios:

1. **Carpal tunnel syndrome** — median nerve compression, flexor retinaculum, thenar weakness, and thumb opposition/abduction.
2. **Ulnar neuropathy at the elbow** — cubital-tunnel anatomy, intrinsic hand weakness, Froment sign, and the ulnar paradox.
3. **Radial nerve injury at the humeral shaft** — radial-groove anatomy and the extensor pattern associated with wrist drop.
4. **Axillary nerve injury** — surgical-neck/anterior-dislocation relationships with deltoid and teres-minor deficits.
5. **Supraspinatus tear** — rotator-cuff relationships, abduction weakness, and the role of cuff stabilization.
6. **Scaphoid fracture** — anatomical-snuffbox relationships and the proximal-pole avascular-necrosis risk.

In Clinical Cases mode, the primary lesion or focus is highlighted in red, affected structures in amber, and supporting context anatomy remains visible. Clinical metadata are stored separately in `src/data/clinicalCases.js`, allowing the teaching layer to evolve independently of geometry.

## Nerve Deficit Explorer

The neurologic-localization layer includes focused profiles for the **median, ulnar, radial, and axillary nerves**.

Selecting a nerve narrows the 3D viewer to that nerve, its major motor targets represented in the current build, and relevant skeletal or regional context. The side panel shows roots, motor pattern, sensory distribution, common lesion sites, examination maneuvers, and a clinical teaching pearl.

Sensory territories are currently presented as **schematic labeled regions**, not anatomically exact 3D skin maps. This keeps the educational distinction clear until validated cutaneous surface geometry is available.

## Lesion-Level Localization

v0.3.3 added a localization ladder inside each nerve profile. The current build distinguishes 10 high-yield lesion patterns:

- **Median nerve** — proximal median lesion, anterior interosseous lesion, carpal tunnel
- **Ulnar nerve** — cubital tunnel, Guyon canal
- **Radial nerve** — radial nerve in the axilla, radial groove, posterior interosseous nerve
- **Axillary nerve** — surgical-neck/anterior-dislocation pattern, quadrangular-space pattern

Each level stores affected motor structures, explicitly spared motor structures, regional context, a sensory pattern, and a localization clue. Changing the lesion level immediately changes how the Motor Test Simulator interprets the same maneuver.

The current highlighting semantics are:

- **Red** — involved nerve pathway
- **Amber** — tested motor target expected to be impaired
- **Green** — tested motor target expected to be spared
- **Purple** — variable or branch-dependent involvement where a simple affected/spared claim would be misleading

Some current muscles are represented as grouped teaching meshes even when their innervation is anatomically subdivided. For example, FDP has mixed median/AIN and ulnar innervation. In these cases, highlighting represents the relevant functional component conceptually rather than claiming the entire grouped mesh belongs to one nerve.

See [`docs/LESION_LOCALIZATION.md`](docs/LESION_LOCALIZATION.md) for the localization model and limitations.

## Clinical Localization Challenge Mode

v0.3.4 turns the localization engine into a scored clinical-reasoning exercise. The scoring model contains **10 lesion concepts**, one for each localization pattern represented in the current nerve model. As of v0.3.9, each concept has a base vignette plus an alternate presentation, producing **20 total vignette presentations across the same 10 scored concepts**.

Each challenge follows the same sequence:

1. Read the clinical stem and key findings.
2. Choose the involved peripheral nerve.
3. Choose the lesion level for that nerve.
4. Rate confidence as **Unsure**, **Moderate**, or **High**.
5. Submit the localization.
6. Receive immediate correct/incorrect feedback, confidence-aware study guidance, and the reasoning behind the answer.
7. Reveal the correct nerve and lesion pattern in the 3D viewer.

The viewer deliberately remains neutral before submission so the anatomy does not leak the answer. During the reveal, the involved nerve is shown in red, expected impaired motor targets in amber, and explicitly spared targets in green.

The current challenge set tests high-yield discriminators such as preserved versus weak triceps, sensory loss versus a pure motor pattern, spared dorsal ulnar-hand sensation, spared thenar-eminence sensation, and the abnormal OK-sign pattern.

### Adaptive sessions

v0.3.5 adds four session modes: **Easy**, **Intermediate**, **Advanced**, and **Adaptive**. Cases are shuffled at the start of each session. Adaptive mode uses the full challenge bank and, after an incorrect response, moves another unanswered case from the same nerve earlier in the queue when one is available.

At the end of a session, Anatomica reports overall accuracy, performance by peripheral nerve, and the exact lesion levels missed. The summary is intentionally descriptive rather than diagnostic or predictive; it is designed to help a learner decide what to review next.

This adaptation is deterministic rule-based tutoring logic, not a machine-learning model.

### Persistent progress and spaced review

v0.3.6 stores completed localization-session history **only in the learner's current browser** using `localStorage`. There is no account, server-side learner profile, or cloud synchronization.

The progress engine tracks performance by peripheral nerve, lesion level, and individual challenge. Correct responses advance a transparent spaced-review schedule and missed responses reset that challenge to the earliest review stage. Review intervals are currently **1, 3, 7, 14, and 30 days**.

The challenge panel shows completed-session count, cumulative accuracy, due-review count, and the current weakest practiced nerve. A **Review due** session pulls challenges whose review date has arrived; if nothing is due yet, the mode falls back to the full challenge bank. Learners can clear all saved progress at any time from the challenge panel.

See [`docs/LOCALIZATION_CHALLENGE_MODE.md`](docs/LOCALIZATION_CHALLENGE_MODE.md) for the assessment design, [`docs/ADAPTIVE_CHALLENGE_SESSIONS.md`](docs/ADAPTIVE_CHALLENGE_SESSIONS.md) for the session engine, and [`docs/PERSISTENT_PROGRESS.md`](docs/PERSISTENT_PROGRESS.md) for browser storage, mastery summaries, and spaced-review behavior.

### Longitudinal mastery dashboard

v0.3.7 adds a dedicated **Mastery dashboard** that turns the browser-local progress record into a compact longitudinal view. It shows cumulative sessions and accuracy, spaced-review load, recent-session accuracy bars, recent momentum, mastery counts, all 10 lesion-pattern summaries, and the weakest practiced concepts.

The four mastery labels are intentionally descriptive: **Unseen**, **Developing**, **Practicing**, and **Strong**. They are derived from the learner's own challenge history and are not validated measures of clinical competence. Recent momentum compares short windows of session accuracy and is shown only when enough completed sessions exist.

A due-review action links the dashboard back into the existing spaced-review session, keeping the workflow connected: **measure → identify weakness → review → reassess**.

See [`docs/MASTERY_DASHBOARD.md`](docs/MASTERY_DASHBOARD.md) for the analytics model, display rules, and limitations.

### Targeted remediation

v0.3.8 makes the Mastery Dashboard actionable. Every lesion-pattern row and weak-concept card can launch a focused remediation session directly from the dashboard.

A remediation session starts with the selected lesion pattern, then presents the other modeled lesion levels from the **same peripheral nerve** as comparators. The goal is not to repeat one vignette until it is memorized; it is to practice the distinguishing clues that separate nearby localizations such as radial-groove versus PIN lesions or cubital-tunnel versus Guyon-canal lesions.

Remediation sessions use the same scored challenge, 3D answer reveal, progress recording, and mastery infrastructure as the rest of the localization system. They are intentionally rule-based and limited by the current challenge bank; they do not claim individualized educational diagnosis or validated competency assessment.

See [`docs/TARGETED_REMEDIATION.md`](docs/TARGETED_REMEDIATION.md) for the session-building rules, dashboard launch behavior, and limitations.

### Alternate vignette presentations

v0.3.9 separates **what is being assessed** from **how the case is presented**. Each of the 10 lesion concepts now has two possible clinical presentations: the original vignette and one alternate stem with different wording, mechanism, or framing where clinically appropriate.

At the start of a session, Anatomica selects one presentation for each included lesion concept and keeps that variant stable throughout answering, feedback, 3D reveal, and session accounting. Progress remains tied to the original challenge ID, nerve, and lesion level, so changing the presentation does not fragment mastery history or spaced-review scheduling.

The variant layer is used by standard difficulty sessions, Adaptive mode, spaced review, and Targeted Remediation. It is designed to reduce simple wording recognition, not to claim a psychometrically validated item bank.

See [`docs/CHALLENGE_VARIANTS.md`](docs/CHALLENGE_VARIANTS.md) for the presentation model, validation rules, and limitations.

### Confidence-calibrated reasoning

v0.4.0 adds a required self-rated confidence step to every localization response. Learners choose **Unsure**, **Moderate**, or **High** before submitting. Confidence does not change whether the localization is scored correct; it adds context to the result.

The immediate feedback distinguishes useful learning states such as **high-confidence misses** and **correct-but-unsure answers**. The Mastery Dashboard adds a Confidence Calibration panel showing the number of rated responses, accuracy among high-confidence responses, high-confidence misses, correct answers made while unsure, and observed accuracy within each confidence band.

Confidence is stored only in the same browser-local progress record already used by Anatomica. Historical sessions without confidence remain valid and are ignored by confidence summaries. The confidence categories are ordinal self-ratings—not numeric probabilities—and Anatomica does not calculate proprietary calibration scores or claim validated measures of clinical competence.

See [`docs/CONFIDENCE_CALIBRATION.md`](docs/CONFIDENCE_CALIBRATION.md) for persistence behavior, feedback semantics, dashboard analytics, validation, and limitations.

### Confidence-aware remediation

v0.4.1 converts confidence data into a transparent remediation priority. Anatomica evaluates the **latest stored response for each lesion concept** rather than accumulating permanent penalties from old mistakes. A high-confidence miss is marked **urgent**, another unresolved miss is marked **review**, and a correct answer made while unsure is marked **reinforce**. A later correct response with moderate or high confidence clears that concept from the confidence-priority queue.

The Mastery Dashboard shows these concepts in priority order. Learners can either launch the full cross-nerve priority queue or click an individual concept to open the existing same-nerve comparator remediation session. The two workflows are complementary: the priority queue decides **what to revisit first**, while targeted remediation teaches **how to distinguish nearby lesion levels**.

This is deterministic rule-based study guidance. It does not diagnose misconceptions, predict examination performance, or certify clinical competence.

See [`docs/CONFIDENCE_AWARE_REMEDIATION.md`](docs/CONFIDENCE_AWARE_REMEDIATION.md) for priority rules, resolution behavior, session construction, validation, and limitations.

### Error-pattern intelligence

v0.4.2 records the **modeled localization the learner actually chose** when answering a clinical-localization challenge. If an incorrect answer maps cleanly to another lesion concept in the current bank, Anatomica stores that choice and uses it to build answer-confusion pairs.

Reverse-direction errors are combined. For example, choosing PIN when the correct answer is radial groove and later choosing radial groove when the correct answer is PIN are treated as one **Radial groove ↔ PIN** confusion pair. A single event remains a historical confusion event; two or more events are labeled **Recurring** in the dashboard. The panel also reports how many events were high-confidence misses.

Each pair can launch a two-concept **Confusion Drill** using the existing alternate-vignette, confidence-rating, feedback, 3D-reveal, persistence, and mastery infrastructure. Error patterns are historical learning signals rather than claims that a learner currently holds a stable misconception, and older browser sessions without selected-answer metadata remain valid but do not contribute to these pair counts.

See [`docs/ERROR_PATTERN_INTELLIGENCE.md`](docs/ERROR_PATTERN_INTELLIGENCE.md) for aggregation rules, drill construction, persistence behavior, validation, and limitations.

## Motor Test Simulator

The functional-examination workflow sits inside the Nerve Deficit Explorer. Each nerve profile contains focused motor tests that can be viewed in two states:

- **Normal activation** — the selected motor targets are highlighted in green with the expected normal response.
- **Lesion pattern** — the selected lesion level determines which test targets are impaired, spared, or variably involved.

The current simulator includes 11 maneuvers:

- **Median nerve** — thumb opposition, forearm pronation, OK sign
- **Ulnar nerve** — finger abduction, finger adduction, key pinch
- **Radial nerve** — wrist extension, finger extension, thumb extension
- **Axillary nerve** — shoulder abduction, external rotation

The current imported anatomy is not rigged, so the simulator uses activation highlighting rather than artificial joint or muscle deformation. This is intentionally a functional-anatomy teaching layer, not a biomechanical motion model.

See [`docs/MOTOR_TEST_SIMULATOR.md`](docs/MOTOR_TEST_SIMULATOR.md) for the exam definitions, interaction model, and limitations.

## Wrist & Hand Explorer

The wrist-and-hand phase introduces a complete 27-bone hand skeleton target plus clinically important muscles, tendons, vessels, and the flexor retinaculum.

The six study views are:

1. **Hand Skeleton** — eight carpals, five metacarpals, and fourteen phalanges with distal radius and ulna context.
2. **Carpal Tunnel** — median nerve, flexor retinaculum, FDS, FDP, and FPL relationships.
3. **Anatomical Snuffbox** — scaphoid, trapezium, APL, EPB, EPL, and radial artery.
4. **Tendon Testing** — digital flexors, finger extensors, and thumb tendons used during the focused hand examination.
5. **Intrinsic Hand** — thenar, hypothenar, lumbrical, and interosseous groups with median-versus-ulnar motor patterns.
6. **Blood Supply** — radial and ulnar arteries with superficial and deep palmar arches.

Clinical teaching links include scaphoid fracture and avascular necrosis, lunate dislocation, Kienböck disease, Guyon canal, Bennett and boxer fractures, jersey finger, mallet finger, anterior interosseous nerve dysfunction, De Quervain tenosynovitis, Froment sign, carpal tunnel syndrome, and palmar arterial supply.

## Forearm Compartments

The forearm explorer separates anatomy into four layers:

- **Anterior superficial** — pronator teres, flexor carpi radialis, palmaris longus, flexor carpi ulnaris
- **Anterior deep** — flexor digitorum superficialis, flexor digitorum profundus, flexor pollicis longus, pronator quadratus
- **Posterior superficial** — brachioradialis, ECRL, ECRB, extensor digitorum, extensor digiti minimi, ECU
- **Posterior deep** — supinator, APL, EPB, EPL, extensor indicis

The viewer focuses the camera on the active region and highlights the selected anatomical group while preserving the surrounding skeletal context.

## Brachial Plexus Explorer

The structured learning model follows the classic organization:

```text
Roots
C5  C6  C7  C8  T1
      ↓
Trunks
Upper  Middle  Lower
      ↓
Divisions
Anterior / Posterior
      ↓
Cords
Lateral  Posterior  Medial
      ↓
Terminal branches
Musculocutaneous · Median · Ulnar · Axillary · Radial
```

Terminal branches are linked to teaching metadata and simplified interactive pathways. Production-quality nerve geometry remains a future validation target and is not represented as anatomically exact GLB anatomy yet.

## Quiz Mode

Quiz Mode turns the 3D scene into an active-recall environment. Learners identify a structure directly in the viewer, receive immediate correct/incorrect feedback, see the correct structure highlighted, and get a short anatomical or clinical explanation.

The current bank spans shoulder, rotator cuff, arm, forearm, brachial plexus, wrist, hand bones, tendon testing, intrinsic hand muscles, carpal tunnel, anatomical snuffbox, and hand vascular anatomy.

## Asset architecture

Anatomica intentionally separates geometry, provenance, medical knowledge, and clinical reasoning:

```text
3D geometry             → public/models/
Model provenance        → src/data/modelManifest.js
Medical knowledge       → src/data/upperLimb.js
Clinical cases          → src/data/clinicalCases.js
Nerve + lesion data     → src/data/nerveDeficits.js
Localization challenges → src/data/localizationChallenges.js
Challenge variants      → src/data/challengeVariants.js
Learning questions      → src/data/quizQuestions.js
Learner progress        → src/learning/progressStore.js
Mastery analytics       → src/learning/masteryDashboard.js
Targeted remediation    → src/learning/remediation.js
Confidence analytics    → src/learning/confidenceCalibration.js
Confidence remediation  → src/learning/confidenceRemediation.js
Error-pattern analytics → src/learning/errorPatterns.js
Rendering / modes       → src/main.js + src/engine/
```

This makes it possible to improve a mesh, teaching note, quiz, clinical scenario, nerve profile, lesion-level pattern, motor test, or reasoning challenge without tightly coupling those layers.

### BodyParts3D

The primary production anatomy source for the current upper-limb build is **BodyParts3D** from The Database Center for Life Science (DBCLS). The official current archive is licensed under **CC BY 4.0**.

Required attribution:

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International

The automated asset workflow resolves official FMA concepts through the BodyParts3D mapping tables, converts the selected OBJ geometry to browser-ready GLB, and commits generated assets into `public/models/upper-limb/`.

See [`ASSETS.md`](ASSETS.md) for provenance and licensing details and [`docs/ANATOMY_VALIDATION.md`](docs/ANATOMY_VALIDATION.md) for the visual/anatomical sign-off checklist.

## Technology

- **Three.js / WebGL** — interactive 3D rendering
- **Vite** — development and production bundling
- **JavaScript** — application and learning interactions
- **glTF / GLB** — browser-ready anatomical geometry
- **Structured JavaScript data** — anatomy, clinical cases, nerve deficits, lesion levels, motor tests, localization challenges, plexus, provenance, and quizzes
- **GitHub Actions** — asset conversion, clinical-data validation, CI, and GitHub Pages deployment

## Project structure

```text
Anatomica/
├── public/
│   └── models/upper-limb/              # Converted anatomical GLBs
├── src/
│   ├── data/
│   │   ├── upperLimb.js                # Medical knowledge
│   │   ├── clinicalCases.js            # Clinical scenario layer
│   │   ├── nerveDeficits.js            # Nerve profiles + lesion levels + motor tests
│   │   ├── localizationChallenges.js   # Scored localization concept bank
│   │   ├── challengeVariants.js        # Alternate vignette presentation layer
│   │   ├── brachialPlexus.js           # Plexus pathway data
│   │   ├── quizQuestions.js            # Learning question bank
│   │   ├── anatomyPalette.js           # System + structure color semantics
│   │   └── modelManifest.js            # Asset paths + provenance
│   ├── learning/
│   │   ├── progressStore.js            # Browser-local mastery + spaced review
│   │   ├── masteryDashboard.js         # Longitudinal learning-analytics summaries
│   │   ├── remediation.js              # Same-nerve targeted-practice session builder
│   │   ├── confidenceCalibration.js    # Confidence-band summaries + feedback
│   │   ├── confidenceRemediation.js    # Latest-response priority remediation engine
│   │   └── errorPatterns.js            # Choice-aware confusion-pair analytics + drills
│   ├── engine/
│   │   ├── modelLoader.js              # Production GLB loader
│   │   ├── realModelSwap.js            # Shared registration + fallback replacement
│   │   └── anatomyVisuals.js           # Model styling + legend
│   ├── main.js
│   ├── style.css
│   ├── confidenceRemediation.css
│   └── errorPatterns.css
├── scripts/
│   ├── validate_clinical_cases.mjs     # Clinical-content integrity check
│   ├── validate_progress_store.mjs     # Persistence + spaced-review validation
│   ├── validate_mastery_dashboard.mjs  # Dashboard analytics validation
│   ├── validate_remediation.mjs        # Targeted-practice pool validation
│   ├── validate_challenge_variants.mjs # Vignette-variant invariant validation
│   ├── validate_confidence_calibration.mjs # Confidence analytics validation
│   ├── validate_confidence_remediation.mjs # Confidence-priority validation
│   └── validate_error_patterns.mjs     # Answer-confusion + drill validation
├── docs/
│   ├── ANATOMY_VALIDATION.md           # Visual/anatomical sign-off standard
│   ├── LESION_LOCALIZATION.md          # Lesion-level reasoning model
│   ├── LOCALIZATION_CHALLENGE_MODE.md  # Clinical reasoning assessment design
│   ├── ADAPTIVE_CHALLENGE_SESSIONS.md  # Difficulty, shuffling + session feedback
│   ├── PERSISTENT_PROGRESS.md          # Browser-local mastery + spaced review
│   ├── MASTERY_DASHBOARD.md            # Longitudinal learning analytics
│   ├── TARGETED_REMEDIATION.md         # Dashboard-to-practice remediation workflow
│   ├── CHALLENGE_VARIANTS.md           # Alternate vignette presentation model
│   ├── CONFIDENCE_CALIBRATION.md       # Self-rated confidence analytics + limits
│   ├── CONFIDENCE_AWARE_REMEDIATION.md # Confidence-priority review model
│   ├── ERROR_PATTERN_INTELLIGENCE.md   # Choice-aware confusion analytics + drills
│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations
├── .github/workflows/
│   ├── build-anatomy-assets.yml
│   ├── ci.yml
│   └── deploy-pages.yml
├── ASSETS.md
├── index.html
├── package.json
└── README.md
```

## Roadmap

- [x] Three.js interactive viewer
- [x] System toggles + transparency
- [x] Structure selection + clinical information
- [x] Isolate / restore / reset view
- [x] Production GLB loader + fallback architecture
- [x] BodyParts3D provenance and automated conversion workflow
- [x] Humerus, radius, ulna, scapula, and clavicle production assets
- [x] Major arm and rotator-cuff production assets
- [x] Forearm compartment explorer
- [x] Real superficial forearm muscle assets
- [x] Complete 27-bone wrist-and-hand asset target
- [x] Deep forearm and thumb tendon asset target
- [x] Thenar, hypothenar, lumbrical, and interosseous asset target
- [x] Flexor retinaculum and palmar vascular asset target
- [x] Wrist & Hand Explorer clinical views
- [x] Expanded clinical Quiz Mode
- [x] Clinical Cases explorer with lesion + affected-structure highlighting
- [x] Nerve Deficit Explorer with motor-target highlighting and schematic sensory territories
- [x] Lesion-Level Localizer for proximal-versus-distal peripheral-nerve patterns
- [x] Motor Test Simulator with lesion-level normal/spared/variable comparison
- [x] Clinical Localization Challenge Mode with scored 3D answer reveal
- [x] Adaptive challenge sessions with difficulty modes, shuffling, targeted follow-up, and performance summaries
- [x] Persistent browser-local learner progress with mastery summaries and spaced-review scheduling
- [x] Longitudinal Mastery Dashboard with recent-session trend, lesion-level mastery states, weakest concepts, and due-review access
- [x] Targeted remediation from lesion-level mastery cards into same-nerve comparator practice
- [x] Alternate clinical-vignette presentations for all 10 localization concepts
- [x] Confidence-Calibrated Clinical Reasoning with confidence-aware feedback and dashboard analytics
- [x] Confidence-aware remediation with latest-response priority review and resolution behavior
- [x] Error-Pattern Intelligence with selected-answer persistence, recurring confusion-pair detection, and focused two-concept drills
- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, dashboard analytics, remediation-session construction, challenge-variant invariants, confidence calibration, confidence-remediation priorities, and error-pattern aggregation
- [x] Formal anatomy validation checklist
- [x] CI + GitHub Pages deployment
- [ ] Visual anatomical sign-off of converted wrist/hand meshes before stronger validation status
- [ ] Validated 3D cutaneous territory overlays
- [ ] Rigged, validated movement/deficit simulation for selected clinical cases
- [ ] Production-quality median/ulnar/radial digital nerve geometry
- [ ] Detailed brachial plexus roots/trunks/divisions/cord geometry
- [ ] Cadaver-style progressive layer removal
- [ ] Lower limb
- [ ] Thorax + cardiovascular physiology
- [ ] Abdomen and pelvis
- [ ] Head and neck
- [ ] Neuroanatomy
- [ ] Cross-sectional anatomy and medical imaging
- [ ] Complete interactive human model

## Validation policy

A converted GLB is **not automatically considered anatomically validated**. Anatomica keeps newly converted meshes in a pre-validation state until structure identity, laterality, orientation, scale, spatial relationships, interaction behavior, and browser presentation are visually checked. Only then should an asset receive a stronger validation claim.

## Educational scope

Anatomica is an educational application and is **not a diagnostic tool or medical device**. Clinical notes are included to support anatomy learning and clinical reasoning, not patient-specific diagnosis or treatment.

## Author

**Pauline Owusu-Ansah**  
Biologist, educator, and computational researcher.

---

### Anatomica
**From cadaver to clinic, in 3D.**