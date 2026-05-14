/*
  PHI RESILIENCE — 12-MONTH CONTENT STRATEGY 2026
  Enhanced Interactive JS
*/

/* ═══════════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════════ */
(function () {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const saved = localStorage.getItem('phi-theme');
  if (saved) root.dataset.theme = saved;

  function updateIcon() {
    const isDark = root.dataset.theme === 'dark' ||
      (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    btn.textContent = isDark ? '☀' : '☾';
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }
  updateIcon();

  btn.addEventListener('click', () => {
    const isDark = root.dataset.theme === 'dark' ||
      (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = isDark ? 'light' : 'dark';
    localStorage.setItem('phi-theme', root.dataset.theme);
    updateIcon();
  });
})();

/* ═══════════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════════ */
const progress = document.getElementById('progress');
if (progress) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        progress.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════
   REVEAL ANIMATIONS
═══════════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal');
const ioReveal = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // stagger children if multiple appear together
      const delay = e.target.dataset.delay || 0;
      setTimeout(() => e.target.classList.add('visible'), delay);
      ioReveal.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

revealEls.forEach((el, i) => {
  el.dataset.delay = (i % 4) * 60; // stagger groups of 4
  ioReveal.observe(el);
});

/* ═══════════════════════════════════════════════
   SIDENAV ACTIVE STATE
═══════════════════════════════════════════════ */
const sidenavLinks = Array.from(document.querySelectorAll('.sidenav-link[href^="#"]'));
const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
  if (!visible.length) return;
  const id = visible[0].target.id;
  sidenavLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
}, { threshold: [0.1, 0.3], rootMargin: '-15% 0px -70% 0px' });

sidenavLinks.forEach(l => {
  const id = l.getAttribute('href')?.slice(1);
  if (id) {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  }
});

/* ═══════════════════════════════════════════════
   TOPIC BANK — FILTERABLE TABLE
═══════════════════════════════════════════════ */
const topics = [
  [1,"CSR readiness assessment: the 25 questions every Philippine board should ask","G","Consideration","Lead+SEO",9,10,8,9],
  [2,"The Periodic Table of Basic CSR explained (cornerstone flagship)","G","Awareness","Authority+SEO",10,10,7,8],
  [3,"Why reactive CSR is costing Philippine companies more than they realize","G","Awareness","Authority",9,10,8,9],
  [4,"How to write a CSR report that survives an ESG audit","G","Consideration","SEO+Lead",9,9,9,8],
  [5,"Business continuity planning for typhoon-exposed operations (BPO guide)","R","Awareness","SEO+Authority",8,10,8,9],
  [6,"Early action protocols: why pre-positioning cuts disaster losses by 60%","R","Awareness","Authority",8,10,6,8],
  [7,"Case study: BPO CSR transformation — from reactive to proactive (flagship)","G","Decision","Lead",10,10,5,7],
  [8,"Case study: donor-funded community resilience program outcomes (flagship)","S","Decision","Lead",10,10,5,7],
  [9,"How AI is changing CSR impact measurement: 5 practical applications","T","Awareness","Authority+SEO",7,8,8,7],
  [10,"The employee volunteering playbook: from checkbox to retention tool","S","Consideration","SEO",8,8,8,9],
  [11,"Solar power for schools and clinics in the Philippines: a buyer's guide","E","Consideration","SEO",7,8,9,8],
  [12,"SDG alignment for Philippine businesses: a practical checklist","G","Awareness","SEO",8,9,9,9],
  [13,"How to structure a board-level CSR presentation","G","Implementation","SEO+Lead",9,9,7,9],
  [14,"Inclusive CSR: designing programs for women, PWDs, and marginalized workers","S","Awareness","Authority",7,9,6,8],
  [15,"Livelihood programs that actually last: 5 design principles","S","Awareness","Authority",7,9,6,8],
  [16,"CSR vs ESG vs sustainability: what Philippine executives need to know","G","Awareness","SEO",9,8,10,10],
  [17,"The hidden cost of reactive CSR (quantified)","G","Awareness","Authority",9,9,5,7],
  [18,"5-point partnership model: why most CSR partnerships fail","S","Consideration","Authority",8,10,5,7],
  [19,"Rainwater harvesting for community resilience","E","Consideration","SEO",6,8,8,9],
  [20,"Building a CSR dashboard: what metrics matter","T","Implementation","SEO+Lead",8,8,7,8],
  [21,"Donor-funded resilience programs: what bilaterals fund and why","R","Consideration","Authority",7,9,5,7],
  [22,"Community risk mapping with open-source tools: a walkthrough","T","Implementation","SEO",6,7,7,7],
  [23,"Corporate climate risk disclosure in the Philippines","E","Awareness","SEO+Authority",7,8,8,8],
  [24,"Eco-literacy programs that actually change behavior","E","Consideration","Authority",6,7,6,7]
];

