// 入口与流程编排:标题 → 24 节令(事件→行动→结算) → 第79回清零演出 → 分家 → 结局 → 收束。
// 引擎在 engine.js(纯逻辑);此文件只做呈现与输入。

import { TEXT } from './text.js';
import { SERVANTS, SCHEMES, DUTIES, TUILU, ENDING } from './data.js';
import * as E from './engine.js';
import { loadAssets, coverURL, portraitURL, compoundStyle } from './assets.js';
import { el, clear, toast, spawnFloats, showModal, closeModal, sealButton } from './ui.js';
import { createCompound } from './compound.js';
import { audio } from './audio.js';

const SAVE_KEY = 'jpm_save_v1';
const params = new URLSearchParams(location.search);
const FAST = params.get('fast') === '1';
const SEED = params.has('seed') ? Number(params.get('seed')) : (Date.now() % 100000);
const wait = (ms) => new Promise((r) => setTimeout(r, FAST ? Math.min(ms, 60) : ms));

const app = document.getElementById('app');
let state = null;
let compound = null;
let els = {}; // 舞台各层引用

// ---------- 音频:首次手势后解锁并按当前场景起 BGM ----------
function sceneFor() {
  if (!state) return 'title';
  return `act${E.festivalDef(state).act}`;
}
let audioArmed = false;
document.addEventListener('pointerdown', () => {
  if (audioArmed) return;
  audioArmed = true;
  audio.unlock();
  audio.playBGM(sceneFor());
}, { capture: true });

// 事件对话卡的立绘(居右)
const EVENT_PORTRAIT = {
  1: 'servant/xue_meipo', 4: 'portrait/pan_jinlian', 6: 'portrait/li_pinger',
  7: 'portrait/ximen_qing', 15: 'portrait/pan_jinlian', 16: 'portrait/li_pinger',
  19: 'portrait/ximen_qing', 20: 'portrait/wu_yueniang', 21: 'portrait/wu_yueniang',
  22: 'portrait/wu_yueniang', 23: 'servant/xue_meipo',
};

// ---------- 启动 ----------
boot();
async function boot() {
  await loadAssets();
  renderTitle();
}

// ---------- 标题画面 ----------
function renderTitle() {
  clear(app);
  const t = el('div', 'title-screen');
  const cover = el('div', 'title-cover');
  const cu = coverURL();
  if (cu) cover.style.backgroundImage = `url(${cu})`;
  else Object.assign(cover.style, compoundStyle('cover'));
  const side = el('div', 'title-side');
  const logo = el('div', 'title-logo');
  logo.appendChild(el('h1', '', TEXT.title));
  logo.appendChild(el('div', 'sub', TEXT.subtitle));
  side.appendChild(logo);
  side.appendChild(el('div', 'title-intro', TEXT.intro.join('\n')));
  const btns = el('div', 'title-btns');
  const hasSave = !!localStorage.getItem(SAVE_KEY);
  const bCont = el('button', 'big-btn', TEXT.btn.cont);
  bCont.id = 'btn-continue';
  bCont.disabled = !hasSave;
  bCont.addEventListener('click', () => {
    const loaded = E.deserialize(localStorage.getItem(SAVE_KEY));
    if (loaded) startGame(loaded);
    else toast(app, '旧账已不可读。');
  });
  const bStart = el('button', 'big-btn primary', TEXT.btn.start);
  bStart.id = 'btn-start';
  bStart.addEventListener('click', () => { localStorage.removeItem(SAVE_KEY); startGame(E.newGame(SEED)); });
  const bHow = el('button', 'big-btn', TEXT.btn.howto);
  bHow.id = 'btn-howto';
  bHow.addEventListener('click', () => {
    showModal(app, {
      id: 'modal-help', title: TEXT.btn.howto, wide: true,
      body: el('div', 'howto-list', TEXT.howto.join('\n')),
      choices: [{ id: 'ok', text: TEXT.btn.howtoClose }],
      onPick: () => closeModal(app),
    });
  });
  btns.append(bCont, bStart, bHow);
  side.appendChild(btns);
  side.appendChild(el('div', 'title-seed', `种子 ${SEED} · 明代绣像风 · 约莫半个至一个时辰`));
  t.append(cover, side);
  app.appendChild(t);
}

