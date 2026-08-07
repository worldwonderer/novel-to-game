# 质量验证契约

本契约定义结论、路径与证据。测试框架和调试接口由项目实现决定。

## Profile 与状态

状态使用 `NOT_RUN`、`FAIL`、`PASS`；人读报告可写 `NOT_RUN: reason`。三档 profile 累加：

| profile | 必需检查 |
|---|---|
| smoke | launch、render、input、experienceFlow、outcome、restart |
| delivery | smoke + targetRuntime、targetDisplay、onboarding |
| release | delivery + performance、requiredAssets、independentPlaytest |

`targetFinish` 描述成色。`assuranceProfile` 描述当前结论需要的证据强度。

## 默认事实源

新产物使用 `qa/verification.json` schema v3：

```json
{
  "schemaVersion": 3,
  "assuranceProfile": "smoke",
  "status": "PASS",
  "checks": {
    "launch": {"status": "PASS", "runId": "main-path", "evidence": ["qa/evidence/run.json"]},
    "experienceFlow": {"status": "PASS", "runId": "main-path", "evidence": ["qa/evidence/run.json"]}
  },
  "verify": {
    "command": "<权威命令>",
    "exitCode": 0
  },
  "completeRun": {
    "id": "main-path",
    "cleanContext": true,
    "start": "initial-state",
    "terminal": "designed-outcome",
    "restart": "initial-state",
    "evidence": "qa/evidence/run.json"
  },
  "limitations": [
    {"scope": "target device", "reason": "not available", "blocksProfiles": ["delivery", "release"]}
  ]
}
```

证据保存在工作区相对路径。每项基础检查的 `runId` 与 `completeRun.id` 一致，使输入、状态、画面、
结果与重开归属于同一次 complete run。

schema v2 工作区继续用于 resume。v2 使用 `coreLoop`，读取时映射为 `experienceFlow`；完成新一轮 QA
后写回 schema v3。

## 六项基础检查

1. **launch**：候选在 `testedRuntime` 启动并进入可交互状态；
2. **render**：玩家看到的画面会随时间、场景或操作变化；
3. **input**：真实输入被候选接收并改变体验状态；
4. **experienceFlow**：从起始状态经过玩家参与和世界回应，到达设计结果；
5. **outcome**：至少一个设计结果可达；
6. **restart**：重开回到 GAME_DESIGN 定义的初态。

experience flow 的证据记录起始状态、玩家意图与实际输入、人物或世界回应、状态变化、玩家可感知
结果、终点和重开状态。

## 按概念承诺增加断言

- 场景和人物承担体验时，验证人物目标、知识状态、证词、物件、时间地点与场景连续性；
- 关键选择承担体验时，验证具体事实写入及其在后续场景、行动、对白、信息或结局中的消费；
- 动作、资源、规则或空间承担体验时，验证状态变化、反馈、推进、结果与恢复；
- 剧情事实与系统状态存在连接时，验证 `experienceProfile` 已声明的每条方向；
- 概念声明双向连接时，验证 narrative→system 与 system→narrative 两条路径。

## 条件检查

条件检查只覆盖玩家实际体验。连续 3D 检查输入控制、朝向与移动、暂停恢复，以及影响路线的可见
空间与碰撞结果。多语言与无障碍检查游戏内实际提供的模式。语音与媒体检查加载、播放、字幕，并
模拟损坏文件、静音和缺音，确认批准的降级体验仍保留核心状态、结果和重开。

目标运行环境与实际测试环境存在差异时，limitations 记录目标平台仍待验证的输入、打包、性能和
设备行为。

## QA_REPORT 与试玩

`QA_REPORT.md` 从机器事实生成，记录环境、命令、完整路径、通过与失败、limitations、未测试范围和
问题归属。

`PLAYTEST_PROTOCOL.md` 记录机器无法判断的体验问题。根据体验档案观察人物理解、信息判断、选择
重量、节奏、回响、上手、策略和手感。报告保存试玩者路径与原话，并说明样本范围。

路径、状态与文本变体属于确定性证据；台词自然度、人物声音、沉浸和选择重量不由这些字段证明。
独立审查引用具体文案与运行上下文，目标玩家试玩引用路径和原话。作者、设计者或构建所有者的自检
只能标记 provisional，不能替代 required set 中的 `independentPlaytest` 或其他独立体验结论。
