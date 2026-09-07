# Anatomica

> **Explore the human body from structure to function.**

**Anatomica** is an open-source interactive 3D anatomy and physiology learning platform for medical, nursing, and health-science students. Its goal is to bridge the gap between cadaver-based anatomy, living physiology, and clinical reasoning through an explorable digital human body.

## Vision

Anatomica is designed to let learners move through the body the way they think clinically: from surface anatomy to deep structures, from structure to function, and from normal anatomy to injury and disease.

Students will be able to rotate the body, isolate structures, toggle anatomical systems, trace nerves and vessels, reveal deeper layers, animate physiological processes, and test themselves directly on the model.

## Core learning modes

- **Anatomy Mode** — explore bones, muscles, organs, nerves, vessels, and body regions in 3D.
- **Cadaver Mode** — progressively reveal deeper anatomical layers from skin to bone.
- **Physiology Mode** — connect structures with dynamic function such as circulation, ventilation, muscle contraction, and neural signaling.
- **Clinical Mode** — visualize lesions, injuries, referred deficits, and clinically important anatomical relationships.
- **Quiz Mode** — identify highlighted structures, pathways, innervation, actions, and clinical correlations.

## v0.1 — Upper Limb Explorer

The first milestone focuses on the upper limb and brachial plexus.

### Working now

- 3D orbit, zoom, and pan
- Skeletal, muscular, nervous, and vascular system toggles
- Click-to-select structures
- Structure highlighting
- Isolate / restore controls
- Medical metadata separated from 3D geometry
- Anatomy and clinical information panel
- Median, radial, and musculocutaneous nerve teaching pathways
- Early Brachial Plexus Mode
- Resilient GLB/glTF production-model loader
- Licensed anatomical asset manifest and provenance workflow

### Next

- Replace procedural teaching geometry with validated BodyParts3D upper-limb meshes
- Transparency / cadaver-layer controls
- Full brachial plexus roots → trunks → divisions → cords → branches
- Upper-limb landmarks and relationships
- Quiz mode

## Structure explorer

Select a structure and view information such as:

- Name
- Region
- Origin / insertion
- Innervation
- Nerve roots
- Blood supply
- Action / function
- Key anatomical relationships
- Clinical relevance

## Asset architecture

Anatomica intentionally separates three layers:

```text
3D geometry          → public/models/
Model provenance     → src/data/modelManifest.js
Medical knowledge    → src/data/upperLimb.js
```

The application can therefore replace or improve a mesh without rewriting its educational metadata.

Production model loading is handled by `src/engine/modelLoader.js`. Until a validated model is marked ready, Anatomica retains a simplified procedural teaching model so development and learning interactions remain usable.

See [`ASSETS.md`](ASSETS.md) for the model licensing and provenance policy.

## Anatomical data source

The primary planned production anatomy source for v0.1 is **BodyParts3D** from The Database Center for Life Science. The current official archive licenses the database under **CC BY 4.0** with attribution.

Required attribution for derived BodyParts3D material:

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International

## Planned learning interactions

### Nerve tracing
Trace a nerve from spinal roots to terminal branches and target structures. Future lesion simulation will compare deficits at different injury levels.

### Muscle motion
Animate contraction and joint movement to connect origin, insertion, and action.

### Surface-to-deep anatomy
Reveal body layers progressively:

`skin → fascia → muscle → vessels → nerves → bone`

### Physiology overlays
Future modules will visualize processes such as:

- Cardiac conduction and circulation
- Ventilation and gas flow
- Muscle contraction
- Nerve impulse propagation
- Renal filtration
- Gastrointestinal movement

## Technology

- **Three.js** — interactive 3D rendering
- **Vite** — development and bundling
- **JavaScript / WebGL** — client-side interaction
- **glTF / GLB** — anatomical 3D assets
- **Structured JavaScript data** — anatomy and physiology metadata

## Project structure

```text
Anatomica/
├── public/
│   └── models/                 # Validated anatomical GLB assets
├── src/
│   ├── data/
│   │   ├── upperLimb.js        # Medical knowledge
│   │   └── modelManifest.js    # Model paths + provenance
│   ├── engine/
│   │   └── modelLoader.js      # Production GLB loader
│   ├── main.js
│   └── style.css
├── ASSETS.md
├── index.html
├── package.json
└── README.md
```

## Roadmap

- [x] Repository foundation
- [x] Three.js viewer scaffold
- [x] Skeletal / muscular / nervous / vascular system toggles
- [x] Structure selection + clinical information panel
- [x] Isolate / restore interaction
- [x] Initial Brachial Plexus Mode
- [x] Production GLB loader architecture
- [x] 3D asset provenance + license manifest
- [ ] Validated upper-limb GLB base model
- [ ] Full Brachial Plexus Explorer
- [ ] Quiz mode
- [ ] Lower limb
- [ ] Thorax + cardiovascular physiology
- [ ] Abdomen and pelvis
- [ ] Head and neck
- [ ] Neuroanatomy
- [ ] Cross-sectional anatomy and medical imaging
- [ ] Clinical lesion simulations
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

Current development target: **validated real upper-limb anatomy + complete Brachial Plexus Explorer**.

---

### Anatomica
**From cadaver to clinic, in 3D.**
