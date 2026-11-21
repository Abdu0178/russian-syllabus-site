const content = document.getElementById("content");
const nav = document.getElementById("navigation");
const crumb = document.getElementById("crumbTitle");
let state = {
  page: "home",
  module: "all",
  search: "",
  taskType: "all",
  week: 1,
};
let done = {};
try {
  done = JSON.parse(localStorage.getItem("alt_syllabus_completed") || "{}");
} catch {
  done = {};
}
const titles = {
  home: "Обзор курса",
  weeks: "Учебный план",
  tasks: "Задания",
  grades: "Оценивание",
  pdf: "Документ PDF",
  detail: "Учебный план",
};
function esc(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function header(kicker, title, desc) {
  return `<div class="eyebrow">${kicker}</div><h1 class="page-title">${title}</h1><p class="subtitle">${desc}</p>`;
}
function navigate(page, opts = {}) {
  state = { ...state, ...opts, page };
  document
    .querySelectorAll(".nav-item")
    .forEach((b) =>
      b.classList.toggle(
        "active",
        b.dataset.page === page ||
          (page === "detail" && b.dataset.page === "weeks"),
      ),
    );
  crumb.textContent = titles[page];
  document.getElementById("sidebar").classList.remove("open");
  render();
  window.scrollTo(0, 0);
}
nav.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-page]");
  if (b) navigate(b.dataset.page);
});
document.getElementById("menuBtn").onclick = () =>
  document.getElementById("sidebar").classList.toggle("open");
