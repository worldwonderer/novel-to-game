---
name: game-build
description: "Build an approved novel adaptation for its selected target runtime. Compress GAME_DESIGN and ART_DIRECTION into a focused BUILD_BRIEF, implement the selected experience profile and a complete experience flow, and iterate from real runs and evidence. Use for implement the approved interactive story or game design, build the playable prototype, turn this design into a running adaptation. 小说改编构建执行。把 GAME_DESIGN 与 ART_DIRECTION 压缩成聚焦的 BUILD_BRIEF，在目标运行环境实现选定体验档案和完整 experience flow，并通过真实运行迭代。"
---
# 游戏与互动叙事构建

实现已经批准的体验与美术方向。读取
[build-brief-contract.md](references/build-brief-contract.md)、`GAME_DESIGN.md` 与 `ART_DIRECTION.md`。

产物语言由 `PRODUCT_BRIEF.md` 锁定；未锁定时跟随对话语言，不默认产出中文。

## 构建目标

按 PRODUCT_BRIEF 锁定的平台、引擎、目标运行时、显示、输入、范围、分级和联网边界交付。
BUILD_BRIEF 压缩以下内容：

- 体验档案与玩家承诺；
- 一条完整 experience flow；
- 会改变场景、人物、规则或结果的状态因果；
- 第一场景、关键节点、招牌时刻和设计结果；
- 界面语言、人物声口和反馈；
- 运行方式、完成度、验证强度和当前限制。

实现模型根据当前技术栈决定架构、文件拆分、渲染方式和资产管线。

## 实现体验档案

- 把场景、说话者、逐字文案、选项、隐藏状态名、写入/读取点与结果文案维护在单一内容源，界面、
  状态机与测试读取同一份定义，不复制易漂移的台词；
- 用场景数据组织时间、地点、在场人物、对白、玩家介入和离场状态；
- 用人物状态保存目标、知识、态度与具体记忆；
- 用事实记录承诺、证词、物件、公开立场和关键行动；
- 为 GAME_DESIGN 声明的关键事实实现后续读取点；
- 让每次选择先触发可见即时反应，再由后续对白、物件、人物站位、可达内容或结果形成延迟回响；
- 让场景、对白、人物行动、可达信息、规则和结局呈现因果；
- 实现体验档案声明的核心动作、目标、空间、反馈和失败恢复；
- 在同一状态模型中保存需要互相影响的剧情事实与系统状态；
- 存档保存恢复当前体验所需的场景、事实、人物记忆和系统状态。

## 可选生产合同

- 采用语音时读取 [tts-production-contract.md](references/tts-production-contract.md)；优先构建期生成本地
  资产，运行时远程合成必须获 brief 批准，密钥只保存在受信服务端；
- 采用动态媒体时读取 [generative-media-pipeline.md](references/generative-media-pipeline.md)；
- 采用实时生成式 3D 生物时读取
  [generated-3d-creature-pipeline.md](references/generated-3d-creature-pipeline.md)；
- 常规生产技巧按需读取 [production-techniques.md](references/production-techniques.md)。

## 最小完成循环

1. 先实现从 clean start 到一个设计结果再回到初态的完整 experience flow；
2. 回写实际 toolchain、install、build/export、start 与 verify 命令和版本；
3. 运行一条权威验证命令；
4. 在 `testedRuntime` 使用真实输入走完整路径；
5. 用最少 checkpoint 记录场景或关卡、关键状态、玩家画面、结果与重开；
6. 根据真实运行修复阻断错误、资源失败、状态错读和连续性问题；
7. 达到 `targetFinish` 对应的焦点资产与演出；
8. 复跑权威命令并更新构建期运行记录与 limitations。

## 输出

生成 `build/BUILD_BRIEF.md`、实际候选和 `build/verification-candidate.json`。证据保存在工作区持久路径。
BUILD_BRIEF 在完成后记录实际命令、最终范围、验证结果和当前限制。

构建阶段提供候选与执行事实；`game-qa` 独立运行同一候选，并负责最终的 `qa/verification.json` 与
验证结论。
