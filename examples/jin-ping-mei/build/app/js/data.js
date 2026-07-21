// 数据表驱动:新增节令/传闻/谋算/对手只加数据,不改引擎。
// 文案边界:无性描写、无露骨台词;「宠」只用席位、赏赐、差事、称谓表达。

// ---------- 结局判定阈值 ----------
export const ENDING = {
  siHigh: 800,   // 私房高档
  siMid: 300,    // 私房中档
  windHigh: 60,  // 风声高位
};

// ---------- 对手(五位有目标的行动者;李娇儿只上榜、不主动出手) ----------
export const RIVALS = {
  yue:     { name: '吴月娘', join: 1, ming: 60, si: 300, style: 'steady' },
  lijiaoer:{ name: '李娇儿', join: 1, ming: 35, si: 260, style: 'hoarder' },
  xuee:    { name: '孙雪娥', join: 1, ming: 18, si: 40,  style: 'chaos' },
  pan:     { name: '潘金莲', join: 4, ming: 26, si: 20,  style: 'aggressive' },
  pinger:  { name: '李瓶儿', join: 6, ming: 38, si: 900, style: 'defensive' },
  chunmei: { name: '庞春梅', join: 1, ming: 12, si: 5,   style: 'climber', offBoard: true },
};

// ---------- 仆役情报网 ----------
export const SERVANTS = {
  daian:    { price: 30, closeTo: null },      // 玳安:谁都能聊,但嘴不稳
  xiaoyu:   { price: 20, closeTo: 'yue' },
  fengmama: { price: 20, closeTo: 'pinger' },
  xuemei:   { price: 0,  closeTo: 'player' },  // 薛媒婆:你的旧识,不收钱
};

// 可信度 → 为真的概率
export const CRED_TRUTH = { '高': 0.9, '中': 0.7, '低': 0.5 };

// 传闻模板:{name}=对象房。kind 用于证实后可知的事实类型。
export const RUMOR_TEXTS = {
  cang: [
    '听说{name}院里这几个月只进不出，箱笼都换了新锁。',
    '{name}房里前两日叫人抬了两口箱子出去，不知去了哪儿。',
  ],
  zheng: [
    '家主前儿把新到的缎子先紧着{name}院里挑了。',
    '节下的席面，{name}的座次又往前挪了一位。',
  ],
  scheme: [
    '有人瞧见{name}院里的人，半夜往{other}院里去。',
    '{name}房里的妈妈近日总往{other}院门口凑，没安好心。',
  ],
  hostile: [
    '{name}提起你就咬牙，当心些。',
    '{name}院里放出话来，说你的闲话早晚要递到大娘子跟前。',
  ],
  calm: [
    '{name}院里安安静静的，没什么动静。',
    '{name}这几日只在屋里做针线，哪儿也没去。',
  ],
};

// ---------- 谋算种类 ----------
export const SCHEMES = {
  sanbu:   { name: '散布流言', desc: '暗中散播对某房不利的说法', mingHit: 14, selfTiyan: 4 },
  duozhang:{ name: '夺其差事', desc: '运作让某房失去手中差事',   mingHit: 18, selfTiyan: 8 },
  zuoshi:  { name: '坐实传闻', desc: '把一条已证实的传闻递到明处', mingHit: 22, selfTiyan: 6, needRumor: true },
  jiexin:  { name: '截留书信', desc: '截看某房与外间往来的书信',   mingHit: 6,  selfTiyan: 2, reveal: true },
};
export const SCHEME_STEP = 34;      // 每次「谋」推进的进度
export const SCHEME_WIND = 6;       // 每次推进升起的风声

// ---------- 差事 ----------
export const DUTIES = {
  zhongkui: { tiyan: 12, chong: 4, gong: 120, desc: '执掌中馈，一宅的饭食人事从你手里过' },
  puzhang:  { tiyan: 10, chong: 3, gong: 260, desc: '理铺子的账，公中银由你经手' },
  yanyan:   { tiyan: 14, chong: 5, gong: 80,  desc: '操办节令宴席，体面来得最快' },
};

// ---------- 退路 ----------
export const TUILU = {
  niangjia: { name: '娘家门路', open: 3,  cost: 200, desc: '薛媒婆替你走动，娘家那边先递了话' },
  puzi:     { name: '铺子门路', open: 9,  cost: 300, desc: '韩道国的绒线铺里，有你一分子' },
  guanmei:  { name: '官媒门路', open: 16, cost: 400, desc: '薛媒婆说，李衙内那边，她替你先看一看' },
};

