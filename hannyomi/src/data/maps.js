'use strict';
// 맵 데이터
//  platforms[0] 은 항상 바닥. 나머지는 아래에서 점프로 올라갈 수 있는 발판
//  spawns: {m: 몬스터, p: 발판 번호, x: 중심 위치, n: 마릿수, gap: 간격}
//  portals: {id, x, to, toPortal, hidden}. hidden 포탈은 배 도착 지점처럼 보이지 않는 위치
//  respawn: 일반 몬스터 리젠 시간(초). 보스방(bossRoom)은 입장할 때마다 보스가 새로 등장
G.GROUND_Y = 610;
G.MAPS = {};
(function () {
  const Y = G.GROUND_Y;
  const add = (id, o) => {
    o.id = id;
    o.platforms = [{ x: 0, y: Y, w: o.width, ground: true }, ...(o.plats || []).map(([x, y, w]) => ({ x, y, w }))];
    o.npcs = o.npcs || []; o.portals = o.portals || []; o.spawns = o.spawns || []; o.deco = o.deco || [];
    o.respawn = o.respawn || 7;
    G.MAPS[id] = o;
  };
  G.addMap = add;

  // ======================= 튜토리얼 =======================
  add('dream_beach', {
    name: '꿈속의 해변', lvText: '튜토리얼', theme: 'dream', width: 2000, home: 'dream_beach', start: 160, hidden: true, respawn: 3,
    plats: [[560, 470, 280], [620, 285, 180]],
    deco: [{ t: 'crystal', x: 420 }, { t: 'tree', x: 960 }, { t: 'crystal', x: 1560 }, { t: 'sign', x: 1860, text: '꿈에서 깨어나기 →' }],
    npcs: [{ id: 'lumi', x: 330 }],
    spawns: [{ m: 'dummy', p: 0, x: 1230, n: 3, gap: 150 }],
    portals: [{ id: 'east', x: 1940, to: 'sprout_port', label: '꿈에서 깨어나기' }],
  });
  G.MAPS.dream_beach.platforms[2].high = true;

  // ======================= 종장: 공허의 왕좌 =======================
  add('void_throne', {
    name: '공허의 왕좌', lvText: '최종 보스 · Lv.100', theme: 'void', width: 1700, home: 'noxgate', start: 260, bossRoom: true,
    plats: [[230, 470, 240], [1230, 470, 240], [280, 285, 140], [1280, 285, 140]],
    deco: [{ t: 'crystal', x: 120 }, { t: 'crystal', x: 1580 }],
    spawns: [{ m: 'nox', p: 0, x: 1150, n: 1 }],
    portals: [{ id: 'in', x: 70, to: 'void_river', toPortal: 'east' }],
  });
  // 높은 발판 (2단 점프 전용, 보스전 피신처)
  G.MAPS.void_throne.platforms[3].high = true; G.MAPS.void_throne.platforms[4].high = true;

  // ======================= 새싹항 섬 =======================
  add('sprout_port', {
    name: '새싹항', lvText: '마을', town: true, theme: 'beachTown', width: 2200, home: 'sprout_port', start: 560,
    plats: [[330, 470, 240], [1420, 470, 260]],
    deco: [{ t: 'ship', x: 70 }, { t: 'house', x: 330, w: 240, color: '#c0503a' }, { t: 'house', x: 690, w: 300, color: '#3a6ab0', big: true },
           { t: 'stall', x: 1040, color: '#e8a0b0' }, { t: 'stall', x: 1250, color: '#7a7a82' }, { t: 'tree', x: 1480 }, { t: 'tree', x: 1700 },
           { t: 'lighthouse', x: 2010 }, { t: 'sign', x: 2080, text: '해안 풀숲 →' }],
    npcs: [{ id: 'brody', x: 170 }, { id: 'lulu', x: 520 }, { id: 'harmon', x: 820 }, { id: 'mina', x: 1040 },
           { id: 'thor', x: 1250 }, { id: 'noah', x: 1600 }, { id: 'dora', x: 1400 }, { id: 'elma', x: 1930 }],
    portals: [{ id: 'dock', x: 270, hidden: true }, { id: 'east', x: 2150, to: 'coast_grass', toPortal: 'west' }],
  });
  add('coast_grass', {
    name: '해안 풀숲', lvText: 'Lv.1~3', theme: 'beach', width: 2400, home: 'sprout_port',
    plats: [[380, 470, 320], [900, 360, 240], [1450, 470, 380]],
    deco: [{ t: 'tree', x: 250 }, { t: 'rock', x: 820 }, { t: 'tree', x: 1300 }, { t: 'rock', x: 2100 }],
    spawns: [{ m: 'jelly', p: 0, x: 520, n: 3, gap: 150 }, { m: 'jelly', p: 0, x: 1250, n: 2, gap: 200 }, { m: 'jelly', p: 1, x: 540, n: 1 },
             { m: 'crab', p: 0, x: 1950, n: 2, gap: 180 }, { m: 'crab', p: 3, x: 1640, n: 1 }],
    portals: [{ id: 'west', x: 60, to: 'sprout_port', toPortal: 'east' }, { id: 'east', x: 2340, to: 'mush_hill', toPortal: 'west' }],
  });
  add('mush_hill', {
    name: '버섯 언덕', lvText: 'Lv.4~6', theme: 'mushroom', width: 2600, home: 'sprout_port',
    plats: [[300, 470, 360], [820, 350, 300], [1350, 470, 400], [1950, 380, 320]],
    deco: [{ t: 'bigshroom', x: 200 }, { t: 'bigshroom', x: 1200 }, { t: 'bigshroom', x: 2400 }, { t: 'rock', x: 1850 }],
    spawns: [{ m: 'spore', p: 0, x: 500, n: 2, gap: 220 }, { m: 'spore', p: 1, x: 480, n: 1 }, { m: 'spore', p: 2, x: 970, n: 2, gap: 120 },
             { m: 'capshroom', p: 0, x: 1450, n: 3, gap: 220 }, { m: 'capshroom', p: 3, x: 1550, n: 1 }, { m: 'capshroom', p: 4, x: 2110, n: 1 }],
    portals: [{ id: 'west', x: 60, to: 'coast_grass', toPortal: 'east' }, { id: 'east', x: 2540, to: 'shell_beach', toPortal: 'west' }],
  });
  add('shell_beach', {
    name: '조개 해변', lvText: 'Lv.7~9', theme: 'beach', width: 2600, home: 'sprout_port',
    plats: [[350, 470, 340], [950, 360, 280], [1500, 470, 380]],
    deco: [{ t: 'rock', x: 260 }, { t: 'tree', x: 900 }, { t: 'rock', x: 1400 }, { t: 'cave', x: 2520 }],
    spawns: [{ m: 'spikeshell', p: 0, x: 520, n: 2, gap: 240 }, { m: 'spikeshell', p: 1, x: 520, n: 1 }, { m: 'spikeshell', p: 2, x: 1090, n: 2, gap: 120 },
             { m: 'sealizard', p: 0, x: 1350, n: 3, gap: 260 }, { m: 'sealizard', p: 3, x: 1690, n: 2, gap: 180 }],
    portals: [{ id: 'west', x: 60, to: 'mush_hill', toPortal: 'east' }, { id: 'east', x: 2530, to: 'light_cave', toPortal: 'in', label: '등대 동굴 (보스)' }],
  });
  add('light_cave', {
    name: '등대 동굴', lvText: '보스 · Lv.10', theme: 'cave', width: 1500, home: 'sprout_port', bossRoom: true,
    plats: [[230, 450, 220], [1050, 450, 220]],
    deco: [{ t: 'crystal', x: 400 }, { t: 'crystal', x: 1300 }],
    spawns: [{ m: 'shellock', p: 0, x: 1000, n: 1 }],
    portals: [{ id: 'in', x: 70, to: 'shell_beach', toPortal: 'east' }],
  });

  // ======================= 바람결 마을 =======================
  add('wind_village', {
    name: '바람결 마을', lvText: '마을', town: true, theme: 'meadowTown', width: 2700, home: 'wind_village', start: 400,
    plats: [[1620, 470, 260]],
    deco: [{ t: 'ship', x: 70 }, { t: 'house', x: 480, w: 240, color: '#4a8a5a' }, { t: 'guild', x: 860, w: 600 },
           { t: 'windmill', x: 1760 }, { t: 'stall', x: 2050, color: '#f0c070' }, { t: 'stall', x: 2220, color: '#6a6a72' },
           { t: 'house', x: 2330, w: 200, color: '#8a6a9a' }, { t: 'sign', x: 2600, text: '황금 들판 →' }],
    npcs: [{ id: 'kir', x: 170 }, { id: 'sera', x: 560 }, { id: 'garen', x: 940 }, { id: 'ria', x: 1080 }, { id: 'oswin', x: 1220 },
           { id: 'vince', x: 1360 }, { id: 'gren', x: 1700 }, { id: 'penny', x: 2050 }, { id: 'haro', x: 2220 }, { id: 'dora', x: 2420 }],
    portals: [{ id: 'dock', x: 270, hidden: true }, { id: 'east', x: 2640, to: 'gold_field', toPortal: 'west' }],
  });
  add('gold_field', {
    name: '황금 들판', lvText: 'Lv.10~13', theme: 'field', width: 2600, home: 'wind_village',
    plats: [[320, 470, 380], [900, 370, 280], [1450, 470, 420], [2000, 380, 300]],
    deco: [{ t: 'haystack', x: 250 }, { t: 'fence', x: 850 }, { t: 'haystack', x: 1350 }, { t: 'fence', x: 2350 }],
    spawns: [{ m: 'fieldrat', p: 0, x: 520, n: 3, gap: 220 }, { m: 'fieldrat', p: 1, x: 510, n: 1 }, { m: 'fieldrat', p: 3, x: 1660, n: 2, gap: 160 },
             { m: 'fieldrat', p: 0, x: 2300, n: 1 }, { m: 'scarecrow', p: 0, x: 1250, n: 3, gap: 230 }, { m: 'scarecrow', p: 2, x: 1040, n: 1 },
             { m: 'scarecrow', p: 4, x: 2150, n: 2, gap: 140 }],
    portals: [{ id: 'west', x: 60, to: 'wind_village', toPortal: 'east' }, { id: 'east', x: 2540, to: 'windmill_hill', toPortal: 'west' }],
  });
  add('windmill_hill', {
    name: '풍차 언덕', lvText: 'Lv.13~16', theme: 'windmill', width: 2800, home: 'wind_village',
    plats: [[350, 470, 400], [950, 360, 300], [1550, 470, 420], [2150, 370, 320]],
    deco: [{ t: 'windmill', x: 250 }, { t: 'windmill', x: 1400 }, { t: 'fence', x: 2000 }, { t: 'windmill', x: 2600 }],
    spawns: [{ m: 'windspirit', p: 1, x: 550, n: 2, gap: 200 }, { m: 'windspirit', p: 2, x: 1100, n: 2, gap: 150 }, { m: 'windspirit', p: 4, x: 2310, n: 2, gap: 160 },
             { m: 'wingboar', p: 0, x: 650, n: 3, gap: 300 }, { m: 'wingboar', p: 0, x: 1800, n: 2, gap: 300 }, { m: 'wingboar', p: 3, x: 1760, n: 2, gap: 200 }],
    portals: [{ id: 'west', x: 60, to: 'gold_field', toPortal: 'east' }, { id: 'east', x: 2740, to: 'bandit_road', toPortal: 'west' }],
  });
  add('bandit_road', {
    name: '도적 숲길', lvText: 'Lv.16~19', theme: 'forest', width: 2800, home: 'wind_village',
    plats: [[450, 470, 380], [1050, 360, 300], [1650, 470, 400], [2200, 370, 320]],
    deco: [{ t: 'tree', x: 120 }, { t: 'tent', x: 380 }, { t: 'tree', x: 980 }, { t: 'tree', x: 1550 }, { t: 'tent', x: 2050 }, { t: 'tree', x: 2650 }],
    npcs: [{ id: 'marco', x: 230 }],
    spawns: [{ m: 'banditnov', p: 0, x: 850, n: 3, gap: 250 }, { m: 'banditnov', p: 0, x: 1950, n: 2, gap: 300 }, { m: 'banditnov', p: 3, x: 1850, n: 2, gap: 200 },
             { m: 'banditarch', p: 1, x: 640, n: 2, gap: 200 }, { m: 'banditarch', p: 2, x: 1200, n: 2, gap: 150 }, { m: 'banditarch', p: 4, x: 2360, n: 2, gap: 160 }],
    portals: [{ id: 'west', x: 60, to: 'windmill_hill', toPortal: 'east' }, { id: 'east', x: 2740, to: 'bandit_den', toPortal: 'in', label: '도적 소굴 (보스)' }],
  });
  add('bandit_den', {
    name: '도적 소굴', lvText: '보스 · Lv.20', theme: 'den', width: 1700, home: 'wind_village', bossRoom: true,
    plats: [[300, 450, 220], [1150, 450, 220]],
    deco: [{ t: 'torch', x: 250 }, { t: 'crate', x: 700 }, { t: 'torch', x: 900 }, { t: 'crate', x: 1450 }, { t: 'torch', x: 1600 }],
    spawns: [{ m: 'bark', p: 0, x: 1200, n: 1 }],
    portals: [{ id: 'in', x: 70, to: 'bandit_road', toPortal: 'east' }],
  });
})();

// 월드맵 배치 (지도 창 좌표, 736 × 360)
G.WORLD = {
  regions: [
    { name: '새싹항 섬', x: 20, y: 70, w: 330, h: 270, color: '#2f6a9a' },
    { name: '아르셀리아 대륙 · 바람결 지방', x: 390, y: 40, w: 330, h: 300, color: '#3f7a3f' },
  ],
  nodes: {
    sprout_port: [80, 265], coast_grass: [150, 205], mush_hill: [220, 145], shell_beach: [285, 205], light_cave: [300, 290],
    wind_village: [440, 265], gold_field: [515, 205], windmill_hill: [585, 140], bandit_road: [655, 205], bandit_den: [670, 290],
  },
};
