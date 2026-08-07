---
name: game-art-direction
description: "Direct the visual, character, scene, interface, motion, and sound language of an approved novel adaptation. Shape how players read people, places, dialogue, choices, actions, and consequences according to the selected experience profile. Use for what should the adaptation look and feel like, direct character and scene presentation, define game art direction. 游戏美术与创意方向。按照选定体验档案定义小说改编中的人物、场景、界面、运动与声音语言，让玩家读懂对白、选择、行动和后果。"
---
# 游戏美术与创意方向

定义玩家怎样看见、听见和读懂已经批准的体验。读取
[art-direction-method.md](references/art-direction-method.md)、`GAME_DESIGN.md` 与 `PRODUCT_BRIEF.md`。

产物语言由 `PRODUCT_BRIEF.md` 锁定；未锁定时跟随对话语言，不默认产出中文。

## 跟随体验档案

- 人物表情、姿态、距离、视线和进退承担关系变化；
- 场景构图交代谁掌握空间、谁在观察、哪些物件值得注意；
- 对白、证词、物件、动作和关键选择拥有清楚的阅读顺序；
- 状态因果通过人物反应、环境变化、镜头、界面和声音被玩家感知；
- 连续场景保持人物身份、服饰、伤势、物件去向、时间与地点一致；
- 目标、威胁、可交互物和空间路线拥有符合当前玩法的视觉区分；
- 界面呈现玩家做当前判断所需的信息。

## 设计内容

1. 定义 3–5 条视觉原则，说明构图、人物、空间、材质、色光和文字如何服务体验；
2. 为主要人物建立可辨识的轮廓、服饰、姿态、表情范围、镜头距离和关系表现；
3. 为关键场景建立时间、地点、焦点、空间层次、人物站位和连续性事实；
4. 定义界面层级、文字排版、对话呈现、证词或系统信息的展开方式；
5. 定义玩家输入、人物反应、动作结果、场景转场和结局的运动与声音；
6. 为标题、主要体验、最高压力和结果各描述一个实际运行时刻；
7. 按 `targetFinish` 选择文字方向、构图草图、style frame 或当前候选 paint-over 作为视觉目标。

## 人物语音与声音

声音方向先定义环境、器物、音乐和反馈。角色语音在它能增加人物身份、关系变化或关键承诺时采用。
先过采用门禁，不因供应商可用或免费而默认加入语音。采用时输出语音策略，记录角色级选角、台词
范围、声口、字幕、静音 / 缺音降级和音色权利，并把生产交给构建阶段。

## 动态媒体

视频、关键帧演出和实时 3D 用镜头边界连接前后体验。每个镜头记录体验作用、参考职责、进入状态、
离开状态、连续性事实和降级表达。

## 输出

生成 `design/ART_DIRECTION.md`，包含：

1. 体验档案与视觉原则；
2. 人物视觉与关系表现；
3. 场景、空间和连续性；
4. 界面、文字与信息层级；
5. 运动、转场、声音与语音策略；
6. 招牌时刻；
7. 视觉目标和资产优先级；
8. 文化、语言、权利与当前风险。

`targetFinish` 需要视觉目标时生成 `design/VISUAL_TARGETS.md` 与工作区内目标图。构建阶段根据批准的
方向选择具体工具和资产管线。