// ---------- 开局 ----------
function startGame(loaded) {
  state = loaded;
  buildStage();
  compound.setAct(actKey());
  renderAll();
  showEvent();
}

function actKey() {
  return `act${E.festivalDef(state).act}`;
}

// ---------- 舞台搭建 ----------
function buildStage() {
  clear(app);
  const wrap = el('div', 'stage-wrap');
  const stage = el('div');
  stage.id = 'stage';
  compound = createCompound(stage);
  // 顶部:节令 + 风声 + 静音开关
  els.banner = el('div', 'fest-banner');
  els.wind = el('div', 'wind-seal');
  els.mute = el('button', 'mute-btn', audio.muted ? '默' : '音');
  els.mute.id = 'btn-mute';
  els.mute.title = '音效开关';
  els.mute.addEventListener('click', () => {
    audio.unlock();
    els.mute.textContent = audio.toggleMuted() ? '默' : '音';
  });
  // 右上:金色排行榜;左下:墨色暗账
  els.lb = el('div', 'leaderboard');
  els.an = el('div', 'anledger');
  // 传闻与谋算
  els.schemeTray = el('div', 'scheme-tray');
  els.rumorTray = el('div', 'rumor-tray');
  // 底部行动栏
  els.bar = el('div', 'actionbar');
  // 浮字层
  els.floats = el('div', 'float-layer');
  stage.append(els.banner, els.wind, els.mute, els.lb, els.an, els.schemeTray, els.rumorTray, els.bar, els.floats);
  wrap.appendChild(stage);
  app.appendChild(wrap);
  els.stage = stage;
}

// ---------- 全量渲染 ----------
function renderAll() {
  audio.playBGM(sceneFor());
  renderBanner();
  renderWind();
  renderLeaderboard();
  renderAnledger();
  renderRumors();
  renderSchemes();
  renderBar();
  compound.render(state, E.mingDead(state));
  drainFloats();
}

function drainFloats() {
  if (state.floats.length) {
    const kinds = new Set(state.floats.map((f) => f.k));
    spawnFloats(els.floats, state.floats.splice(0));
    // 三色通感:金=清亮金属音,墨=闷木音,朱=擦弦音
    if (kinds.has('gold')) audio.sfx('ming');
    if (kinds.has('ink')) audio.sfx('an');
    if (kinds.has('red')) audio.sfx('wind');
  }
}

function renderBanner() {
  const ev = E.festivalDef(state);
  clear(els.banner);
  els.banner.appendChild(el('div', 'fest-name', `${ev.name}`));
  els.banner.appendChild(el('div', 'fest-chapter', `${ev.chapter} · 第${ev.n}令`));
  els.banner.appendChild(el('div', 'fest-act', TEXT.ui[`act${ev.act}`]));
  const old = els.stage.querySelector('.jinzu-banner');
  old?.remove();
  if (state.player.jinzu > 0 && state.phase === 'actions') {
    els.stage.appendChild(el('div', 'jinzu-banner', TEXT.ui.jinzu));
  }
}

function renderWind() {
  clear(els.wind);
  const w = state.player.fengsheng;
  els.wind.classList.toggle('hot', w >= 60);
  els.wind.appendChild(el('div', 'wind-stamp', '风'));
  els.wind.appendChild(el('div', 'wind-num', `${w}`));
}

function renderLeaderboard() {
  clear(els.lb);
  if (E.mingDead(state)) { els.lb.style.display = 'none'; return; }
  els.lb.style.display = '';
  els.lb.appendChild(el('div', 'lb-title', TEXT.ui.leaderboard));
  for (const row of E.leaderboard(state)) {
    const r = el('div', `lb-row${row.you ? ' you' : ''}`);
    r.dataset.house = row.id;
    r.appendChild(el('span', 'lb-rank', `${row.rank}`));
    r.appendChild(el('span', 'lb-name', row.name));
    r.appendChild(el('span', 'lb-score', `${row.score}`));
    els.lb.appendChild(r);
  }
}

