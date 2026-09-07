"""Blender helper: import one or more OBJ files and export one compact GLB.

Usage:
  blender --background --python scripts/obj_to_glb.py -- input1.obj [input2.obj ...] output.glb
"""

from __future__ import annotations

import sys
from pathlib import Path

import bpy


def argv_after_separator() -> list[str]:
    if "--" not in sys.argv:
        return []
    return sys.argv[sys.argv.index("--") + 1 :]


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def import_obj(path: Path) -> None:
    if hasattr(bpy.ops.wm, "obj_import"):
        bpy.ops.wm.obj_import(filepath=str(path))
    else:
        bpy.ops.import_scene.obj(filepath=str(path))


def collect_meshes():
    return [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]


def normalize_scene() -> None:
    objects = collect_meshes()
    if not objects:
        raise RuntimeError("No mesh objects were imported")

    # Preserve head-level meshes during import, then join them into one selectable
    # Anatomica structure for v0.1. Provenance remains in modelManifest.js/ASSETS.md.
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    if len(objects) > 1:
        bpy.ops.object.join()

    obj = bpy.context.view_layer.objects.active
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    corners = [obj.matrix_world @ obj.bound_box[i] for i in range(8)]
    center = sum(corners, corners[0].copy() * 0) / 8
    obj.location -= center

    max_dim = max(obj.dimensions)
    if max_dim > 0:
        scale = 4.0 / max_dim
        obj.scale = (scale, scale, scale)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    obj.name = "AnatomicaStructure"
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


def export_glb(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(path),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
    )


def main() -> None:
    args = argv_after_separator()
    if len(args) < 2:
        raise SystemExit("Expected one or more input OBJ paths followed by an output GLB path after --")

    input_paths = [Path(value) for value in args[:-1]]
    output_path = Path(args[-1])

    clear_scene()
    for input_path in input_paths:
        import_obj(input_path)
    normalize_scene()
    export_glb(output_path)
    print(f"Exported {output_path} from {len(input_paths)} source mesh(es)")


if __name__ == "__main__":
    main()
