---
name: game-qa
description: "Verify a novel adaptation with evidence on its selected target runtime. Run the actual build and prove launch, changing output, real input, a complete experience flow, a designed outcome, and restart. Trace the specific scene, character, choice, system, and consequence promises declared by the selected concept. Use for test a generated game, QA an interactive story, verify a game build. 小说改编证据化验证。在目标运行环境中实际启动候选，验证启动、变化画面、真实输入、完整体验流程、设计结果与重开，并追踪选定概念承诺的场景、人物、选择、系统和后果。"
---
# 游戏与互动叙事验证

验证批准后的体验是否真实运行。读取
[qa-contract.md](references/qa-contract.md)、`PRODUCT_BRIEF.md`、`CONCEPT.md`、`GAME_DESIGN.md` 与
`BUILD_BRIEF.md`。需要设计项目测试路径时同读
[test-design-method.md](references/test-design-method.md)。

产物语言由 `PRODUCT_BRIEF.md` 锁定；未锁定时跟随对话语言，不默认产出中文。

## 验证范围

三个 profile 累加玩家实际经历的检查：

- `smoke`：launch、render、input、experienceFlow、outcome、restart；
- `delivery`：smoke 加目标运行时、目标显示模式和首次上手；
- `release`：delivery 加目标设备性能、必要资产降级和独立试玩。

语音、多语言、无障碍、生成媒体和连续 3D 在项目采用这些能力时进入对应检查；语音同时验证字幕、
静音/缺音和失败降级。

## 执行

1. 读取 `assuranceProfile`、`experienceProfile`、`targetRuntime`、`testedRuntime` 和权威验证命令；
2. 独立运行权威命令，记录命令、退出码、环境和实际失败；
3. 在 `testedRuntime` 从 clean start 走一条完整路径，使用真实输入到达设计结果并重开；
4. 给同一次完整运行分配 `runId`，让基础检查指向该运行及其证据；
5. 按 CONCEPT 与 GAME_DESIGN 已声明的体验承诺检查设计因果；
6. 对关键分支走正向与反向路径，证明已选事实被消费且未选事实不会串线；
7. 记录当前 profile 的结论、限制和问题归属。

## 按设计承诺追踪路径

每条 complete run 记录：起始状态、玩家意图与实际输入、人物或世界回应、状态变化、玩家可感知结果、
终点和重开状态。

场景、人物、知识差、证词、物件或关键选择承担体验时，追踪相关事实的写入、后续读取与连续性。
关键人物使用自己已经获得的信息，路径到达 GAME_DESIGN 声明的结果。

动作、规则、资源或空间承担体验时，追踪核心动作、状态变化、反馈、推进、结果与恢复。采用的代表
局面来自 GAME_DESIGN 已声明的规则。

剧情事实与系统状态存在连接时，逐条验证概念承诺的连接方向。概念承诺双向影响时，两条方向都
进入代表路径。

自动化证明路径、状态、文案变体和可达性，不能证明文案自然、人物魅力、沉浸、选择重量或主观
节奏。此类结论需要独立文案审查或目标玩家试玩；所有者自检只标记 provisional，不签发最终体验
质量 PASS。

## 输出

生成：

- `qa/verification.json`：机器事实源，使用 schema v3，记录 profile、状态、权威命令、complete run、
  checks 与 limitations；
- `qa/QA_REPORT.md`：人读摘要，记录环境、命令、路径、结论、问题与未测试范围；
- `qa/PLAYTEST_PROTOCOL.md`：项目需要目标玩家判断人物、节奏、手感或理解时生成。

状态使用 `NOT_RUN`、`FAIL`、`PASS`。每项 PASS 指向工作区内可复核证据，并用 `runId` 关联同一次
complete run。体验感受以试玩观察和玩家原话记录。