function renderAnledger(fullscreenLines = null) {
  const p = state.player;
  if (fullscreenLines) {
    clear(els.an);
    els.an.className = 'anledger fullscreen open';
    const body = el('div', 'an-body');
    const lines = el('div', 'an-fs-lines');
    lines.appendChild(el('div', '', `私房 ${p.sifang} 两`));
    for (const [who, v] of Object.entries(p.renqing)) {
      if (v > 0) lines.appendChild(el('div', 'dim', `${TEXT.rivals[who]?.name ?? who} 欠你人情 ${v}`));
    }
    for (const t of p.tuilu) lines.appendChild(el('div', '', `退路 · ${TUILU[t].name}`));
    if (!p.tuilu.length) lines.appendChild(el('div', 'dim', '退路 · 无'));
    body.appendChild(lines);
    els.an.appendChild(body);
    return;
  }
  els.an.className = `anledger${els.an.classList.contains('open') ? ' open' : ''}`;
  clear(els.an);
  const head = el('div', 'an-head');
  head.appendChild(el('span', '', `暗账 · 私房 ${p.sifang} 两`));
  head.appendChild(el('span', '', els.an.classList.contains('open') ? '合' : '开'));
  head.addEventListener('click', () => { els.an.classList.toggle('open'); renderAnledger(); });
  els.an.appendChild(head);
  const body = el('div', 'an-body');
  const rq = Object.entries(p.renqing).filter(([, v]) => v > 0);
  body.appendChild(anRow('私房', `${p.sifang} 两`));
  if (state.player.gongzhong > 0) body.appendChild(anRow(TEXT.ui.gongzhong, `${p.gongzhong} 两`));
  if (rq.length) {
    body.appendChild(el('div', 'an-sub', '人情'));
    for (const [who, v] of rq) body.appendChild(anRow(`　${TEXT.rivals[who]?.name ?? who}`, `${v}`, 'an-sub'));
  }
  body.appendChild(anRow('退路', p.tuilu.length ? p.tuilu.map((t) => TUILU[t].name).join('、') : '无'));
  body.appendChild(el('div', 'an-hint', '不上榜,不给总分。散场时只清算这本。'));
  els.an.appendChild(body);
}
function anRow(k, v, cls = 'an-row') {
  const r = el('div', cls);
  r.appendChild(el('span', '', k));
  r.appendChild(el('span', 'v', v));
  return r;
}

function renderRumors() {
  clear(els.rumorTray);
  const rs = [...state.rumors].reverse().slice(0, 8);
  if (!rs.length) return;
  for (const r of rs) {
    const card = el('div', `rumor-card${r.verified === true ? ' verified-true' : r.verified === false ? ' verified-false' : ''}`);
    const src = el('div', 'rc-src');
    src.appendChild(el('span', '', `${TEXT.servants[r.servant]?.name ?? r.servant} 说`));
    src.appendChild(el('span', 'rc-cred', TEXT.ui.cred[r.cred]));
    card.appendChild(src);
    card.appendChild(el('div', 'rc-text', r.text));
    if (r.verified === null && state.phase === 'actions' && state.ap > 0 && !E.mingDead(state)) {
      const b = el('button', 'rc-verify', TEXT.ui.verify);
      b.dataset.verify = r.id;
      b.addEventListener('click', () => doAction({ type: 'verify', rumorId: r.id }));
      card.appendChild(b);
    }
    if (r.verified === false) card.appendChild(el('span', 'wang', '妄'));
    if (r.verified === true) card.appendChild(el('span', 'rc-cred', TEXT.ui.verifiedTrue));
    els.rumorTray.appendChild(card);
  }
}

function renderSchemes() {
  clear(els.schemeTray);
  for (const s of state.schemes) {
    const def = SCHEMES[s.key];
    const t = state.rivals[s.target];
    const card = el('div', 'scheme-card');
    card.appendChild(el('div', 'sc-name', `${def.name} · 对${t.name}`));
    const bar = el('div', 'sc-bar');
    bar.appendChild(el('div', 'sc-fill')).style.width = `${s.progress}%`;
    card.appendChild(bar);
    card.appendChild(el('div', 'sc-info',
      `${TEXT.ui.informers}:${s.informers.map((x) => TEXT.servants[x]?.name ?? x).join('、') || '无'}`));
    els.schemeTray.appendChild(card);
  }
}

