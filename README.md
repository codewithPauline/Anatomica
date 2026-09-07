# Anatomica

> **Explore the human body from structure to function.**

**Live demo:** https://codewithpauline.github.io/Anatomica/

**Anatomica** is an open-source interactive 3D anatomy and physiology learning platform for medical, nursing, and health-science students. It is designed to connect structural anatomy, functional understanding, clinical reasoning, and active recall inside one explorable 3D environment.

**From cadaver to clinic, in 3D.**

## Current milestone — v0.2 Upper Limb + Wrist & Hand

Anatomica now moves from the shoulder through the arm and forearm into a dedicated wrist-and-hand learning environment.

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
- Expanded Quiz Mode with more than 50 anatomy and clinical-identification questions
- GitHub Actions asset conversion, CI build verification, and GitHub Pages deployment

## Wrist & Hand Explorer

The v0.2 hand phase introduces a complete 27-bone hand skeleton target plus clinically important muscles, tendons, vessels, and the flexor retinaculum.

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

Anatomica intentionally separates geometry, provenance, and medical knowledge:

```text
3D geometry          → public/models/
Model provenance     → src/data/modelManifest.js
Medical knowledge    → src/data/upperLimb.js
Learning questions   → src/data/quizQuestions.js
Rendering / modes    → src/main.js + src/engine/
```

This makes it possible to replace or improve a mesh without rewriting the associated teaching content.

### BodyParts3D

The primary production anatomy source for the current upper-limb build is **BodyParts3D** from The Database Center for Life Science (DBCLS). The official current archive is licensed under **CC BY 4.0**.

Required attribution:

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International

The automated asset workflow resolves official FMA concepts through the BodyParts3D mapping tables, converts the selected OBJ geometry to browser-ready GLB, and commits generated assets into `public/models/upper-limb/`.

See [`ASSETS.md`](ASSETS.md) for provenance, validation rules, and licensing details.

## Technology

- **Three.js / WebGL** — interactive 3D rendering
- **Vite** — development and production bundling
- **JavaScript** — application and learning interactions
- **glTF / GLB** — browser-ready anatomical geometry
- **Structured JavaScript data** — medical knowledge, plexus, provenance, and quizzes
- **GitHub Actions** — asset conversion, CI, and GitHub Pages deployment

## Project structure

```text
Anatomica/
├── public/
│   └── models/upper-limb/          # Converted anatomical GLBs
├── src/
│   ├── data/
│   │   ├── upperLimb.js            # Medical knowledge
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
- [x] CI + GitHub Pages deployment
- [ ] Visual anatomical validation of newly converted wrist/hand meshes before `ready` status
- [ ] Production-quality median/ulnar/radial digital nerve geometry
- [ ] Detailed brachial plexus roots/trunks/divisions/cord geometry
- [ ] Dynamic clinical lesion simulation
- [ ] Cadaver-style progressive layer removal
- [ ] Lower limb
- [ ] Thorax + cardiovascular physiology
- [ ] Abdomen and pelvis
- [ ] Head and neck
- [ ] Neuroanatomy
- [ ] Cross-sectional anatomy and medical imaging
- [ ] Complete interactive human model

## Validation policy

A converted GLB is **not automatically considered anatomically validated**. Anatomica keeps newly converted meshes in a pre-validation state until structure identity, orientation, scale, spatial relationships, and browser presentation are visually checked. Only then should an asset be marked `ready`.

## Educational scope

Anatomica is an educational application and is **not a diagnostic tool or medical device**. Clinical notes are included to support anatomy learning and clinical reasoning, not patient-specific diagnosis or treatment.

## Author

**Pauline Owusu-Ansah**  
Biologist, educator, and computational researcher.

---

### Anatomica
**From cadaver to clinic, in 3D.**
