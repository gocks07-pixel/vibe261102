import json,glob,os,collections
S=os.path.dirname(os.path.abspath(__file__))
rows=[];boss=collections.defaultdict(lambda: collections.defaultdict(list))
for f in sorted(glob.glob(S+'/*.json')):
    n=os.path.basename(f)[:-5]
    try: d=json.load(open(f))
    except Exception as e: rows.append((n,'ERR '+str(e)[:60])); continue
    fam,line,gear=n.split('_')
    end=[e['kind'] for e in d.get('endings',[]) if e.get('credits')]
    rows.append((n,d.get('status'),d.get('gameHours'),d.get('realSec'),d.get('level'),d.get('gold'),d.get('sub'),len(d.get('notDone',[])),d.get('fieldDeaths'),len(d.get('pageErrors',[])),len(d.get('errlog',[])),'/'.join(end),sum(1 for s in d.get('saveChecks',[]) if not s['ok']),len(d.get('stuck',[]) or [])))
    for m,b in d.get('boss',{}).items():
        boss[m][gear].append((b.get('winTry'),b.get('winAuto'),b['tries'],b.get('skipped')))
for r in rows: print(*r)
print()
for m in boss:
    line=[m]
    for g in ['weak','normal','strong']:
        L=boss[m][g]
        if not L: continue
        direct=sum(1 for w,a,t,s in L if w and w<=5); auto6=sum(1 for w,a,t,s in L if w==6); late=sum(1 for w,a,t,s in L if w and w>6); fail=sum(1 for w,a,t,s in L if not w)
        tries=sum(min(t,5) for w,a,t,s in L); dwins=direct
        line.append(f"{g}: 직접{direct}/{len(L)} 6번{auto6} 7~10번{late} 실패{fail} (직접도전 승률 {dwins}/{tries})")
    print(' | '.join(line))
