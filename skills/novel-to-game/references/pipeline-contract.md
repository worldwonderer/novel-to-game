# 流程契约

## 最小工作区

```text
game-adaptations/{project}/
├── PRODUCT_BRIEF.md
├── analysis/SOURCE_BIBLE.md
├── concepts/CONCEPT.md
├── design/GAME_DESIGN.md
├── design/ART_DIRECTION.md
├── build/BUILD_BRIEF.md
├── build/app/
├── qa/verification.json
├── qa/QA_REPORT.md
└── _progress.md
```

覆盖记录、场景表、视觉目标、资产台账、证据目录和试玩协议按项目需要增加。

## 两个正交字段

- `targetFinish`：`graybox < playable-prototype < polished-vertical-slice < showcase`；
- `assuranceProfile`：`smoke < delivery < release`。

三档 profile 使用同一个累加公式：

| profile | 必须证明 |
|---|---|
| smoke | launch、render、input、experienceFlow、outcome、restart |
| delivery | smoke + targetRuntime、targetDisplay、onboarding |
| release | delivery + performance、requiredAssets、independentPlaytest |

项目采用的语音、多语言、无障碍、媒体和连续 3D 进入相应条件检查。

## 体验交接

`PRODUCT_BRIEF.md` 记录原作优先级和玩家参与假设。`SOURCE_BIBLE.md` 完成后，概念阶段比较三个实质
不同的方向，并在选定方向中声明 `experienceProfile`：

```text
primaryExperience: 玩家持续经历什么
playerParticipation: 玩家持续理解、表达、选择或执行什么
storyCarrier: 场景、人物、知识、物件和情节怎样推进
systemRole: 规则、资源、空间与反馈承担什么职责
worldResponse: 玩家影响怎样被后续体验读取
```

后续产物沿用这份档案：

- `GAME_DESIGN.md` 展开场景、人物、系统、因果、节奏与结果；
- `ART_DIRECTION.md` 定义玩家如何看见、听见和读懂当前体验；
- `BUILD_BRIEF.md` 压缩实现范围与运行方式；
- `verification.json` 证明一条符合已声明承诺的完整 experience flow。

证据促成方向变化时，回到概念产物更新体验档案，再更新受影响的下游交接。

## 阶段 owner 与完成检查

概念、体验设计、美术方向、构建和 QA 分别维护自己的产物。source owner 在概念选定后补充目标段落
的事实证据。build 记录候选运行事实，QA 独立写最终 `qa/verification.json`。

总入口检查：

| 检查 | 成立条件 |
|---|---|
| scope | 来源、体验档案、范围、目标运行形态和阶段交接一致 |
| playable | 当前 profile 的玩家体验检查具有实际运行证据 |

`_progress.md` 记录当前阶段、工作假设、回流和两项结果。

## 证据与回流

新产物使用 `qa/verification.json` schema v3，记录 profile、状态、权威命令、complete run、checks 和
limitations。每项必需检查通过 `runId` 关联 complete run。resume 可以读取 schema v2：旧键
`coreLoop` 映射为 `experienceFlow`，下一次 QA 后写回 v3。

状态使用 `NOT_RUN`、`FAIL`、`PASS`。问题按 owner 回流：产品方向回 PRODUCT_BRIEF，来源事实回
SOURCE_BIBLE，体验和美术回批准文档，实现问题回 build。修订后重建受影响范围并复跑完整路径。

## 完成度声明

`graybox` 允许明确的视觉缺口。更高 finish 逐步增加批准的焦点资产、演出和目标设备表现。目标
玩家试玩记录趣味、人物感受、节奏、手感、长期平衡和商业判断。

## 语言与文化

原文、策划、市场和界面语言分别记录。原文证据保留原语言，跨语言维护术语表。人物关系、称谓、
礼仪和价值冲突按原作文化语境进入设计与文案。
