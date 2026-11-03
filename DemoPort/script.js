(function () {
  const P = window.PROFILE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICONS = {
    body: '<svg viewBox="0 0 24 24"><path d="M3 13l2-5a3 3 0 0 1 2.8-2h8.4A3 3 0 0 1 19 8l2 5v4a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1z"/><path d="M3 13h18"/></svg>',
    lamp: '<svg viewBox="0 0 24 24"><path d="M10 6a6 6 0 0 0 0 12h2V6z"/><path d="M16 8h5M16 12h5M16 16h5"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>',
  };

  // 단순 바인딩
  document.querySelectorAll("[data-bind]").forEach((el) => { el.textContent = P[el.dataset.bind]; });
  document.querySelectorAll('[data-bind-href="mailto"]').forEach((el) => { el.href = "mailto:" + P.email; });
  $("#year").textContent = new Date().getFullYear();

  $("#about-text").innerHTML = P.about.map((p) => `<p>${esc(p)}</p>`).join("");
  $("#keywords").innerHTML = P.keywords.map((k) => `<li>${esc(k)}</li>`).join("");

  $("#expertise-list").innerHTML = P.expertise.map((e) => `
    <article class="card reveal">
      <div class="card-icon" aria-hidden="true">${ICONS[e.icon] || ICONS.check}</div>
      <h3>${esc(e.title)}</h3>
      <p class="sub">${esc(e.subtitle)}</p>
      <ul>${e.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    </article>`).join("");

  $("#process-list").innerHTML = P.process.map((s) => `
    <li class="reveal"><h3>${esc(s.step)}</h3><p>${esc(s.desc)}</p></li>`).join("");

  $("#project-list").innerHTML = P.projects.map((p) => `
    <article class="card reveal">
      <div class="project-head">
        <h3>${esc(p.name)}</h3>
        <span class="project-period">${esc(p.period)}</span>
      </div>
      <dl class="meta">
        <dt>대상 제어기</dt><dd>${esc(p.target)}</dd>
        <dt>역할</dt><dd>${esc(p.role)}</dd>
      </dl>
      <ul>${p.tasks.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <p class="result">성과 · ${esc(p.result)}</p>
    </article>`).join("");

  $("#tool-list").innerHTML = P.tools.map((g) => `
    <div class="tool-group card reveal">
      <h3>${esc(g.group)}</h3>
      <ul class="chips">${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    </div>`).join("");

  // 모바일 메뉴
  const menuBtn = $(".menu-btn");
  const links = $("#nav-links");
  menuBtn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) { links.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); }
  });

  // 다크 모드
  const root = document.documentElement;
  $(".theme-btn").addEventListener("click", () => {
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // 이메일 복사
  const status = $(".copy-status");
  $(".copy-btn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(P.email);
      status.textContent = "이메일 주소가 복사되었습니다.";
    } catch (e) {
      status.textContent = "복사에 실패했습니다. 주소를 직접 선택해 주세요.";
    }
    setTimeout(() => { status.textContent = ""; }, 2500);
  });

  // 현재 섹션 표시 + 등장 애니메이션
  const navMap = new Map([...links.querySelectorAll("a")].map((a) => [a.getAttribute("href").slice(1), a]));
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navMap.forEach((a) => a.classList.remove("active"));
      navMap.get(en.target.id)?.classList.add("active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => secObs.observe(s));

  const revObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); revObs.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => revObs.observe(el));
})();