function moduleCard(n, range) {
  return `<div class="module-card" data-go="weeks" data-module="${n}"><div class="module-num">0${n}</div><div class="module-name">${esc(modules[n])}<small>${range} недели</small></div><span class="arrow">›</span></div>`;
}
function home() {
  content.innerHTML = `${header("ВАШ УЧЕБНЫЙ КУРС", "Добро пожаловать в ALT Study", "Вся информация по дисциплине в одном удобном месте.")}<section class="hero"><div class="hero-content"><span class="hero-kicker">2 КУРС · 4 СЕМЕСТР · УРОВЕНЬ B1</span><h2>Русский язык <span style="color:#adc4ff">B1</span></h2><p>Рабочая учебная программа · 2026–2027 учебный год</p><button class="btn btn-light" data-go="weeks">Смотреть учебный план &nbsp; →</button></div><div class="hero-art" aria-hidden="true">Я</div></section><div class="stat-grid"><div class="stat"><div class="stat-icon">▤</div><div><b>15</b><small>учебных недель</small></div></div><div class="stat"><div class="stat-icon">◷</div><div><b>120</b><small>часов всего</small></div></div><div class="stat"><div class="stat-icon">▧</div><div><b>4</b><small>кредита</small></div></div><div class="stat"><div class="stat-icon">◈</div><div><b>3</b><small>учебных модуля</small></div></div></div><div class="columns"><section><div class="section-head"><h3>Учебные модули</h3><a data-go="weeks">Все недели →</a></div><div class="panel">${moduleCard(1, "1–6")}${moduleCard(2, "7–9")}${moduleCard(3, "10–15")}</div></section><section><div class="section-head"><h3>О дисциплине</h3><a data-go="pdf">Открыть PDF →</a></div><div class="panel"><p class="overview-description">Курс развивает навыки устного и письменного общения, работы с текстами, деловой переписки и профессиональной коммуникации на русском языке.</p><div class="info-list"><div><span>Университет</span><strong>ALT имени М. Тынышпаева</strong></div><div><span>Уровень</span><strong>B1</strong></div><div><span>Практические занятия</span><strong>30 часов</strong></div><div><span>СРО / СРОП</span><strong>82 / 8 часов</strong></div><div><span>Итоговый контроль</span><strong>Тестирование</strong></div></div></div></section></div>`;
}
function weeksPage() {
  let filtered = weeks.filter(
    (w) =>
      (state.module === "all" || String(w.module) === String(state.module)) &&
      `${w.title} ${w.practice} ${w.sro || ""} ${w.srop || ""}`
        .toLowerCase()
        .includes(state.search.toLowerCase()),
  );
  content.innerHTML = `${header("КАЛЕНДАРЬ КУРСА", "Учебный план", "15 недель практических занятий, самостоятельной работы и подготовки проектов.")}<div class="toolbar"><div class="search"><span>⌕</span><input id="weekSearch" placeholder="Поиск по темам и заданиям..." value="${esc(state.search)}"></div><select class="select" id="moduleSelect"><option value="all">Все модули</option>${[1, 2, 3].map((n) => `<option value="${n}" ${String(state.module) === String(n) ? "selected" : ""}>Модуль ${n}</option>`).join("")}</select></div><div id="weekResults">${weekResults(filtered)}</div>`;
  document.getElementById("weekSearch").addEventListener("input", (e) => {
    state.search = e.target.value;
    let a = weeks.filter(
      (w) =>
        (state.module === "all" || String(w.module) === String(state.module)) &&
        `${w.title} ${w.practice} ${w.sro || ""} ${w.srop || ""}`
          .toLowerCase()
          .includes(state.search.toLowerCase()),
    );
    document.getElementById("weekResults").innerHTML = weekResults(a);
  });
  document.getElementById("moduleSelect").onchange = (e) => {
    state.module = e.target.value;
    weeksPage();
  };
}
function weekResults(items) {
  return items.length
    ? `<div class="weeks-grid">${items.map((w) => `<article class="week-card" data-week="${w.week}"><div class="week-head"><span class="week-tag">Неделя ${w.week}</span><span class="module-tag">Модуль ${w.module}</span></div><h4>${esc(w.title)}</h4><p>${esc(w.practice)}</p><div class="bottom"><span>Практика · 2 часа</span><b>Подробнее ↗</b></div></article>`).join("")}</div>`
    : '<div class="empty">По вашему запросу ничего не найдено.</div>';
}
function detail() {
  const w = weeks.find((w) => w.week === Number(state.week)) || weeks[0];
  content.innerHTML = `<button class="btn btn-outline back" data-go="weeks">← Все недели</button>${header("МОДУЛЬ " + w.module + " · НЕДЕЛЯ " + w.week, esc(w.title), esc(modules[w.module]))}<div class="detail-grid"><section class="detail-box"><h3>Что изучаем</h3><div class="detail-row"><label>ПРАКТИЧЕСКОЕ ЗАНЯТИЕ · 2 ЧАСА</label><div>${esc(w.practice)}</div></div><div class="detail-row"><label>СРО · САМОСТОЯТЕЛЬНАЯ РАБОТА</label><div>${w.sro ? esc(w.sro) : "Задание СРО на этой неделе не указано."}</div></div><div class="detail-row"><label>СРОП · РАБОТА С ПРЕПОДАВАТЕЛЕМ</label><div>${w.srop ? esc(w.srop) : "Задание СРОП на этой неделе не указано."}</div></div></section><aside class="detail-box"><h3>Информация</h3><div class="info-list"><div><span>Неделя</span><strong>${w.week} из 15</strong></div><div><span>Модуль</span><strong>${w.module}</strong></div><div><span>Практика</span><strong>2 часа</strong></div><div><span>Срок СРО*</span><strong>${w.sro ? "Четверг, 10:00" : "—"}</strong></div><div><span>Срок СРОП*</span><strong>${w.srop ? "Четверг, 13:00" : "—"}</strong></div></div><p style="margin-top:15px;font-size:10px">* Сроки указаны по графикам СРО и СРОП в силлабусе (разделы 5.8–5.9). Конкретные календарные даты не приведены.</p><button class="btn btn-primary" data-go="pdf">Открыть первоисточник ↗</button></aside></div>`;
}
function taskRows(type) {
  let items = weeks
    .flatMap((w) => [
      { week: w.week, type: "practice", title: w.practice },
      { week: w.week, type: "sro", title: w.sro },
      { week: w.week, type: "srop", title: w.srop },
    ])
    .filter((x) => x.title && (type === "all" || x.type === type));
  return items
    .map((x) => {
      let id = `${x.type}-${x.week}`,
        isDone = !!done[id],
        label = { practice: "Практическое занятие", sro: "СРО", srop: "СРОП" }[
          x.type
        ];
      return `<div class="task ${isDone ? "done" : ""}"><input type="checkbox" aria-label="Отметить выполнение задания" class="task-done" data-task="${id}" ${isDone ? "checked" : ""}><div class="task-main"><h4>${esc(x.title)}</h4><div class="task-foot"><span class="pill">Неделя ${x.week}</span><span class="pill ${x.type === "srop" ? "purple" : x.type === "sro" ? "orange" : ""}">${label}</span>${x.type === "sro" ? '<span class="pill">Чт · 10:00</span>' : x.type === "srop" ? '<span class="pill">Чт · 13:00</span>' : ""}</div></div></div>`;
    })
    .join("");
}
function tasksPage() {
  let completed = Object.values(done).filter(Boolean).length;
  content.innerHTML = `${header("ВАШИ ЗАДАНИЯ", "Практика и самостоятельная работа", "Отмечайте выполненные задания — отметки сохраняются в вашем браузере.")}<div class="section-head"><h3>Список заданий</h3><span style="color:#8593ad;font-size:11px">Выполнено: ${completed} из 37</span></div><div class="tabs">${[
    ["all", "Все"],
    ["practice", "Практика"],
    ["sro", "СРО"],
    ["srop", "СРОП"],
  ]
    .map(
      ([v, t]) =>
        `<button class="tab ${state.taskType === v ? "active" : ""}" data-tasktype="${v}">${t}</button>`,
    )
    .join(
      "",
    )}</div><div class="task-list" id="taskResults">${taskRows(state.taskType)}</div>`;
}
function gradesPage() {
  content.innerHTML = `${header("СИСТЕМА ОЦЕНИВАНИЯ", "Как формируется оценка", "Распределение весов видов контроля по официальному силлабусу, раздел 5.7.")}<div class="columns"><div class="panel"><div class="section-head"><h3>Структура итогового балла</h3></div><div class="grade-list">${grading.map((x) => `<div class="grade-row"><span>${esc(x.name)}</span><div class="grade-bar"><div class="grade-fill" style="width:${(x.value / 30) * 100}%"></div></div><strong>${x.value}%</strong></div>`).join("")}</div><div class="grade-total"><span>ИТОГО</span><span>100%</span></div></div><div class="panel"><div class="section-head"><h3>Шкала оценок</h3></div><div class="info-list">${[
    ["A", "95–100"],
    ["A−", "90–94"],
    ["B+", "85–89"],
    ["B", "80–84"],
    ["B−", "75–79"],
    ["C+", "70–74"],
    ["C", "65–69"],
    ["C−", "60–64"],
    ["D+", "55–59"],
    ["D", "50–54"],
    ["FX", "25–49"],
    ["F", "0–24"],
  ]
    .map(([a, b]) => `<div><strong>${a}</strong><span>${b} баллов</span></div>`)
    .join("")}</div></div></div>`;
}
function pdfPage() {
  content.innerHTML = `${header("ПЕРВОИСТОЧНИК", "Официальный силлабус PDF", "Полная рабочая учебная программа дисциплины «Русский язык (уровень B1)». 18 страниц.")}<div class="toolbar"><a class="btn btn-primary" target="_blank" rel="noopener" href="syllabus.pdf">Открыть в новой вкладке ↗</a><a class="btn btn-outline" download="Силлабус_Русский_язык_B1.pdf" href="syllabus.pdf">↓ Скачать PDF</a></div><iframe title="Силлабус — Русский язык B1" class="pdf-viewer" src="syllabus.pdf#toolbar=1"></iframe><p class="pdf-fallback">Если документ не отображается, нажмите «Открыть в новой вкладке».</p>`;
}
function render() {
  if (state.page === "home") home();
  if (state.page === "weeks") weeksPage();
  if (state.page === "detail") detail();
  if (state.page === "tasks") tasksPage();
  if (state.page === "grades") gradesPage();
  if (state.page === "pdf") pdfPage();
}
content.addEventListener("click", (e) => {
  const w = e.target.closest("[data-week]");
  if (w) {
    navigate("detail", { week: Number(w.dataset.week) });
    return;
  }
  const t = e.target.closest("[data-tasktype]");
  if (t) {
    state.taskType = t.dataset.tasktype;
    tasksPage();
    return;
  }
  const g = e.target.closest("[data-go]");
  if (g) {
    navigate(
      g.dataset.go,
      g.dataset.module ? { module: g.dataset.module, search: "" } : {},
    );
    return;
  }
});
content.addEventListener("change", (e) => {
  if (e.target.matches("[data-task]")) {
    done[e.target.dataset.task] = e.target.checked;
    localStorage.setItem("alt_syllabus_completed", JSON.stringify(done));
    e.target.closest(".task").classList.toggle("done", e.target.checked);
    const counter = content.querySelector(".section-head > span");
    if (counter)
      counter.textContent = `Выполнено: ${Object.values(done).filter(Boolean).length} из 37`;
  }
});
render();
