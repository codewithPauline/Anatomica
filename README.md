# Anatomica

> **Explore the human body from structure to function.**

**Live demo:** https://codewithpauline.github.io/Anatomica/

**Anatomica** is an open-source interactive 3D anatomy and physiology learning platform for medical, nursing, and health-science students. It is designed to connect structural anatomy, functional understanding, clinical reasoning, and active recall inside one explorable 3D environment.

**From cadaver to clinic, in 3D.**

## Current milestone — v0.3.1 Clinical Intelligence + Nerve Deficits

Anatomica now connects the existing upper-limb, wrist, and hand anatomy to interactive clinical cases and nerve-localization teaching. Learners can start from either an injury pattern or a named peripheral nerve, then inspect the relevant anatomy, expected motor deficit, sensory territory, lesion sites, and examination clues.

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
- Expanded Quiz Mode with more than 50 anatomy and clinical-identification questions
- Clinical-content integrity validation in CI so cases and nerve profiles cannot silently reference missing anatomy keys
- GitHub Actions asset conversion, CI build verification, and GitHub Pages deployment

## Clinical Cases

The first v0.3 clinical layer includes six high-yield upper-limb scenarios:

1. **Carpal tunnel syndrome** — median nerve compression, flexor retinaculum, thenar weakness, and thumb opposition/abduction.
2. **Ulnar neuropathy at the elbow** — cubital-tunnel anatomy, intrinsic hand weakness, Froment sign, and the ulnar paradox.
3. **Radial nerve injury at the humeral shaft** — radial-groove anatomy and the extensor pattern associated with wrist drop.
4. **Axillary nerve injury** — surgical-neck/anterior-dislocation relationships with deltoid and teres-minor deficits.
5. **Supraspinatus tear** — rotator-cuff relationships, abduction weakness, and the role of cuff stabilization.
6. **Scaphoid fracture** — anatomical-snuffbox relationships and the proximal-pole avascular-necrosis risk.

In Clinical Cases mode, the primary lesion or focus is highlighted in red, affected structures in amber, and supporting context anatomy remains visible. Clinical metadata are stored separately in `src/data/clinicalCases.js`, allowing the teaching layer to evolve independently of geometry.

## Nerve Deficit Explorer

The v0.3.1 neurologic-localization layer adds focused profiles for the **median, ulnar, radial, and axillary nerves**.

Selecting a nerve automatically narrows the 3D viewer to that nerve, its major motor targets represented in the current build, and relevant skeletal or regional context. The nerve is emphasized separately from the affected motor structures, while the side panel shows roots, motor pattern, sensory distribution, common lesion sites, examination maneuvers, and a clinical teaching pearl.

Sensory territories are currently presented as **schematic labeled regions**, not anatomically exact 3D skin maps. This keeps the educational distinction clear until validated cutaneous surface geometry is available.

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
3D geometry          → public/models/
Model provenance     → src/data/modelManifest.js
Medical knowledge    → src/data/upperLimb.js
Clinical cases       → src/data/clinicalCases.js
Nerve deficits       → src/data/nerveDeficits.js
Learning questions   → src/data/quizQuestions.js
Rendering / modes    → src/main.js + src/engine/
```

This makes it possible to improve a mesh, teaching note, quiz, clinical scenario, or nerve profile without tightly coupling those layers.

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
- **Structured JavaScript data** — anatomy, clinical cases, nerve deficits, plexus, provenance, and quizzes
- **GitHub Actions** — asset conversion, clinical-data validation, CI, and GitHub Pages deployment

## Project structure

```text
Anatomica/
├── public/
│   └── models/upper-limb/          # Converted anatomical GLBs
├── src/
│   ├── data/
│   │   ├── upperLimb.js            # Medical knowledge
│   │   ├── clinicalCases.js        # Clinical scenario layer
│   │   ├── nerveDeficits.js        # Peripheral-nerve deficit profiles
│   │   ├── brachialPlexus.js       # Plexus pathway data
│   │   ├── quizQuestions.js        # Learning question bank
│   │   ├── anatomyPalette.js       # System + structure color semantics
│   │   └── modelManifest.js        # Asset paths + provenance
│   ├── engine/
│   │   ├── modelLoader.js          # Production GLB loader
│   │   ├── realModelSwap.js        # Shared registration + fallback replacement
│   │   └── anatomyVisuals.js       # Model styling + legend
│   ├── main.js
│   └── style.css
├── scripts/
│   └── validate_clinical_cases.mjs # Clinical-content integrity check
├── docs/
│   └── ANATOMY_VALIDATION.md       # Visual/anatomical sign-off standard
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
- [x] Automated clinical-content anatomy-key validation
- [x] Formal anatomy validation checklist
- [x] CI + GitHub Pages deployment
- [ ] Visual anatomical sign-off of converted wrist/hand meshes before stronger validation status
- [ ] Validated 3D cutaneous territory overlays
- [ ] Dynamic movement/deficit simulation for selected clinical cases
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
