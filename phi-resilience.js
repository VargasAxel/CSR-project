/*
  PHI RESILIENCE — 12-MONTH CONTENT STRATEGY 2026
  Separated JS from PHI_Resilience_Content_Strategy_2026 (1).html
*/

// (Migrated from inline <script> in PHI_Resilience_Content_Strategy_2026 (1).html)


/* ─────────────── PROGRESS BAR ─────────────── */
const progress = document.getElementById('progress');
if (progress) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0%';
  }, { passive: true });
}

/* ─────────────── REVEAL ─────────────── */
const revealEls = document.querySelectorAll('.reveal');

/* ═══ SECTION NAVIGATION ACTIVE STATE ═══════════════════════════════ */
const sectionNavLinks = Array.from(document.querySelectorAll('.section-nav-link'));

/* ─────────────── REVEAL ─────────────── */
const ioReveal = new IntersectionObserver((entries) => {

  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      ioReveal.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
revealEls.forEach(el => ioReveal.observe(el));

/* ═══ SECTION NAVIGATION ACTIVE STATE ═══════════════════════════════ */
const sectionIds = sectionNavLinks
  .map(a => a.getAttribute('data-section'))
  .filter(Boolean)
  .filter(id => id !== 'top');

const sectionObserver = new IntersectionObserver((entries) => {
// choose the most-visible intersecting section
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));

  // ensure "active" is always consistent when user clicks a link
  sectionNavLinks.forEach(link => {
    if (link.dataset.section === visible[0]?.target?.id) link.classList.add('is-active');
  });

  if (!visible.length) return;

  const id = visible[0].target.getAttribute('id');
  if (!id) return;

  sectionNavLinks.forEach(link => {
    link.classList.toggle('is-active', link.getAttribute('data-section') === id);
  });
}, { threshold: [0.15, 0.35, 0.55], rootMargin: '-20% 0px -65% 0px' });

sectionIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

/* ─────────────── SECTION NAVIGATION INTERACTIVITY ─────────────── */
if (sectionNavLinks.length) {
  sectionNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('data-section');
      if (!id) return;
      sectionNavLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('data-section') === id));
    });
  });
}


const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
revealEls.forEach(el => io.observe(el));

/* ─────────────── TOPIC BANK DATA ─────────────── */
const tbody = document.getElementById('topic-rows');
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

if (tbody) {
  topics.forEach(([rank, title, pillar, stage, goal, ci, cmf, sp, rf], i) => {
    const tr = document.createElement('tr');
    if (i < 10) tr.classList.add('priority');

    tr.innerHTML = `
      <td class="t-rank">${String(rank).padStart(2, '0')}</td>
      <td class="t-title">${title}</td>
      <td class="t-pillar">${pillar}</td>
      <td class="t-stage">${stage}</td>
      <td class="t-goal">${goal}</td>
      <td class="t-score">${ci}<span class="t-score-bar" style="--w:${ci*10}%"></span></td>
      <td class="t-score">${cmf}<span class="t-score-bar" style="--w:${cmf*10}%"></span></td>
      <td class="t-score">${sp}<span class="t-score-bar" style="--w:${sp*10}%"></span></td>
      <td class="t-score">${rf}<span class="t-score-bar" style="--w:${rf*10}%"></span></td>
    `;

    tbody.appendChild(tr);
  });
}

/* ─────────────── CALENDAR DATA ─────────────── */
const quarters = [
  {
    label: "Q1 · Months 1–3",
    title: "Foundation",
    theme: "Foundation",
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
    label: "Q2 · Months 4–6",
    title: "Authority",
    theme: "Authority",
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
    label: "Q3 · Months 7–9",
    title: "Depth",
    theme: "Depth",
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
    label: "Q4 · Months 10–12",
    title: "Scale",
    theme: "Scale",
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

const cal = document.getElementById('calendar');
if (cal) {
  quarters.forEach(q => {
    const div = document.createElement('div');
    div.className = 'quarter reveal';

    const rowsHtml = q.rows.map(r => `
      <div class="q-row ${r[4]}">
        <div class="q-row-month">${r[0]}</div>
        <div class="q-row-title">${r[1]}</div>
        <div class="q-row-pillar">${r[2]}</div>
        <div class="q-row-goal">${r[3]}</div>
      </div>
    `).join('');

    div.innerHTML = `
      <div class="q-header">
        <div class="q-label">${q.label}</div>
        <div class="q-title">${q.title}</div>
        <div class="q-theme">${q.theme}</div>
      </div>
      <div class="q-body">${rowsHtml}</div>
    `;

    cal.appendChild(div);
    io.observe(div);
  });
}

