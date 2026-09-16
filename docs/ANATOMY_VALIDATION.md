# Anatomica anatomy validation checklist

This document separates **source identification and conversion** from **visual/anatomical validation**.

A GLB can be present in the app and still require validation. `converted` means that the source structure has been identified, converted to browser-ready GLB, and registered into the scene. It does **not** mean the structure has been clinically validated.

## Sign-off criteria

Before a structure is described as validated, review all of the following:

- **Identity** — the rendered mesh matches the intended anatomical structure and documented source label.
- **Laterality** — right-sided structures remain right-sided after registration.
- **Orientation** — proximal/distal, anterior/posterior, and medial/lateral relationships are sensible.
- **Scale** — the structure is proportionate to its anatomical neighbors.
- **Registration** — shared BodyParts3D structures preserve plausible source-space relationships after transformation.
- **Completeness** — multipart muscles contain the intended heads/parts and no unrelated mesh fragments.
- **Relationship checks** — clinically important neighboring structures appear in sensible relative positions.
- **Interaction** — selection, isolate, transparency, study modes, and clinical-case highlighting target the correct structure key.
- **Color semantics** — bones, muscles, nerves, arteries, veins, and ligaments use the intended visual system.
- **Performance** — the structure loads in the production build without materially degrading interaction.

## v0.3 validation order

### 1. Core anchors

- Humerus
- Radius
- Ulna
- Scapula
- Clavicle

These establish the scene registration used by many dependent structures.

### 2. Shoulder and arm

- Deltoid
- Supraspinatus
- Infraspinatus
- Teres minor
- Subscapularis
- Teres major
- Biceps brachii
- Triceps brachii
- Brachialis
- Coracobrachialis

### 3. Forearm

Review superficial and deep flexor/pronator and extensor/supinator groups in compartment mode, paying particular attention to elbow origin relationships and distal tendon direction.

### 4. Wrist and hand skeleton

Validate the eight carpal bones as a coherent unit before judging individual hand structures. Then review metacarpals and phalanges for order, laterality, scale, and continuity.

### 5. Hand muscles and retinaculum

Review thenar, hypothenar, lumbrical, and interosseous groups together with the flexor retinaculum and digital flexor/extensor relationships.

### 6. Vessels and teaching overlays

Review brachial, radial, and ulnar arterial geometry and the palmar arches. Procedural nerve paths remain educational overlays unless a validated production nerve source is introduced.

## Clinical-mode checks

For every clinical case:

1. The primary lesion/focus structure is shown in **red**.
2. Functionally affected structures are shown in **amber**.
3. Relevant context anatomy remains visible without dominating the lesion.
4. The camera frames the region rather than the entire limb when possible.
5. Mechanism, expected deficit, exam clue, and clinical pearl agree with the highlighted anatomy.
6. Exiting Clinical Cases restores the previous normal system state.

## Current status

The v0.3 pipeline contains converted BodyParts3D anatomy plus procedural teaching overlays. The validation checklist above is the standard for future sign-off. No structure should be promoted from conversion-ready/converted status to a stronger validation claim solely because it builds or renders successfully.
