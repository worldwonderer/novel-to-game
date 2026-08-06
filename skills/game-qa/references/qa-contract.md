# 质量验证契约

本契约只规定什么结论需要什么证据。测试框架、调试接口和实现结构由项目决定。

## Profile 与状态

状态只取 `NOT_RUN` / `FAIL` / `PASS`。机器记录里使用 `NOT_RUN`；人读表格可写
`NOT_RUN: reason`。未验证不是通过，graceful failure 也不是 fallback。

三档单调累加：

| profile | 必需检查 |
|---|---|
| smoke | launch、render、input、coreLoop、outcome、restart |
| delivery | smoke + targetRuntime、targetDisplay、onboarding；采用能力所需 performance/requiredAssets |
| release | delivery + 当前候选身份、公开托管、权利/秘密、发布声明与必要独立评审 |

`targetFinish` 只描述成色，不改变公式。安全、权利和秘密检查优先于 profile。

## 默认事实源

`qa/verification.json` schema v2 至少包含：

```json
{
  "schemaVersion": 2,
  "assuranceProfile": "smoke",
  "status": "PASS",
  "sourceFingerprint": "<当前可发布输入的 sha256>",
  "capabilities": {
    "continuous3D": {"adopted": false, "discoveredFrom": []},
    "tts": {"adopted": false, "discoveredFrom": []},
    "generatedMedia": {"adopted": false, "discoveredFrom": []},
    "publicHost": {"adopted": false, "discoveredFrom": []},
    "multiLanguage": {"adopted": false, "discoveredFrom": []},
    "accessibilityModes": {"adopted": false, "discoveredFrom": []}
  },
  "checks": {
    "launch": {"status": "PASS", "evidence": ["qa/evidence/run.json"]}
  },
  "verify": {
    "command": "<权威命令>",
    "exitCode": 0,
    "evidence": [
      {"path": "qa/evidence/run.json", "sha256": "<文件 sha256>"}
    ]
  },
  "completeRun": {
    "id": "main-path",
    "cleanContext": true,
    "terminal": "designed-outcome",
    "restart": "initial-state",
    "evidence": "qa/evidence/run.json"
  },
  "limitations": [
    {"scope": "target device", "reason": "not available", "blocksProfiles": ["delivery", "release"]}
  ]
}
```

六个 capability 键固定。QA 从 BUILD_BRIEF、asset ledger、runtime/source discovery 复算；
`adopted:true` 无来源/现行证据会 FAIL。发现了 audition、可选工具或历史配置但当前候选确实未采用时，
仍须写入 `discoveredFrom` 并给 `notAdoptedReason`；不能用空数组藏掉发现结果。`discoveredFrom` 只接受
工作区内存在路径。每个 `adopted:true` capability 必须增加一个同名 check，
例如 `publicHost` 对应 `checks.publicHost`，不能只声明采用而不证明。

所有 profile 都把 `sourceFingerprint` 与当前可发布输入复算一致；每个 PASS check 和 complete run 的
证据都必须出现在 `verify.evidence`，并由 SHA-256 绑定。只写一个存在的空文件、旧截图目录或绿色摘要
不能满足该契约。

release 扩展只写发布事实，`evidenceRole` 只接受 `CURRENT` / `HISTORICAL`。历史文件不得满足当前
要求；与 verification 的 profile、fingerprint 或结论冲突时 FAIL，不设覆盖顺序。

## 最小可玩闭环

一次权威运行至少证明：

1. 候选在实际 `testedRuntime` 启动，无阻断错误；
2. 画面非空且会随时间或操作变化；
3. 真实输入引起可观察状态变化；
4. 核心循环完整执行；
5. 至少一个设计结果可达；
6. restart 回到定义初态。

步骤、状态和画面必须属于同一个 complete-run step、同一个 source commit；截图不能证明隐藏状态，
状态 dump 不能证明真实画面。证据落在工作区持久路径，不引用临时目录。

