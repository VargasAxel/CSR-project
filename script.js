/* ============================================================
   PHI RESILIENCE — script.js
   ============================================================ */

'use strict';

/* ── CUSTOM CURSOR ───────────────────────────────────────── */
(function initCursor() {
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = -100, my = -100, rx = -100, ry = -100;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function loop() {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, .el, .value-card, .svc-card, .why-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

/* ── NAV SCROLL ──────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  const hbg = document.getElementById('hbg');
  const navM = document.getElementById('navM');

  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  hbg.addEventListener('click', () => {
    navM.classList.toggle('open');
    const spans = hbg.querySelectorAll('span');
    const open  = navM.classList.contains('open');
    spans[0].style.transform = open ? 'translateY(6.5px) rotate(45deg)'  : '';
    spans[1].style.opacity   = open ? '0' : '';
    spans[2].style.transform = open ? 'translateY(-6.5px) rotate(-45deg)' : '';
  });

  window.closeM = () => {
    navM.classList.remove('open');
    hbg.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  };

  navM.addEventListener('click', e => { if (e.target === navM) window.closeM(); });
})();

/* ── SCROLL REVEAL ───────────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ── COUNTER ANIMATION ───────────────────────────────────── */
(function initCounters() {
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const dur    = 1800;
      const start  = performance.now();

      function tick(now) {
        const t   = Math.min((now - start) / dur, 1);
        const val = Math.round(easeOutQuart(t) * target);
        el.textContent = val + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: .5 });

  document.querySelectorAll('.stat-num').forEach(el => obs.observe(el));
})();

/* ── PERIODIC TABLE ──────────────────────────────────────── */
(function buildPeriodic() {
  const elements = [
    // Group E — Environmental & Climate Solutions
    { num:'E1', sym:'Sl', name:'Solar Energy',        grp:'E', sdg:'7,13',  desc:'Modular solar kits for schools, clinics, and community hubs.' },
    { num:'E2', sym:'Wt', name:'Water Solutions',     grp:'E', sdg:'6,3',   desc:'Rainwater harvesting systems and potable water filtration.' },
    { num:'E3', sym:'Wm', name:'Waste Mgmt',          grp:'E', sdg:'11,12', desc:'Zero-waste campaigns, segregation training, eco-advocacy.' },
    { num:'E4', sym:'Gr', name:'Urban Greening',      grp:'E', sdg:'11,13', desc:'Garden-to-table initiatives, reforestation, and urban farming.' },
    { num:'E5', sym:'Ee', name:'Energy Efficiency',   grp:'E', sdg:'7,13',  desc:'Carbon footprint audits and green building retrofits.' },
    { num:'E6', sym:'Cb', name:'Carbon Action',       grp:'E', sdg:'13',    desc:'Carbon offset programs and climate resilience advocacy.' },

    // Group C — Community & Social Development
    { num:'C1', sym:'Lv', name:'Livelihoods',         grp:'C', sdg:'1,8',   desc:'Microenterprise training, cooperative development, and market linkage.' },
    { num:'C2', sym:'Ed', name:'Education',            grp:'C', sdg:'4',     desc:'Scholarship programs, safe learning spaces, and school-building.' },
    { num:'C3', sym:'Hl', name:'Health & Wellness',   grp:'C', sdg:'3',     desc:'Medical missions, health literacy, and mental wellness programs.' },
    { num:'C4', sym:'Yd', name:'Youth Dev',            grp:'C', sdg:'4,10',  desc:'Youth leadership camps, skills training, and values formation.' },
    { num:'C5', sym:'Pw', name:'PWD Inclusion',        grp:'C', sdg:'10',    desc:'Inclusive programs ensuring dignity and access for PWDs.' },
    { num:'C6', sym:'Gd', name:'Gender & Dev',         grp:'C', sdg:'5,10',  desc:'Women empowerment, gender-responsive budgeting, and safe spaces.' },

    // Group R — Resilience & Disaster Risk
    { num:'R1', sym:'Dm', name:'DRRM Training',        grp:'R', sdg:'11,13', desc:'Simulation exercises, hazard mapping, and preparedness workshops.' },
    { num:'R2', sym:'Bc', name:'Business Continuity',  grp:'R', sdg:'8,11',  desc:'BCPs for corporations and community livelihood continuity plans.' },
    { num:'R3', sym:'Sh', name:'Shelter',               grp:'R', sdg:'11',   desc:'Disaster-resilient community shelters and evacuation centers.' },
    { num:'R4', sym:'Ef', name:'Early Action',          grp:'R', sdg:'13',   desc:'Pre-arranged financing and early warning response protocols.' },
    { num:'R5', sym:'Mr', name:'Micro-Risk',            grp:'R', sdg:'1,8',  desc:'Risk-readiness packages for micro and small enterprises.' },
    { num:'R6', sym:'Rm', name:'Risk Mapping',          grp:'R', sdg:'11,13',desc:'Community risk mapping systems using GIS and local data.' },

    // Group T — Technology & Innovation
    { num:'T1', sym:'Db', name:'CSR Dashboard',        grp:'T', sdg:'17',   desc:'Real-time digital CSR impact dashboards and analytics.' },
    { num:'T2', sym:'Ai', name:'AI Analytics',          grp:'T', sdg:'9,17', desc:'AI-enabled impact measurement and program optimization.' },
    { num:'T3', sym:'Gis',name:'GIS Mapping',           grp:'T', sdg:'11',  desc:'Geospatial risk and impact visualization tools.' },
    { num:'T4', sym:'Di', name:'Digital Inc.',          grp:'T', sdg:'9,10', desc:'Digital literacy, e-commerce training, and tech access programs.' },

    // Group G — Governance & ESG Compliance
    { num:'G1', sym:'Esg',name:'ESG Strategy',          grp:'G', sdg:'16,17',desc:'ESG framework design, reporting, and stakeholder communication.' },
    { num:'G2', sym:'Sd', name:'SDG Alignment',          grp:'G', sdg:'17',  desc:'SDG benchmarking, mapping, and disclosure support.' },
    { num:'G3', sym:'Hr', name:'Human Rights',           grp:'G', sdg:'16',  desc:'HRDD integration in supply chains and governance structures.' },
    { num:'G4', sym:'Et', name:'Ethics & Anti-Corr',     grp:'G', sdg:'16',  desc:'Anti-corruption programs, whistleblower policies, and ethical audits.' },
    { num:'G5', sym:'Im', name:'Impact Meas.',           grp:'G', sdg:'17',  desc:'Theory of change, KPI frameworks, and outcomes evaluation.' },

    // Group S — Stakeholder & Partnership
    { num:'S1', sym:'Ev', name:'Employee Vol.',          grp:'S', sdg:'17',  desc:'Structured volunteer programs with skills-based matching.' },
    { num:'S2', sym:'Cr', name:'CSR Readiness',          grp:'S', sdg:'17',  desc:'Diagnostics, readiness scoring, and CSR maturity assessment.' },
    { num:'S3', sym:'Kx', name:'Knowledge Exchange',     grp:'S', sdg:'4,17',desc:'Multi-sector learning labs, dialogues, and community impact fairs.' },
    { num:'S4', sym:'Pp', name:'Public-Priv Partner',    grp:'S', sdg:'17',  desc:'Co-financing, joint advocacy, and shared-value creation models.' },
    { num:'S5', sym:'Sc', name:'Scaling',                grp:'S', sdg:'17',  desc:'Replication guides, implementation frameworks, and regional rollout.' },
  ];

  const grid = document.getElementById('ptGrid');
  const tip  = document.getElementById('ptTip');
  if (!grid) return;

  elements.forEach(e => {
    const el = document.createElement('div');
    el.className = `el grp-${e.grp}`;
    el.innerHTML = `
      <div class="el-num">${e.num}</div>
      <div class="el-sym">${e.sym}</div>
      <div class="el-name">${e.name}</div>`;

    const showTip = (cx, cy) => {
      tip.innerHTML = `<strong>${e.name}</strong><br>${e.desc}<br><small style="color:var(--gold);margin-top:.35rem;display:block">SDG ${e.sdg}</small>`;
      tip.classList.add('show');
      const maxX = window.innerWidth  - 260;
      const maxY = window.innerHeight - 120;
      tip.style.left = Math.min(Math.max(cx + 14, 8), maxX) + 'px';
      tip.style.top  = Math.min(cy - 10, maxY) + 'px';
    };

    el.addEventListener('mousemove', ev => showTip(ev.clientX, ev.clientY));
    el.addEventListener('mouseleave', () => tip.classList.remove('show'));

    // Touch: tap to show, tap elsewhere to hide
    el.addEventListener('touchstart', ev => {
      ev.preventDefault();
      const t = ev.touches[0];
      showTip(t.clientX, t.clientY);
      setTimeout(() => tip.classList.remove('show'), 2800);
    }, { passive: false });

    grid.appendChild(el);
  });
})();

/* ── SMOOTH PARALLAX HERO PATTERN ────────────────────────── */
(function initParallax() {
  const pattern = document.querySelector('.hero-pattern');
  if (!pattern) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        pattern.style.transform = `translateY(${y * .25}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ── ACTIVE NAV LINK HIGHLIGHT ───────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
})();

/* ── SUBTLE TILT ON HOVER (cards) ────────────────────────── */
(function initTilt() {
  // Only on non-touch
  if (window.matchMedia('(hover: none)').matches) return;

  const targets = document.querySelectorAll('.mv-card, .svc-card, .leader-card, .why-card');

  targets.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-4px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── PAGE LOAD FADE-IN ───────────────────────────────────── */
(function initPageLoad() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .5s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
})();