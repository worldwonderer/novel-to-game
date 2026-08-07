# 构建说明契约

BUILD_BRIEF 让实现模型快速理解体验边界、运行方式和完成证据。

```text
# 成品目标
experienceProfile:
  primaryExperience: [玩家持续经历什么]
  playerParticipation: [玩家持续理解、表达、选择或执行什么]
  storyCarrier: [场景、人物、知识、物件和情节怎样推进]
  systemRole: [规则、资源、空间与反馈承担什么职责]
  worldResponse: [玩家影响怎样被读取]
targetFinish: [逐字继承 PRODUCT_BRIEF]
assuranceProfile: [smoke / delivery / release]
publicationTier: [当前对外声明]
[平台、交付物、受众、切片时长、视口、输入、分级、联网边界]

# 玩家承诺
[玩家是谁、如何持续参与、人物或世界如何回应、目标感受]

# 完整体验流程
[clean start → 第一场景/关卡 → 关键输入 → 因果变化 → 设计结果 → restart]

# 必读设计
[GAME_DESIGN.md, ART_DIRECTION.md]

# 范围
[场景/关卡、人物、关键选择或核心动作、结果、焦点资产]

# 叙事内容源（采用对白/选择时）
[单一内容源路径；scene_id / line_id；说话者；逐字文案；选项行动；隐藏状态名；写入/读取点；
即时反应；延迟回响；结果文案；证据物件与可见状态]

# 运行与验证
toolchain:
  targetPlatform: [批准平台]
  targetRuntime: [计划交付环境]
  testedRuntime: [本次实际启动环境]
  engine: [实际引擎/框架]
  engineVersion: [实际版本]
  runtimeVersion: [实际版本]
  packageManager: [name@version 或 none]
commands:
  install: [命令或 NONE]
  buildOrExport: [命令或 NONE]
  start: [命令]
  verify: [权威验证命令]
verificationCandidate: build/verification-candidate.json
verification:
  completeRun: qa/verification.json#completeRun

# 当前限制
[scope / reason / blocksProfiles]
```

## 按体验档案补充

从 GAME_DESIGN 提取当前项目实际使用的内容：

- 场景脊柱与转场条件；
- 核心人物的目标、知识、声口和主动行动；
- 关键介入、写入事实、即时反应、后续回响与结局影响；
- 证词、物件和关键事实的知识边界；
- 核心动作、目标、输入、规则、关卡推进、反馈、状态、结果和恢复；
- 剧情事实与系统状态之间已声明的连接；
- 存档恢复体验所需的场景、事实、人物记忆和系统状态。

实现完成时走一条符合 GAME_DESIGN 承诺的完整路径。

对白、字幕、界面、状态机和验证从同一内容定义投影。测试可以按稳定 ID 与隐藏状态名断言因果；
必须确认逐字文案时，直接读取该内容源，不在测试里维护第二份结果文案。

## 默认完成证据

所有 profile 共用六项：launch、render、input、experienceFlow、outcome、restart。使用一条完整路径
和最少语义 checkpoint 证明。

`delivery` 增加 targetRuntime、targetDisplay、onboarding；`release` 增加 performance、
requiredAssets、independentPlaytest。

## 条件台账

高于 graybox 时记录批准的焦点资产、生产状态、工作区证据与剩余问题。连续 3D 记录输入、相机、
移动和空间碰撞合同。动态媒体记录镜头边界与本地输出。语音记录台词、角色选角、字幕、权利、
静音体验与最终文件。

### 语音资产台账

语音策略非 `none` 时逐句记录 `line_id`、角色/旁白、`casting_id`、逐字台词、字幕键、音色权利、
静音/缺音降级、最终文件与 hash。远程生成只保存去密钥的 `request_sha256` 与必要响应事实；未生成
写 `NOT_RUN: 原因`，不把计划中的语音冒充可用资产。

## 权威验证

verify 组合当前项目需要的状态、集成与运行时检查，并实际执行一次完整路径。构建阶段将命令、退出
码、路径与限制写入 `build/verification-candidate.json`。QA 独立复跑并写入最终
`qa/verification.json`。
