#!/usr/bin/env python3
"""重拍宣发四图(简报 T12):title / battle / bibotan / hero,全部 1280×800、JPEG q88。

与 capture_demo_clip.py 同脚手架(端口/视口/种子),与 qa_browser.py 同页面操作助手
(QA 类,直接 import 复用,不跑它的 main)。三条约束不变:
1. 常速。不带 fast=1,引擎按真实节奏结算,截图就是玩家看到的画面。
2. 种子固定 ?seed=42,同一条操作路径重跑出同一场战役,产物可复现、可被质疑。
3. 落盘在工作区内:examples/journey-to-the-west/screenshots/,不进 /tmp。

主图(hero.jpg)硬性要求:无淡出残影、无常驻说明文字、无被裁切的血条——
捕获前显式等飘字层与 toast 清空(简报 T9/T10 已保证它们会被回收)。

跑法: python3 qa/capture_screenshots.py
产出: screenshots/title.jpg battle.jpg bibotan.jpg
       screenshots/clip/candidate_a_overworld.jpg  (主图候选 A:序幕·火焰山脚)
       screenshots/clip/candidate_b_truefan3.jpg   (主图候选 B:积雷山·真扇三段后)
hero.jpg 由执行者在两张候选中裁定后复制(报告里说明选哪帧、为什么)。
"""
from __future__ import annotations

import socket
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
EXAMPLE = HERE.parent
APP = EXAMPLE / "build" / "app"
SHOTS = EXAMPLE / "screenshots"
CAND = SHOTS / "clip"
PORT = 5176
BASE = f"http://127.0.0.1:{PORT}"
URL = f"{BASE}/?seed=42"  # 常速:不带 fast=1

sys.path.insert(0, str(APP / "test"))
from qa_browser import QA  # noqa: E402  复用页面操作助手(对话框/指令台/状态读取)

VIEW = {"width": 1280, "height": 800}


def ensure_server() -> subprocess.Popen | None:
    with socket.socket() as s:
        if s.connect_ex(("127.0.0.1", PORT)) == 0:
            return None
    proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
        cwd=APP, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    for _ in range(60):
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", PORT)) == 0:
                return proc
        time.sleep(0.1)
    proc.kill()
    raise RuntimeError("本地服务未起来")


class Cap:
    def __init__(self, page, qa: QA):
        self.p = page
        self.qa = qa

    def save(self, path: Path, toast_clear: bool = False) -> None:
        """截图前确认飘字层为空(主图硬性要求;其余三图同标准)。"""
        if not self.qa.wait_floats_clear():
            raise RuntimeError(f"飘字层 12s 未清空,残影仍在:{path.name}")
        if toast_clear:
            try:
                self.p.wait_for_function(
                    "() => document.querySelectorAll('.toast').length === 0",
                    timeout=8000,
                )
            except Exception as e:
                raise RuntimeError(f"toast 8s 未清空:{path.name}") from e
        # 把指针停到顶栏标题字上(非按钮区):否则鼠标最后停在哪个指令钮上,
        # 那颗钮就带着 hover 高亮和它的说明气泡一起进宣发图——画面里会出现
        # 两颗看起来都在激活的按钮。等一拍让 hover 过渡走完再拍。
        self.p.mouse.move(120, 12)
        self.p.wait_for_timeout(260)
        self.p.screenshot(path=str(path), type="jpeg", quality=88)
        print(f"  捕获 → {path.relative_to(EXAMPLE)}")

    def wait_cmd(self, timeout_s: float = 40.0) -> bool:
        t0 = time.monotonic()
        while time.monotonic() - t0 < timeout_s:
            if self.qa.cmd_visible():
                return True
            if self.p.locator("#btn-once-close").count() > 0:
                self.p.locator("#btn-once-close").click()
                self.p.wait_for_timeout(200)
            self.p.wait_for_timeout(200)
        return False

    def click_dialogs_until(self, selector: str, timeout_s: float = 60.0) -> None:
        """点穿剧情对话,直到指定选择器出现(章节卡自动消隐,无需处理)。"""
        t0 = time.monotonic()
        while time.monotonic() - t0 < timeout_s:
            if self.p.locator(selector).count() > 0:
                return
            if self.p.locator("#dialog").count() > 0:
                self.p.locator("#dialog").click()
            self.p.wait_for_timeout(280)
        raise RuntimeError(f"等待 {selector} 超时")


