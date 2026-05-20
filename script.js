/* ============================================================
   PHI RESILIENCE — script.js (Teal-Dominant Edition)
   ============================================================ */

'use strict';

/* ── MAILER ENDPOINT ─────────────────────────────────────── */
const MAILER_ENDPOINT = './send_consultation.php';

/* ── UTILS ───────────────────────────────────────────────── */
const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);

/* ── CUSTOM CURSOR ───────────────────────────────────────── */
(function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = -200, my = -200;
  let rx = -200, ry = -200;
  let dx = -200, dy = -200;
  let isHovered  = false;
  let isClicking = false;
  let rafId      = null;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mousedown', () => {
    isClicking = true;
    ring.classList.add('clicking');
    ring.classList.remove('hovered');
  });
  document.addEventListener('mouseup', () => {
    isClicking = false;
    ring.classList.remove('clicking');
    if (isHovered) ring.classList.add('hovered');
  });

  const registerHoverables = () => {
    document.querySelectorAll(
      'a, button, .el, .value-card, .svc-card, .why-card, .mv-card, .ctile, .stat-cell, .about-chip, .c-chip, .exp-tag'
    ).forEach(el => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = '1';
      el.addEventListener('mouseenter', () => { isHovered = true; if (!isClicking) ring.classList.add('hovered'); });
      el.addEventListener('mouseleave', () => { isHovered = false; ring.classList.remove('hovered'); });
    });
  };
  registerHoverables();

  const observer = new MutationObserver(() => registerHoverables());
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

  function tick() {
    rx = lerp(rx, mx, 0.10); ry = lerp(ry, my, 0.10);
    dx = lerp(dx, mx, 0.55); dy = lerp(dy, my, 0.55);
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    dot.style.left  = dx + 'px'; dot.style.top  = dy + 'px';
    rafId = requestAnimationFrame(tick);
  }
  tick();

  document.addEventListener('mousemove', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--rx', ((e.clientX - r.left) / r.width * 100) + '%');
    btn.style.setProperty('--ry', ((e.clientY - r.top)  / r.height * 100) + '%');
  });
})();

/* ── NAV SCROLL ──────────────────────────────────────────── */
(function initNav() {
  const nav  = document.getElementById('nav');
  const hbg  = document.getElementById('hbg');
  const navM = document.getElementById('navM');
  if (!nav) return;

  let lastScroll = 0, ticking = false;

  function updateNav() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    if (Math.abs(y - lastScroll) > 8) {
      nav.style.transform = (y > lastScroll && y > 200) ? 'translateY(-105%)' : '';
      lastScroll = y;
    }
    ticking = false;
  }

  nav.style.transition = 'transform .4s cubic-bezier(.4,0,.2,1), background .5s, backdrop-filter .5s, border-color .5s, padding .4s';
  updateNav();
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateNav); ticking = true; } }, { passive: true });

  if (hbg && navM) {
    hbg.addEventListener('click', () => {
      const isOpen = navM.classList.toggle('open');
      const spans  = hbg.querySelectorAll('span');
      spans[0].style.transform = isOpen ? 'translateY(6.5px) rotate(45deg)'   : '';
      spans[1].style.opacity   = isOpen ? '0'                                  : '';
      spans[2].style.transform = isOpen ? 'translateY(-6.5px) rotate(-45deg)' : '';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navM.addEventListener('click', e => { if (e.target === navM) closeM(); });
  }

  window.closeM = () => {
    if (!navM) return;
    navM.classList.remove('open');
    hbg?.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    document.body.style.overflow = '';
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navM?.classList.contains('open')) window.closeM();
  });
})();

/* ── SMOOTH ANCHOR SCROLL ────────────────────────────────── */
(function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.closeM?.();
      const navH = document.getElementById('nav')?.offsetHeight ?? 70;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── SCROLL REVEAL ───────────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: .1, rootMargin: '0px 0px -48px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ── COUNTER ANIMATION ───────────────────────────────────── */
(function initCounters() {
  const ease = t => 1 - Math.pow(1 - t, 4);
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = +el.dataset.target, suffix = el.dataset.suffix || '', dur = 1600;
      let start = null;
      const tick = ts => {
        if (!start) start = ts;
        const t = clamp((ts - start) / dur, 0, 1), val = Math.round(ease(t) * target);
        el.textContent = val.toLocaleString() + suffix;
        if (t < 1) requestAnimationFrame(tick); else el.textContent = target.toLocaleString() + suffix;
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: .5 });
  document.querySelectorAll('.stat-num').forEach(el => obs.observe(el));
})();

