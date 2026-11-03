"""퀘스트 상태 판정, 수락/진행/완료, 보상 지급."""
from .data import QUESTS, NPCS, MONSTERS, SLOTS, item_name
from .formulas import quest_exp
from . import items as itm


def fmt(text, player):
    return text.replace("{name}", player.name).replace("{job}", player.job_title)


def is_available(qid, p):
    q = QUESTS[qid]
    if qid in p.quests_active:
        return False
    if qid in p.quests_done and q["type"] != "repeat":
        return False
    if p.level < q["level"]:
        return False
    if "job_tier" in q and p.job_tier != q["job_tier"]:
        return False
    return all(r in p.quests_done for r in q.get("prereq", []))


def started_or_done(qid, p):
    return qid in p.quests_active or qid in p.quests_done


def goal_progress(qid, p):
    """[(라벨, 현재, 목표)] 목록."""
    q = QUESTS[qid]
    st = p.quests_active.get(qid, {"kills": {}})
    out = []
    for g in q["goals"]:
        if "kill" in g:
            out.append((MONSTERS[g["kill"]]["name"] + " 처치", min(g["n"], st["kills"].get(g["kill"], 0)), g["n"]))
        else:
            out.append((item_name(g["item"]) + " 수집", min(g["n"], p.count_item(g["item"])), g["n"]))
    return out


def is_ready(qid, p):
    return qid in p.quests_active and all(c >= n for _, c, n in goal_progress(qid, p))


def npc_quests(npc_id, p):
    """NPC가 가진 퀘스트: (완료 가능, 수락 가능, 진행 중) 목록."""
    ready, avail, prog = [], [], []
    for qid, q in QUESTS.items():
        if q["ender"] == npc_id and is_ready(qid, p):
            ready.append(qid)
        elif q["giver"] == npc_id and is_available(qid, p):
            avail.append(qid)
        elif qid in p.quests_active and (q["giver"] == npc_id or q["ender"] == npc_id):
            prog.append(qid)
    return ready, avail, prog


def npc_marker(npc_id, p):
    ready, avail, prog = npc_quests(npc_id, p)
    if ready:
        return "?"
    if avail:
        return "!"
    if prog:
        return "…"
    return None


def accept(qid, p):
    p.quests_active[qid] = {"kills": {}}


def wanted_items(p):
    """진행 중 퀘스트가 아직 필요로 하는 기타 아이템."""
    need = {}
    for qid in p.quests_active:
        for g in QUESTS[qid]["goals"]:
            if "item" in g:
                need[g["item"]] = max(need.get(g["item"], 0), g["n"])
    return {k: v for k, v in need.items() if p.count_item(k) < v}


def on_kill(mid, p):
    msgs = []
    for qid, st in p.quests_active.items():
        for g in QUESTS[qid]["goals"]:
            if g.get("kill") == mid:
                c = st["kills"].get(mid, 0)
                if c < g["n"]:
                    st["kills"][mid] = c + 1
                    msgs.append(f"[{QUESTS[qid]['title']}] {MONSTERS[mid]['name']} {c + 1}/{g['n']}")
    return msgs


def has_choice(qid, p):
    """선택지가 있는 퀘스트인지. choice_job이 있으면 그 직업일 때만 선택지가 나온다."""
    c = QUESTS[qid].get("choice")
    return bool(c) and (not c.get("job") or c["job"] == p.job)


def complete(qid, p, choice=None):
    """보상 지급. 획득 내역 메시지 목록과 레벨업 수를 반환."""
    q = QUESTS[qid]
    for g in q["goals"]:
        if "item" in g:
            p.remove_item(g["item"], g["n"])
    del p.quests_active[qid]
    if qid not in p.quests_done:
        p.quests_done.append(qid)
    msgs = []
    rewards = [q.get("rewards", {})]
    if choice is not None and has_choice(qid, p):
        rewards.insert(0, q["choice"]["options"][choice]["rewards"])
    ups = 0
    advanced = False
    for r in rewards:
        if "job" in r:
            p.set_job(r["job"])
        if "job_tier" in r:
            p.job_tier = r["job_tier"]
            advanced = True
    for r in rewards:
        if "branch" in r:
            p.branches[str(p.job_tier)] = r["branch"]
    if advanced:
        p.invalidate()
        msgs.append(f"전직 완료! 이제 [{p.job_title}] 입니다.")
    for r in rewards:
        if r.get("meso"):
            p.meso += r["meso"]
            msgs.append(f"메소 +{r['meso']:,}")
        for iid, n in r.get("items", {}).items():
            p.add_item(iid, n)
            msgs.append(f"{item_name(iid)} x{n}")
        for e in r.get("equip", []):
            job = e.get("job")
            if SLOTS[e["slot"]]["kind"] == "weapon" and not job:
                job = p.job if p.job != "beginner" else "beginner"
            mode = "boss" if q["type"] == "main" and q["goals"] and q["goals"][0].get("kill", "").startswith("b_") else "elite"
            it = itm.make_equip(e["tier"], e["slot"], job, grade_mode=mode)
            p.add_equip(it)
            msgs.append(f"장비 [{it['name']}] 획득")
        if r.get("exp"):
            amount = quest_exp(q["level"], r["exp"])
            msgs.append(f"경험치 +{amount:,}")
            ups += p.gain_exp(amount)
    return msgs, ups
