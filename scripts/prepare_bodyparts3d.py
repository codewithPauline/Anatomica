#!/usr/bin/env python3
"""Download BodyParts3D and prepare Anatomica's first upper-limb assets.

The full upstream archive is cached outside public/. Only selected OBJ files are
extracted. With --convert, Blender combines multi-part structures (for example,
the heads of biceps brachii) into one browser-ready GLB per Anatomica structure.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from pathlib import Path

ARCHIVE_URL = "https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_BP3D_4.0_obj_99.zip"

STRUCTURES = {
    "humerus": ["BP9206.obj"],
    "radius": ["BP8464.obj"],
    "ulna": ["BP8233.obj"],
    "biceps-brachii": ["BP5558.obj", "BP5566.obj"],
    "triceps-brachii": ["BP5562.obj", "BP5550.obj", "BP5564.obj"],
    "brachial-artery": ["BP6020.obj"],
    "cephalic-vein": ["BP5943.obj"],
}

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".asset-cache"
ZIP_PATH = CACHE / "isa_BP3D_4.0_obj_99.zip"
SOURCE_DIR = ROOT / "assets" / "source" / "bodyparts3d" / "upper-limb"
OUTPUT_DIR = ROOT / "public" / "models" / "upper-limb"
BLENDER_SCRIPT = ROOT / "scripts" / "obj_to_glb.py"


def download_archive() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    if ZIP_PATH.exists() and ZIP_PATH.stat().st_size > 1_000_000:
        print(f"Using cached archive: {ZIP_PATH}")
        return
    print("Downloading BodyParts3D 4.0 99% IS-A archive (~136 MB)...")
    urllib.request.urlretrieve(ARCHIVE_URL, ZIP_PATH)
    print(f"Saved: {ZIP_PATH}")


def extract_targets() -> dict[str, list[Path]]:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    extracted: dict[str, list[Path]] = {}
    with zipfile.ZipFile(ZIP_PATH) as archive:
        members = {Path(name).name: name for name in archive.namelist()}
        for structure, filenames in STRUCTURES.items():
            extracted[structure] = []
            for filename in filenames:
                member = members.get(filename)
                if not member:
                    raise FileNotFoundError(f"{filename} was not found in the BodyParts3D archive")
                destination = SOURCE_DIR / filename
                with archive.open(member) as src, destination.open("wb") as dst:
                    shutil.copyfileobj(src, dst)
                extracted[structure].append(destination)
                print(f"Extracted {structure}: {destination.name}")
    return extracted


def convert_with_blender(extracted: dict[str, list[Path]]) -> None:
    blender = shutil.which("blender")
    if not blender:
        raise RuntimeError(
            "Blender was not found on PATH. Install Blender, then rerun with --convert, "
            "or convert the extracted OBJ files manually to GLB."
        )
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for structure, paths in extracted.items():
        output = OUTPUT_DIR / f"{structure}.glb"
        cmd = [
            blender,
            "--background",
            "--python",
            str(BLENDER_SCRIPT),
            "--",
            *(str(path) for path in paths),
            str(output),
        ]
        print(f"Converting {structure}: {', '.join(path.name for path in paths)} -> {output.name}")
        subprocess.run(cmd, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--convert", action="store_true", help="Convert extracted OBJ files to GLB with Blender")
    args = parser.parse_args()

    try:
        download_archive()
        extracted = extract_targets()
        if args.convert:
            convert_with_blender(extracted)
        else:
            print("\nOBJ extraction complete. Rerun with --convert after Blender is installed to create GLB files.")
        print("\nSource: BodyParts3D / Database Center for Life Science — CC BY 4.0. See ASSETS.md.")
        return 0
    except Exception as exc:
        print(f"Asset preparation failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
