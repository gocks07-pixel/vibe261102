import json,glob,sys,collections
for g in sys.argv[1:]:
    c=collections.defaultdict(lambda:[0,0]); per=collections.defaultdict(lambda:[0,0])
    for f in glob.glob(f'/tmp/claude-0/-home-user/558450f0-4a3e-5c82-a57a-13153a100c8c/scratchpad/boss/r15/{g}/*.jsonl'):
        who=f.split('/')[-1].replace('_buried_temple.jsonl','').replace('_void_throne.jsonl','')
        for l in open(f):
            try: r=json.loads(l)
            except: continue
            k=(r['map'],r['gear']); c[k][0]+=r['win']; c[k][1]+=1
            if r['gear']=='normal': per[(r['map'],who)][0]+=r['win']; per[(r['map'],who)][1]+=1
    print(g, {f'{m[:6]}/{gr}':f'{a}/{b}={round(100*a/b)}%' for (m,gr),(a,b) in sorted(c.items())})
    for m in ['buried_temple','void_throne']: print('   ',m[:6],' '.join(f"{w}:{a}/{b}" for (mm,w),(a,b) in sorted(per.items()) if mm==m))
