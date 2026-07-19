# NovelToGame

> 把任何小说变成可玩的网页游戏。

NovelToGame 是一套把小说改编成网页游戏的开源技能，适配 Claude Code、Codex 和 Kimi Code。
它先从原著里找出真正能玩的部分，挑一个合适的改编方向，设计出可玩的世界和画面，再把一份
边界清晰的构建说明交给编码智能体去实现，最后验证成品能不能跑起来。

[English](README.md)

## 为什么需要它

直接把小说丢给模型做游戏，出来的多半是换皮的通用玩法。NovelToGame 解决真正难的那一步：
把这本书特有的规则和情绪变成玩家动作和核心循环，判断它该做成什么游戏，再一路推进到
能玩的原型。

## 流程

一个总入口驱动六个专业阶段，把原始文本一路推进到可验证、可游玩的原型。

```mermaid
flowchart LR
    classDef entry fill:#eef2ff,color:#1e1b4b,stroke:#6366f1,stroke-width:1px
    classDef stage fill:#e8f4fd,color:#0f172a,stroke:#4a9be8,stroke-width:1px
    classDef ship fill:#fce4ec,color:#333,stroke:#e57373,stroke-width:1px

    novel{{"小说 / oh-story 工程"}}:::entry
    orch(["novel-to-game<br/>总入口"]):::entry

    a["novel-game-analyze<br/>源设定圣经"]:::stage
    c["game-concept<br/>三选一概念"]:::stage
    w["game-world-design<br/>系统与关卡"]:::stage
    art["game-art-direction<br/>视觉身份"]:::stage
    b["game-build<br/>构建说明 → 原型"]:::stage
    qa["game-qa<br/>证据化质量验证"]:::ship

    game(["可玩网页游戏"]):::ship

    novel --> orch
    orch --> a --> c --> w --> art --> b --> qa --> game
    qa -.->|未通过| b
```

## 技能

| 技能 | 职责 |
|---|---|
| `novel-to-game` | quick / director 两种模式的完整流程总入口 |
| `novel-game-analyze` | 提取规则、动作、空间、角色、系统与标志性场面，产出源设定圣经 |
| `game-concept` | 生成、淘汰并从三个真正不同的方案中做出选择 |
| `game-world-design` | 设计玩家体验、动态世界、系统、关卡与完整可玩原型 |
| `game-art-direction` | 定义视觉支柱、镜头、世界语法、界面、反馈与签名画面 |
| `game-build` | 形成构建说明，并驱动实现智能体完成一次可验证的构建 |
| `game-qa` | 验证启动、画面、交互、状态转移、通关与重开 |

## 通过 Agent Skills 安装

为你使用的 CLI 安装全部七个技能：

| Agent CLI | 安装命令 | 调用方式 |
|---|---|---|
| Claude Code | `npx skills add worldwonderer/novel-to-game -g -y -a claude-code -s '*'` | `/novel-to-game` |
| Codex | `npx skills add worldwonderer/novel-to-game -g -y -a codex -s '*'` | `$novel-to-game` |
| Kimi Code | `npx skills add worldwonderer/novel-to-game -g -y -a kimi-code-cli -s '*'` | `/skill:novel-to-game` |

同时安装三端，重复 `-a` 即可：

```bash
npx skills add worldwonderer/novel-to-game -g -y -s '*' \
  -a claude-code -a codex -a kimi-code-cli
```

克隆仓库后，三端也都能发现项目内的 7 个技能。

## 原生插件安装

Claude Code：

```text
/plugin marketplace add worldwonderer/novel-to-game
/plugin install novel-to-game@novel-to-game-skills
/novel-to-game:novel-to-game quick
```

Codex：

```bash
codex plugin marketplace add worldwonderer/novel-to-game
codex plugin add novel-to-game@novel-to-game-skills
```

Kimi Code 0.27 或更高版本：

```text
/plugins install https://github.com/worldwonderer/novel-to-game
/reload
/skill:novel-to-game quick
```

这里适配的是当前 [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code)，
不是已经迁移的 Python `kimi-cli` 旧包。

## 快速开始

```text
用 novel-to-game quick 把这本小说做成一个 15 分钟可完整游玩的网页游戏。
玩家以原创身份进入世界，不要逐段复演原作剧情。
```

`quick` 是默认模式，会自动挑证据最强的方案；想在世界设计之前先从三个方向里做选择，
就用 `director` 模式。

## 产出

每次运行都会创建一个紧凑的适配工作区：

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

构建与模型无关：无论用哪个模型，实现的都是同一份已批准的说明，做出来的还是同一个游戏。

## 完整示例 —— 《西游记》

[《西游记》](examples/journey-to-the-west/) 示例展示了完整的小说转游戏策划交接：从完整的
公版百回本中文原著，收敛为《三借芭蕉扇》——一个确定性回合制潜入策略原型。它包含游戏类型
定位、玩法对标、游戏与美术方向，以及一份模型无关的构建说明。

<details>
<summary>展开示例的产出目录树</summary>

```text
examples/journey-to-the-west/
├── source/
│   ├── 西游记.txt          # 完整公版百回本原著
│   └── SOURCE.md           # 来源出处 + 原文导入方式
├── analysis/
│   └── SOURCE_BIBLE.md     # 可玩化正典：规则、动作、空间、角色、标志性场面
├── concepts/
│   └── CONCEPT.md          # 三个差异化概念，含入选方案与关键取舍
├── design/
│   ├── GAME_DESIGN.md      # 玩家幻想、核心循环、系统、关卡、失败/重开、原型范围
│   └── ART_DIRECTION.md    # 视觉支柱、镜头、世界语法、界面、签名画面
├── build/
│   └── BUILD_BRIEF.md      # 交给编码智能体的模型无关、边界清晰的构建说明
└── _progress.md            # 流程运行日志，记录每个阶段的状态
```

该示例是一次策划交接，到构建说明为止。完整运行会继续产出 `build/app/`（已实现的原型）
与 `qa/QA_REPORT.md`（证据化验证），详见 [产出](#产出) 一节。

</details>

## 许可证

MIT
