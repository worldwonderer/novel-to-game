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

按需增加 `_coverage.md`、视觉目标、资产账本、证据目录和人工试玩协议。只有
`assuranceProfile: release` 才要求 `qa/release-gates.json`；不要提前创建空文件。

所有机器状态只取 `NOT_RUN` / `FAIL` / `PASS`。`NOT_RUN` 表示没有证据，不能满足当前 profile。

## 两个正交字段

- `targetFinish`：`graybox < playable-prototype < polished-vertical-slice < showcase`，表示成色目标。
- `assuranceProfile`：`smoke < delivery < release`，表示证据强度。

`quick` 默认 smoke。三档使用同一个累加公式：

| profile | 必须证明 |
|---|---|
| `smoke` | 启动、变化的渲染、真实输入、核心循环、设计结果、重开 |
| `delivery` | smoke + 目标运行时、目标显示模式、首次上手；已采用能力所需的性能/资产检查 |
| `release` | delivery + 当前候选身份、公开托管、权利/秘密、发布文案、必要独立评审 |

TTS、生成媒体、公开托管、连续 3D、多语言和无障碍按实际采用能力触发。权利、秘密和安全高于
profile；不能通过自报未采用来绕过仓库中的实际资产、调用或公开声明。

## 阶段 owner 与三道门

概念、体验/关卡设计、美术方向分别由 `CONCEPT.md`、`GAME_DESIGN.md`、`ART_DIRECTION.md` 的 owner
负责；构建不得静默改写它们。编排器只检查：

| gate | 成立条件 |
|---|---|
| `scope` | `PRODUCT_BRIEF`、`SOURCE_BIBLE` 和三份设计交接存在；范围、原作事实、目标运行形态与 finish/profile 不冲突 |
| `playable` | `qa/verification.json` 对当前 profile 必需项给出真实运行证据；smoke 六项全部 PASS |
| `claim` | `publicationTier <= demonstratedTier <= targetFinish`；历史证据不冒充当前；release 扩展在需要时 PASS |

`_progress.md` 只记录来源、模式、当前阶段、未确认假设、回流和这三行：`gate:scope`、
`gate:playable`、`gate:claim`。详细测试状态留在 `qa/verification.json`，不要复制到多份状态表。

## 证据角色

`qa/verification.json` 是执行事实源。schema v2 写 `assuranceProfile`、整体状态、固定 capability 清单、
checks 和结构化 limitations。limitations 含 `scope`、`reason`、`blocksProfiles`；阻断当前 profile 时
整体不能 PASS。

`qa/release-gates.json` 只保存 release 事实。当前证明标 `evidenceRole: "CURRENT"`；旧记录唯一合法
角色为 `evidenceRole: "HISTORICAL"`，不得满足当前要求。verification 与 release 对同一 profile、
fingerprint 或结论冲突时直接 FAIL，不设覆盖优先级。

## 完成度声明

`graybox` 可以诚实保留视觉缺口；更高 finish 需要相应焦点资产、目标视图和未关闭缺陷事实。
这些事实不应让 smoke 自动升级为 release，也不能让 release 把 graybox 包装成成片。预算或工具耗尽
只会留下 `NOT_RUN` / `FAIL`、降低公开声明或延期，不会生成 PASS。

## resume 与回流

`resume` 读取 `_progress.md` 和实际产物，从最早未成立的三道门继续。QA 发现按 owner 回流：

- product：回 `PRODUCT_BRIEF.md`；
- design/art：修订批准文档后重建受影响范围；
- build：修实现并复跑同一验证路径。

品类认不出、体验弧不存在、核心前提未上屏不是小缺陷；停止打磨并请求产品裁决。趣味、长期平衡、
留存和商业价值只能作为试玩观察，不得写成确定性 PASS。

## 语言与文化

原文、策划、市场和界面语言分别记录。原文证据保留原语言；跨语言维护一个术语表。多语言只有在
brief 采用时才进入 capability 检查，不默认把每份产物复制成双语。
