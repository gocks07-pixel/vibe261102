import re
s=open('outfit_v2.js').read().replace('G.Outfit2 = (function','G.Outfit3 = (function',1)
def ren(old,new):
    global s
    n=len(re.findall(r'\n  function %s\('%old, s)); assert n==1,(old,n)
    s=re.sub(r'\n  function %s\('%old, '\n  function %s('%new, s, count=1)
ren('torso','torsoV2'); ren('cape','capeV2'); ren('hat','hatOld'); ren('sleeve','sleeveOld'); ren('pauldron','pauldronV2')
s=s.replace("  // ---------------- 모자 · 투구 ----------------", open('v3parts.js').read()+"\n  // ---------------- 모자 · 투구 ----------------",1)
old="    // 몸통\n    torso(ctx, topKind, topC, lk, sTop, e);"
assert old in s; s=s.replace(old,"    if (g.top && TAIL[g.top.k]) coatTail(ctx, g.top.k, topC, sTop, sw);\n"+old)
old="sleeve(ctx, g.top ? (topKind === 'plate' || topKind === 'royal' ? topKind : 'plain') : (e.sleeve || 'plain'), topC, e, sTop);"
assert old in s; s=s.replace(old,"sleeve(ctx, g.top ? (SLV[topKind] || topKind === 'plate' || topKind === 'royal' ? topKind : 'plain') : (e.sleeve || 'plain'), topC, e, sTop);")
old="    // 팔 + 장갑 + 무기"
s=s.replace(old,"    if (g.top && g.top.k === 'longcoat') runes(ctx, t, sTop);\n"+old,1)
# 시안 B 세트 정의
old="    red: {}, steel: {}, wind: {}, crystal: {}, shadow: {},\n  };"
assert old in s
s=s.replace(old,"""    red: {}, steel: {}, wind: {}, crystal: {}, shadow: {},
  };
  Object.assign(S, {
    mithril:  { hat: 'plume', top: 'surcoat', bottom: 'greave', shoes: 'sabaton', gloves: 'gauntlet', cape: 'long', trim: '#e8ecf4', cloth: '#2a4a9a' },
    frost:    { hat: 'frostcrown', top: 'furcoat', bottom: 'pants', shoes: 'boot', gloves: 'glove', cape: 'fur', trim: '#d8f0ff', glow: '#bfe8ff' },
    void:     { hat: 'voidhalo', top: 'longcoat', bottom: 'pants', shoes: 'tallboot', gloves: 'glove', cape: 'shadow', trim: '#c890ff', glow: '#b070ff' },
    sprout:   { hat: 'beret', top: 'jerkin', emblem: 'leaf', shoes: 'boot', trim: '#f4e27a' },
    traveler: { cape: 'capelet', gloves: 'glove' },
    elen:     { hat: 'leafcrown', top: 'ranger', shoes: 'tallboot', gloves: 'bracer', cape: 'leafcape', trim: '#e2c66a' },
    rag:      { hat: 'engineer', top: 'apron', bottom: 'pants', shoes: 'boot', gloves: 'gauntlet', cape: 'steampack', trim: '#d0843e', rivet: true },
    leather:  { hat: 'bandana', top: 'vest', bottom: 'pants', shoes: 'boot', gloves: 'glove' },
    desert:   { hat: 'desertwrap', top: 'nomad', bottom: 'baggy', shoes: 'sandal', gloves: 'wrap', cape: 'long', trim: '#b0503a' },
    sahrin:   { hat: 'sunhelm', top: 'guardvest', bottom: 'kilt', shoes: 'sandal', gloves: 'bracer', trim: '#3a7ad0' },
    pharaoh:  { hat: 'sunmitre', top: 'priestrobe', bottom: 'kilt', shoes: 'sandal', gloves: 'bracer', cape: 'long', trim: '#2a50b0' },
    storm:    { hat: 'stormcrest', top: 'stormcoat', bottom: 'greave', shoes: 'sabaton', gloves: 'gauntlet', cape: 'stormcape', trim: '#ffe060', glow: '#fff09a' },
    sky:      { hat: 'skyhat', top: 'skyrobe', bottom: 'pants', shoes: 'winged', gloves: 'glove', cape: 'feather', trim: '#fff6d0', glow: '#e8f0ff' },
    starheir: { hat: 'starcirclet', top: 'knightcoat', bottom: 'greave', shoes: 'sabaton', gloves: 'gauntlet', cape: 'starflow', trim: '#e8c050', glow: '#ffe680' },
  });""")
old2="    // 후드 (캐주얼)\n    if (e.hood && !g.top) hood(ctx, topC);"
assert old2 in s, 'hood'
s=s.replace(old2, old2+"\n    if (g.top) backItem(ctx, o, g.top.k, topC, sTop);")
open('outfit_v3.js','w').write(s); print('ok')