def run() -> int:
    errors: list[str] = []
    server = ensure_server()
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            ctx = browser.new_context(viewport=VIEW)  # 全新上下文:无存档、无持久开关
            page = ctx.new_page()
            page.on("pageerror", lambda e: errors.append("PAGEERROR: " + str(e)))
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            qa = QA(page)
            cap = Cap(page, qa)

            # ---------- 标题(顶栏在标题页已隐藏,简报 T7) ----------
            print("== 标题 ==")
            page.goto(URL, wait_until="load")
            page.wait_for_selector("#btn-start", timeout=15000)
            assert page.evaluate("__game.fast") is False and page.evaluate("__game.seed") == 42, "必须常速+seed=42"
            page.wait_for_timeout(400)
            cap.save(SHOTS / "title.jpg")

            # ---------- 序幕·火焰山脚(主图候选 A) ----------
            print("== 序幕 ==")
            page.click("#btn-start")
            qa.wait_dialog_then_clear()
            page.wait_for_selector("#overworld-canvas", timeout=8000)
            page.wait_for_timeout(900)  # 师徒跟随就位
            cap.save(CAND / "candidate_a_overworld.jpg")
            # 问土地 → 前往罗刹女
            pos = page.evaluate("__game.npcScreenPos('tudi')")
            page.mouse.click(pos["x"], pos["y"])
            page.wait_for_selector("#dialog", timeout=10000)
            qa.click_dialogs()
            pos = page.evaluate("__game.npcScreenPos('luosha')")
            page.mouse.click(pos["x"], pos["y"])
            cap.click_dialogs_until("#btn-tutorial-ok", 60)

            # ---------- 战斗1 · 翠云山(battle.jpg) ----------
            print("== 战斗1 ==")
            page.click("#btn-tutorial-ok")
            page.wait_for_selector('.cmd-btn[data-cmd="auto"]', timeout=10000)
            # 第一回合:悟空 法术→如意金箍棒→罗刹女,其余自动
            page.click('.cmd-btn[data-cmd="skill"]')
            page.wait_for_selector('[data-skill="ruyibang"]')
            page.click('[data-skill="ruyibang"]')
            page.wait_for_timeout(300)
            page.locator('.unit-card[data-unit-id="e0"]').click()
            page.wait_for_timeout(300)
            qa.click_auto()
            qa.click_auto()
            if not cap.wait_cmd():
                raise RuntimeError("第一回合结算后指令台未回来")
            cap.save(SHOTS / "battle.jpg")  # 第一回合结算完、飘字已清的指令阶段
            # 自动到剧情吹飞
            for _ in range(200):
                if page.locator("#dialog").count() > 0:
                    break
                if qa.cmd_visible():
                    qa.click_auto()
                else:
                    page.wait_for_timeout(200)
            cap.click_dialogs_until('.cmd-btn[data-cmd="auto"]', 60)  # 吹飞→灵吉→再战前
            # 再战:≤55% 化虫入腹,否则自动
            for _ in range(400):
                if page.locator("#dialog").count() > 0:
                    page.locator("#dialog").click()
                    page.wait_for_timeout(200)
                    continue
                if qa.battle_over():
                    break
                if qa.cmd_visible():
                    status = page.locator(".cmd-status").inner_text()
                    if "孙悟空" in status and qa.boss_hp_ratio("luosha") <= 0.55:
                        page.click('.cmd-btn[data-cmd="special"]')
                        qa.close_once()
                        page.wait_for_selector('[data-form="chongzi"]')
                        page.click('[data-form="chongzi"]')
                        page.wait_for_timeout(600)
                    else:
                        qa.click_auto()
                else:
                    page.wait_for_timeout(150)
            qa.wait_victory()
            page.click("#btn-victory-ok")
            cap.click_dialogs_until("#btn-once-close", 60)  # 交扇→假扇火起→战斗2小卡

            # ---------- 战斗2 · 火焰山火兵(收服赤焰火骝,批2 需要) ----------
            print("== 战斗2 ==")
            page.click("#btn-once-close")
            page.wait_for_selector('.cmd-btn[data-cmd="auto"]', timeout=15000)
            caught = False
            for _ in range(600):
                if qa.defeat_retry():
                    caught = False
                    continue
                if page.locator("#dialog").count() > 0:
                    page.locator("#dialog").click()
                    page.wait_for_timeout(200)
                    continue
                if qa.battle_over():
                    break
                if qa.cmd_visible():
                    st = qa.battle_state()
                    uid = qa.prompt_unit_id()
                    low = qa.lowest_party(st)
                    e0 = next((u for u in st["units"] if u["id"] == "e0"), None)
                    e0_low = e0 and e0["alive"] and e0["hp"] / e0["maxHp"] <= 0.4
                    if "huobao" in (st.get("caught") if st else []):
                        caught = True
                    if uid == "p0" and e0_low and not caught and st["items"].get("buyaosheng", 0) > 0:
                        page.click('.cmd-btn[data-cmd="item"]')
                        page.wait_for_selector('[data-item="buyaosheng"]')
                        page.click('[data-item="buyaosheng"]')
                        page.wait_for_timeout(300)
                        page.locator('.unit-card[data-unit-id="e0"]').click()
                        page.wait_for_timeout(400)
                    elif not caught and uid in ("p0", "p1") and e0 and e0["alive"]:
                        page.click('.cmd-btn[data-cmd="attack"]')
                        page.wait_for_timeout(300)
                        page.locator('.unit-card[data-unit-id="e0"]').click()
                        page.wait_for_timeout(300)
                    elif not caught and uid in ("p2", "p3"):
                        page.click('.cmd-btn[data-cmd="defend"]')
                        page.wait_for_timeout(200)
                    elif uid == "p0" and low and low["hp"] / low["maxHp"] < 0.35 and st["items"].get("jinchuang", 0) > 0:
                        page.click('.cmd-btn[data-cmd="item"]')
                        page.wait_for_selector('[data-item="jinchuang"]')
                        page.click('[data-item="jinchuang"]')
                        page.wait_for_timeout(300)
                        page.locator(f'.unit-card[data-unit-id="{low["id"]}"]').click()
                        page.wait_for_timeout(300)
                    else:
                        qa.click_auto()
                else:
                    st_now = qa.battle_state()
                    if not caught and st_now and "huobao" in (st_now.get("caught") or []):
                        caught = True
                    page.wait_for_timeout(150)
            qa.wait_victory()
            page.click("#btn-victory-ok")
            page.wait_for_timeout(400)
            cap.click_dialogs_until('.cmd-btn[data-cmd="auto"]', 60)  # 战后对话→摩云洞

            # ---------- 玉面公主 → 初战牛魔王 ----------
            print("== 摩云洞 ==")
            for _ in range(600):
                if qa.defeat_retry():
                    continue
                if page.locator("#dialog").count() > 0:
                    page.locator("#dialog").click()
                    page.wait_for_timeout(200)
                    continue
                if qa.battle_over():
                    break
                if qa.cmd_visible():
                    st = qa.battle_state()
                    low = qa.lowest_party(st)
                    uid = qa.prompt_unit_id()
                    if uid == "p0" and low and low["hp"] / low["maxHp"] < 0.35 and st["items"].get("jinchuang", 0) > 0:
                        page.click('.cmd-btn[data-cmd="item"]')
                        page.wait_for_selector('[data-item="jinchuang"]')
                        page.click('[data-item="jinchuang"]')
                        page.wait_for_timeout(300)
                        page.locator(f'.unit-card[data-unit-id="{low["id"]}"]').click()
                        page.wait_for_timeout(300)
                    else:
                        qa.click_auto()
                else:
                    page.wait_for_timeout(150)
            qa.wait_victory()
            page.click("#btn-victory-ok")
            page.wait_for_timeout(400)
            cap.click_dialogs_until('.cmd-btn[data-cmd="auto"]', 60)  # 战后→初战牛魔王
            for _ in range(200):  # 3 回合赴宴而走
                if page.locator("#dialog").count() > 0:
                    break
                if qa.cmd_visible():
                    qa.click_auto()
                else:
                    page.wait_for_timeout(200)

            # ---------- 碧波潭(bibotan.jpg = 第一个选择节点) ----------
            print("== 碧波潭 ==")
            cap.click_dialogs_until("#choice-crab", 60)
            page.wait_for_timeout(300)
            cap.save(SHOTS / "bibotan.jpg")
            page.click("#choice-insect")  # 先试错:蟭蟟虫被冲回
            cap.click_dialogs_until("#choice-crab", 30)
            page.click("#choice-crab")
            cap.click_dialogs_until("#choice-shift", 30)
            page.click("#choice-shift")
            cap.click_dialogs_until("#choice-steal", 30)
            page.click("#choice-steal")
            cap.click_dialogs_until("#choice-check", 60)  # 偷兽→骗扇→反骗选择

            # ---------- 反骗 → 换辟水金睛兽上阵 → 决战 ----------
            print("== 决战前 ==")
            page.click("#choice-check")
            page.wait_for_selector("#dialog", timeout=15000)
            for _ in range(4):  # fanpianCheck 四句,点完后是 BOSS 战前对话
                page.locator("#dialog").click()
                page.wait_for_timeout(250)
            page.wait_for_selector("#dialog", timeout=15000)  # preBattle3 战前对白
            # 换宠上阵(对话与面板可叠加;必须在真扇小卡弹出前完成,否则小卡会挡顶栏)
            page.click("#btn-pet")
            page.wait_for_selector("#modal-pet")
            page.click('[data-pet-active="pixie"]')
            page.wait_for_selector("#modal-pet")
            page.click("#modal-pet-close")
            qa.click_dialogs()  # 点完 BOSS 战前对白
            page.wait_for_selector("#btn-once-close", timeout=20000)  # 真扇三段小卡
            page.click("#btn-once-close")
            page.wait_for_selector('.cmd-btn[data-cmd="auto"]', timeout=15000)

            # ---------- 战斗3 · 真扇三段(主图候选 B) ----------
            print("== 战斗3 ==")
            fan_used = 0
            fan3_round = None  # 第三扇所在回合:主图必须等这回合结算完(落雨/破绽上场)再拍
            formation_switched = False
            for i in range(600):
                if qa.defeat_retry():
                    fan_used = 0
                    fan3_round = None
                    formation_switched = False
                    continue
                if page.locator("#dialog").count() > 0:
                    page.locator("#dialog").click()
                    page.wait_for_timeout(200)
                    continue
                if qa.battle_over():
                    break
                if fan3_round is not None:
                    # 第三扇已下:其余伙伴自动,等这回合结算完、回合数翻篇再拍
                    if qa.cmd_visible():
                        st_now = qa.battle_state()
                        if st_now and st_now.get("round", 0) > fan3_round:
                            break
                        qa.click_auto()
                    else:
                        page.wait_for_timeout(150)
                    continue
                if qa.cmd_visible():
                    st = qa.battle_state()
                    uid = qa.prompt_unit_id()
                    low = qa.lowest_party(st)
                    round_now = (st or {}).get("round", 1)
                    charging = any(u["charge"] == 1 and u["alive"] for u in st["units"] if not u["id"].startswith("p"))
                    if uid == "p0" and not formation_switched:
                        page.click("#btn-battle-formation")  # 天罡 → 六丁
                        formation_switched = True
                        page.wait_for_timeout(500)
                    elif charging and low and uid == low["id"]:
                        page.click('.cmd-btn[data-cmd="defend"]')
                        page.wait_for_timeout(300)
                    elif uid == "p0" and fan_used < 3 and round_now >= 2:
                        page.click('.cmd-btn[data-cmd="item"]')
                        page.wait_for_selector('[data-item="truefan"]')
                        page.click('[data-item="truefan"]')
                        fan_used += 1
                        if fan_used == 3:
                            fan3_round = round_now
                        page.wait_for_timeout(500)
                    elif uid == "p0" and low and low["hp"] / low["maxHp"] < 0.3 and st["items"].get("jinchuang", 0) > 0:
                        page.click('.cmd-btn[data-cmd="item"]')
                        page.wait_for_selector('[data-item="jinchuang"]')
                        page.click('[data-item="jinchuang"]')
                        page.wait_for_timeout(300)
                        page.locator(f'.unit-card[data-unit-id="{low["id"]}"]').click()
                        page.wait_for_timeout(300)
                    else:
                        qa.click_auto()
                else:
                    page.wait_for_timeout(150)
            if fan_used < 3:
                raise RuntimeError(f"真扇只用了 {fan_used} 次,候选 B 帧没拍到")
            page.wait_for_timeout(300)
            cap.save(CAND / "candidate_b_truefan3.jpg", toast_clear=True)

            ctx.close()
            browser.close()
    finally:
        if server:
            server.terminate()

    if errors:
        print(f"\n控制台报错 {len(errors)} 条:")
        for e in errors[:5]:
            print("  ERR:", e[:300])
        return 1
    print("\n四图重拍完成(hero.jpg 由两张候选裁定后复制,见简报 T12 报告要求)")
    return 0


if __name__ == "__main__":
    sys.exit(run())
