---
name: game-world-design
description: "Design the playable experience, narrative structure, systems, and levels for an approved novel adaptation. Turn CONCEPT into a GAME_DESIGN that follows its selected experience profile and gives build a clear scene, consequence, pacing, feedback, and scope contract. Use for design the game world, write the interactive story structure, deepen gameplay and levels, write the game design document. 游戏体验、互动叙事、系统与关卡设计。把选定概念收束为符合体验档案的 GAME_DESIGN，交付清楚的场景、人物、因果、节奏、反馈与范围合同。"
---
# 游戏体验与世界设计

把选定概念展开为可实现的玩家体验。输入为 `SOURCE_BIBLE.md`、`CONCEPT.md` 与
`PRODUCT_BRIEF.md`。

先读取 [world-design-method.md](references/world-design-method.md)。项目以场景、人物、对白、知识差或
关键选择承载体验时读取 [narrative-design-method.md](references/narrative-design-method.md) 与
[dialogue-design-method.md](references/dialogue-design-method.md)；资源门槛、对抗或经营判断确实承担
体验时读取 [numeric-design-method.md](references/numeric-design-method.md)。

产物语言由 `PRODUCT_BRIEF.md` 锁定；未锁定时跟随对话语言，不默认产出中文。

## 共同设计

1. 用一句话写清玩家身份、持续参与方式、世界回应和目标感受；
2. 把体验支柱落到玩家实际经历的场景、动作、选择和反馈；
3. 定义体验推进：玩家知道什么、能影响什么、人物或世界如何改变；
4. 选出最小完整切片，从进入处境走到一个有意义的结果；
5. 为主要人物、对手和势力写清目标、已知信息、可采取行动及其变化；
6. 建立状态因果表，每项状态标明写入时刻、读取时刻和玩家感知方式；
7. 设计第一分钟，让玩家从场景与界面理解身份、当前处境和第一次参与；
8. 定义语言、声口、镜头、界面信息和反馈层级；
9. 记录范围、开放问题和最大设计假设对应的试玩观察。

## 用场景与人物承载体验

- 建立场景脊柱，逐场记录时间、地点、视角人物、在场人物、各自目标、进入条件、冲突推进和离场
  状态；
- 先写人物的对白议程、筹码、初始策略与策略受阻后的换招，再写逐字台词；
- 让台词承担试探、交换、划界、推责、威胁、保护或转移等行动，并改变下一轮可采取的动作；
- 把选择集中在不可兼得且会改变关系、信息、后续场景或结果的行动节点，不在选项上预告后果；
- 用隐藏因果记录承诺、怀疑、证词、物件去向、公开立场和人物记忆；
- 通过对白、行动、环境和可达场景回读玩家做过的事；
- 为证词与关键事实建立知识表，区分玩家、主角和每名人物在每个场景知道什么；
- 用汇流场景控制制作量，同时保留关键人物的记忆、措辞和行动区别；
- 结局回收玩家在核心关系与主题冲突中的选择。

## 用规则、动作与空间承载体验

- 定义玩家反复使用的核心动作和阶段目标；
- 使用一个核心系统和直接支持核心判断的辅助系统；
- 写清输入、可见信息、世界回应、失败恢复和熟练度差异；
- 让关卡按教会、变式、组合、检验和主题回收推进；
- 为实际承担门槛或张力的资源建立数值预算；
- 用代表性局面说明不同状态下的合理选择；
- 让对手、环境和关卡读取玩家使用的核心规则。

## 连接剧情与系统

选定概念同时使用剧情事实和系统状态时，按体验档案声明每一层的职责。为已承诺的连接分别记录
写入、消费与玩家感知方式。双向影响属于概念承诺时，两条方向都进入最小切片和验证路径。

## 输出

生成 `design/GAME_DESIGN.md`，按当前项目组织为以下部分：

1. 玩家承诺与 `experienceProfile`；
2. 原作价值到玩家体验的转换；
3. 体验推进与最小完整切片；
4. 人物、对手与世界回应；
5. 状态因果与信息呈现；
6. 场景结构、关卡结构或二者连接；
7. 第一场景、关键节点与结果；
8. 反馈、界面、语言和文案声口；
9. 范围、设计假设与试玩观察。

项目按实际承载方式附场景脊柱、人物目标表、知识表、关键因果表、结局回收、规则、关卡节拍或
数值说明。交付前走读一条完整路径，确认连续性、人物行动、状态消费和玩家可感知的变化。
