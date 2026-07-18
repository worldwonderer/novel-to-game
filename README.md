# NovelToGame

> Turn any novel into a playable game.

NovelToGame is an open-source novel-to-game and story-to-game skill set for
Claude Code, Codex, and Kimi Code. It extracts gameable truth from fiction,
chooses a strong adaptation concept, designs the playable world and visual
experience, then hands a bounded build brief to capable coding agents.

[Chinese README](README_ZH.md)

## Why It Exists

Frontier coding models already know how to build web games. The scarce work
is deciding what the novel should become: who the player is, what they do, how
the world reacts, what the game looks like, and what a complete playable prototype
must prove. NovelToGame captures that adaptation know-how without teaching the
model framework syntax it already knows.

## Workflow

```text
novel or oh-story project
  -> game-oriented source bible
  -> three materially different concepts
  -> selected player fantasy and core loop
  -> playable systems and level rhythm
  -> art direction and signature frames
  -> provider-neutral build brief
  -> agentic implementation with visual feedback
  -> deterministic game QA
```

## Skills

| Skill | Purpose |
|---|---|
| `novel-to-game` | Orchestrate the complete pipeline in quick or director mode |
| `novel-game-analyze` | Extract canon, verbs, systems, spaces, agents, and signature moments |
| `game-concept` | Propose, reject, and choose between genuinely different games |
| `game-world-design` | Define player experience, world behavior, systems, levels, and the playable prototype |
| `game-art-direction` | Define visual pillars, camera, world grammar, HUD, feedback, and signature frames |
| `game-build` | Produce the build brief and drive an implementation agent to a verified build |
| `game-qa` | Verify startup, rendering, interaction, state transitions, completion, and restart |

## Install With Agent Skills

Install all seven skills for the CLI you use:

| Agent CLI | Install command | Invoke |
|---|---|---|
| Claude Code | `npx skills add worldwonderer/novel-to-game -g -y -a claude-code -s '*'` | `/novel-to-game` |
| Codex | `npx skills add worldwonderer/novel-to-game -g -y -a codex -s '*'` | `$novel-to-game` |
| Kimi Code | `npx skills add worldwonderer/novel-to-game -g -y -a kimi-code-cli -s '*'` | `/skill:novel-to-game` |

To install all three adapters at once, repeat `-a`:

```bash
npx skills add worldwonderer/novel-to-game -g -y -s '*' \
  -a claude-code -a codex -a kimi-code-cli
```

Cloning the repository also enables project-local discovery in all three CLIs.

## Native Plugin Install

Claude Code:

```text
/plugin marketplace add worldwonderer/novel-to-game
/plugin install novel-to-game@novel-to-game-skills
/novel-to-game:novel-to-game quick
```

Codex:

```bash
codex plugin marketplace add worldwonderer/novel-to-game
codex plugin add novel-to-game@novel-to-game-skills
```

Kimi Code 0.27 or newer:

```text
/plugins install https://github.com/worldwonderer/novel-to-game
/reload
/skill:novel-to-game quick
```

This targets the current [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code)
CLI, not the retired Python `kimi-cli` package.

## Quick Start

```text
Turn this novel into a complete 15-minute web game with novel-to-game quick.
The player should enter the world as an original character rather than replay
the protagonist's exact plot.
```

Use `director` mode when you want to choose between three concept directions
before world design begins.

## Language And Culture

- Source novels can be in any language.
- Planning artifacts follow the requested language, or the conversation language
  when unspecified. NovelToGame does not duplicate every document bilingually.
- Source quotations stay in the original language, with a consistent terminology
  table when translation or transliteration is needed.
- Benchmark research covers both the source culture and the target-language game
  market. Mechanics may transfer; cultural symbols, humor, values, and market
  assumptions require separate evidence.
- Game design declares the launch UI language and any additional locales. Build
  and QA keep player-facing text replaceable, readable, and culturally accurate.

## Output

Each run creates a compact adaptation workspace:

```text
game-adaptations/<project>/
  analysis/SOURCE_BIBLE.md
  concepts/CONCEPT.md
  design/GAME_DESIGN.md
  design/ART_DIRECTION.md
  build/BUILD_BRIEF.md
  build/app/
  qa/QA_REPORT.md
  _progress.md
```

The build is model-neutral. Provider choice changes how the approved brief is
executed, not the game vision.

## Example

[Journey to the West](examples/journey-to-the-west/) demonstrates the complete
novel-to-game planning handoff from the full 100-chapter public-domain Chinese
text to **Three Borrowings of the Banana Fan**, a deterministic turn-based
stealth tactics prototype. The example includes genre positioning,
gameplay benchmarks, game and art direction, and a provider-neutral build brief.

## Current Scope

The first release targets complete, short web game prototypes. It verifies that
a game runs, responds, reaches a designed outcome, and restarts; it does not claim to measure long-term fun, economy balance,
or commercial readiness. Imported fiction must be content the user is allowed
to adapt, especially before publishing generated assets or builds.

## Validate

```bash
python3 scripts/validate_repo.py
python3 -m unittest discover -s tests -v
```

## License

MIT

## Design References

NovelToGame's compact planning gates were cross-checked against the design roles
and templates in [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)
and the player-facing design, game-feel, UI, and visual review methods in
[threejs-game-skills](https://github.com/majidmanzarpour/threejs-game-skills).
NovelToGame deliberately excludes their engine architecture, implementation recipes,
large studio-agent hierarchy, and asset-provider pipelines.