const PILLAR_LABELS = { G:'Governance', R:'Resilience', S:'Social', T:'Technology', E:'Environmental' };
const PILLAR_COLORS = { G:'teal', R:'navy', S:'gold', T:'slate', E:'green' };

function scoreBar(val) {
  return `<span class="score-wrap" title="${val}/10">
    <span class="score-track"><span class="score-fill" style="width:${val*10}%"></span></span>
    <span class="score-num">${val}</span>
  </span>`;
}

function stageBadge(stage) {
  const map = { Awareness:'aware', Consideration:'con', Decision:'dec', Implementation:'impl' };
  return `<span class="stage-badge stage-${map[stage]||'aware'}">${stage}</span>`;
}

function pillarBadge(code) {
  return `<span class="pillar-badge pb-${code}" title="${PILLAR_LABELS[code]||code}">${code}</span>`;
}

function goalBadge(goal) {
  const cls = goal.includes('SEO') ? 'goal-seo' : goal.includes('Lead') ? 'goal-tl' : 'goal-lg';
  return `<span class="${cls}">${goal}</span>`;
}

function totalScore(row) {
  return row[5] + row[6] + row[7] + row[8];
}

let sortCol = null;
let sortDir = 1;
let activeFilters = { pillar: 'ALL', stage: 'ALL', search: '' };

function renderTopics() {
  const tbody = document.getElementById('topic-rows');
  if (!tbody) return;

  let data = topics.slice();

  // filter
  if (activeFilters.pillar !== 'ALL') data = data.filter(r => r[2] === activeFilters.pillar);
  if (activeFilters.stage !== 'ALL') data = data.filter(r => r[3] === activeFilters.stage);
  if (activeFilters.search) {
    const q = activeFilters.search.toLowerCase();
    data = data.filter(r => r[1].toLowerCase().includes(q) || r[4].toLowerCase().includes(q));
  }

  // sort
  if (sortCol !== null) {
    data.sort((a, b) => {
      const av = sortCol === 'total' ? totalScore(a) : a[sortCol];
      const bv = sortCol === 'total' ? totalScore(b) : b[sortCol];
      return typeof av === 'number' ? (bv - av) * sortDir : av.localeCompare(bv) * sortDir;
    });
  }

  const count = document.getElementById('topic-count');
  if (count) count.textContent = `${data.length} topic${data.length !== 1 ? 's' : ''}`;

  tbody.innerHTML = '';
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--mist);font-style:italic;">No topics match the current filters.</td></tr>`;
    return;
  }

  data.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.className = 'topic-row' + (row[0] <= 10 ? ' priority' : '');
    tr.style.animationDelay = `${i * 25}ms`;
    tr.innerHTML = `
      <td class="t-rank">${String(row[0]).padStart(2,'0')}</td>
      <td class="t-title">${row[1]}${row[0] <= 3 ? ' <span class="flagship-badge">flagship</span>' : ''}</td>
      <td class="t-pillar">${pillarBadge(row[2])}</td>
      <td class="t-stage">${stageBadge(row[3])}</td>
      <td class="t-goal">${goalBadge(row[4])}</td>
      <td class="t-score">${scoreBar(row[5])}</td>
      <td class="t-score">${scoreBar(row[6])}</td>
      <td class="t-score">${scoreBar(row[7])}</td>
      <td class="t-score">${scoreBar(row[8])}</td>
    `;
    tbody.appendChild(tr);
  });
}

