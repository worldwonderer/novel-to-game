# Project Plateau 最终候选独立视觉复核

- 日期：2026-08-04
- reviewer：`/root/visual_v17_review`
- 模式：vision、只读独立审查
- 判定：**PASS / GO**
- 目标完成度：`playable-prototype`
- source fingerprint：`8396d9b9879a3a934cac03cf83e02d1ccd305b77945185afce436094a46833e1`
- release visual manifest sha256：`25d8a2a3a3a801ed83da27d51ab3b1613169c0968c3d6cde8b3da745a5f1ca3e`
- supplemental visual-target manifest sha256：`7882f046b1294a698e48dcd9b3f58c90277802f3f52eb486b8520205f0933355`

## 独立性

审查者只读取最终冻结且逐项 hash 绑定的运行帧、双视口联系表、转台、照片板和动作序列；未修改实现、捕获脚本、manifest 或 QA 文件，也未采用实现者自评代替视觉判断。

## VT01–VT06

| 目标 | 判定 | 独立视觉判断 |
|---|---|---|
| VT01 | PASS | 标题、记录板和菜单焦点明确；银黑材质、玄武岩剪影与远景层次成立，无 HUD 遮挡或异常高光。 |
| VT02 | PASS | 足迹具有不规则泥缘、凹陷、散石和接触暗部；溪水为受控青黑反射，不再出现纯白发光块。 |
| VT03 | PASS | 家庭为第一视觉中心，成年体与幼体轮廓分离；相框 HUD 不遮挡关键行为。 |
| VT04 | PASS | 翼龙接近、转向和俯冲轮廓明确；地面阴影随距离和方向变化，家庭与攻击者空间关系可读。 |
| VT05 | PASS | 四张板内容、构图和线索数量可区分；照片、标题及按钮层级稳定。 |
| VT06 | PASS | 150% 文本、控制栏、相机附签和字幕保持安全边距；1280×720 与目标视口层级一致。 |

## 专项复核

- **树木与接地：PASS。** 树干保留明暗面，林冠无旧版矩形连接梁；树根和主要植被接地可信。
- **水面：PASS。** 溪流具有暗色基底、局部波纹和有限高光，无连续纯白发光或突兀材质断层。
- **阴影与光色：PASS。** 生物、树木和翼龙投影方向与太阳一致；接触阴影未显示普遍漂浮，家庭与玄武岩仍在可读暖光通道中。
- **营地、火塘与烟：PASS。** 双视口运行帧未见旧版锥体、球串、发光烟雾或漂浮营地物件的回归。
- **翼龙动作：PASS。** `build/evidence/visual-targets/contact-sheet-motion.jpg` 第四行固定主体、变换和机位，仅切换 `wingUp`、neutral、`wingDown`；两翼同步经历高举、中位和下压，无单翼冻结、翼根断裂或左右相位错位。
- **双视口一致性：PASS。** `1440×900` 与 `1280×720` 的标题、家庭和俯冲场景保持相同焦点、构图比例、光色和工具占比，无关键裁切或 UI 冲突。

## 缺陷分级

- blocker：无
- major：无
- minor：
  1. VT06 最右上边缘有一只非关键背景翼龙局部出画；主要翼龙完整，不影响焦点或操作信息。
  2. 少数翼龙转台帧与树冠或前景枝杈存在二维轮廓重叠，未观察到确定的模型穿插。
  3. 营地近景尚未像 VT01–VT06 一样拥有单独的正式联系表；现有真实运行帧足以排除已知发布阻断回归，后续证据升级可补充专表。

## 证据

- `build/evidence/visual-upgrade/generated/contact-sheet-supported-viewports.jpg`
- `build/evidence/visual-upgrade/generated/manifest.json`
- `build/evidence/visual-targets/contact-sheet-targets.jpg`
- `build/evidence/visual-targets/contact-sheet-orbits.jpg`
- `build/evidence/visual-targets/contact-sheet-plates.jpg`
- `build/evidence/visual-targets/contact-sheet-motion.jpg`
- `build/evidence/visual-targets/manifest.json`

## 最终结论

**PASS / GO。** VT01–VT06 全部通过；焦点、轮廓、空间层次、材质、光色、HUD、动作和双视口一致性达到发布门槛。此前溪水纯白发光、林冠黑位压死、矩形枝条及翼龙左右翼相位疑虑均已解除；未发现 blocker 或 major。
