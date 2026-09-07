# Anatomica 3D Asset Provenance

Anatomica keeps source-code licensing separate from anatomical-model licensing. Every production 3D asset added to `public/models/` must have a traceable source, license, structure mapping, and validation state.

## Primary anatomical source

**BodyParts3D**  
Provider: The Database Center for Life Science (DBCLS)  
License: **Creative Commons Attribution 4.0 International (CC BY 4.0)**  
Official archive: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/  
99% IS-A polygon archive: `isa_BP3D_4.0_obj_99.zip`

Required attribution:

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International

The current Anatomica workflow uses only the official DBCLS archive and mapping tables for source resolution. Mirror repositories are not treated as authoritative for licensing or structure identity.

## Reproducible GitHub Actions import workflow

`.github/workflows/build-anatomy-assets.yml` performs the production asset build. It:

1. Downloads the official BodyParts3D 4.0 99% IS-A archive.
2. Downloads the official parts and element mapping tables.
3. Resolves Anatomica FMA concepts through the BodyParts3D representation/element definitions.
4. Verifies the resolver against the previously confirmed right-humerus mapping.
5. Converts selected OBJ elements to browser-ready GLB with `trimesh`.
6. Writes the results to `public/models/upper-limb/`.
7. Commits newly generated GLBs back to `main` without recursively triggering itself.

The application then loads those GLBs through `src/engine/modelLoader.js` and `src/engine/realModelSwap.js`.

## Coordinate registration

BodyParts3D structures share a common source coordinate frame. Anatomica therefore avoids independently centering every related model.

- `humerus` establishes the shoulder/arm source-to-scene registration used by structures such as scapula, clavicle, and shoulder muscles.
- `radius` establishes the forearm/wrist/hand source-to-scene registration used by forearm muscles, carpals, metacarpals, phalanges, intrinsic hand muscles, flexor retinaculum, and hand vessels.

This preserves source-space anatomical relationships better than fitting each structure to a separate procedural envelope.

## Current converted upper-limb scope

The repository now contains production GLB assets spanning:

- shoulder girdle: humerus, scapula, clavicle
- arm: biceps brachii, triceps brachii, deltoid, brachialis, coracobrachialis, teres major
- rotator cuff: supraspinatus, infraspinatus, teres minor, subscapularis
- superficial forearm: pronator teres, FCR, palmaris longus, FCU, brachioradialis, ECRL, ECRB, extensor digitorum, ECU, supinator
- wrist/hand skeleton target: eight carpals, five metacarpals, and fourteen phalanges
- deep forearm/thumb target: FDS, FDP, FPL, pronator quadratus, APL, EPB, EPL, extensor indicis, extensor digiti minimi
- intrinsic hand target: thenar, hypothenar, lumbrical, palmar-interosseous, and dorsal-interosseous structures
- wrist roof: flexor retinaculum
- vessels: brachial artery, cephalic vein, radial artery, ulnar artery, superficial palmar arch, deep palmar arch

Exact FMA and BodyParts3D representation identifiers are recorded in `src/data/modelManifest.js`.

## Status vocabulary

`modelManifest.js` intentionally separates conversion from anatomical validation:

- `pending-source` — no approved production source is yet mapped.
- `source-identified` — an official source concept and output path are mapped; the application may attempt to load the model when present.
- `converted` — a GLB has been generated and confirmed in the repository, but visual validation may still be pending.
- `ready` — the production asset has passed Anatomica's visual/anatomical validation checklist.

A successful conversion alone is **not** enough to mark a model `ready`.

## Ready-state validation checklist

Before a model is marked `ready`, it must meet all of the following requirements:

1. Source structure/FMA identifier is recorded.
2. License is verified from the original source.
3. Geometry has been visually checked for the intended anatomical structure.
4. Laterality is confirmed.
5. Orientation is correct in the Anatomica scene.
6. Scale and spatial relationship to neighboring structures are anatomically coherent.
7. Mesh names are mapped to the correct Anatomica structure key.
8. Browser rendering and interaction work without material, clipping, or loading failures.
9. File size remains appropriate for web delivery.
10. Attribution remains documented here.

## Nerve geometry policy

The current median, musculocutaneous, radial, ulnar, and axillary nerve paths are intentionally simplified educational geometry. Their manifest entries remain `pending-source` until suitable production-quality anatomical nerve geometry is verified. Anatomica does not fabricate BodyParts3D identifiers for structures that have not been confirmed in the official source tables.

## Why Anatomica uses a manifest

The rendering engine should not need to know where a model came from. `modelManifest.js` provides one controlled layer for paths, anatomical systems, readiness, identifiers, and provenance. Medical knowledge remains in `src/data/upperLimb.js`, while production geometry remains in `public/models/`.

This separation lets Anatomica replace, improve, or validate a 3D mesh without rewriting the educational content or interaction system.