// ---------- 行动栏 ----------
function renderBar() {
  clear(els.bar);
  const inActions = state.phase === 'actions' && !state.over;
  const ap = state.ap;
  const dots = el('div', 'ap-dots');
  for (let i = 0; i < 3; i++) dots.appendChild(el('span', `ap-dot${i < ap ? ' on' : ''}`));
  els.bar.appendChild(dots);
  const defs = [
    ['tan', '探', '买传闻'], ['jie', '结', '送礼'], ['mou', '谋', '起谋算'],
    ['chi', '持', '担差事'], ['cang', '藏', '存退路'],
  ];
  for (const [type, char, label] of defs) {
    const b = sealButton(char, label, () => openSub(type));
    b.dataset.seal = type;
    b.disabled = !inActions || ap <= 0 || (type === 'mou' && !state.flags.mou);
    if (type === 'mou' && !state.flags.mou) b.title = '第二幕解锁';
    els.bar.appendChild(b);
  }
  const sub = el('button', 'submit-btn', TEXT.btn.submit);
  sub.id = 'btn-submit';
  sub.disabled = state.over || state.phase !== 'actions';
  sub.addEventListener('click', doSubmit);
  els.bar.appendChild(sub);
}

// ---------- 行动子面板 ----------
let subSel = {};
function openSub(type) {
  closeSub();
  subSel = {};
  const panel = el('div', 'subpanel');
  panel.id = 'subpanel';
  const rows = [];
  const pickRow = (label, options, key) => {
    const row = el('div', 'sub-row');
    row.appendChild(el('span', 'sub-label', label));
    for (const o of options) {
      const b = el('button', 'pick-btn', o.text);
      b.dataset.pick = `${key}:${o.id}`;
      if (o.disabled) { b.disabled = true; b.title = o.reason ?? ''; }
      b.addEventListener('click', () => {
        subSel[key] = o.id;
        row.querySelectorAll('.pick-btn').forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel');
        if (key === 'scheme' && o.id === 'zuoshi') pickZuoshiRumor(panel);
      });
      row.appendChild(b);
    }
    return row;
  };
  const rivalOpts = (filterDead = true) =>
    Object.values(state.rivals)
      .filter((r) => r.joined && (!filterDead || r.alive))
      .map((r) => ({ id: r.id, text: r.name }));

  let title = '';
  if (type === 'tan') {
    title = `${TEXT.ui.chooseServant} · ${TEXT.ui.chooseTarget}`;
    rows.push(pickRow('仆役', Object.entries(SERVANTS).map(([id, s]) => ({
      id, text: `${TEXT.servants[id].name}${s.price ? ` ${s.price}两` : ' 不收钱'}`,
      disabled: state.player.sifang < s.price, reason: '私房不够',
    })), 'servant'));
    rows.push(pickRow('对象', rivalOpts(), 'target'));
  } else if (type === 'jie') {
    title = '结 · 送礼应酬';
    rows.push(pickRow('对象', [{ id: 'ximen', text: '家主' }, ...rivalOpts()], 'target'));
    rows.push(pickRow('礼', [{ id: 'small', text: TEXT.ui.giftSmall }, { id: 'big', text: TEXT.ui.giftBig }], 'size'));
    rows.push(pickRow('银出', [
      { id: 'si', text: TEXT.ui.fundSi },
      { id: 'gong', text: TEXT.ui.fundGong, disabled: !state.player.duty, reason: '先担差事' },
    ], 'fund'));
  } else if (type === 'mou') {
    title = TEXT.ui.chooseScheme;
    rows.push(pickRow('谋算', Object.entries(SCHEMES).map(([id, s]) => ({ id, text: s.name })), 'scheme'));
    rows.push(pickRow('对象', rivalOpts(), 'target'));
  } else if (type === 'chi') {
    title = TEXT.ui.chooseDuty;
    const rank = E.playerRank(state);
    rows.push(pickRow('差事', Object.entries(DUTIES).map(([id, d]) => ({
      id, text: `${TEXT.ui.dutyNames[id]}(+${d.tiyan}体面 公中${d.gong})`,
      disabled: rank !== null && rank >= 5 && id !== 'puzhang',
      reason: '位次太靠后',
    })), 'duty'));
    rows.push(el('div', 'sub-note', '担差事耗 2 行动;该令若出事,你是第一责任人。'));
  } else if (type === 'cang') {
    title = TEXT.ui.chooseCang;
    rows.push(pickRow('藏', [
      { id: 'save', text: TEXT.ui.cangSave },
      { id: 'help', text: `${TEXT.ui.cangHelp}(40两)` },
      { id: 'tuilu', text: TEXT.ui.cangTuilu },
    ], 'mode'));
    rows.push(pickRow('对象', rivalOpts(), 'target'));
    rows.push(pickRow('退路', Object.entries(TUILU).map(([id, t]) => ({
      id, text: `${t.name} ${t.cost}两`,
      disabled: state.festival < t.open || state.player.tuilu.includes(id) || state.player.sifang < t.cost,
      reason: state.festival < t.open ? `第${t.open}令开` : state.player.tuilu.includes(id) ? '已在手' : '私房不够',
    })), 'line'));
  }
  panel.appendChild(el('div', 'sub-title', title));
  rows.forEach((r) => panel.appendChild(r));
  const actions = el('div', 'sub-actions');
  const bCancel = el('button', 'pick-btn', TEXT.btn.cancel);
  bCancel.addEventListener('click', closeSub);
  const bOk = el('button', 'pick-btn sel', TEXT.btn.confirm);
  bOk.id = 'btn-sub-confirm';
  bOk.addEventListener('click', () => confirmSub(type));
  actions.append(bCancel, bOk);
  panel.appendChild(actions);
  els.stage.appendChild(panel);
}

