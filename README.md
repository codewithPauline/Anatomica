# Anatomica

> **Explore the human body from structure to function.**

**Live demo:** https://codewithpauline.github.io/Anatomica/

**Anatomica** is an open-source interactive 3D anatomy and physiology learning platform for medical, nursing, and health-science students. Its goal is to bridge the gap between cadaver-based anatomy, living physiology, and clinical reasoning through an explorable digital human body.

## Vision

Anatomica is designed to let learners move through the body the way they think clinically: from surface anatomy to deep structures, from structure to function, and from normal anatomy to injury and disease.

Students will be able to rotate the body, isolate structures, toggle anatomical systems, trace nerves and vessels, reveal deeper layers, animate physiological processes, and test themselves directly on the model.

## v0.1 — Upper Limb Explorer

The first milestone focuses on the upper limb and brachial plexus.

### Working now

- 3D orbit, zoom, and pan
- Skeletal, muscular, nervous, and vascular system toggles
- Per-system transparency control
- Click-to-select structures
- Structure highlighting
- Isolate / restore controls with preserved system visibility state
- Anatomy + clinical information panel
- Structured brachial plexus roots, trunks, divisions, cords, and all five classic terminal branches
- Interactive teaching paths for musculocutaneous, median, ulnar, axillary, and radial nerves
- Quiz Mode with score tracking and explanatory feedback
- Medical metadata separated from 3D geometry
- Automatic GLB/glTF replacement of procedural teaching geometry when validated models are present
- Real BodyParts3D GLBs now included for the right humerus, radius, ulna, biceps brachii, and triceps brachii
- Licensed anatomical asset manifest and provenance workflow
- Independent CI production-build verification
- Live GitHub Pages deployment

### In progress

- Add scapula and clavicle to complete the shoulder-girdle context
- Replace remaining procedural neurovascular teaching paths with validated anatomical geometry
- Add upper-limb anatomical landmarks and spatial relationships
- Add clinical lesion simulations

## Core learning modes

- **Anatomy Mode** — explore structures and their relationships in 3D.
- **Brachial Plexus Mode** — follow the C5–T1 organization from roots to the five terminal branches.
- **Quiz Mode** — identify structures directly in the viewer and receive immediate teaching feedback.
- **Cadaver Mode** — planned progressive layer removal from superficial to deep anatomy.
- **Physiology Mode** — planned dynamic visualization of structure-function relationships.
- **Clinical Mode** — planned lesion and injury simulations tied to anatomical deficits.

## Structure explorer

Select a structure and view information such as:

- Name
- Region
- Origin / insertion
- Innervation
- Nerve roots
- Action / function
- Clinical relevance

## Asset architecture

Anatomica intentionally separates three layers:

```text
3D geometry          → public/models/
Model provenance     → src/data/modelManifest.js
Medical knowledge    → src/data/upperLimb.js
```

The application can therefore replace or improve a mesh without rewriting its educational metadata.

Production model loading is handled by `src/engine/modelLoader.js` and `src/engine/realModelSwap.js`. Until a validated model is available, Anatomica retains a simplified procedural teaching model so development and learning interactions remain usable.

See [`ASSETS.md`](ASSETS.md) for the model licensing and provenance policy.

## Anatomical data source

The primary production anatomy source for v0.1 is **BodyParts3D** from The Database Center for Life Science. The current official archive licenses the database under **CC BY 4.0** with attribution.

Required attribution for derived BodyParts3D material:

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International

## Brachial Plexus Explorer

The current data layer models the classic organization:

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

Each terminal branch is linked to teaching metadata and a simplified 3D pathway. Validated production nerve assets will replace those pathways when suitable sources are available.

## Quiz Mode

Quiz Mode currently asks learners to identify upper-limb bones, muscles, and nerves directly in the 3D viewer. It includes questions on median, radial, ulnar, and axillary nerve relationships, tracks score, highlights the correct structure, and explains the anatomical concept after each attempt.

## Technology

- **Three.js** — interactive 3D rendering
- **Vite** — development and production bundling
- **JavaScript / WebGL** — browser interaction
- **glTF / GLB** — anatomical 3D assets
- **Structured JavaScript data** — anatomy, brachial plexus, and quiz metadata
- **GitHub Actions** — continuous build verification and GitHub Pages deployment

## Project structure

```text
Anatomica/
├── public/
│   └── models/                    # Validated anatomical GLB assets
├── src/
│   ├── data/
│   │   ├── upperLimb.js           # Medical knowledge
│   │   ├── brachialPlexus.js      # Plexus pathway data
│   │   ├── quizQuestions.js       # Learning question bank
│   │   └── modelManifest.js       # Model paths + provenance
│   ├── engine/
│   │   ├── modelLoader.js         # Production GLB loader
│   │   └── realModelSwap.js       # Real-model / fallback replacement
│   ├── main.js
│   └── style.css
├── scripts/                       # BodyParts3D extraction + conversion
├── ASSETS.md
├── index.html
├── package.json
└── README.md
```

## Roadmap

- [x] Repository foundation
- [x] Three.js viewer scaffold
- [x] Skeletal / muscular / nervous / vascular system toggles
- [x] Per-system transparency
- [x] Structure selection + clinical information panel
- [x] Isolate / restore interaction
- [x] Five-terminal-branch Brachial Plexus Explorer foundation
- [x] Quiz Mode
- [x] Production GLB loader architecture
- [x] Automatic real-model replacement
- [x] 3D asset provenance + license manifest
- [x] Independent production-build CI
- [x] GitHub Pages live deployment
- [x] Real humerus, radius, and ulna GLBs
- [x] Real biceps and triceps GLBs
- [ ] Scapula + clavicle
- [ ] Detailed brachial plexus roots/trunks/divisions/cord geometry
- [ ] Clinical lesion simulation
- [ ] Lower limb
- [ ] Thorax + cardiovascular physiology
- [ ] Abdomen and pelvis
- [ ] Head and neck
- [ ] Neuroanatomy
- [ ] Cross-sectional anatomy and medical imaging
- [ ] Complete interactive human model

## Educational philosophy

Anatomica is not intended to be a static atlas. The aim is to create a learning environment where a student can ask:

> **What is this? Where does it go? What does it do? What happens when it fails?**

and answer those questions while directly exploring the relevant anatomy.

## Author

**Pauline Owusu-Ansah**  
Biologist, educator, and computational researcher.

## Status

🚧 **Early development — v0.1**

Current development target: **complete the real upper-limb shoulder context, improve nerve/vessel anatomy, and add clinical interactions**.

---

### Anatomica
**From cadaver to clinic, in 3D.**