/* ── PERIODIC TABLE ──────────────────────────────────────── */
(function buildPeriodic() {
  const elements = [
    { num:'E1', sym:'Sl', name:'Solar Energy',       grp:'E', sdg:'7,13',   desc:'Modular solar kits for schools, clinics, and community hubs.' },
    { num:'E2', sym:'Wt', name:'Water Solutions',    grp:'E', sdg:'6,3',    desc:'Rainwater harvesting systems and potable water filtration.' },
    { num:'E3', sym:'Wm', name:'Waste Mgmt',         grp:'E', sdg:'11,12',  desc:'Zero-waste campaigns, segregation training, eco-advocacy.' },
    { num:'E4', sym:'Gr', name:'Urban Greening',     grp:'E', sdg:'11,13',  desc:'Garden-to-table initiatives, reforestation, and urban farming.' },
    { num:'E5', sym:'Ee', name:'Energy Efficiency',  grp:'E', sdg:'7,13',   desc:'Carbon footprint audits and green building retrofits.' },
    { num:'E6', sym:'Cb', name:'Carbon Action',      grp:'E', sdg:'13',     desc:'Carbon offset programs and climate resilience advocacy.' },
    { num:'C1', sym:'Lv', name:'Livelihoods',        grp:'C', sdg:'1,8',    desc:'Microenterprise training, cooperative development, and market linkage.' },
    { num:'C2', sym:'Ed', name:'Education',           grp:'C', sdg:'4',      desc:'Scholarship programs, safe learning spaces, and school-building.' },
    { num:'C3', sym:'Hl', name:'Health & Wellness',  grp:'C', sdg:'3',      desc:'Medical missions, health literacy, and mental wellness programs.' },
    { num:'C4', sym:'Yd', name:'Youth Dev',           grp:'C', sdg:'4,10',   desc:'Youth leadership camps, skills training, and values formation.' },
    { num:'C5', sym:'Pw', name:'PWD Inclusion',       grp:'C', sdg:'10',     desc:'Inclusive programs ensuring dignity and access for PWDs.' },
    { num:'C6', sym:'Gd', name:'Gender & Dev',        grp:'C', sdg:'5,10',   desc:'Women empowerment, gender-responsive budgeting, and safe spaces.' },
    { num:'R1', sym:'Dm', name:'DRRM Training',       grp:'R', sdg:'11,13',  desc:'Simulation exercises, hazard mapping, and preparedness workshops.' },
    { num:'R2', sym:'Bc', name:'Business Continuity', grp:'R', sdg:'8,11',   desc:'BCPs for corporations and community livelihood continuity plans.' },
    { num:'R3', sym:'Sh', name:'Shelter',              grp:'R', sdg:'11',    desc:'Disaster-resilient community shelters and evacuation centers.' },
    { num:'R4', sym:'Ef', name:'Early Action',         grp:'R', sdg:'13',    desc:'Pre-arranged financing and early warning response protocols.' },
    { num:'R5', sym:'Mr', name:'Micro-Risk',           grp:'R', sdg:'1,8',   desc:'Risk-readiness packages for micro and small enterprises.' },
    { num:'R6', sym:'Rm', name:'Risk Mapping',         grp:'R', sdg:'11,13', desc:'Community risk mapping systems using GIS and local data.' },
    { num:'T1', sym:'Db', name:'CSR Dashboard',       grp:'T', sdg:'17',    desc:'Real-time digital CSR impact dashboards and analytics.' },
    { num:'T2', sym:'Ai', name:'AI Analytics',         grp:'T', sdg:'9,17',  desc:'AI-enabled impact measurement and program optimization.' },
    { num:'T3', sym:'Gis',name:'GIS Mapping',          grp:'T', sdg:'11',    desc:'Geospatial risk and impact visualization tools.' },
    { num:'T4', sym:'Di', name:'Digital Inc.',         grp:'T', sdg:'9,10',  desc:'Digital literacy, e-commerce training, and tech access programs.' },
    { num:'G1', sym:'Esg',name:'ESG Strategy',         grp:'G', sdg:'16,17', desc:'ESG framework design, reporting, and stakeholder communication.' },
    { num:'G2', sym:'Sd', name:'SDG Alignment',        grp:'G', sdg:'17',    desc:'SDG benchmarking, mapping, and disclosure support.' },
    { num:'G3', sym:'Hr', name:'Human Rights',         grp:'G', sdg:'16',    desc:'HRDD integration in supply chains and governance structures.' },
    { num:'G4', sym:'Et', name:'Ethics & Anti-Corr',   grp:'G', sdg:'16',    desc:'Anti-corruption programs, whistleblower policies, and ethical audits.' },
    { num:'G5', sym:'Im', name:'Impact Meas.',         grp:'G', sdg:'17',    desc:'Theory of change, KPI frameworks, and outcomes evaluation.' },
    { num:'S1', sym:'Ev', name:'Employee Vol.',        grp:'S', sdg:'17',    desc:'Structured volunteer programs with skills-based matching.' },
    { num:'S2', sym:'Cr', name:'CSR Readiness',        grp:'S', sdg:'17',    desc:'Diagnostics, readiness scoring, and CSR maturity assessment.' },
    { num:'S3', sym:'Kx', name:'Knowledge Exchange',   grp:'S', sdg:'4,17',  desc:'Multi-sector learning labs, dialogues, and community impact fairs.' },
    { num:'S4', sym:'Pp', name:'Public-Priv Partner',  grp:'S', sdg:'17',    desc:'Co-financing, joint advocacy, and shared-value creation models.' },
    { num:'S5', sym:'Sc', name:'Scaling',              grp:'S', sdg:'17',    desc:'Replication guides, implementation frameworks, and regional rollout.' },
  ];

  const grid = document.getElementById('ptGrid');
  const tip  = document.getElementById('ptTip');
  if (!grid) return;

  let tipTx = -500, tipTy = -500, tipRx = -500, tipRy = -500, tipRaf = null, tipVisible = false;

  function animateTip() {
    tipRx = lerp(tipRx, tipTx, 0.2); tipRy = lerp(tipRy, tipTy, 0.2);
    tip.style.left = tipRx + 'px'; tip.style.top = tipRy + 'px';
    if (tipVisible) tipRaf = requestAnimationFrame(animateTip);
  }

  function showTip(content, cx, cy) {
    tip.innerHTML = content; tip.classList.add('show'); tipVisible = true;
    tipTx = clamp(cx + 16, 8, window.innerWidth  - 260);
    tipTy = clamp(cy - 10, 8, window.innerHeight - 130);
    cancelAnimationFrame(tipRaf); tipRaf = requestAnimationFrame(animateTip);
  }
  function hideTip() { tip.classList.remove('show'); tipVisible = false; cancelAnimationFrame(tipRaf); }

  elements.forEach((e, i) => {
    const el = document.createElement('div');
    el.className = `el grp-${e.grp}`;
    el.style.animationDelay = `${i * 0.018}s`;
    el.innerHTML = `<div class="el-num">${e.num}</div><div class="el-sym">${e.sym}</div><div class="el-name">${e.name}</div>`;
    const content = `<strong>${e.name}</strong><br>${e.desc}<br><small style="color:var(--teal-bright);margin-top:.35rem;display:block">SDG ${e.sdg}</small>`;
    el.addEventListener('mousemove', ev => showTip(content, ev.clientX, ev.clientY));
    el.addEventListener('mouseleave', hideTip);
    el.addEventListener('touchstart', ev => {
      ev.preventDefault();
      const t = ev.touches[0];
      showTip(content, t.clientX, t.clientY);
      setTimeout(hideTip, 3000);
    }, { passive: false });
    grid.appendChild(el);
  });
})();

