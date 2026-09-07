"""Blender helper: import one OBJ, normalize it, and export a compact GLB.

Usage:
  blender --background --python scripts/obj_to_glb.py -- input.obj output.glb
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
    # Blender 4.x uses wm.obj_import; older versions use import_scene.obj.
    if hasattr(bpy.ops.wm, "obj_import"):
        bpy.ops.wm.obj_import(filepath=str(path))
    else:
        bpy.ops.import_scene.obj(filepath=str(path))


def normalize_selected() -> None:
    objects = [obj for obj in bpy.context.selected_objects if obj.type == "MESH"]
    if not objects:
        raise RuntimeError("No mesh objects were imported")

    # Join parts so one anatomical structure behaves as one selectable object.
    bpy.context.view_layer.objects.active = objects[0]
    for obj in objects:
        obj.select_set(True)
    if len(objects) > 1:
        bpy.ops.object.join()

    obj = bpy.context.view_layer.objects.active
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Center the object's bounding box around the origin without altering shape.
    corners = [obj.matrix_world @ obj.bound_box[i] for i in range(8)]
    center = sum(corners, corners[0].copy() * 0) / 8
    obj.location -= center

    # Normalize the largest dimension to 4 Blender units. Final anatomical
    # registration/alignment remains an Anatomica manifest responsibility.
    max_dim = max(obj.dimensions)
    if max_dim > 0:
        scale = 4.0 / max_dim
        obj.scale = (scale, scale, scale)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    obj.name = "AnatomicaStructure"


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
    if len(args) != 2:
        raise SystemExit("Expected input OBJ and output GLB paths after --")
    input_path, output_path = map(Path, args)
    clear_scene()
    import_obj(input_path)
    normalize_selected()
    export_glb(output_path)
    print(f"Exported {output_path}")


if __name__ == "__main__":
    main()