function pickZuoshiRumor(panel) {
  // 坐实传闻:自动附上该房第一条已证实传闻
  const t = subSel.target;
  if (!t) return;
  const r = state.rumors.find((x) => x.target === t && x.verified === true);
  subSel.rumorId = r?.id ?? null;
}

function closeSub() {
  els.stage?.querySelector('#subpanel')?.remove();
}

function confirmSub(type) {
  let a = null;
  if (type === 'tan') a = { type, servant: subSel.servant, target: subSel.target };
  if (type === 'jie') a = { type, target: subSel.target, size: subSel.size ?? 'small', fund: subSel.fund ?? 'si' };
  if (type === 'mou') {
    if (!subSel.scheme || !subSel.target) { toast(app, '先拣齐再定。'); return; }
    a = { type, scheme: subSel.scheme, target: subSel.target };
    if (subSel.scheme === 'zuoshi') {
      pickZuoshiRumor(els.stage.querySelector('#subpanel'));
      a.rumorId = subSel.rumorId;
    }
  }
  if (type === 'chi') a = { type, duty: subSel.duty };
  if (type === 'cang') {
    if (subSel.mode === 'help') a = { type, mode: 'help', target: subSel.target };
    else if (subSel.mode === 'tuilu') a = { type, mode: 'tuilu', line: subSel.line };
    else a = { type, mode: 'save' };
  }
  if (!a || Object.values(a).some((v) => v === undefined)) {
    toast(app, '先拣齐再定。');
    return;
  }
  doAction(a);
  closeSub();
}

function doAction(a) {
  const r = E.applyAction(state, a);
  if (!r.ok) { toast(app, r.msg); return; }
  if (a.type === 'tan') audio.sfx('paper');
  else if (a.type === 'verify') {
    audio.sfx(r.rumor?.verified === false ? 'wang' : 'paper');
    toast(app, r.rumor.verified ? '查实了:这话不假。' : '查实了:是假话。');
  } else if (a.type === 'mou') audio.sfx('mou', { progress: r.scheme?.progress });
  else audio.sfx('click');
  renderAll();
  save();
}

