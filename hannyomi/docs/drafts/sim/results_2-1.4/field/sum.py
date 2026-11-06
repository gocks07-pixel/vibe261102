import json,glob,collections,statistics as st
R=collections.defaultdict(dict)
for f in glob.glob('*.jsonl'):
    ver=f.split('_')[0]; rows=[json.loads(l) for l in open(f) if l.strip()]
    if rows: R[rows[0]['label']][ver]=rows
def s(rows):
    d=sum(r['deaths'] for r in rows)/len(rows); k=st.median([r['killsPerH'] for r in rows]); fe=[r['firstElite'] for r in rows if r['firstElite'] is not None]
    return f"쓰러짐 {d:4.1f}  멈춤 {sum(r['stops'] for r in rows)/len(rows):4.1f}  처치/시간 {k:5.0f}  첫정예 {str(round(st.median(fe))) if fe else '-':>5}초({len(fe)}/{len(rows)})  정예 {st.median([len(r['eliteKills']) for r in rows]):.0f}"
for lab in sorted(R):
    print(lab)
    for v in ['before','after']:
        if v in R[lab]: print('  ',v.ljust(6), s(R[lab][v]))
