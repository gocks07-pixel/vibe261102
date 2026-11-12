import re
src=open('/home/user/vibe261102/hannyomi/src/render/outfit.js').read()
v2=open('v2parts.js').read()
s=src.replace('G.Outfit = (function','G.Outfit2 = (function',1)
# 옛 함수 이름 바꾸기 (v2 가 감쌈)
for n in ['torso','cape','leg','shoe','pauldron','hand','dome']:
    s=re.sub(r'\n  function %s\('%n, '\n  function %sOld('%n, s, count=1)
# capeOld: fill 을 g 로 받을 수 있게 (c2 = 원래 색, 문양 · 테두리 계산용)
s=s.replace("function capeOld(ctx, o, kind, c, sp) {\n    const m = o.moving ? 4 : 0, wv = Math.sin((o.t || 0) * 6) * (o.moving ? 1.5 : 0.6);\n    const hemX = -19 - m + wv, d = sh(c, -0.3);",
 "function capeOld(ctx, o, kind, c, sp, c2) {\n    const m = o.moving ? 4 : 0, wv = Math.sin((o.t || 0) * 6) * (o.moving ? 1.5 : 0.6);\n    const base = c2 || c, hemX = -19 - m + wv, d = sh(base, -0.3);")
s=s.replace("ell(ctx, hemX + 3 + i * 4.3, -8 + (i % 2) * 1.5, 3, 5.5, i % 2 ? sh(c, 0.25) : '#ffffff', d, 0.6);","ell(ctx, hemX + 3 + i * 4.3, -8 + (i % 2) * 1.5, 3, 5.5, i % 2 ? sh(base, 0.25) : '#ffffff', d, 0.6);")
# torsoOld: 바탕 rrect 를 건너뛸 수 있게
s=s.replace("function torsoOld(ctx, kind, c, lk, sp, e) {\n    const d = sh(c, -0.35), bc = lk.bottom;\n    rrect(ctx, -9, -36, 18, 23, 6, c, d);",
 "function torsoOld(ctx, kind, c, lk, sp, e, noBase) {\n    const d = sh(c, -0.35), bc = lk.bottom;\n    if (!noBase) rrect(ctx, -9, -36, 18, 23, 6, c, d);")
assert 'noBase' in s and 'c2 || c' in s
# 사용자: 서리용 뿔 2개 · 공허 가시 3개 삭제
a=s.index("        for (const [x, k] of [[-5, 1], [3, 0.75]]) {"); b=s.index("        dome(ctx, c, d);", a)
s=s[:a]+"        // 세련 시안 A: 뒤로 휜 뿔 2개 삭제 (사용자)\n"+s[b:]
old="        for (const [x, h] of [[-8, 8], [-1, 11], [6, 8]]) poly(ctx, [[x - 3, -62], [x, -62 - h], [x + 3, -62]], sh(c, -0.25));\n"
assert old in s; s=s.replace(old,"        // 세련 시안 A: 가시 3개 삭제 (사용자)\n")
s=s.replace("  // ---------------- 모자 · 투구 ----------------", v2+"\n  // ---------------- 모자 · 투구 ----------------",1)
open('outfit_v2.js','w').write(s)
print('ok')
