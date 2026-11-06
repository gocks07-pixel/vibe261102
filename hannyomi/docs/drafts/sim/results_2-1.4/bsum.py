import json,glob,os,collections,statistics as st,sys
R=os.path.dirname(os.path.abspath(__file__))+'/'+(sys.argv[1] if len(sys.argv)>1 else 'res')
rows=collections.defaultdict(list)
for f in sorted(glob.glob(R+'/*.jsonl')):
    who=os.path.basename(f).rsplit('_',2)[0] if 'buried' in f else os.path.basename(f).rsplit('_',2)[0]
    for line in open(f):
        try: r=json.loads(line)
        except: continue
        r['who']=os.path.basename(f).replace('_buried_temple.jsonl','').replace('_void_throne.jsonl','')
        rows[(r['map'],r['gear'],r['mode'])].append(r)
for map_ in ['buried_temple','void_throne']:
    print('==',map_)
    for gear in ['normal','strong']:
        for mode in ['direct','auto']:
            L=rows[(map_,gear,mode)]
            if not L: continue
            w=[r for r in L if r['win']]; lose=[r for r in L if not r['win']]
            per=collections.defaultdict(lambda:[0,0])
            for r in L: per[r['who']][0]+=r['win']; per[r['who']][1]+=1
            print(f" {gear:6} {mode:6} 승 {len(w)}/{len(L)} = {round(100*len(w)/len(L))}%  이긴시간 {st.median([r['t'] for r in w]) if w else '-'}  진시간 {st.median([r['t'] for r in lose]) if lose else '-'}  maxHP {round(st.median([r['maxHP'] for r in L]))} def {round(st.median([r['def'] for r in L]))}")
            print('    직업별', ' '.join(f"{k}:{a}/{b}" for k,(a,b) in sorted(per.items())))
            # 받은 피해 (최대HP %) 평균, 진 판의 마지막 10초
            agg=collections.Counter(); 
            for r in L:
                for k,v in r['dmg'].items(): agg[k.replace('(고정)','*')]+=v/len(L)
            print('    판당 받은 피해(최대HP%)', ', '.join(f"{k} {round(v)}" for k,v in agg.most_common(7)))
            la=collections.Counter()
            for r in lose:
                for k,v in (r.get('last10') or {}).items(): la[k.replace('(고정)','*')]+=v/max(1,len(lose))
            if lose: print('    진 판 마지막 10초', ', '.join(f"{k} {round(v)}" for k,v in la.most_common(5)))
