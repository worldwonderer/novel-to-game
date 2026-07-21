// 宅院剖面视图:固定比例舞台(1672:941),三幕背景交叉淡入,
// 房间锚点、人物立像、仆役提灯动线(核心情报)、风声窃语剪影、灭灯演出。
// 可视元素一律经皮肤层键查表;缺图时 assets.js 回退灰盒。

import { compoundStyle, portraitURL, hasImage, urlOf } from './assets.js';
import { el, clear } from './ui.js';

// 房间锚点(相对舞台 %,取房间地坪)。横向:前厅铺面→厢院→仪门→正房→厢院→花园。
export const ROOMS = {
  xuee:    { x: 10, y: 68 },  // 厨下(前厅铺面一侧)
  lijiaoer:{ x: 23, y: 70 },
  player:  { x: 31, y: 70 },
  gate:    { x: 40, y: 72 },  // 仪门(外间来路)
  ximen:   { x: 43, y: 64 },
  yue:     { x: 55, y: 66 },  // 正房
  chunmei: { x: 63, y: 70 },
  pan:     { x: 68, y: 70 },
  pinger:  { x: 76, y: 70 },
  garden:  { x: 90, y: 72 },
};
const CORRIDOR_Y = 78; // 廊道(动线承载区)

const PORTRAIT_KEY = {
  player: ['portrait/meng_yulou', 'portrait/meng_yulou_mourning'],
  pan: ['portrait/pan_jinlian', 'portrait/pan_jinlian_mourning'],
  pinger: ['portrait/li_pinger', 'portrait/li_pinger'],
  yue: ['portrait/wu_yueniang', 'portrait/wu_yueniang_mourning'],
  xuee: ['portrait/sun_xuee', 'portrait/sun_xuee_mourning'],
  chunmei: ['portrait/pang_chunmei', 'portrait/pang_chunmei_madam'], // 她不穿孝,她高升了
  lijiaoer: ['portrait/li_jiaoer', 'portrait/li_jiaoer'],
  ximen: ['portrait/ximen_qing', 'portrait/ximen_qing'],
};
const NAMES = {
  player: '孟玉楼', pan: '潘金莲', pinger: '李瓶儿', yue: '吴月娘',
  xuee: '孙雪娥', chunmei: '庞春梅', lijiaoer: '李娇儿', ximen: '西门庆',
};
const SERVANT_KEY = {
  daian: 'servant/daian', xiaoyu: 'servant/xiaoyu', fengmama: 'servant/feng_mama', xuemei: 'servant/xue_meipo',
};
const SERVANT_NAMES = { daian: '玳安', xiaoyu: '小玉', fengmama: '冯妈妈', xuemei: '薛媒婆' };

