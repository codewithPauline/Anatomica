# Anatomica 3D Asset Provenance

Anatomica keeps source code licensing separate from anatomical model licensing. Every production 3D asset added to `public/models/` must have a traceable source, license, and structure mapping.

## Primary anatomical source

**BodyParts3D**  
Provider: The Database Center for Life Science (DBCLS)  
License: **Creative Commons Attribution 4.0 International (CC BY 4.0)**  
Official archive: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/

Required attribution:

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International

The BodyParts3D archive states that users may access, redistribute, create, and distribute derivative works from the database under CC BY 4.0 provided the specified attribution is retained.

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
| `humerus` | Humerus | pending conversion |
| `radius` | Radius | pending conversion |
| `ulna` | Ulna | pending conversion |
| `bicepsBrachii` | Biceps brachii | pending conversion |
| `tricepsBrachii` | Triceps brachii | pending conversion |
| `medianNerve` | Median nerve | pending conversion |
| `musculocutaneousNerve` | Musculocutaneous nerve | pending conversion |
| `radialNerve` | Radial nerve | pending conversion |
| `brachialArtery` | Brachial artery | pending conversion |
| `cephalicVein` | Cephalic vein | pending conversion |

## Why Anatomica uses a manifest

The rendering engine should not need to know where a model came from. `modelManifest.js` provides one controlled layer for paths, systems, readiness, and provenance. The medical knowledge remains in `src/data/upperLimb.js`, while the geometry remains in `public/models/`.

This separation lets Anatomica replace, improve, or validate a 3D mesh without rewriting the educational content or interaction system.
