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

## Anatomical systems

Planned system layers include:

- Skeletal
- Muscular
- Nervous
- Cardiovascular
- Respiratory
- Gastrointestinal
- Endocrine
- Urinary
- Reproductive
- Lymphatic
- Integumentary
- Special senses

## v0.1 — Upper Limb Explorer

The first milestone focuses on the upper limb and brachial plexus.

### Initial capabilities

- 3D orbit, zoom, and pan
- Anatomical system toggles
- Structure selection and highlighting
- Hide / isolate / restore controls
- Transparency controls
- Structure information panel
- Upper-limb bones and major muscles
- Major arteries and nerves
- Interactive brachial plexus pathway explorer
- Early quiz mode

## Planned learning interactions

### Structure explorer
Select a structure and view:

- Name
- Region
- Origin / insertion
- Innervation
- Blood supply
- Action / function
- Key anatomical relationships
- Clinical relevance

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

The project is being built as a modern browser-based application using:

- **Three.js** for interactive 3D rendering
- **Vite** for development and bundling
- **JavaScript / WebGL** for client-side interaction
- **glTF / GLB** for anatomical 3D assets
- **JSON** for structured anatomy and physiology metadata

## Project structure

```text
Anatomica/
├── public/
│   └── models/              # Anatomical 3D assets
├── src/
│   ├── data/                # Anatomy / physiology metadata
│   ├── engine/              # 3D scene and interaction logic
│   ├── modules/             # Regional and system learning modules
│   ├── ui/                  # Interface components
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
└── README.md
```

## Roadmap

- [x] Repository foundation
- [x] Three.js viewer scaffold
- [ ] Upper-limb base model
- [ ] Skeletal / muscular / nervous system toggles
- [ ] Structure selection + information panel
- [ ] Brachial Plexus Explorer
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

The first public development target is the **Upper Limb Explorer + Brachial Plexus module**.

---

### Anatomica
**From cadaver to clinic, in 3D.**
