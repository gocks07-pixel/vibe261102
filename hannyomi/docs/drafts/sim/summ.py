import json,collections,sys,glob
files=sys.argv[1:]
rows=[json.loads(l) for f in files for l in open(f) if l.startswith('{')]
order=['쉘로크','바르크','모르웬','그라운더','파라칸','카이엔','아우렐리온+엘드리크','녹스']
g=collections.defaultdict(list)
for r in rows: g[r['R']['boss']].append(r)
print('boss | n | kill | avgT normal | avgT low | max | deaths runs | causes | candies avg | errs | patterns seen')
for b in order:
    v=g.get(b,[]);
    if not v: continue
    n=len(v); k=sum(r['killed'] for r in v)
    tn=[r['t'] for r in v if r['R']['gear']=='normal']; tl=[r['t'] for r in v if r['R']['gear']=='low']
    dr=sum(1 for r in v if r['deaths']); c=collections.Counter(d['cause'] for r in v for d in r['deaths'])
    pots=round(sum(r['potHP']+r['potMP'] for r in v)/n,1)
    pats=collections.Counter()
    for r in v:
        for kk,vv in r['hits'].items(): pats[kk]+=vv
        for kk,vv in r['dodged'].items(): pats[kk]+=vv
    errs=sum(1 for r in v if r['errs'])
    print(b,n,k,round(sum(tn)/max(1,len(tn))),round(sum(tl)/max(1,len(tl))),max(r['t'] for r in v),dr,dict(c),pots,errs,dict(pats.most_common(8)))
    jt=collections.defaultdict(list)
    for r in v: jt[(r['R']['fam'],r['R']['gear'])].append(r['t'])
    print('   ', {f'{a[0][:2]}-{a[1][0]}':round(sum(x)/len(x)) for a,x in sorted(jt.items())})
