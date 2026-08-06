---
name: game-qa
description: "Verify a game with evidence on its selected target runtime. Launch the actual build and check logs, real rendering, input and state changes, the core loop, designed outcomes, restart, target display modes, interface language, first-time onboarding, and whether the core fantasy is actually performed — without dressing subjective fun up as a certain verdict. Use for test a generated game, QA a game build, check whether the game is fully playable, verify the build. 游戏证据化质量验证。在选定的目标运行环境中启动实际构建，检查日志、真实画面、输入与状态变化、核心循环、设计要求的结果、重开、目标显示模式、界面语言、首次上手与核心幻想是否真正出现，不把主观趣味包装成确定性结论。用于测试生成游戏、检查游戏能否完整游玩等需求。"
---
# 游戏质量验证

验证当前候选是否达到 `PRODUCT_BRIEF.md` 的 `assuranceProfile`，不把普通试玩原型默认升级为
发布审计，也不给“好玩”伪造客观分数。

读取 [qa-contract.md](references/qa-contract.md) 定判据，按
[test-design-method.md](references/test-design-method.md) 设计最少但有区分力的检查。

产物语言由 `PRODUCT_BRIEF.md` 锁定；未锁定时跟随对话语言，不默认产出中文。

## 一条判定公式

`required = profile 累加项 ∪ 已采用 capability 的必需检查 ∪ 安全/权利/秘密检查`

- `smoke`：启动、变化的渲染、真实输入、核心循环、设计结果、重开。
- `delivery`：smoke + 目标运行时、目标显示模式、首次上手；按采用范围补性能与必需资产。
- `release`：delivery + 当前候选 fingerprint、公开托管、发布文案、权利、秘密与必要独立评审。

不为 finish/profile 组合另写分支。TTS、生成媒体、连续 3D、多语言、无障碍和公开托管从
BUILD_BRIEF、ledger、runtime/source 重新发现；自报与实物冲突即 FAIL。

## 执行

1. 读取 `assuranceProfile`、`targetRuntime`、`testedRuntime`、权威 verify 和 capability 清单；它们与
   PRODUCT_BRIEF/BUILD_BRIEF 冲突时先报错，不由 QA 猜值。
2. 发现已有测试：检查 manifest scripts、CI、测试文件和 brief runner，记录
   `suite | discovered from | files | runner | observed in verify | result`。required suite 未被权威命令
   调用时报告 `ORPHANED_TEST_SUITE`；明确 archived/vendor/generated 项可附理由排除。
3. 独立运行权威 verify，记录 command、exit code、duration、环境和持久 `verify.log`；不能只接受
   实现方的绿色摘要。
4. 在 `testedRuntime` 启动真实候选，从 `clean start → 核心动作 → 设计结果 → restart` 走一条完整
   路径。证明画面非空且变化、真实输入改变状态、结果可达、重开恢复定义的初态。
5. 对照 GAME_DESIGN 中会改变结果的不变量和三段弧结束标记；只验证设计承诺，不遍历所有代码路径。
6. `delivery` 及以上再检查目标显示模式、第一分钟上手和目标运行时差异。替代运行时只证明实际覆盖
   层，目标独有输入、性能、打包与设备项写 limitation；阻断当前 profile 时不能 PASS。
7. 只启用已采用的条件包：
   - 连续 3D：输入控制权、朝向/移动一致性、失焦归零，以及 collider 与可见布局的关键边界；
   - 多语言/无障碍：逐项切换实际采用模式，检查关键玩法信息可读可用；
   - 生成媒体：台账、请求/响应、本地文件/hash、首中尾连续性与失败行为；
   - 语音与 TTS：逐句真值、权利、字幕、解码、真实试听、静音/缺音降级和客户端密钥暴露。
8. `release` 才执行当前候选身份、公开部署 fingerprint、发布资产、对外文案和必要独立视觉评审。
   旧证据只能标 `HISTORICAL`，不得证明当前候选。
9. 记录 limitation 和 blocker/major 的 product/design/art/build 归属；趣味、长期平衡、留存与商业价值
   只写观察，不给确定性 PASS。

优先使用已有可观察状态；只有无法判断结果时才增加最小测试钩子。不要为了 QA 重构游戏或强制某种
框架、测试库或调试接口。

## 输出

默认只写：

- `qa/verification.json`：机器事实源，包含 `assuranceProfile`、三态 status、固定 capabilities、checks、
  limitations 和持久证据路径；
- `qa/QA_REPORT.md`：由 verification 生成的人读摘要，说明环境、命令、结论、缺口和未测试范围；
- `qa/PLAYTEST_PROTOCOL.md`：仅保留需要人工感受判断的试玩路径。

只有 `release` 再写 `qa/release-gates.json`，记录 `evidenceRole: "CURRENT"`、source fingerprint、公开
托管、权利、发布资产/文案和必要独立 reviewer。历史文件使用 `evidenceRole: "HISTORICAL"`，不能
满足当前必需项。verification 与 release 结论冲突直接 FAIL。

状态只取 `NOT_RUN` / `FAIL` / `PASS`。缺口写结构化 limitation，不发明 `PASS_WITH_GAPS`；若
`blocksProfiles` 包含当前 profile，整体不得 PASS。把裁决与一句原因交回总入口，由编排器记录
`gate:playable` / `gate:claim`。