目标运行环境与实际测试环境不同时，把目标独有输入、打包、性能和设备行为写 limitation。替代版本
不能证明目标平台已通过。

## 测试发现与权威命令

检查 manifest scripts、CI、测试文件和 BUILD_BRIEF runner，输出：

`suite | discovered from | files | runner | observed in verify | result`

required suite 必须出现在一次真实权威 verify 的 log 中；单独补跑的绿色结果不能拼成一次通过。
排除项必须给稳定路径和理由。发现存在却未执行的 required suite 是 `ORPHANED_TEST_SUITE`。

## 条件检查包

### 连续 3D

仅当 `continuous3D.adopted` 为真时检查：取得输入控制权、真实朝向变化、相机与移动前向一致、失焦/
暂停/恢复归零，以及会改变路线的 collider 与可见布局可追溯。确定性 shim 只证明覆盖层，不能替代
目标设备的真实输入锁定。

### 多语言与无障碍

仅按采用范围切换实际模式。检查字体、截断、阅读顺序、关键玩法信息、颜色替代、可关闭动效和输入
可操作性。未采用的模式不制造空门。

### 语音与 TTS

当前候选存在语音台账、语音文件或运行时调用即采用。明确标为 audition/not-adopted 的可选工具不触发
运行时检查，但必须披露发现来源和未采用原因。采用后逐句核对生成真值、说话人与选角、字幕键、音色权利、请求指纹、
本地文件 hash、解码/时长/响度和人工试听；覆盖短反馈、长段、情绪、停顿、专名、数字及实际采用
语言。模拟损坏文件、静音和缺音，确认核心状态、结果、反馈和重开仍诚实。运行时网络必须在 brief
获批，API 密钥只能在受信服务端，客户端源码/包/日志不得泄漏。

### 生成媒体与 3D 资产

存在动态媒体或生成资产台账即采用。核对请求、响应、任务 ID、本地输出与 hash；逐镜保存首/中/尾
帧并检查边界连续性。3D 资产检查母版、运行派生物、空间原点、释放和失败降级。无台账但运行包存在
相关资产或调用属于 scope drift，不能靠自报不适用绕过。

### 公开托管与发布

只在 release 或当前确有公开声明时检查。部署报告必须绑定与当前候选相同的 source fingerprint；旧
URL/commit 只能 HISTORICAL。权利、秘密和公开文案不因低 finish 而放宽。

## Fallback 边界

只有 brief/ledger 预先批准的 fallback 才能继续，并证明核心动作、状态、结果、可读反馈和 restart
五项仍成立。以下概念不得混用：

- graceful failure：安全失败，仍是 FAIL；
- test substitute：只证明测试层，目标层写 limitation；
- placeholder/graybox：是 finish 事实；
- historical evidence：只说明旧候选。

## Release 扩展

`qa/release-gates.json` 只在 `assuranceProfile: release` 使用，至少绑定当前 fingerprint、发布输入清单、
公开托管、权利/秘密结论、对外 tier 和必要 reviewer。独立评审只在批准目标或发布声明确实要求时
执行；reviewer 不得用实现解释替代真实画面，证据必须绑定当前 manifest。

release PASS 要求零 blocker/major、必需项无 NOT_RUN，并满足
`publicationTier <= demonstratedTier <= targetFinish`。主观“好玩”“平衡”“有商业潜力”不属于该
不等式，也不能由 reviewer 证明。

## QA_REPORT 与人工试玩

`QA_REPORT.md` 从机器事实生成，至少写环境、实际命令、通过/失败、limitations、未测试范围和问题
归属。不要再复制完整 release schema。

`PLAYTEST_PROTOCOL.md` 只承接机器不能确定的体验问题：第一分钟是否理解、核心幻想是否真的形成
场面、节奏与手感。记录观察者、路径和原话，不把少量试玩包装成普遍结论。