// inject filter bar + enhanced table styles
function injectTopicControls() {
  const table = document.querySelector('#topic-rows')?.closest('table') ||
                document.querySelector('.topic-table');
  if (!table) return;

  // styles
  const style = document.createElement('style');
  style.textContent = `
    .topic-controls {
      display: flex; gap: .65rem; align-items: center; flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    .topic-search {
      flex: 1; min-width: 180px; max-width: 280px;
      padding: .45rem .85rem;
      border: 1px solid var(--line); border-radius: 6px;
      background: var(--white); color: var(--ink);
      font-family: var(--sans); font-size: .8rem;
      outline: none; transition: border-color .15s;
    }
    .topic-search:focus { border-color: var(--teal); }
    .topic-search::placeholder { color: var(--mist); }
    .filter-group { display: flex; gap: 2px; }
    .filter-btn {
      padding: .4rem .75rem; font-size: .7rem; font-weight: 600;
      letter-spacing: .06em; text-transform: uppercase;
      border: 1px solid var(--line); background: var(--white);
      color: var(--slate); cursor: pointer; transition: all .15s;
      font-family: var(--sans);
    }
    .filter-btn:first-child { border-radius: 6px 0 0 6px; }
    .filter-btn:last-child  { border-radius: 0 6px 6px 0; }
    .filter-btn:hover { background: var(--teal-light); color: var(--teal); border-color: var(--teal); }
    .filter-btn.active { background: var(--teal); color: #fff; border-color: var(--teal); }
    .filter-btn.pb-G.active { background: #0d6e5c; }
    .filter-btn.pb-R.active { background: var(--navy); }
    .filter-btn.pb-S.active { background: var(--gold); }
    .filter-btn.pb-T.active { background: var(--slate); }
    .filter-btn.pb-E.active { background: #2d7a3a; }
    .topic-count { font-family: var(--mono); font-size: .7rem; color: var(--mist); margin-left: auto; }
    .sort-btn { cursor: pointer; user-select: none; white-space: nowrap; }
    .sort-btn::after { content: ' ↕'; opacity: .35; font-size: .6rem; }
    .sort-btn.asc::after  { content: ' ↑'; opacity: 1; color: var(--teal); }
    .sort-btn.desc::after { content: ' ↓'; opacity: 1; color: var(--teal); }
    .topic-row { animation: rowIn .22s ease both; }
    @keyframes rowIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
    .score-wrap { display: inline-flex; align-items: center; gap: .4rem; }
    .score-track { width: 36px; height: 4px; background: var(--line); border-radius: 2px; overflow: hidden; flex-shrink: 0; }
    .score-fill  { height: 100%; background: var(--teal); border-radius: 2px; transition: width .4s ease; }
    .score-num { font-family: var(--mono); font-size: .72rem; color: var(--ink-mid); min-width: 12px; }
    .pillar-badge {
      display: inline-flex; align-items: center; justify-content: center;
      width: 26px; height: 26px; border-radius: 50%;
      font-family: var(--mono); font-size: .68rem; font-weight: 700;
      color: #fff; flex-shrink: 0;
    }
    .pillar-badge.pb-G { background: #0d6e5c; }
    .pillar-badge.pb-R { background: #1a2640; }
    .pillar-badge.pb-S { background: #a87c2a; }
    .pillar-badge.pb-T { background: #6b7385; }
    .pillar-badge.pb-E { background: #2d7a3a; }
    .flagship-badge {
      font-size: .6rem; font-weight: 600; letter-spacing: .06em;
      padding: .15rem .4rem; border-radius: 3px;
      background: var(--gold-light); color: var(--gold);
      text-transform: uppercase; vertical-align: middle;
      margin-left: .4rem;
    }
    .topic-table tbody tr.topic-row:hover td { background: var(--teal-light); transition: background .1s; }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.className = 'topic-controls';

  // search
  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'topic-search';
  search.placeholder = 'Search topics…';
  search.addEventListener('input', () => {
    activeFilters.search = search.value.trim();
    renderTopics();
  });
  wrap.appendChild(search);

  // pillar filters
  const pillars = document.createElement('div');
  pillars.className = 'filter-group';
  ['ALL','G','R','S','T','E'].forEach(p => {
    const b = document.createElement('button');
    b.className = `filter-btn pb-${p}${p === 'ALL' ? ' active' : ''}`;
    b.textContent = p === 'ALL' ? 'All' : `${p} – ${PILLAR_LABELS[p]}`;
    b.addEventListener('click', () => {
      pillars.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      activeFilters.pillar = p;
      renderTopics();
    });
    pillars.appendChild(b);
  });
  wrap.appendChild(pillars);

  // stage filters
  const stages = document.createElement('div');
  stages.className = 'filter-group';
  ['ALL','Awareness','Consideration','Decision','Implementation'].forEach(s => {
    const b = document.createElement('button');
    b.className = `filter-btn${s === 'ALL' ? ' active' : ''}`;
    b.textContent = s === 'ALL' ? 'All stages' : s;
    b.addEventListener('click', () => {
      stages.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      activeFilters.stage = s;
      renderTopics();
    });
    stages.appendChild(b);
  });
  wrap.appendChild(stages);

  // count
  const countEl = document.createElement('span');
  countEl.id = 'topic-count';
  countEl.className = 'topic-count';
  wrap.appendChild(countEl);

  table.parentNode.insertBefore(wrap, table);

  // sortable column headers
  const thead = table.querySelector('thead');
  if (thead) {
    const headers = thead.querySelectorAll('th');
    const sortMap = [null, null, null, null, null, 5, 6, 7, 8]; // col index → data index
    headers.forEach((th, i) => {
      if (sortMap[i] !== undefined && sortMap[i] !== null) {
        th.classList.add('sort-btn');
        th.addEventListener('click', () => {
          if (sortCol === sortMap[i]) {
            sortDir *= -1;
          } else {
            sortCol = sortMap[i];
            sortDir = -1;
          }
          headers.forEach(h => h.classList.remove('asc','desc'));
          th.classList.add(sortDir === -1 ? 'desc' : 'asc');
          renderTopics();
        });
      }
    });
  }

  renderTopics();
}

/* ═══════════════════════════════════════════════
   CALENDAR — INTERACTIVE
═══════════════════════════════════════════════ */
const quarters = [
  {
    label: "Q1 · Months 1–3", title: "Foundation", theme: "Foundation",
    rows: [
      ["M1","CSR vs ESG vs sustainability: what PH executives need to know","Governance","SEO",""],
      ["M1","The Periodic Table of Basic CSR (cornerstone flagship)","Governance","Authority",""],
      ["M1","LAUNCH: CSR Readiness Checklist (gated PDF)","Lead Magnet","Lead Gen","launch"],
      ["M2","Why reactive CSR is costing PH companies more than they realize","Governance","Authority",""],
      ["M2","SDG alignment for PH businesses: a practical checklist","Governance","SEO",""],
      ["M2","LAUNCH: Monthly newsletter begins","Distribution","Retention","launch"],
      ["M3","Business continuity planning for typhoon-exposed operations (BPO guide)","Resilience","SEO",""],
      ["M3","How to structure a board-level CSR presentation","Governance","SEO+Lead",""]
    ]
  },
  {
    label: "Q2 · Months 4–6", title: "Authority", theme: "Authority",
    rows: [
      ["M4","How to write a CSR report that survives an ESG audit","Governance","SEO+Lead",""],
      ["M4","Solar for schools and clinics in PH: a buyer's guide","Environmental","SEO",""],
      ["M5","Early action protocols: why pre-positioning cuts losses by 60%","Resilience","Authority",""],
      ["M5","The employee volunteering playbook: from checkbox to retention tool","Social","SEO",""],
      ["M5","CASE STUDY #1: From reactive to proactive — a BPO CSR transformation","Governance","Lead Gen","case-study"],
      ["M6","How AI is changing CSR impact measurement: 5 practical applications","Technology","Authority+SEO",""],
      ["M6","5-point partnership model: why most CSR partnerships fail","Social","Authority",""],
      ["M6","WEBINAR #1: From Reactive to Proactive CSR — a 60-minute playbook","Cross-pillar","Lead Gen","webinar"]
    ]
  },
  {
    label: "Q3 · Months 7–9", title: "Depth", theme: "Depth",
    rows: [
      ["M7","Inclusive CSR: designing programs for women, PWDs, and marginalized workers","Social","Authority",""],
      ["M7","CSR readiness assessment: the 25 questions every PH board should ask","Governance","Lead+SEO",""],
      ["M8","Donor-funded resilience programs: what bilateral agencies fund and why","Resilience","Authority",""],
      ["M8","Corporate climate risk disclosure in the Philippines","Environmental","SEO+Authority",""],
      ["M8","CASE STUDY #2: Donor-funded community resilience program outcomes","Social","Lead Gen","case-study"],
      ["M9","Building a CSR dashboard: what metrics matter and how to track them","Technology","SEO+Lead",""],
      ["M9","Livelihood programs that actually last: 5 design principles","Social","Authority",""],
      ["M9","LAUNCH: DRRM Plan Template for PH Operations (gated PDF)","Lead Magnet","Lead Gen","launch"]
    ]
  },
  {
    label: "Q4 · Months 10–12", title: "Scale", theme: "Scale",
    rows: [
      ["M10","Community risk mapping with open-source tools: a beginner's walkthrough","Technology","SEO",""],
      ["M10","The hidden cost of reactive CSR (quantified)","Governance","Authority",""],
      ["M11","Rainwater harvesting for community resilience","Environmental","SEO",""],
      ["M11","Eco-literacy programs that actually change behavior","Environmental","Authority",""],
      ["M11","CASE STUDY #3: NGO partnership scaling across 5 provinces","Social","Lead Gen","case-study"],
      ["M12","PHI Resilience 2026 Impact Report (annual flagship)","Cross-pillar","Authority",""],
      ["M12","CSR planning for 2027: trends every PH executive should track","Governance","SEO+Authority",""],
      ["M12","WEBINAR #2: 2027 CSR Planning for Philippine Businesses","Cross-pillar","Lead Gen","webinar"]
    ]
  }
];

function injectCalendar() {
  const cal = document.getElementById('calendar');
  if (!cal) return;

  const style = document.createElement('style');
  style.textContent = `
    .cal-tabs { display: flex; gap: 2px; margin-bottom: 1.5rem; }
    .cal-tab {
      flex: 1; padding: .65rem 1rem; text-align: center;
      border: 1px solid var(--line); background: var(--white);
      color: var(--slate); font-family: var(--mono); font-size: .68rem;
      letter-spacing: .07em; cursor: pointer; transition: all .2s;
      position: relative; overflow: hidden;
    }
    .cal-tab:first-child { border-radius: var(--r-lg) 0 0 var(--r-lg); }
    .cal-tab:last-child  { border-radius: 0 var(--r-lg) var(--r-lg) 0; }
    .cal-tab:hover { background: var(--teal-light); color: var(--teal); border-color: var(--teal); }
    .cal-tab.active {
      background: var(--navy); color: #fff; border-color: var(--navy);
    }
    .cal-tab .tab-q { display: block; font-size: .6rem; opacity: .6; margin-bottom: .15rem; }
    .cal-tab .tab-title { display: block; font-size: .78rem; font-family: var(--serif); font-style: italic; }

    .cal-panel { display: none; animation: panelIn .25s ease both; }
    .cal-panel.active { display: block; }
    @keyframes panelIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }

    .cal-type-filters { display: flex; gap: .4rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .cal-type-btn {
      font-size: .67rem; padding: .3rem .7rem; border-radius: 20px;
      border: 1px solid var(--line); background: var(--white);
      color: var(--slate); cursor: pointer; font-family: var(--sans);
      transition: all .15s; font-weight: 500;
    }
    .cal-type-btn.active { font-weight: 600; }
    .cal-type-btn[data-type="ALL"].active { background: var(--navy); color: #fff; border-color: var(--navy); }
    .cal-type-btn[data-type="seo"].active  { background: #2a5bc7; color: #fff; border-color: #2a5bc7; }
    .cal-type-btn[data-type="authority"].active { background: var(--teal); color: #fff; border-color: var(--teal); }
    .cal-type-btn[data-type="lead"].active { background: var(--gold); color: #fff; border-color: var(--gold); }
    .cal-type-btn[data-type="launch"].active { background: #6b3fa0; color: #fff; border-color: #6b3fa0; }
    .cal-type-btn[data-type="case-study"].active { background: #b85a0d; color: #fff; border-color: #b85a0d; }
    .cal-type-btn[data-type="webinar"].active { background: #c22e5a; color: #fff; border-color: #c22e5a; }

    .q-month-group { margin-bottom: 1.25rem; }
    .q-month-label {
      font-family: var(--mono); font-size: .63rem; letter-spacing: .1em;
      color: var(--mist); text-transform: uppercase;
      padding: .4rem 0; border-bottom: 1px solid var(--line);
      margin-bottom: .5rem;
    }
    .q-row {
      display: grid; grid-template-columns: 2.5rem 1fr auto auto;
      gap: .75rem; align-items: center;
      padding: .55rem .75rem; border-radius: 6px;
      margin-bottom: 3px; transition: background .15s, opacity .2s, transform .2s;
      border-left: 3px solid transparent;
    }
    .q-row:hover { background: var(--teal-light); }
    .q-row.hidden { opacity: 0; pointer-events: none; height: 0; padding: 0; margin: 0; overflow: hidden; }
    .q-row-month { font-family: var(--mono); font-size: .65rem; color: var(--mist); }
    .q-row-title { font-size: .8rem; color: var(--ink-mid); line-height: 1.4; }
    .q-row-pillar { font-size: .68rem; color: var(--slate); white-space: nowrap; }
    .q-row-goal {
      font-size: .65rem; font-weight: 600; padding: .2rem .5rem;
      border-radius: 3px; white-space: nowrap; letter-spacing: .04em;
    }
    /* row type accents */
    .q-row[data-goal*="SEO"]       { border-left-color: #4a7ce8; }
    .q-row[data-goal*="Authority"] { border-left-color: var(--teal); }
    .q-row[data-goal*="Lead"]      { border-left-color: var(--gold); }
    .q-row.launch    { border-left-color: #9b6fcc; background: #f9f7fe; }
    .q-row.case-study { border-left-color: #b85a0d; background: var(--gold-light); }
    .q-row.webinar   { border-left-color: #c22e5a; background: #fdf0f5; }
    [data-theme="dark"] .q-row.launch    { background: #1f1535; }
    [data-theme="dark"] .q-row.case-study { background: #2a1a05; }
    [data-theme="dark"] .q-row.webinar   { background: #2a0f18; }

    .goal-chip {
      font-size: .65rem; font-weight: 600; padding: .2rem .5rem;
      border-radius: 3px; white-space: nowrap;
    }
    .chip-seo { background: #eef2fb; color: #2a5bc7; }
    .chip-authority { background: var(--teal-light); color: var(--teal); }
    .chip-lead { background: var(--gold-light); color: #7a5a1a; }
    .chip-mixed { background: var(--bg); color: var(--slate); border: 1px solid var(--line); }
    .chip-launch { background: #f3f0f9; color: #6b3fa0; }
    .chip-case-study { background: #fef0e7; color: #b85a0d; }
    .chip-webinar { background: #fdf0f5; color: #c22e5a; }
    [data-theme="dark"] .chip-seo { background: #1a2550; color: #7da4f5; }
    [data-theme="dark"] .chip-authority { background: #0d3530; color: #1d9e75; }
    [data-theme="dark"] .chip-lead { background: #2a1a05; color: #d4a050; }
    [data-theme="dark"] .chip-launch { background: #1f1535; color: #b08ae0; }
    [data-theme="dark"] .chip-case-study { background: #2a1a05; color: #e8963a; }
    [data-theme="dark"] .chip-webinar { background: #2a0f18; color: #f080a0; }

    .cal-summary {
      display: flex; gap: 1rem; flex-wrap: wrap;
      padding: 1rem 1.25rem; background: var(--white);
      border: 1px solid var(--line); border-radius: var(--r-lg);
      margin-bottom: 1.25rem;
    }
    .cal-sum-item { text-align: center; }
    .cal-sum-num { font-family: var(--serif); font-size: 1.6rem; color: var(--teal); line-height: 1; }
    .cal-sum-label { font-size: .65rem; color: var(--mist); font-family: var(--mono); letter-spacing: .06em; }
  `;
  document.head.appendChild(style);

  function goalChip(goal, type) {
    if (type === 'launch')     return `<span class="goal-chip chip-launch">Launch</span>`;
    if (type === 'case-study') return `<span class="goal-chip chip-case-study">Case Study</span>`;
    if (type === 'webinar')    return `<span class="goal-chip chip-webinar">Webinar</span>`;
    if (goal.includes('SEO') && goal.includes('Lead')) return `<span class="goal-chip chip-mixed">${goal}</span>`;
    if (goal.includes('SEO'))       return `<span class="goal-chip chip-seo">SEO</span>`;
    if (goal.toLowerCase().includes('lead')) return `<span class="goal-chip chip-lead">Lead Gen</span>`;
    if (goal.toLowerCase().includes('authority')) return `<span class="goal-chip chip-authority">Authority</span>`;
    return `<span class="goal-chip chip-mixed">${goal}</span>`;
  }

  function rowType(row) {
    if (row[4]) return row[4];
    if (row[3].includes('SEO')) return 'seo';
    if (row[3].toLowerCase().includes('authority')) return 'authority';
    if (row[3].toLowerCase().includes('lead')) return 'lead';
    return 'other';
  }

  // build tabs
  const tabsEl = document.createElement('div');
  tabsEl.className = 'cal-tabs';

  const typeFilterEl = document.createElement('div');
  typeFilterEl.className = 'cal-type-filters';
  let activeTypeFilter = 'ALL';

  ['ALL','seo','authority','lead','launch','case-study','webinar'].forEach(t => {
    const b = document.createElement('button');
    b.className = `cal-type-btn${t === 'ALL' ? ' active' : ''}`;
    b.dataset.type = t;
    b.textContent = t === 'ALL' ? 'All content' : t.replace('-',' ');
    b.addEventListener('click', () => {
      typeFilterEl.querySelectorAll('.cal-type-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      activeTypeFilter = t;
      filterRows();
    });
    typeFilterEl.appendChild(b);
  });

  function filterRows() {
    document.querySelectorAll('.q-row').forEach(row => {
      const rt = row.dataset.rowtype || '';
      const show = activeTypeFilter === 'ALL' || rt === activeTypeFilter ||
        (activeTypeFilter === 'seo' && rt === 'seo') ||
        (activeTypeFilter === 'authority' && rt === 'authority') ||
        (activeTypeFilter === 'lead' && rt === 'lead');
      row.classList.toggle('hidden', !show);
    });
  }

  const panels = quarters.map((q, qi) => {
    // tab
    const tab = document.createElement('button');
    tab.className = `cal-tab${qi === 0 ? ' active' : ''}`;
    tab.innerHTML = `<span class="tab-q">${q.label}</span><span class="tab-title">${q.title}</span>`;
    tabsEl.appendChild(tab);

    // panel
    const panel = document.createElement('div');
    panel.className = `cal-panel${qi === 0 ? ' active' : ''}`;

    // summary stats
    const launches = q.rows.filter(r => r[4] === 'launch').length;
    const caseStudies = q.rows.filter(r => r[4] === 'case-study').length;
    const webinars = q.rows.filter(r => r[4] === 'webinar').length;
    const articles = q.rows.filter(r => !r[4]).length;

    const summary = document.createElement('div');
    summary.className = 'cal-summary';
    summary.innerHTML = `
      <div class="cal-sum-item"><div class="cal-sum-num">${q.rows.length}</div><div class="cal-sum-label">pieces</div></div>
      <div class="cal-sum-item"><div class="cal-sum-num">${articles}</div><div class="cal-sum-label">articles</div></div>
      ${launches ? `<div class="cal-sum-item"><div class="cal-sum-num">${launches}</div><div class="cal-sum-label">launches</div></div>` : ''}
      ${caseStudies ? `<div class="cal-sum-item"><div class="cal-sum-num">${caseStudies}</div><div class="cal-sum-label">case studies</div></div>` : ''}
      ${webinars ? `<div class="cal-sum-item"><div class="cal-sum-num">${webinars}</div><div class="cal-sum-label">webinars</div></div>` : ''}
    `;
    panel.appendChild(summary);

    // group by month
    const monthGroups = {};
    q.rows.forEach(r => {
      if (!monthGroups[r[0]]) monthGroups[r[0]] = [];
      monthGroups[r[0]].push(r);
    });

    Object.entries(monthGroups).forEach(([month, rows]) => {
      const mg = document.createElement('div');
      mg.className = 'q-month-group';
      mg.innerHTML = `<div class="q-month-label">${month}</div>`;

      rows.forEach(r => {
        const rt = rowType(r);
        const row = document.createElement('div');
        row.className = `q-row${r[4] ? ' ' + r[4] : ''}`;
        row.dataset.rowtype = rt;
        row.dataset.goal = r[3];
        row.innerHTML = `
          <span class="q-row-month">${r[0]}</span>
          <span class="q-row-title">${r[1]}</span>
          <span class="q-row-pillar">${r[2]}</span>
          ${goalChip(r[3], r[4])}
        `;
        mg.appendChild(row);
      });

      panel.appendChild(mg);
    });

    tab.addEventListener('click', () => {
      tabsEl.querySelectorAll('.cal-tab').forEach(t => t.classList.remove('active'));
      cal.querySelectorAll('.cal-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      panel.classList.add('active');
    });

    return panel;
  });

  cal.innerHTML = '';
  cal.appendChild(tabsEl);
  cal.appendChild(typeFilterEl);
  panels.forEach(p => cal.appendChild(p));
}

/* ═══════════════════════════════════════════════
   CHATBOT WIDGET
═══════════════════════════════════════════════ */
function initChat() {
  const trigger = document.getElementById('chat-trigger');
  const win = document.getElementById('chat-window');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const messages = document.getElementById('chat-messages');
  const suggestionsWrap = document.getElementById('chat-suggestions');
  if (!trigger || !win) return;

  let isOpen = false;
  let isWaiting = false;

  trigger.addEventListener('click', () => {
    isOpen = !isOpen;
    trigger.classList.toggle('open', isOpen);
    win.classList.toggle('open', isOpen);
    if (isOpen && input) setTimeout(() => input.focus(), 300);
  });

  const SUGGESTIONS = [
    'What is reactive vs proactive CSR?',
    'Which topics should I prioritise in Q1?',
    'Explain the 5 content pillars',
    'What lead magnets are planned?'
  ];

  function showSuggestions(list) {
    if (!suggestionsWrap) return;
    suggestionsWrap.innerHTML = '';
    list.forEach(s => {
      const b = document.createElement('button');
      b.className = 'chat-sugg';
      b.textContent = s;
      b.addEventListener('click', () => sendMessage(s));
      suggestionsWrap.appendChild(b);
    });
  }

  function addMessage(text, role) {
    if (!messages) return;
    const msg = document.createElement('div');
    msg.className = `msg ${role}`;
    const initials = role === 'user' ? 'You' : 'PHI';
    msg.innerHTML = `
      <div class="msg-avatar">${initials}</div>
      <div class="msg-bubble"><p>${text}</p></div>
    `;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    if (!messages) return null;
    const el = document.createElement('div');
    el.className = 'msg bot typing-indicator';
    el.innerHTML = `<div class="msg-avatar">PHI</div><div class="typing-dots"><span></span><span></span><span></span></div>`;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  // simple canned responses keyed to keywords
  const RESPONSES = [
    [['reactive','proactive','difference'], 'Reactive CSR responds to crises after they happen — it\'s costly and reputational. Proactive CSR embeds resilience into operations before risks materialise, typically cutting disaster recovery costs by 40–60%.'],
    [['q1','quarter 1','first quarter','priorit'], 'In Q1 (Foundation), focus on: (1) CSR vs ESG explainer for SEO reach, (2) The Periodic Table of Basic CSR as your cornerstone, and (3) launching the gated CSR Readiness Checklist as your first lead magnet.'],
    [['pillar','five pillar','5 pillar'], 'The five content pillars are: **G** – Governance (CSR strategy & reporting), **R** – Resilience (DRRM & continuity), **S** – Social (community & livelihood), **T** – Technology (AI, dashboards, tools), and **E** – Environmental (climate & ecosystems).'],
    [['lead magnet','gated','download'], 'Two lead magnets are planned: (1) M1 — CSR Readiness Checklist PDF (25 board questions), and (2) M9 — DRRM Plan Template for Philippine operations. Both target decision-makers and feed the newsletter funnel.'],
    [['webinar'], 'Two webinars anchor the year: Webinar #1 in M6 ("From Reactive to Proactive CSR") and Webinar #2 in M12 ("2027 CSR Planning for PH Businesses"). Both are positioned as lead-gen events.'],
    [['seo','search','keyword'], 'Top SEO priorities are: CSR vs ESG definition (KD ~30, vol ~800/mo), SDG alignment checklist (KD ~25), and business continuity planning Philippines (KD ~40). These anchor the awareness funnel.'],
    [['case stud'], 'Three flagship case studies ship across the year: M5 (BPO CSR transformation), M8 (donor-funded community resilience), and M11 (NGO partnership scaling). Each anchors a quarter\'s authority push.'],
  ];

  function getResponse(text) {
    const lower = text.toLowerCase();
    for (const [keywords, response] of RESPONSES) {
      if (keywords.some(k => lower.includes(k))) return response;
    }
    return 'Great question! The PHI Resilience strategy covers 24 prioritised topics across 5 pillars over 12 months. Could you be more specific — are you asking about a particular quarter, pillar, or content type?';
  }

  function sendMessage(text) {
    if (!text.trim() || isWaiting) return;
    isWaiting = true;
    if (input) input.value = '';
    if (sendBtn) sendBtn.disabled = true;
    if (suggestionsWrap) suggestionsWrap.innerHTML = '';
    addMessage(text, 'user');

    const typing = showTyping();
    const delay = 700 + Math.random() * 600;

    setTimeout(() => {
      if (typing) typing.remove();
      addMessage(getResponse(text), 'bot');
      isWaiting = false;
      if (sendBtn) sendBtn.disabled = false;
      // show follow-up suggestions
      const followUps = SUGGESTIONS.filter(s => s.toLowerCase() !== text.toLowerCase()).slice(0, 2);
      showSuggestions(followUps);
    }, delay);
  }

  if (sendBtn) sendBtn.addEventListener('click', () => sendMessage(input?.value || ''));
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
    });
    // auto-grow textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 110) + 'px';
    });
  }

  showSuggestions(SUGGESTIONS);
}

/* ═══════════════════════════════════════════════
   EXEC STATS — ANIMATED COUNT-UP
═══════════════════════════════════════════════ */
function initCountUp() {
  const style = document.createElement('style');
  style.textContent = `
    .exec-stat-num[data-target] { transition: none; }
  `;
  document.head.appendChild(style);

  const statNums = document.querySelectorAll('.exec-stat-num[data-target]');
  if (!statNums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      const duration = 1200;
      const start = performance.now();

      function update(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const val = target * ease;
        el.textContent = prefix + val.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════
   COPY-TO-CLIPBOARD on code/mono elements
═══════════════════════════════════════════════ */
function initCopyable() {
  document.querySelectorAll('code, .copyable').forEach(el => {
    el.style.cursor = 'copy';
    el.title = 'Click to copy';
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(el.textContent).then(() => {
        const orig = el.style.outline;
        el.style.outline = '2px solid var(--teal)';
        setTimeout(() => el.style.outline = orig, 800);
      });
    });
  });
}

/* ═══════════════════════════════════════════════
   SMOOTH SCROLL + BACK-TO-TOP
═══════════════════════════════════════════════ */
function initScrollHelpers() {
  // smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // back-to-top via topbar brand
  const brand = document.querySelector('.topbar-brand');
  if (brand) {
    brand.style.cursor = 'pointer';
    brand.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

/* ═══════════════════════════════════════════════
   KEYBOARD NAVIGATION for sidenav
═══════════════════════════════════════════════ */
function initKeyNav() {
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && e.altKey) {
      const links = Array.from(document.querySelectorAll('.sidenav-link'));
      const active = links.findIndex(l => l.classList.contains('active'));
      const next = links[Math.min(active + 1, links.length - 1)];
      if (next) next.click();
    }
    if (e.key === 'ArrowUp' && e.altKey) {
      const links = Array.from(document.querySelectorAll('.sidenav-link'));
      const active = links.findIndex(l => l.classList.contains('active'));
      const prev = links[Math.max(active - 1, 0)];
      if (prev) prev.click();
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      const search = document.querySelector('.topic-search');
      if (search) { e.preventDefault(); search.focus(); }
    }
  });
}

/* ═══════════════════════════════════════════════
   INIT ALL
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  injectTopicControls();
  injectCalendar();
  initChat();
  initCountUp();
  initCopyable();
  initScrollHelpers();
  initKeyNav();
});