/* ── PARALLAX HERO PATTERN ───────────────────────────────── */
(function initParallax() {
  const pattern = document.querySelector('.hero-pattern');
  const glow    = document.querySelector('.hero-glow');
  if (!pattern) return;
  let ticking = false, lastY = 0;
  window.addEventListener('scroll', () => {
    lastY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        pattern.style.transform = `translateY(${lastY * .22}px)`;
        if (glow) glow.style.transform = `translate(-50%,-50%) translateY(${lastY * .08}px)`;
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
  if (!sections.length || !links.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  sections.forEach(s => obs.observe(s));
})();

/* ── 3D TILT ON HOVER ────────────────────────────────────── */
(function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const INTENSITY = 3.5, LIFT = 5;
  document.querySelectorAll('.mv-card, .svc-card, .leader-card, .why-card').forEach(card => {
    let rafId = null, targetRX = 0, targetRY = 0, currentRX = 0, currentRY = 0;
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      targetRX = -((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * INTENSITY;
      targetRY =  ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * INTENSITY;
    });
    function animateTilt() {
      currentRX = lerp(currentRX, targetRX, 0.12); currentRY = lerp(currentRY, targetRY, 0.12);
      card.style.transform = `translateY(-${LIFT}px) rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;
      if (Math.abs(currentRX - targetRX) + Math.abs(currentRY - targetRY) > 0.01)
        rafId = requestAnimationFrame(animateTilt);
    }
    card.addEventListener('mouseenter', () => {
      card.style.transformStyle = 'preserve-3d'; card.style.transition = 'none'; card.style.willChange = 'transform';
      cancelAnimationFrame(rafId); rafId = requestAnimationFrame(animateTilt);
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(rafId); targetRX = 0; targetRY = 0;
      card.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)'; card.style.transform = '';
    });
  });
})();

/* ── PAGE LOAD FADE-IN ───────────────────────────────────── */
(function initPageLoad() {
  document.body.style.opacity   = '0';
  document.body.style.transform = 'translateY(6px)';
  document.body.style.transition = 'opacity .55s ease, transform .55s cubic-bezier(.22,.68,0,1.2)';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.style.opacity = '1'; document.body.style.transform = '';
  }));
})();

/* ── MAGNETIC BUTTONS ────────────────────────────────────── */
(function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const STRENGTH = 0.28;
  document.querySelectorAll('.btn-gold, .btn-ghost, .nav-links a.nav-cta').forEach(btn => {
    let rafId = null, tx = 0, ty = 0, cx = 0, cy = 0;
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width  / 2)) * STRENGTH;
      ty = (e.clientY - (r.top  + r.height / 2)) * STRENGTH;
    });
    function animateMagnetic() {
      cx = lerp(cx, tx, 0.15); cy = lerp(cy, ty, 0.15);
      btn.style.transform = `translate(${cx}px, ${cy}px)`;
      if (Math.abs(cx - tx) + Math.abs(cy - ty) > 0.05) rafId = requestAnimationFrame(animateMagnetic);
    }
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'box-shadow .35s, background-position .5s, opacity .25s, border-color .25s, color .25s';
      cancelAnimationFrame(rafId); rafId = requestAnimationFrame(animateMagnetic);
    });
    btn.addEventListener('mouseleave', () => {
      cancelAnimationFrame(rafId); tx = 0; ty = 0;
      btn.style.transition = 'transform .65s cubic-bezier(.34,1.56,.64,1), box-shadow .35s, background-position .5s, opacity .25s, border-color .25s, color .25s';
      btn.style.transform = ''; requestAnimationFrame(() => { cx = 0; cy = 0; });
    });
  });
})();

/* ── SCROLL PROGRESS INDICATOR ───────────────────────────── */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `position:fixed;top:0;left:0;height:2px;width:0%;background:linear-gradient(90deg,var(--teal),var(--teal-bright));z-index:9998;pointer-events:none;transform-origin:left;transition:width .1s linear;`;
  document.body.appendChild(bar);
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        bar.style.width = clamp((window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100, 0, 100) + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ── STAGGERED CHILD REVEALS ─────────────────────────────── */
(function initStaggeredReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      [...entry.target.children].forEach((child, i) => {
        if (child.classList.contains('reveal') && !child.classList.contains('visible'))
          child.style.transitionDelay = `${i * 0.07}s`;
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: .05 });
  document.querySelectorAll('.values-grid, .services-grid, .why-grid, .focus-grid, .sol-grid, .bv-grid, .leaders-grid').forEach(g => obs.observe(g));
})();

/* ============================================================
   CONSULTATION MODAL — Enhanced Validation
   ============================================================ */
(function initConsultationModal() {

  /* ── VALIDATION RULES ──────────────────────────────────── */
  const RULES = {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 80,
      pattern: /^[a-zA-ZÀ-ÿ\s'\-\.]+$/,
      messages: {
        required:  'Please enter your full name.',
        minLength: 'Name must be at least 2 characters.',
        maxLength: 'Name must be under 80 characters.',
        pattern:   'Name should only contain letters, spaces, and hyphens.',
      }
    },
    company: {
      required: true,
      minLength: 2,
      maxLength: 100,
      messages: {
        required:  'Please enter your organization or company name.',
        minLength: 'Organization name must be at least 2 characters.',
        maxLength: 'Organization name must be under 100 characters.',
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      messages: {
        required: 'Please enter your email address.',
        pattern:  'Please enter a valid email address (e.g. you@company.com).',
      }
    },
    phone: {
      required: false,
      pattern: /^[\+]?[\d\s\-\(\)]{7,20}$/,
      messages: {
        pattern: 'Please enter a valid phone number (7–20 digits).',
      }
    },
    interest: {
      required: true,
      messages: {
        required: 'Please select an area of interest.',
      }
    },
    message: {
      required: false,
      minLength: 10,
      maxLength: 1000,
      messages: {
        minLength: 'Message must be at least 10 characters if provided.',
        maxLength: 'Message must be under 1,000 characters.',
      }
    },
    consent: {
      required: true,
      messages: {
        required: 'You must agree to be contacted before submitting.',
      }
    }
  };

  /* ── VALIDATE SINGLE FIELD ─────────────────────────────── */
  function validateField(name, value, el) {
    const rule = RULES[name];
    if (!rule) return null;

    // Checkbox special case
    if (name === 'consent') {
      return el.checked ? null : rule.messages.required;
    }

    const trimmed = typeof value === 'string' ? value.trim() : value;

    if (rule.required && !trimmed) return rule.messages.required;
    if (!trimmed && !rule.required) return null; // optional + empty = ok

    if (rule.minLength && trimmed.length < rule.minLength) return rule.messages.minLength;
    if (rule.maxLength && trimmed.length > rule.maxLength) return rule.messages.maxLength;
    if (rule.pattern   && !rule.pattern.test(trimmed))    return rule.messages.pattern;

    return null;
  }

  /* ── SHOW / CLEAR FIELD ERROR ──────────────────────────── */
  function showFieldError(el, message) {
    el.classList.add('invalid');
    el.classList.remove('valid');

    const group = el.closest('.form-group');
    if (!group) return;

    let errEl = group.querySelector('.field-error');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'field-error';
      group.appendChild(errEl);
    }
    errEl.textContent = message;
    errEl.style.display = 'flex';

    // Shake animation
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  function clearFieldError(el) {
    el.classList.remove('invalid', 'shake');
    el.classList.add('valid');

    const group = el.closest('.form-group');
    const errEl = group?.querySelector('.field-error');
    if (errEl) errEl.style.display = 'none';
  }

  function clearAllErrors(form) {
    form.querySelectorAll('.invalid, .valid, .shake').forEach(el => {
      el.classList.remove('invalid', 'valid', 'shake');
    });
    form.querySelectorAll('.field-error').forEach(el => { el.style.display = 'none'; });
  }

  /* ── UPDATE CHAR COUNTER ───────────────────────────────── */
  function updateCounter(textarea, max) {
    const group   = textarea.closest('.form-group');
    let counter   = group.querySelector('.char-counter');
    if (!counter) {
      counter = document.createElement('div');
      counter.className = 'char-counter';
      group.appendChild(counter);
    }
    const len = textarea.value.length;
    counter.textContent = `${len} / ${max}`;
    counter.classList.toggle('over', len > max);
    counter.classList.toggle('near', len > max * 0.85 && len <= max);
  }

  /* ── MODAL HTML ────────────────────────────────────────── */
  const modalHTML = `
  <div id="consultationModal">
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <button class="modal-close" aria-label="Close modal">&#x2715;</button>
      <div class="modal-header">
        <h2>Schedule a Consultation</h2>
        <p>Tell us about your organization and we'll be in touch within 1–2 business days.</p>
      </div>

      <form class="consultation-form" id="consultationForm" novalidate autocomplete="on">

        <div class="form-row">
          <div class="form-group">
            <label for="fullName">Full Name <span class="req" aria-label="required">*</span></label>
            <input type="text" id="fullName" name="fullName"
              placeholder="Your full name"
              autocomplete="name"
              maxlength="80"
              aria-required="true"
              aria-describedby="fullName-error" />
          </div>
          <div class="form-group">
            <label for="company">Organization / Company <span class="req" aria-label="required">*</span></label>
            <input type="text" id="company" name="company"
              placeholder="Your organization"
              autocomplete="organization"
              maxlength="100"
              aria-required="true"
              aria-describedby="company-error" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="email">Email Address <span class="req" aria-label="required">*</span></label>
            <input type="email" id="email" name="email"
              placeholder="you@company.com"
              autocomplete="email"
              aria-required="true"
              aria-describedby="email-error" />
          </div>
          <div class="form-group">
            <label for="phone">
              Phone Number
              <span class="optional-tag">Optional</span>
            </label>
            <input type="tel" id="phone" name="phone"
              placeholder="+63 9XX XXX XXXX"
              autocomplete="tel"
              aria-describedby="phone-error" />
          </div>
        </div>

        <div class="form-group">
          <label for="interest">Area of Interest <span class="req" aria-label="required">*</span></label>
          <select id="interest" name="interest" aria-required="true" aria-describedby="interest-error">
            <option value="" disabled selected>Select a service area…</option>
            <option value="CSR Strategy & Program Design">CSR Strategy &amp; Program Design</option>
            <option value="Resilience & Risk Management">Resilience &amp; Risk Management</option>
            <option value="Sustainability Advisory">Sustainability Advisory</option>
            <option value="Organizational Strategy & Capacity Building">Organizational Strategy &amp; Capacity Building</option>
            <option value="Community Engagement & Social Investment">Community Engagement &amp; Social Investment</option>
            <option value="Innovative Technologies">Innovative Technologies</option>
            <option value="ESG Diagnostics & Compliance">ESG Diagnostics &amp; Compliance</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>
        </div>

        <div class="form-group">
          <label for="message">
            Message / Context
            <span class="optional-tag">Optional</span>
          </label>
          <textarea id="message" name="message" rows="4"
            placeholder="Tell us about your goals, current challenges, or what you're hoping to achieve…"
            maxlength="1000"
            aria-describedby="message-error"></textarea>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label" for="consent">
            <span class="checkbox-wrap">
              <input type="checkbox" id="consent" name="consent" aria-required="true" aria-describedby="consent-error" />
              <span class="checkbox-custom"></span>
            </span>
            <span class="checkbox-text">
              I agree to be contacted by PHI Resilience regarding my inquiry.
              <span class="req" aria-label="required">*</span>
            </span>
          </label>
        </div>

        <div class="form-summary-error" id="formSummaryError" role="alert" aria-live="polite" style="display:none"></div>

        <button type="submit" class="btn btn-gold submit-btn" id="submitBtn">
          <span class="btn-label">Send Consultation Request</span>
          <span class="btn-spinner" style="display:none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/>
              </path>
            </svg>
            Sending…
          </span>
        </button>

        <p class="form-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Your information is kept private and never shared.
        </p>
      </form>

      <div class="modal-success" style="display:none">
        <div class="success-icon">✦</div>
        <h3>Message Received</h3>
        <p>Thank you for reaching out to PHI Resilience. Our team will review your inquiry and respond within 1–2 business days.</p>
        <button class="btn btn-ghost" id="closeSuccessBtn" style="margin-top:.5rem">Close</button>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  /* ── STYLES ────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #consultationModal {
      display: none; position: fixed; inset: 0; z-index: 8000;
      align-items: center; justify-content: center;
      opacity: 0; transition: opacity .4s cubic-bezier(.4,0,.2,1);
    }
    #consultationModal.open { display: flex; opacity: 1; }

    .modal-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,.72);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      cursor: pointer;
    }

    .modal-content {
      position: relative; z-index: 1;
      background: var(--navy-light);
      border: 1px solid var(--teal-line);
      border-radius: 8px;
      max-width: 600px; width: 92vw;
      max-height: 90svh; overflow-y: auto;
      padding: 3rem 2.5rem;
      box-shadow: 0 24px 80px rgba(0,0,0,.75);
      animation: slideIn .45s cubic-bezier(.34,1.56,.64,1);
      scroll-behavior: smooth; overscroll-behavior: contain;
    }
    .modal-content::-webkit-scrollbar { width: 3px; }
    .modal-content::-webkit-scrollbar-thumb { background: var(--teal); border-radius: 2px; }

    @keyframes slideIn {
      from { transform: translateY(-28px) scale(.96); opacity: 0; }
      to   { transform: none; opacity: 1; }
    }

    .modal-close {
      position: absolute; top: 1.4rem; right: 1.4rem;
      background: none; border: 1px solid var(--border); border-radius: 50%;
      width: 36px; height: 36px; font-size: 1rem; color: var(--muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center; line-height: 1;
      transition: color .25s, border-color .25s, transform .4s cubic-bezier(.34,1.56,.64,1), background .25s;
    }
    .modal-close:hover { color: var(--teal-bright); border-color: var(--teal-line); transform: rotate(90deg); background: rgba(49,167,182,.07); }

    .modal-header { margin-bottom: 2rem; }
    .modal-header h2 { font-family: var(--font-serif); font-size: 1.85rem; font-weight: 800; color: var(--white); margin-bottom: .4rem; }
    .modal-header p  { font-size: .88rem; color: var(--muted); line-height: 1.6; }

    /* ── Form layout ── */
    .consultation-form { display: flex; flex-direction: column; gap: 1.35rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .form-group { display: flex; flex-direction: column; gap: .45rem; position: relative; }

    .form-group label {
      font-size: .72rem; font-weight: 600; letter-spacing: .1em;
      text-transform: uppercase; color: var(--teal-bright);
      transition: color .2s;
      display: flex; align-items: center; gap: .4rem; flex-wrap: wrap;
    }
    .form-group:focus-within label { filter: brightness(1.2); }

    .req { color: #e07070; font-size: .75rem; }

    .optional-tag {
      font-size: .62rem; font-weight: 400; letter-spacing: .08em;
      color: var(--muted); text-transform: uppercase;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
      border-radius: 100px; padding: .1rem .5rem;
      margin-left: auto;
    }

    /* ── Inputs ── */
    .form-group input,
    .form-group select,
    .form-group textarea {
      background: rgba(7,16,31,.7);
      border: 1px solid var(--teal-line);
      border-radius: 4px;
      padding: .8rem 1rem;
      font-family: var(--font-sans); font-size: .88rem; color: var(--white);
      transition: border-color .25s, box-shadow .25s, background .25s;
      width: 100%;
    }
    .form-group input::placeholder,
    .form-group textarea::placeholder { color: var(--muted); }

    .form-group input:hover,
    .form-group select:hover,
    .form-group textarea:hover { border-color: var(--teal-bright); }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--teal-bright);
      box-shadow: 0 0 0 3px rgba(49,167,182,.2);
      background: rgba(16,30,51,.9);
    }

    /* ── Valid state ── */
    .form-group input.valid,
    .form-group select.valid,
    .form-group textarea.valid {
      border-color: rgba(91,205,130,.55);
      box-shadow: 0 0 0 2px rgba(91,205,130,.1);
    }

    /* ── Invalid state ── */
    .form-group input.invalid,
    .form-group select.invalid,
    .form-group textarea.invalid {
      border-color: #e07070;
      box-shadow: 0 0 0 3px rgba(224,112,112,.15);
    }

    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
    .shake { animation: shake .4s cubic-bezier(.36,.07,.19,.97) both; }

    /* ── Inline field error ── */
    .field-error {
      display: flex;
      align-items: flex-start;
      gap: .4rem;
      font-size: .75rem;
      color: #f0a0a0;
      line-height: 1.45;
      margin-top: .2rem;
      animation: errFadeIn .25s ease;
    }
    .field-error::before {
      content: '⚠';
      font-size: .7rem;
      flex-shrink: 0;
      margin-top: .05rem;
    }
    @keyframes errFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: none; }
    }

    /* ── Char counter ── */
    .char-counter {
      font-size: .68rem; color: var(--muted);
      text-align: right; margin-top: .2rem;
      transition: color .25s;
    }
    .char-counter.near { color: var(--gold); }
    .char-counter.over { color: #e07070; font-weight: 600; }

    /* ── Select ── */
    .form-group select {
      cursor: pointer; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath fill='%2331a7b6' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 1rem center; background-size: 12px;
      padding-right: 2.5rem; background-color: rgba(7,16,31,.7);
    }
    .form-group select option { background: #0d1a2e; color: var(--white); }

    /* ── Textarea ── */
    .form-group textarea { resize: vertical; min-height: 100px; }

    /* ── Checkbox ── */
    .checkbox-group { flex-direction: row !important; gap: 0 !important; }
    .checkbox-label {
      display: flex; align-items: flex-start; gap: .75rem;
      cursor: pointer; width: 100%;
      text-transform: none !important; letter-spacing: 0 !important;
      font-size: .85rem !important; font-weight: 400 !important;
      color: var(--off-white) !important;
    }
    .checkbox-wrap { position: relative; flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; }
    .checkbox-wrap input[type="checkbox"] {
      position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; z-index: 1;
      border: none !important; box-shadow: none !important; padding: 0 !important; background: none !important;
    }
    .checkbox-custom {
      position: absolute; inset: 0;
      border: 1.5px solid var(--teal-line);
      border-radius: 4px;
      background: rgba(7,16,31,.7);
      transition: border-color .25s, background .25s, box-shadow .25s;
      display: flex; align-items: center; justify-content: center;
    }
    .checkbox-custom::after {
      content: '✓'; font-size: .75rem; color: var(--navy); font-weight: 700;
      opacity: 0; transform: scale(.5); transition: opacity .2s, transform .25s cubic-bezier(.34,1.56,.64,1);
    }
    .checkbox-wrap input:checked ~ .checkbox-custom {
      background: var(--teal-bright); border-color: var(--teal-bright);
      box-shadow: 0 0 0 3px rgba(49,167,182,.2);
    }
    .checkbox-wrap input:checked ~ .checkbox-custom::after { opacity: 1; transform: scale(1); }
    .checkbox-wrap input:focus ~ .checkbox-custom { box-shadow: 0 0 0 3px rgba(49,167,182,.3); }

    /* Invalid checkbox */
    .checkbox-group.has-error .checkbox-custom { border-color: #e07070; box-shadow: 0 0 0 3px rgba(224,112,112,.15); }
    .checkbox-text { line-height: 1.5; }

    /* ── Summary error ── */
    .form-summary-error {
      background: rgba(224,112,112,.1);
      border: 1px solid rgba(224,112,112,.35);
      border-left: 3px solid #e07070;
      border-radius: 4px; padding: .85rem 1.1rem;
      font-size: .83rem; color: #f0a0a0; line-height: 1.6;
      animation: errFadeIn .3s ease;
    }

    /* ── Submit ── */
    .submit-btn { width: 100%; justify-content: center; margin-top: .25rem; gap: .65rem; min-height: 50px; }
    .submit-btn:disabled { opacity: .65; cursor: not-allowed; transform: none !important; }

    /* ── Note ── */
    .form-note { font-size: .72rem; color: var(--muted); text-align: center; line-height: 1.5; }

    /* ── Success ── */
    .modal-success {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; gap: 1.25rem; padding: 2.5rem 0 1rem;
    }
    .success-icon { font-size: 3rem; color: var(--teal-bright); animation: popIn .55s cubic-bezier(.34,1.56,.64,1); }
    @keyframes popIn {
      from { transform: scale(0) rotate(-20deg); opacity: 0; }
      to   { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    .modal-success h3 { font-family: var(--font-serif); font-size: 1.6rem; font-weight: 800; color: var(--white); }
    .modal-success p  { font-size: .9rem; color: var(--muted); line-height: 1.7; max-width: 380px; }

    /* ── Responsive ── */
    @media (max-width: 560px) {
      .modal-content { padding: 2rem 1.25rem; }
      .form-row { grid-template-columns: 1fr; }
      .modal-header h2 { font-size: 1.5rem; }
      .optional-tag { display: none; }
    }
  `;
  document.head.appendChild(style);

  /* ── WIRE UP DOM ───────────────────────────────────────── */
  const modal           = document.getElementById('consultationModal');
  const overlay         = modal.querySelector('.modal-overlay');
  const closeBtn        = modal.querySelector('.modal-close');
  const form            = document.getElementById('consultationForm');
  const successBox      = modal.querySelector('.modal-success');
  const submitBtn       = document.getElementById('submitBtn');
  const btnLabel        = submitBtn.querySelector('.btn-label');
  const btnSpinner      = submitBtn.querySelector('.btn-spinner');
  const summaryError    = document.getElementById('formSummaryError');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const messageEl       = form.querySelector('[name="message"]');
  const consentEl       = form.querySelector('[name="consent"]');
  const consentGroup    = consentEl?.closest('.checkbox-group');

  /* ── OPEN / CLOSE ──────────────────────────────────────── */
  window.openConsultationModal = () => {
    modal.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => { modal.style.opacity = '1'; }));
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.querySelector('input')?.focus(), 120);
  };

  function closeModal() {
    modal.style.opacity = '0';
    const mc = modal.querySelector('.modal-content');
    mc.style.transform = 'translateY(12px) scale(.97)';
    mc.style.transition = 'transform .35s ease, opacity .35s ease';
    setTimeout(() => {
      modal.style.display = 'none';
      mc.style.transform = ''; mc.style.transition = '';
      document.body.style.overflow = '';
      form.reset();
      form.style.display = '';
      successBox.style.display = 'none';
      summaryError.style.display = 'none';
      clearAllErrors(form);
      if (consentGroup) consentGroup.classList.remove('has-error');
      updateCounter(messageEl, 1000);
      setLoading(false);
    }, 360);
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  closeSuccessBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

  /* ── LOADING STATE ─────────────────────────────────────── */
  function setLoading(on) {
    submitBtn.disabled      = on;
    btnLabel.style.display  = on ? 'none'         : '';
    btnSpinner.style.display = on ? 'inline-flex'  : 'none';
  }

  /* ── REAL-TIME VALIDATION (blur + input) ───────────────── */
  form.querySelectorAll('input:not([type="checkbox"]), select, textarea').forEach(el => {
    const name = el.name;

    // Validate on blur (first touch)
    el.addEventListener('blur', () => {
      if (!el.dataset.touched) el.dataset.touched = '1';
      const err = validateField(name, el.value, el);
      err ? showFieldError(el, err) : clearFieldError(el);
    });

    // Validate on input after first blur
    el.addEventListener('input', () => {
      if (!el.dataset.touched) return;
      const err = validateField(name, el.value, el);
      err ? showFieldError(el, err) : clearFieldError(el);
    });
  });

  // Char counter for message
  if (messageEl) {
    updateCounter(messageEl, 1000);
    messageEl.addEventListener('input', () => updateCounter(messageEl, 1000));
  }

  // Consent checkbox — validate on change
  if (consentEl) {
    consentEl.addEventListener('change', () => {
      const err = validateField('consent', null, consentEl);
      if (err) {
        consentGroup?.classList.add('has-error');
        let errEl = consentGroup?.querySelector('.field-error');
        if (!errEl && consentGroup) {
          errEl = document.createElement('div');
          errEl.className = 'field-error';
          consentGroup.appendChild(errEl);
        }
        if (errEl) { errEl.textContent = err; errEl.style.display = 'flex'; }
      } else {
        consentGroup?.classList.remove('has-error');
        const errEl = consentGroup?.querySelector('.field-error');
        if (errEl) errEl.style.display = 'none';
      }
    });
  }

  /* ── FULL FORM VALIDATE ON SUBMIT ──────────────────────── */
  function validateAll() {
    let firstInvalid = null;
    let errorCount   = 0;

    // Mark all fields as touched and validate
    form.querySelectorAll('input:not([type="checkbox"]), select, textarea').forEach(el => {
      el.dataset.touched = '1';
      const err = validateField(el.name, el.value, el);
      if (err) {
        showFieldError(el, err);
        errorCount++;
        if (!firstInvalid) firstInvalid = el;
      } else {
        clearFieldError(el);
      }
    });

    // Consent
    const consentErr = validateField('consent', null, consentEl);
    if (consentErr) {
      consentGroup?.classList.add('has-error');
      let errEl = consentGroup?.querySelector('.field-error');
      if (!errEl && consentGroup) {
        errEl = document.createElement('div'); errEl.className = 'field-error'; consentGroup.appendChild(errEl);
      }
      if (errEl) { errEl.textContent = consentErr; errEl.style.display = 'flex'; }
      errorCount++;
      if (!firstInvalid) firstInvalid = consentEl;
    } else {
      consentGroup?.classList.remove('has-error');
      const errEl = consentGroup?.querySelector('.field-error');
      if (errEl) errEl.style.display = 'none';
    }

    return { valid: errorCount === 0, firstInvalid, errorCount };
  }

  /* ── SUBMIT ────────────────────────────────────────────── */
  async function sendEmail(data) {
    const res  = await fetch(MAILER_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.error || 'Server error. Please try again.');
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    summaryError.style.display = 'none';

    const { valid, firstInvalid, errorCount } = validateAll();

    if (!valid) {
      const plural = errorCount === 1 ? 'issue' : 'issues';
      summaryError.innerHTML = `Please fix the <strong>${errorCount} ${plural}</strong> highlighted below before submitting.`;
      summaryError.style.display = 'block';

      // Scroll to first invalid field
      if (firstInvalid) {
        setTimeout(() => {
          firstInvalid.closest('.form-group, .checkbox-group')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      }
      return;
    }

    const data = {
      fullName: form.fullName.value.trim(),
      company:  form.company.value.trim(),
      email:    form.email.value.trim(),
      phone:    form.phone.value.trim(),
      interest: form.interest.value,
      message:  form.message.value.trim(),
    };

    setLoading(true);

    try {
      await sendEmail(data);
      form.style.display       = 'none';
      successBox.style.display = 'flex';
    } catch (err) {
      console.error('[PHI Resilience] Email send error:', err);
      summaryError.innerHTML =
        'Something went wrong sending your message. Please try emailing us directly at ' +
        '<a href="mailto:info@mardietorres.com" style="color:var(--teal-bright)">info@mardietorres.com</a>.';
      summaryError.style.display = 'block';
      setLoading(false);
    }
  });

})();