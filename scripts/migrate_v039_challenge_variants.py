from pathlib import Path

path = Path('src/main.js')
text = path.read_text()

replacements = [
    (
        "import { localizationChallenges, localizationChallengeById, localizationChallengesForDifficulty } from './data/localizationChallenges.js';\n",
        "import { localizationChallenges, localizationChallengeById, localizationChallengesForDifficulty } from './data/localizationChallenges.js';\nimport { localizationChallengePresentation, randomChallengeVariantIndex } from './data/challengeVariants.js';\n",
    ),
    (
        "let remediationFocus = null;\nlet localizationChallengeDifficulty = 'adaptive';\n",
        "let remediationFocus = null;\nlet localizationChallengeVariantSelection = {};\nlet localizationChallengeDifficulty = 'adaptive';\n",
    ),
    (
        "function currentLocalizationChallenge() {\n  const id = localizationChallengeSessionIds[localizationChallengeSessionPosition];\n  return localizationChallengeById(id);\n}\n",
        "function currentLocalizationChallenge() {\n  const id = localizationChallengeSessionIds[localizationChallengeSessionPosition];\n  const challenge = localizationChallengeById(id);\n  const variantIndex = localizationChallengeVariantSelection[id] ?? 0;\n  return localizationChallengePresentation(challenge, variantIndex);\n}\n",
    ),
    (
        "  localizationChallengeSessionIds = difficulty === 'remediation'\n    ? pool.map((challenge) => challenge.id)\n    : shuffleChallenges(pool).map((challenge) => challenge.id);\n  localizationChallengeSessionPosition = 0;\n",
        "  localizationChallengeSessionIds = difficulty === 'remediation'\n    ? pool.map((challenge) => challenge.id)\n    : shuffleChallenges(pool).map((challenge) => challenge.id);\n  localizationChallengeVariantSelection = Object.fromEntries(\n    localizationChallengeSessionIds.map((id) => {\n      const challenge = localizationChallengeById(id);\n      return [id, randomChallengeVariantIndex(challenge)];\n    }),\n  );\n  localizationChallengeSessionPosition = 0;\n",
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f'Expected anchor not found:\n{old[:180]}')
    text = text.replace(old, new, 1)

path.write_text(text)
print('Patched src/main.js for stable per-session challenge variants.')