// ---------- 提交节令 ----------
async function doSubmit() {
  closeSub();
  els.bar.querySelector('#btn-submit').disabled = true;
  audio.sfx('submit');
  const rep = E.submitTurn(state);
  // 仆役动线先行(情报),再弹账
  if (rep.sightings?.length) await compound.playSightings(rep.sightings, FAST);
  renderAll();
  if (rep.rankBefore && rep.rankAfter && rep.rankBefore !== rep.rankAfter) audio.sfx('plank');
  if (rep.faluo) audio.sfx('faluo');
  await wait(300);
  if (rep.faluo) {
    await showNotes(rep.notes, '发落');
  } else if (rep.notes?.length) {
    await showNotes(rep.notes);
  }
  audio.sfx('watch'); // 更漏:节令推进
  if (rep.reveal) {
    const t = state.rivals[rep.reveal.target];
    toast(app, `截得书信:${t.name}私房里约 ${rep.reveal.si} 两。`);
  }
  save();
  if (state.over) return;
  showEvent();
}

function showNotes(notes, title) {
  return new Promise((resolve) => {
    showModal(app, {
      id: 'modal-settle', title: title ?? '节令结算',
      body: notes.join('\n'),
      choices: [{ id: 'ok', text: TEXT.btn.next }],
      onPick: () => { closeModal(app); resolve(); },
    });
  });
}

// ---------- 节令事件 ----------
function showEvent() {
  save();
  compound.setAct(actKey());
  const ev = state.event;
  if (ev.clear) return clearSequence();
  if (ev.ending) return endingScreen();
  if (ev.epilogue) return epilogueScreen();
  renderAll();
  const choices = (ev.choices ?? []).map((c) => ({
    id: c.id, text: c.text, hint: c.hint,
    disabled: !!E.eventChoiceError(state, c), reason: E.eventChoiceError(state, c),
  }));
  const portraitKey = EVENT_PORTRAIT[ev.n];
  const bodyWrap = el('div');
  bodyWrap.appendChild(el('div', '', ev.intro));
  showModal(app, {
    id: 'modal-event', title: `${ev.name}`, sub: `${ev.chapter}`,
    body: bodyWrap,
    portrait: portraitKey ? { src: portraitURL(portraitKey, '') } : null,
    choices: choices.length ? choices : [{ id: 'ok', text: TEXT.btn.confirm }],
    onPick: (id) => {
      audio.sfx('click');
      if (choices.length) {
        const r = E.applyEventChoice(state, id);
        if (!r.ok) { toast(app, r.msg); return; }
        closeModal(app);
        toast(app, r.choice.result);
      } else {
        E.skipEventIfNoChoice(state);
        closeModal(app);
      }
      renderAll();
      save();
    },
  });
}

// ---------- 第79回:明账清零演出 ----------
async function clearSequence() {
  renderAll();
  // 音乐在两秒内抽空,静默3-4秒;这段无声不许任何音效盖过
  audio.playClear(() => audio.playBGM('act3'));
  // 清零演出是全作签名场面:即使 fast 模式也保留可观察的最短节拍
  const cw = (ms) => new Promise((r) => setTimeout(r, FAST ? Math.min(ms, 260) : ms));
  const overlay = el('div', 'clear-overlay');
  overlay.id = 'clear-overlay';
  els.stage.appendChild(overlay);
  const lines = [TEXT.clear.title, TEXT.clear.line1, TEXT.clear.line2, TEXT.clear.line3].map((t) => {
    const n = el('div', 'clear-line', t);
    overlay.appendChild(n);
    return n;
  });
  for (const n of lines) { n.classList.add('on'); await cw(1100); }
  // 灯火逐间熄灭
  compound.lightsOut();
  await cw(2100);
  // 排行榜木牌逐块翻落、掉出画面、不再出现
  const rows = [...els.lb.querySelectorAll('.lb-row')];
  for (const r of rows) { r.classList.add('plank-fall'); await cw(240); }
  els.lb.classList.add('gone');
  await cw(700);
  overlay.querySelectorAll('.clear-line').forEach((n) => n.classList.remove('on'));
  // 墨色暗账面板展开占满全屏
  renderAnledger(true);
  await cw(2000);
  // 历史最高位次:金字浮出 → 褪灰 → 墨字
  const best = el('div', 'clear-line gold', `${TEXT.ui.historyBest}:${rankText(state.bestRank)}`);
  overlay.appendChild(best);
  best.classList.add('on');
  await cw(1600);
  best.classList.remove('gold');
  best.classList.add('fadegray');
  const zero = el('div', 'clear-line', TEXT.ui.bestUseless);
  overlay.appendChild(zero);
  zero.classList.add('on');
  await cw(2000);
  // 收尾:暗账面板收回角落,进入第三幕
  overlay.remove();
  compound.clearLights();
  compound.setAct('act3');
  els.an.className = 'anledger open';
  renderAnledger();
  E.skipEventIfNoChoice(state);
  renderAll();
  toast(app, TEXT.clear.anOpen, 3200);
  save();
}