export function createCompound(stage) {
  stage.classList.add('stage');
  const bgA = el('div', 'bg-layer'), bgB = el('div', 'bg-layer');
  const glowLayer = el('div', 'glow-layer');
  const roomLayer = el('div', 'room-layer');
  const moveLayer = el('div', 'move-layer');
  const whisperLayer = el('div', 'whisper-layer');
  stage.append(bgA, bgB, glowLayer, roomLayer, whisperLayer, moveLayer);
  let curAct = null;
  let bgFlip = false;

  function setAct(actKey) {
    if (curAct === actKey) return;
    curAct = actKey;
    const show = bgFlip ? bgA : bgB;
    const hide = bgFlip ? bgB : bgA;
    bgFlip = !bgFlip;
    Object.assign(show.style, compoundStyle(`compound/${actKey}`));
    show.classList.add('on');
    hide.classList.remove('on');
  }

  function render(state, mingDeadNow) {
    clear(roomLayer);
    clear(whisperLayer);
    clear(glowLayer);
    const mourning = state.festival >= 19;
    for (const r of Object.values(state.rivals)) {
      if (!r.joined || !r.alive) continue; // 春梅不上榜,但她在宅子里,看得见
      putPortrait(r.id, mourning);
      putGlow(r.id, state, mourning);
    }
    putPortrait('player', mourning);
    putGlow('player', state, mourning);
    if (!mingDeadNow && state.festival >= 2) {
      putPortrait('ximen', false);
      putGlow('ximen', state, false);
    }
    // 风声≥60:廊下出现窃窃私语的仆役剪影(可读预警)
    if (state.player.fengsheng >= 60) {
      for (const x of [36, 58, 82]) {
        const w = el('div', 'whisper');
        w.style.left = `${x}%`;
        w.style.top = `${CORRIDOR_Y - 8}%`;
        whisperLayer.appendChild(w);
      }
    }
  }

  // 灯火层:哪里亮=哪里有人在动。第三幕灯灭大半,只剩正房与玩家房里一点。
  function putGlow(id, state, mourning) {
    const a = ROOMS[id];
    if (!a) return;
    const g = el('div', 'room-glow');
    g.style.left = `${a.x}%`;
    g.style.top = `${a.y - 10}%`;
    if (mourning && id !== 'player' && id !== 'yue') g.classList.add('dim');
    glowLayer.appendChild(g);
  }

  function putPortrait(id, mourning) {
    const a = ROOMS[id];
    if (!a) return;
    const wrap = el('div', `room-fig fig-${id}`);
    wrap.style.left = `${a.x}%`;
    wrap.style.top = `${a.y}%`;
    const keys = PORTRAIT_KEY[id];
    const key = mourning ? keys[1] : keys[0];
    const img = el('img', 'fig-img');
    img.src = portraitURL(key, NAMES[id]);
    img.alt = NAMES[id];
    img.draggable = false;
    wrap.appendChild(img);
    wrap.appendChild(el('span', 'fig-name', NAMES[id]));
    roomLayer.appendChild(wrap);
  }

  // 仆役提灯动线:谁往谁屋里去 = 玩家的核心情报
  function playSightings(sightings, fast) {
    const jobs = sightings.slice(0, 4).map((s, i) => runOne(s, i * (fast ? 0 : 500), fast));
    return Promise.all(jobs);
  }

  function runOne(s, delay, fast) {
    return new Promise((resolve) => {
      const from = ROOMS[s.from] ?? ROOMS.gate;
      const to = ROOMS[s.to] ?? ROOMS.garden;
      const fig = el('div', 'mover');
      const img = el('img', 'mover-img');
      img.src = urlOf(SERVANT_KEY[s.servant]) ?? portraitURL(SERVANT_KEY[s.servant], SERVANT_NAMES[s.servant] ?? '仆', false);
      img.alt = SERVANT_NAMES[s.servant] ?? '仆役';
      img.draggable = false;
      const lamp = el('span', 'mover-lamp');
      fig.append(lamp, img);
      moveLayer.appendChild(fig);
      const dur = fast ? 60 : 700;
      const steps = [
        { x: from.x, y: CORRIDOR_Y },
        { x: to.x, y: CORRIDOR_Y },
        { x: to.x, y: to.y + 6 },
      ];
      fig.style.left = `${from.x}%`;
      fig.style.top = `${from.y + 6}%`;
      let i = 0;
      const stepNext = () => {
        if (i >= steps.length) {
          setTimeout(() => { fig.remove(); resolve(); }, fast ? 60 : 500);
          return;
        }
        const st = steps[i++];
        fig.style.transitionDuration = `${dur}ms`;
        fig.style.left = `${st.x}%`;
        fig.style.top = `${st.y}%`;
        setTimeout(stepNext, dur + 40);
      };
      setTimeout(stepNext, delay);
    });
  }

  // 第79回:灯火逐间熄灭
  function lightsOut() {
    stage.classList.add('lights-out');
  }
  function clearLights() {
    stage.classList.remove('lights-out');
  }

  return { setAct, render, playSightings, lightsOut, clearLights, ROOMS };
}
