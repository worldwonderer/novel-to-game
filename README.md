# NovelToGame

> Turn a novel in any language into a source-grounded, fully playable game.

[![Validate](https://github.com/worldwonderer/novel-to-game/actions/workflows/validate.yml/badge.svg)](https://github.com/worldwonderer/novel-to-game/actions/workflows/validate.yml) [![Latest release](https://img.shields.io/github/v/release/worldwonderer/novel-to-game?display_name=tag&sort=semver)](https://github.com/worldwonderer/novel-to-game/releases/latest) [![License](https://img.shields.io/github/license/worldwonderer/novel-to-game)](LICENSE) [![GitHub stars](https://img.shields.io/github/stars/worldwonderer/novel-to-game?style=flat&logo=github)](https://github.com/worldwonderer/novel-to-game/stargazers)

NovelToGame is an open-source Agent Skills toolkit for Claude Code, Codex, and Kimi Code. It turns novel adaptation into a staged workflow: source analysis, concept selection, world and art direction, implementation, and runtime QA.

Bring a novel in any language and choose the target runtime. Generated artifacts follow the requested language; build and QA stay on the chosen platform instead of silently falling back to an easier substitute.

[中文](README_ZH.md) · [Play Online](#play-online) · [Quick Start](#quick-start) · [Workflow](#workflow) · [Skills](#skills) · [Artifacts](#artifacts) · [Contributing](#contributing)

## Play Online

Three finished adaptations, each playable in a browser right now, each linked to the complete case study behind it: source provenance, concept trade-offs, game and art direction, runnable source, and QA evidence — including the gates that have not passed.

### Journey to the West · Three Borrowings of the Banana Fan

[![Wukong's party faces the Bull Demon King on the Jilei Mountain stage under the third fan's rain, five-element badges on both sides and a live command tray below](examples/journey-to-the-west/screenshots/hero.jpg)](https://xiyouji.vibecoco.ai)

**One wave of a fan blew you fifty thousand li. Take the mountain back one turn at a time.**

Command Wukong's party through the three borrowings of the Banana-Leaf Fan: read the five-element wheel, set a formation, transform your way in where force will not work, and turn a demon king who outclasses you into a rainstorm over the Mountain of Flames.

**[Play in browser](https://xiyouji.vibecoco.ai)** · [Read the case study](examples/journey-to-the-west/) · 45–90 min campaign · all ages · graybox

### Jin Ping Mei · Ledger of Desire

[![Three women of the Ximen household look straight at the player; one holds out a brass key](examples/jin-ping-mei/screenshots/title.jpg)](https://jinpingmei.vibecoco.ai)

**Choose whose door you enter tonight. Find out whose door knocks in the morning.**

Six nights, three courtyards. Spend each day converting silver, standing and secrets into the right to choose — then wake up and settle what the other two are owed.

**[Play in browser](https://jinpingmei.vibecoco.ai)** · [Read the case study](examples/jin-ping-mei/) · 20–30 min run · 18+ · graybox

### Project Plateau · The Lost World · 3D

A real-time **first-person 3D field-photography game** adapted from Arthur Conan Doyle's *The Lost World*. Cross a connected plateau, observe a living Iguanodon family, expose four glass plates under aerial pressure, and return with the views that survived.

Play the full expedition on desktop, or watch the 15-second gameplay preview on other devices.

#### 36-second Remotion launch trailer

The trailer follows [the verified same-take gameplay route](examples/project-plateau/qa/evidence/remotion-launch-trailer-2026-08-04.md) and uses an approved Fish Audio synthetic narration. Captions preserve the complete story when muted.

https://github.com/user-attachments/assets/edde9933-c932-4bd9-9b4c-4587bbc516f7

**[Play in your browser — no install](https://plateau.vibecoco.ai)** · [Read the case study](examples/project-plateau/) · [Share feedback](https://github.com/worldwonderer/novel-to-game/discussions/7) · 1–3 min run · desktop WebGL2 · playable prototype

## Why NovelToGame

A one-line “turn this book into a game” prompt often produces a generic reskin or a clickable plot summary. NovelToGame keeps the adaptation traceable and gives each major decision a clear owner:

- **Source-grounded adaptation:** extract rules, spaces, character agency, conflicts, and visual anchors with citations;
- **Real game design:** turn source evidence into player verbs, systems, levels, feedback, failure, and outcomes;
- **Target-runtime delivery:** build for the approved platform or engine without implementation silently redesigning the game;
- **Optional, restrained voice:** synthesize only approved high-value lines at build time, keep subtitles and mute fallbacks, and never send the whole novel to a TTS provider by default;
- **Evidence-based QA:** verify startup, input, state changes, complete runs, outcomes, restart, and target display modes and devices.

## Quick Start

### 1. Install the seven skills

| Agent CLI | Install | Invoke |
|---|---|---|
| Claude Code | `npx skills add worldwonderer/novel-to-game -g -y -a claude-code -s '*'` | `/novel-to-game` |
| Codex | `npx skills add worldwonderer/novel-to-game -g -y -a codex -s '*'` | `$novel-to-game` |
| Kimi Code | `npx skills add worldwonderer/novel-to-game -g -y -a kimi-code-cli -s '*'` | `/skill:novel-to-game` |

Install adapters for all three CLIs on the same machine:

```bash
npx skills add worldwonderer/novel-to-game -g -y -s '*' \
  -a claude-code -a codex -a kimi-code-cli
```

Cloning the repository also enables project-local skill discovery in all three CLIs.

### 2. Start an adaptation

Give the agent a novel file, directory, or link:

```text
Use novel-to-game quick to adapt this novel into a fully playable game.
Recommend the target platform, genre, and engine from the source, and keep the first build to about 15 minutes.
Let the player enter the world as an original character with a new playable route through its conflict.
```

`quick` is the hands-off option: after confirming your requirements, the agent compares three ways to turn the novel into a game, chooses the most promising one, and continues through design, build, and QA. Choose `director` if you want to review those three proposals and decide which one should be built.

<details>
<summary><strong>Native plugin installation</strong></summary>

#### Claude Code

```text
/plugin marketplace add worldwonderer/novel-to-game
/plugin install novel-to-game@novel-to-game-skills
/novel-to-game:novel-to-game quick
```

#### Codex

```bash
codex plugin marketplace add worldwonderer/novel-to-game
codex plugin add novel-to-game@novel-to-game-skills
```

#### Kimi Code 0.27 or newer

```text
/plugins install https://github.com/worldwonderer/novel-to-game
/reload
/skill:novel-to-game quick
```

</details>

## Workflow

The orchestrator locks `PRODUCT_BRIEF.md`, then hands the adaptation through six stages with separate ownership. Failed QA returns to the build for another repair pass until the evidence clears the gate.

```text
Novel → Source analysis → Concept → World design → Art direction → Build ⇄ QA → Playable game
```

Concept selection, experience and level design, and art direction remain separately reviewable. Build targets the chosen runtime; QA verifies that same runtime with real execution evidence. If art direction selects voice, build-time TTS is optional and provider-neutral: line-level rights, request fingerprints, local audio, subtitles, failure fallback, decode and loudness evidence, and human listening review are required before release.

## Skills

| Skill | Responsibility |
|---|---|
| [`novel-to-game`](skills/novel-to-game/) | Confirm requirements, choose a mode, orchestrate stage handoffs, and recover progress |
| [`novel-game-analyze`](skills/novel-game-analyze/) | Extract cited rules, verbs, spaces, agents, systems, and signature moments |
| [`game-concept`](skills/game-concept/) | Generate three materially different directions, reject invalid options, and choose one |
| [`game-world-design`](skills/game-world-design/) | Define the player promise, core loop, world response, systems, levels, failure, and outcomes |
| [`game-art-direction`](skills/game-art-direction/) | Define camera, composition, visual grammar, colour, light, materials, HUD, motion, and sound |
| [`game-build`](skills/game-build/) | Compress an approved build brief and drive implementation to a fully playable build |
| [`game-qa`](skills/game-qa/) | Verify commands, states, screenshots, and real play paths without overstating subjective results |

## Artifacts

Each run creates a compact, self-contained adaptation workspace:

```text
game-adaptations/<project>/
  PRODUCT_BRIEF.md
  analysis/SOURCE_BIBLE.md
  concepts/CONCEPT.md
  design/GAME_DESIGN.md
  design/ART_DIRECTION.md
  build/BUILD_BRIEF.md
  build/app/
  qa/QA_REPORT.md
  _progress.md
```

Core design documents remain independent of any single model or game engine. The approved target runtime determines the implementation and QA environment.

## Contributing

Reproducible bugs, skill gaps backed by evidence, and example proposals that demonstrate a distinct adaptation lesson are welcome. Read the [contribution guide](CONTRIBUTING.md) and use the repository's structured issue and pull request templates.

## License

NovelToGame is released under the [MIT License](LICENSE).

## Acknowledgments

Thanks to the [linux.do](https://linux.do) community for early feedback and support.
