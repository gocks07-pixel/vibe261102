import json,sys
WEAP={10:{'warrior':'sword_iron','archer':'bow_hunter','mage':'wand_novice','thief':'dagger_twin'},15:{'warrior':'sword_steel','archer':'bow_wind','mage':'wand_crystal','thief':'dagger_shadow'},20:{'warrior':'sword_red','archer':'bow_red','mage':'wand_red','thief':'dagger_red'}}
wp=lambda lv,f: WEAP[lv][f] if lv in WEAP else f'wp{lv}_{f}'
def ar(t,cape=True): return [f'ar{t}_{x}' for x in ['hat','top','bottom','shoes','gloves']+(['cape'] if cape else [])]
def ac(t): return [f'ac{t}_earring',f'ac{t}_ring',f'ac{t}_ring',f'ac{t}_pendant',f'ac{t}_belt']
LEATHER=['leather_hat','leather_vest','leather_pants','leather_boots','leather_gloves']
SPROUT=['sprout_hat','sprout_top','sprout_bottom','sprout_shoes','traveler_cape','traveler_gloves']
ELEN=['elen_hat','elen_top','elen_bottom','elen_shoes','elen_gloves','traveler_cape']
CLOTH=['cloth_top','cloth_pants','cloth_shoes']
RELIC=['relic_earring','relic_pendant','relic_ring','relic_belt']
B=[('쉘로크','light_cave','shellock',(12,1,10,LEATHER+['silver_ring','wind_belt']),(10,1,10,CLOTH)),
 ('바르크','bandit_den','bark',(22,1,15,SPROUT+['silver_ring','wind_belt','relic_earring','relic_pendant']),(18,1,10,LEATHER+['silver_ring'])),
 ('모르웬','heart_of_tree','morwen',(32,2,20,ELEN+RELIC),(30,2,15,SPROUT+['silver_ring','wind_belt'])),
 ('그라운더','cult_factory','grounder',(47,2,40,ar(40,False)+['ar30_cape']+ac(35)),(43,2,30,ar(30)+RELIC)),
 ('파라칸','buried_temple','parakan',(60,2,50,ar(55,False)+['ar50_cape']+ac(55)),(57,2,50,ar(50)+ac(35))),
 ('카이엔','frost_nest','kaien_boss',(77,3,60,ar(60)+ac(55)),(73,3,50,ar(50)+ac(35))),
 ('아우렐리온+엘드리크','sky_sanctum','eldrick',(91,4,80,ar(80)+ac(75)),(86,4,70,ar(70)+ac(55))),
 ('녹스','void_throne','nox',(98,4,90,ar(90)+ac(95)),(92,4,80,ar(80)+ac(75)))]
def runs(cfg, mul, reps, tag):
    out=[]
    for name,mp,fin,nm,lo in B:
        for rep in range(reps):
            for fam in ['warrior','archer','mage','thief']:
                for gname,(L,tier,wl,eq) in (('normal',nm),('low',lo)):
                    for sk in [(0.5,0.9),(0.2,0.6)]:
                        r={"boss":name,"map":mp,"final":fin,"job":"warrior_4a","fam":fam,"tier":tier,"gear":gname,"L":L,"eq":[wp(wl,fam)]+eq,"pot":"candy","dodge":sk[0],"doomOk":sk[1],"rep":rep,"hpMul":mul.get(name,1)}
                        r.update(cfg); out.append(r)
    for i in range(4): json.dump(out[i::4],open(f'runs_{tag}_{i}.json','w'))
    return len(out)
CFG={"mech":True,"vulnMul":1.75,"vulnT":6,"mageMul":2.5,"underMul":1.3,"gates":[0.7,0.4],"gateT":3.5,"enrage":1200}
if __name__=='__main__':
    mul=json.loads(sys.argv[2]) if len(sys.argv)>2 else {}
    print(runs(CFG, mul, int(sys.argv[3]) if len(sys.argv)>3 else 2, sys.argv[1]))
