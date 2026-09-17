from pathlib import Path

path = Path('src/main.js')
text = path.read_text()
old = ": '<p class=\"mastery-empty\">Nothing is currently flagged by the learner's latest confidence-rated responses.</p>';"
new = ': `<p class="mastery-empty">Nothing is currently flagged by the learner\'s latest confidence-rated responses.</p>`;'
count = text.count(old)
if count != 1:
    raise SystemExit(f'Expected one build-error anchor, found {count}')
path.write_text(text.replace(old, new, 1))
