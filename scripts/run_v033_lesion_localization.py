from pathlib import Path
import subprocess

style_path = Path('src/style.css')
style = style_path.read_text()
needle = ".sensory-schematic p { margin: 10px 0 0; color: #7f8997; font-size: 11px; line-height: 1.45; }\n.motor-simulator {"
if needle in style:
    style = style.replace(needle, needle.replace('\n.motor-simulator {', '\n\n.motor-simulator {'), 1)
    style_path.write_text(style)

subprocess.run(['python', 'scripts/patch_v033_lesion_localization.py'], check=True)
