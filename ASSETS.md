# Anatomica 3D Asset Provenance

Anatomica keeps source code licensing separate from anatomical model licensing. Every production 3D asset added to `public/models/` must have a traceable source, license, and structure mapping.

## Primary anatomical source

**BodyParts3D**  
Provider: The Database Center for Life Science (DBCLS)  
License: **Creative Commons Attribution 4.0 International (CC BY 4.0)**  
Official archive: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/  
99% IS-A polygon archive: `isa_BP3D_4.0_obj_99.zip`

Required attribution:

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International

The BodyParts3D archive states that users may access, redistribute, create, and distribute derivative works from the database under CC BY 4.0 provided the specified attribution is retained.

## Reproducible import workflow

The first skeletal assets can be prepared from the repository root with:

```bash
npm run assets:extract
```

This downloads the official BodyParts3D 4.0 99% IS-A archive into the ignored `.asset-cache/` directory and extracts only Anatomica's selected source OBJ files into `assets/source/bodyparts3d/upper-limb/`.

If Blender is installed and available on `PATH`, convert them directly to browser-ready GLB files with:

```bash
npm run assets:build
```

The conversion helper writes the resulting models to `public/models/upper-limb/`.

### First verified source mappings

| Anatomica key | BodyParts3D label | FMA concept | Representation | Output |
| --- | --- | --- | --- | --- |
| `humerus` | right humerus | `FMA23130` | `BP9206` | `humerus.glb` |
| `radius` | right radius | `FMA23464` | `BP8464` | `radius.glb` |
| `ulna` | right ulna | `FMA23467` | `BP8233` | `ulna.glb` |

These IDs come from the official BodyParts3D IS-A parts table and are recorded again in `src/data/modelManifest.js` so provenance travels with the model configuration.

## Asset policy

Before a model is marked `ready` in `src/data/modelManifest.js`, it must meet all of the following requirements:

1. Source structure/FMA identifier is recorded.
2. License is verified from the original source, not inferred from a mirror.
3. Geometry has been visually checked for correct anatomical structure.
4. Orientation is normalized to Anatomica's Y-up anatomical coordinate system.
5. Scale is normalized consistently across the upper limb.
6. Mesh names are mapped to an Anatomica structure key.
7. File is optimized for browser delivery in GLB/glTF format.
8. Attribution remains documented here.

## v0.1 upper-limb target assets

| Anatomica key | Structure | Status |
| --- | --- | --- |
| `humerus` | Right humerus | source identified; conversion pipeline ready |
| `radius` | Right radius | source identified; conversion pipeline ready |
| `ulna` | Right ulna | source identified; conversion pipeline ready |
| `bicepsBrachii` | Biceps brachii | pending source mapping |
| `tricepsBrachii` | Triceps brachii | pending source mapping |
| `medianNerve` | Median nerve | pending source mapping |
| `musculocutaneousNerve` | Musculocutaneous nerve | pending source mapping |
| `radialNerve` | Radial nerve | pending source mapping |
| `brachialArtery` | Brachial artery | pending source mapping |
| `cephalicVein` | Cephalic vein | pending source mapping |

## Why Anatomica uses a manifest

The rendering engine should not need to know where a model came from. `modelManifest.js` provides one controlled layer for paths, systems, readiness, identifiers, and provenance. The medical knowledge remains in `src/data/upperLimb.js`, while production geometry remains in `public/models/`.

This separation lets Anatomica replace, improve, or validate a 3D mesh without rewriting the educational content or interaction system.