// ---------- 24 节令 ----------
// choice.effects: {tiyan,chong,sifang,feng,gong,renqing:{who:delta},tuilu,flag,setVar}
export const FESTIVALS = [
  { n: 1, act: 1, name: '过门', chapter: '第七回',
    intro: '嫁妆箱笼抬进仪门，账房先生执笔待记。你的嫁妆上千两，还有两张南京拔步床、三二百筒三梭布。',
    choices: [
      { id: 'gong', text: '登记入公中', hint: '+体面 +宠',
        effects: { tiyan: 15, chong: 10, sifang: 200 },
        result: '账房记下你的名字，大娘子当众赞了一句「懂事」。满宅都看见了你的体面。' },
      { id: 'si', text: '留一半在自己名下', hint: '+私房',
        effects: { tiyan: 3, sifang: 600 },
        result: '你把一半箱笼径直抬回自己院里。没人说什么，但也没有人为你说什么。' },
    ] },
  { n: 2, act: 1, name: '元宵', chapter: '第十五回',
    intro: '元宵放灯。堂屋设席，座次就是名分。排行榜今夜第一次挂出来。',
    settle: 'yanxi' },
  { n: 3, act: 1, name: '清明', chapter: '第二十五回',
    intro: '清明烧纸。仆役们开始往你院里走动——传闻可买了。薛媒婆说，娘家那条路，随时可以替你开。',
    grantRumor: { servant: 'xiaoyu', target: 'xuee', cred: '高', truth: true } },
  { n: 4, act: 1, name: '端午', chapter: '第九回',
    intro: '潘金莲入门，行拜见礼，排行第五。她没有嫁妆，没有娘家，只有一双眼睛。排行榜添了一块新木牌。',
    join: ['pan'] },
  { n: 5, act: 1, name: '七夕', chapter: '第二十二回',
    intro: '七夕乞巧。宅里的嘴多起来——从这一令起，买来的传闻里会有假的。',
    grantRumor: { servant: 'daian', target: 'yue', cred: '中', truth: false } },
  { n: 6, act: 1, name: '中秋', chapter: '第十九回',
    intro: '李瓶儿携资入门，排行第六。她带来的银子比你的还多。今夜满院灯火，座次要重排了。',
    join: ['pinger'], settle: 'yanxi', dutyRisk: true },
  { n: 7, act: 2, name: '冬至', chapter: '第三十回',
    intro: '官哥儿降生，西门庆买得金吾卫副千户的官身。生子加官，全宅到了顶点。从这一令起，「谋」与风声入局。',
    unlockMou: true },
  { n: 8, act: 2, name: '立春', chapter: '第三十三回',
    intro: '开春。各房的眼神都变了——有了官哥儿，这宅子里的每一笔账都要重算。' },
  { n: 9, act: 2, name: '花朝', chapter: '第三十六回',
    intro: '花朝节。绒线铺新开张，韩道国做了伙计。铺子那条门路，如今可以走了。' },
  { n: 10, act: 2, name: '佛诞', chapter: '第四十回',
    intro: '浴佛。中馈之权要重新分派，大娘子在看谁接。',
    choices: [
      { id: 'zheng', text: '当众争这权', hint: '+体面 +风声',
        effects: { tiyan: 8, feng: 5 },
        result: '你当席应了下来。有人佩服，也有人记下了你的名字。' },
      { id: 'rang', text: '让给大娘子的人', hint: '+大娘子人情',
        effects: { renqing: { yue: 10 } },
        result: '你退了一步。大娘子看你一眼，什么都没说，什么都记下了。' },
    ] },
  { n: 11, act: 2, name: '夏至', chapter: '第四十四回',
    intro: '夏至。铺账、节礼、人情往来，都赶在这一令。' },
  { n: 12, act: 2, name: '中元', chapter: '第四十八回',
    intro: '中元烧包。官场上有人参了西门庆一本，宅子里气压很低——这一令的明账，涨得虚。' },
  { n: 13, act: 2, name: '重阳', chapter: '第五十二回',
    intro: '重阳登高。家主的应酬越来越多，回来得越来越晚。' },
  { n: 14, act: 2, name: '寒衣', chapter: '第五十六回',
    intro: '寒衣节。李瓶儿房里的灯，常常亮到后半夜。' },
  { n: 15, act: 2, name: '官哥儿夭', chapter: '第五十九回',
    intro: '官哥儿受惊，没了。宅子里人人知道是怎么回事，人人不说。你买下的传闻在你袖子里发烫。',
    choices: [
      { id: 'jiefa', text: '揭发', hint: '+体面 +风声 · 潘金莲成死敌',
        effects: { tiyan: 15, feng: 20, flag: 'jiefa' },
        result: '你把话递到了大娘子跟前。体面是你的了，死敌也是你的了。' },
      { id: 'chenmo', text: '沉默', hint: '无变化',
        effects: {},
        result: '你什么都没说。袖子里那条传闻，慢慢凉了。' },
      { id: 'huanqu', text: '换取好处', hint: '+私房 +潘金莲人情 −体面',
        effects: { sifang: 250, renqing: { pan: 20 }, tiyan: -8, flag: 'huanqu' },
        result: '潘金莲院里的人深夜送来一口小箱子。你们谁都没有提官哥儿。' },
    ], dutyRisk: true },
  { n: 16, act: 2, name: '李瓶儿病故', chapter: '第六十二回',
    intro: '李瓶儿病了三个月，没了。大办丧仪，宅里白幡满院。她的那块木牌，从排行榜上撤了下来。',
    dead: ['pinger'],
    choices: [
      { id: 'jiefa2', text: '借丧仪再提旧事', hint: '+体面 +风声',
        effects: { tiyan: 8, feng: 12 },
        result: '丧仪上你又递了一句话。有人开始躲着你走。' },
      { id: 'songzhong', text: '好好送一程', hint: '+各房人情',
        effects: { renqing: { yue: 8, xuee: 5 } },
        result: '你帮着料理了丧仪。人都说三娘心善。' },
      { id: 'shoulian', text: '收敛不出头', hint: '+私房',
        effects: { sifang: 120 },
        result: '白事乱，账也乱。你把自己的东西清点了一遍，又锁紧了一层。' },
    ] },
  { n: 17, act: 2, name: '元宵·虚顶', chapter: '第七十八回',
    intro: '又是元宵。西门庆权势最盛，烟火放到半夜。明账的收益眼下是最好的——可你听得出，这火太旺了。',
    mingBoost: true },
  { n: 18, act: 2, name: '重阳·虚顶', chapter: '第七十九回前',
    intro: '家主连日在王三官府上赴宴，回来时说心口疼。排行榜上的数字还在涨，涨得让人眼热。',
    mingBoost: true },
  { n: 19, act: 3, name: '第七十九回', chapter: '第七十九回', clear: true,
    intro: '这一日，宅子里的事，一件接着一件。' },
  { n: 20, act: 3, name: '分家 · 债主上门', chapter: '第八十回',
    intro: '家主一倒，债主上门。李娇儿已经悄悄卷了财物回院里去了。吴月娘主持分家，先问的是现银。',
    dead: ['lijiaoer'],
    choices: [
      { id: 'dadian', text: '拿私房打点', hint: '−150私房 +大娘子人情', needSi: 150,
        effects: { sifang: -150, renqing: { yue: 12 } },
        result: '银子递出去，债主的口气软了。大娘子看在眼里。' },
      { id: 'shuoxiang', text: '请大娘子说项', hint: '−12大娘子人情', needRq: { who: 'yue', n: 12 },
        effects: { renqing: { yue: -12 }, sifang: 60 },
        result: '大娘子出面回了几笔。欠她的，从此你心里有数。' },
      { id: 'yingding', text: '硬顶着不出', hint: '+风声',
        effects: { feng: 10 },
        result: '你一两没出。债主走了，话留下了。' },
    ] },
  { n: 21, act: 3, name: '分家 · 铺子关张', chapter: '第八十一回',
    intro: '韩道国拐了一千两货款远遁，来保也欺主自开布铺。铺子一间间关张，人手星散。',
    settle: 'puzi' },
  { n: 22, act: 3, name: '分家 · 月娘分派', chapter: '第八十五回',
    intro: '月娘按礼法与实际把持，分派余下的家产。春梅已被发卖，潘金莲也被逐出。宅子里越来越空。',
    settle: 'fenpei' },
  { n: 23, act: 3, name: '去向', chapter: '第九十一回',
    intro: '尘埃落定。你的去路，只看你这些年藏下的那本账。',
    ending: true },
  { n: 24, act: 3, name: '第一百回', chapter: '第一百回',
    intro: '后来。',
    epilogue: true },
];

// ---------- 宴席结算(排行榜的诱惑):宠高者席位靠前,额外体面 ----------
export const YANXI = [
  { minChong: 40, tiyan: 8, text: '你的席位排得靠前，众人举杯先敬你。' },
  { minChong: 20, tiyan: 4, text: '你的席位不差，也算体面。' },
  { minChong: 0, tiyan: 0, text: '你的席位靠后。满桌的笑语，隔着几个人才传到你耳边。' },
];
