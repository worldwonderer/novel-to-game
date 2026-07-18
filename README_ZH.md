# NovelToGame

> 把任何小说变成可玩的游戏。

NovelToGame 是一套适配 Claude Code、Codex 和 Kimi Code 的小说转游戏技能。它不重复
教授强模型已经掌握的 React、Three.js 或游戏代码，而是解决真正稀缺的工作：从小说中
提取可玩世界，选择正确的游戏形态，定义玩家体验和视觉方向，再让编码智能体完成实现和自测。

## 流程

```text
小说或 oh-story 工程
  -> 游戏化拆解
  -> 三个差异化游戏概念
  -> 玩家幻想与核心循环
  -> 游戏系统与关卡节奏
  -> 美术方向与签名画面
  -> 模型无关的构建说明
  -> 智能体运行、截图、修复
  -> 证据化游戏质量验证
```

## 技能

| 技能 | 职责 |
|---|---|
| `novel-to-game` | quick/director 两种模式的总入口 |
| `novel-game-analyze` | 提取规则、动作、空间、角色、系统和标志性场面 |
| `game-concept` | 生成、淘汰并选择三个真正不同的游戏方案 |
| `game-world-design` | 设计玩家体验、动态世界、系统、关卡和完整可玩原型 |
| `game-art-direction` | 定义视觉支柱、镜头、世界语法、界面、反馈和签名画面 |
| `game-build` | 形成构建说明，并驱动强模型实现和视觉迭代 |
| `game-qa` | 验证启动、画面、交互、状态、胜负与重开 |

## 通过 Agent Skills 安装

| Agent CLI | 安装命令 | 调用方式 |
|---|---|---|
| Claude Code | `npx skills add worldwonderer/novel-to-game -g -y -a claude-code -s '*'` | `/novel-to-game` |
| Codex | `npx skills add worldwonderer/novel-to-game -g -y -a codex -s '*'` | `$novel-to-game` |
| Kimi Code | `npx skills add worldwonderer/novel-to-game -g -y -a kimi-code-cli -s '*'` | `/skill:novel-to-game` |

同时安装三端：

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

这里适配的是当前 [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code)，不是
已经迁移的 Python `kimi-cli` 旧包。

快速模式示例：

```text
用 novel-to-game quick 把这本小说做成一个 15 分钟可完整游玩的网页游戏。
玩家以原创身份进入世界，不要逐段复演原作剧情。
```

`quick` 是默认模式，会自动选择证据最强的方案；`director` 模式会先停在概念选择。
第一版面向 10-30 分钟可完整游玩的网页游戏原型，质量验证只证明游戏能运行、能交互、能完成，不把
人工智能的“好玩评分”冒充客观结论。

## 语言与文化

- 小说原文可以是任意语言。
- 策划文档使用用户指定语言；未指定时跟随对话语言，不默认生成中英双份。
- 原文证据保留原语言；需要翻译或音译时维护统一术语表。
- 对标调研同时覆盖原作文化和目标语言游戏市场。玩法原则可以迁移，文化符号、幽默、
  价值关系和市场习惯必须分别验证，不能拿异文化作品生硬套皮。
- 游戏设计明确首发界面语言和其他支持语言；构建与质量验证检查文本可替换、字体完整、
  排版不溢出、关键术语和文化含义准确。

## 示例

[《西游记》](examples/journey-to-the-west/) 示例收录并分析完整公版百回本，再收敛为
《三借芭蕉扇》确定性回合制潜入策略游戏原型。示例包含游戏类型、行业对标、回合规则、
游戏与美术方向和模型无关的构建说明。

## 校验

```bash
python3 scripts/validate_repo.py
python3 -m unittest discover -s tests -v
```
