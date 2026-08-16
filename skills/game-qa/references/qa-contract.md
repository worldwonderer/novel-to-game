# 质量验证契约

本契约只规定什么结论需要什么证据。测试框架、调试接口和实现结构由项目决定。

## 状态与事实源

状态只取 `NOT_RUN` / `FAIL` / `PASS`。未验证不是通过，安全失败也不是成功降级。

`qa/verification.json` schema v3 恰好使用以下顶层字段，`checks` 恰好只含六键：

```json
{
  "schemaVersion": 3,
  "status": "PASS",
  "verify": {"command": "<权威命令>", "exitCode": 0},
  "completeRun": {
    "id": "main-path",
    "cleanContext": true,
    "terminal": "designed-outcome",
    "restart": "initial-state",
    "evidence": "qa/evidence/run.json"
  },
  "checks": {
    "launch": "PASS", "render": "PASS", "input": "PASS",
    "coreLoop": "PASS", "outcome": "PASS", "restart": "PASS"
  },
  "limitations": [
    {"scope": "target device", "reason": "not available"}
  ]
}
```

`completeRun.evidence` 使用工作区相对路径且文件必须存在，可以是状态 JSON、日志、截图、录制或
完整路径摘要。它保存运行细节，不得再复制 `verification.json` 的 command、exitCode 和六项结论。
权威命令无论成功失败都原子重写 `verification.json`，旧 PASS 不得在失败复跑后幸存。项目回归只放
`verify.suites` 或证据诊断；若其失败破坏六项之一，映射到该键。

## 最小可玩闭环

一次权威运行至少证明：

1. 候选在实际 `testedRuntime` 启动，无阻断错误；
2. 画面非空且会随时间或操作变化；
3. 真实输入引起可观察状态变化；
4. 核心循环完整执行；
5. 至少一个设计结果可达；
6. restart 回到定义初态。

步骤、状态和画面必须属于同一次 complete run；截图不能证明隐藏状态，状态 dump 不能证明真实画面。
目标运行环境与实际测试环境不同时，把目标独有输入、打包、性能和设备行为写 limitation；替代版本
不能证明目标平台已通过。

## 条件检查与边界

连续 3D、多语言、无障碍、语音、媒体或生成资产只在游戏实际采用时运行诊断。只看玩家能否正确
看到、听到、操作和完成核心流程；诊断不新增 checks，也不审计供应商请求、营销素材或生产身份。

只有 brief/ledger 预先批准的 fallback 才能继续，并证明核心动作、状态、结果、可读反馈和 restart
仍成立。安全失败仍是 FAIL；测试替身只证明测试层；placeholder 只描述完成度；历史证据只说明旧候选。

不要求真人试玩、人工审查或另写 QA 报告。主观趣味、平衡、沉浸、选择重量、权利合规和发布质量
不由本合同确定性证明；需要这类研究时另立任务，不影响本合同的机器 PASS。
