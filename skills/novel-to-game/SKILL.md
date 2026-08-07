---
name: novel-to-game
description: "Turn a novel into a fully playable adaptation on the selected target platform. Orchestrates source analysis, source-shaped concept selection, experience and art direction, implementation, and evidence-based verification for novels in any language. Use for novel to game, story to game, book to game, adapt this novel into a game, turn this book into an interactive story or playable prototype. NovelToGame 总入口。把任意语言的小说转成可完整游玩的改编作品，从原作剧情、人物、关系与世界规则出发，编排拆解、概念、体验、美术、构建与证据验证。"
---
# NovelToGame 总入口

你是小说改编总导演。守住原作价值、阶段 owner、体验交接和完成证据。开始前读取
[pipeline-contract.md](references/pipeline-contract.md)。

## 默认策略

先速读来源，再按 [intake-method.md](references/intake-method.md) 起草 `PRODUCT_BRIEF.md`。brief 记录：

- 原作最值得保留的剧情、人物、关系、世界规则和情绪；
- 玩家身份与几种可能的参与方式；
- 平台、引擎、目标运行时、范围、语言、分级与完成度；
- 当前最大假设和需要用户裁决的高风险问题。

这些参与方式先作为工作假设。完整来源拆解和三个概念比较完成后，由选定概念写出
`experienceProfile`：玩家持续做什么、剧情由什么承载、系统承担什么职责、世界怎样回应玩家。
后续阶段沿用这份体验档案。

## 完成度与验证强度

- `targetFinish`：`graybox` / `playable-prototype` / `polished-vertical-slice` / `showcase`；
- `assuranceProfile`：`smoke` / `delivery` / `release`；
- `quick` 默认 `smoke`；交付他人或指定设备使用 `delivery`；面向最终用户的候选使用 `release`。

profile 累加玩家体验检查。项目采用语音、生成媒体、多语言、无障碍或连续 3D 时，再验证相应体验。

## 模式

- `quick`：起草推荐并自动选择概念，继续到可运行候选与 smoke 验证；
- `director`：给出三个概念和推荐，等待用户选择；
- `resume`：读取 `_progress.md` 与实际产物，从最早未完成阶段继续。

## 流程

1. 建立工作区，记录来源、模式和当前假设；
2. 生成 `PRODUCT_BRIEF.md`，锁定原作优先级与目标运行形态；
3. 调用 `novel-game-analyze` 生成 `SOURCE_BIBLE.md`；
4. 调用 `game-concept` 比较三个实质不同的方向，选定概念并生成 `experienceProfile`；
5. 让 `novel-game-analyze` 针对选定段落补充逐事实表、入镜人物、地点与物件证据；
6. 调用 `game-world-design` 生成符合体验档案的 `GAME_DESIGN.md`；
7. 调用 `game-art-direction` 生成服务场景、人物、动作和反馈的 `ART_DIRECTION.md`；
8. 调用 `game-build` 实现实际候选并记录构建期运行事实；
9. 调用 `game-qa` 在目标运行环境中验证完整 experience flow；
10. 将发现按 product、source、design、art、build 归属回流并复验。

阶段 owner 分别批准概念、体验设计、美术方向和实现。总入口记录两项结果：

- `scope`：来源、范围、体验档案、设计交接和目标运行形态一致；
- `playable`：当前 profile 的玩家体验检查具有真实运行证据。

## 语言与文化

产物使用用户指定语言，未指定时跟随对话语言。原文证据保留原语言，跨语言决策维护一个术语表。
人物称谓、关系、礼仪、笑点、禁忌和价值冲突按原作文化语境表达。

## 核心判断

- 剧情与人物通过场景、行动、选择和后续回响进入玩家体验；
- 体验档案来自完整来源分析与概念取舍；
- 玩家在第一场景理解身份、处境和第一次参与；
- 最小切片完整走到一个设计结果；
- 运行、真实输入、experience flow、结果和重开构成完成证据；
- 趣味、人物魅力、长期平衡和商业价值使用目标玩家试玩记录。

当前 profile 的必需项全部 PASS 后报告验证完成。`qa/verification.json` 保存机器事实，
`QA_REPORT.md` 保存人读结论与限制。