function rankText(r) {
  return ['—', '第一', '第二', '第三', '第四', '第五', '第六'][r] ?? '—';
}

// ---------- 结局 ----------
function endingScreen() {
  renderAll();
  const e = state.ending;
  const def = TEXT.endings[e.key];
  // 结局定格一记磬音;BGM 依分支:李衙内=向上收束,流落=中途停住
  audio.sfx('qing');
  audio.playBGM(e.key === 'liyanei' ? 'ending_liyanei' : e.key === 'liuluo' ? 'ending_liuluo' : 'ending_other');
  const panel = el('div', 'ending-panel');
  panel.appendChild(el('div', 'ending-name', def.name));
  panel.appendChild(el('div', 'ending-line', def.line));
  const stats = el('div', 'ending-stats');
  stats.appendChild(el('div', '', `私房 ${e.sifang} 两 · 退路 ${e.tuilu} 条 · 风声 ${e.wind}`));
  stats.appendChild(el('div', '', `${TEXT.ui.historyBest}:${rankText(e.bestRank)}`));
  stats.appendChild(el('div', 'zero', TEXT.ui.bestUseless));
  panel.appendChild(stats);
  if (def.source) panel.appendChild(el('div', 'ending-src', def.source));
  const root = el('div', 'ending-screen');
  root.id = 'ending-root';
  root.appendChild(panel);
  els.stage.appendChild(root);
  const b = el('button', 'big-btn primary', TEXT.btn.next);
  b.id = 'btn-ending-next';
  b.addEventListener('click', () => {
    root.remove();
    E.skipEventIfNoChoice(state);
    save();
    doSubmit();
  });
  panel.appendChild(b);
}

// ---------- 第一百回收束 ----------
function epilogueScreen() {
  renderAll();
  const panel = el('div', 'ending-panel');
  panel.appendChild(el('div', 'ending-name', '第一百回'));
  panel.appendChild(el('div', 'ending-line epilogue-lines', TEXT.epilogue.join('\n')));
  const e = state.ending;
  if (e) {
    const def = TEXT.endings[e.key];
    panel.appendChild(el('div', 'ending-stats', `你的去向:${def.name}`));
  }
  const root = el('div', 'ending-screen');
  root.id = 'epilogue-root';
  root.appendChild(panel);
  els.stage.appendChild(root);
  const b = el('button', 'big-btn primary', TEXT.btn.endingRestart);
  b.id = 'btn-restart';
  b.addEventListener('click', () => { localStorage.removeItem(SAVE_KEY); location.reload(); });
  panel.appendChild(b);
  localStorage.removeItem(SAVE_KEY); // 一局已了
  state.over = true;
}

// ---------- 存读 ----------
function save() {
  if (!state || state.over) return;
  try { localStorage.setItem(SAVE_KEY, E.serialize(state)); } catch { /* 存储不可用时静默 */ }
}

// ---------- QA 钩子 ----------
window.__game = {
  state: () => state,
  phase: () => state?.phase,
  festival: () => state?.festival,
  leaderboard: () => (state ? E.leaderboard(state) : []),
  engine: E,
  seed: SEED,
  fast: FAST,
};
