/* ============================================================
   PHI RESILIENCE — script.js
   ============================================================ */

'use strict';

/* ── MAILER ENDPOINT ─────────────────────────────────────── */
// Path to the PHP mailer script relative to your site root.
// If index.html and send_consultation.php are in the same folder, leave as-is.
const MAILER_ENDPOINT = './send_consultation.php';

/* ── CUSTOM CURSOR ───────────────────────────────────────── */
(function initCursor() {
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function loop() {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
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
  const nav  = document.getElementById('nav');
  const hbg  = document.getElementById('hbg');
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
    { num:'E1', sym:'Sl', name:'Solar Energy',        grp:'E', sdg:'7,13',  desc:'Modular solar kits for schools, clinics, and community hubs.' },
    { num:'E2', sym:'Wt', name:'Water Solutions',     grp:'E', sdg:'6,3',   desc:'Rainwater harvesting systems and potable water filtration.' },
    { num:'E3', sym:'Wm', name:'Waste Mgmt',          grp:'E', sdg:'11,12', desc:'Zero-waste campaigns, segregation training, eco-advocacy.' },
    { num:'E4', sym:'Gr', name:'Urban Greening',      grp:'E', sdg:'11,13', desc:'Garden-to-table initiatives, reforestation, and urban farming.' },
    { num:'E5', sym:'Ee', name:'Energy Efficiency',   grp:'E', sdg:'7,13',  desc:'Carbon footprint audits and green building retrofits.' },
    { num:'E6', sym:'Cb', name:'Carbon Action',       grp:'E', sdg:'13',    desc:'Carbon offset programs and climate resilience advocacy.' },
    { num:'C1', sym:'Lv', name:'Livelihoods',         grp:'C', sdg:'1,8',   desc:'Microenterprise training, cooperative development, and market linkage.' },
    { num:'C2', sym:'Ed', name:'Education',            grp:'C', sdg:'4',     desc:'Scholarship programs, safe learning spaces, and school-building.' },
    { num:'C3', sym:'Hl', name:'Health & Wellness',   grp:'C', sdg:'3',     desc:'Medical missions, health literacy, and mental wellness programs.' },
    { num:'C4', sym:'Yd', name:'Youth Dev',            grp:'C', sdg:'4,10',  desc:'Youth leadership camps, skills training, and values formation.' },
    { num:'C5', sym:'Pw', name:'PWD Inclusion',        grp:'C', sdg:'10',    desc:'Inclusive programs ensuring dignity and access for PWDs.' },
    { num:'C6', sym:'Gd', name:'Gender & Dev',         grp:'C', sdg:'5,10',  desc:'Women empowerment, gender-responsive budgeting, and safe spaces.' },
    { num:'R1', sym:'Dm', name:'DRRM Training',        grp:'R', sdg:'11,13', desc:'Simulation exercises, hazard mapping, and preparedness workshops.' },
    { num:'R2', sym:'Bc', name:'Business Continuity',  grp:'R', sdg:'8,11',  desc:'BCPs for corporations and community livelihood continuity plans.' },
    { num:'R3', sym:'Sh', name:'Shelter',               grp:'R', sdg:'11',   desc:'Disaster-resilient community shelters and evacuation centers.' },
    { num:'R4', sym:'Ef', name:'Early Action',          grp:'R', sdg:'13',   desc:'Pre-arranged financing and early warning response protocols.' },
    { num:'R5', sym:'Mr', name:'Micro-Risk',            grp:'R', sdg:'1,8',  desc:'Risk-readiness packages for micro and small enterprises.' },
    { num:'R6', sym:'Rm', name:'Risk Mapping',          grp:'R', sdg:'11,13',desc:'Community risk mapping systems using GIS and local data.' },
    { num:'T1', sym:'Db', name:'CSR Dashboard',        grp:'T', sdg:'17',   desc:'Real-time digital CSR impact dashboards and analytics.' },
    { num:'T2', sym:'Ai', name:'AI Analytics',          grp:'T', sdg:'9,17', desc:'AI-enabled impact measurement and program optimization.' },
    { num:'T3', sym:'Gis',name:'GIS Mapping',           grp:'T', sdg:'11',  desc:'Geospatial risk and impact visualization tools.' },
    { num:'T4', sym:'Di', name:'Digital Inc.',          grp:'T', sdg:'9,10', desc:'Digital literacy, e-commerce training, and tech access programs.' },
    { num:'G1', sym:'Esg',name:'ESG Strategy',          grp:'G', sdg:'16,17',desc:'ESG framework design, reporting, and stakeholder communication.' },
    { num:'G2', sym:'Sd', name:'SDG Alignment',          grp:'G', sdg:'17',  desc:'SDG benchmarking, mapping, and disclosure support.' },
    { num:'G3', sym:'Hr', name:'Human Rights',           grp:'G', sdg:'16',  desc:'HRDD integration in supply chains and governance structures.' },
    { num:'G4', sym:'Et', name:'Ethics & Anti-Corr',     grp:'G', sdg:'16',  desc:'Anti-corruption programs, whistleblower policies, and ethical audits.' },
    { num:'G5', sym:'Im', name:'Impact Meas.',           grp:'G', sdg:'17',  desc:'Theory of change, KPI frameworks, and outcomes evaluation.' },
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
        pattern.style.transform = `translateY(${window.scrollY * .25}px)`;
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

/* ── SUBTLE TILT ON HOVER ────────────────────────────────── */
(function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.mv-card, .svc-card, .leader-card, .why-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const dx   = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy   = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      card.style.transform = `translateY(-4px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ── PAGE LOAD FADE-IN ───────────────────────────────────── */
(function initPageLoad() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .5s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { document.body.style.opacity = '1'; });
  });
})();

/* ── CONSULTATION MODAL ──────────────────────────────────── */
(function initConsultationModal() {
  // ── Inject modal HTML ──────────────────────────────────
  const modalHTML = `
  <div id="consultationModal">
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <button class="modal-close" aria-label="Close modal">&#x2715;</button>
      <div class="modal-header">
        <h2>Schedule a Consultation</h2>
        <p>Tell us about your organization and we'll be in touch within 1–2 business days.</p>
      </div>

      <form class="consultation-form" id="consultationForm" novalidate>

        <div class="form-row">
          <div class="form-group">
            <label for="fullName">Full Name <span class="req">*</span></label>
            <input type="text" id="fullName" name="fullName" placeholder="Your full name" required />
          </div>
          <div class="form-group">
            <label for="company">Organization / Company <span class="req">*</span></label>
            <input type="text" id="company" name="company" placeholder="Your organization" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="email">Email Address <span class="req">*</span></label>
            <input type="email" id="email" name="email" placeholder="you@company.com" required />
          </div>
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" placeholder="+63 9XX XXX XXXX" />
          </div>
        </div>

        <div class="form-group">
          <label for="interest">Area of Interest <span class="req">*</span></label>
          <select id="interest" name="interest" required>
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
          <label for="message">Message / Context</label>
          <textarea id="message" name="message" rows="4"
            placeholder="Tell us about your goals, current challenges, or what you're hoping to achieve…"></textarea>
        </div>

        <div class="form-group checkbox">
          <input type="checkbox" id="consent" name="consent" required />
          <label for="consent" style="text-transform:none;letter-spacing:0;font-size:.82rem;font-weight:400;color:var(--off-white)">
            I agree to be contacted by PHI Resilience regarding my inquiry.
          </label>
        </div>

        <div class="form-error" id="formError" style="display:none"></div>

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

        <p class="form-note">Your information is kept private and never shared.</p>
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

  // ── Extra styles injected once ─────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #consultationModal {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 8000;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity .35s ease;
    }
    #consultationModal.open {
      display: flex;
      opacity: 1;
    }
    .modal-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,.72);
      backdrop-filter: blur(8px);
      cursor: pointer;
    }
    .modal-content {
      position: relative;
      z-index: 1;
      background: var(--navy-light);
      border: 1px solid var(--gold-line);
      border-radius: 8px;
      max-width: 580px;
      width: 92vw;
      max-height: 90svh;
      overflow-y: auto;
      padding: 3rem 2.5rem;
      box-shadow: 0 24px 80px rgba(0,0,0,.75);
      animation: slideIn .4s cubic-bezier(.22,.68,0,1.2);
    }
    @keyframes slideIn {
      from { transform: translateY(-28px); opacity: 0; }
      to   { transform: none; opacity: 1; }
    }
    .modal-close {
      position: absolute;
      top: 1.4rem; right: 1.4rem;
      background: none;
      border: 1px solid var(--border);
      border-radius: 50%;
      width: 36px; height: 36px;
      font-size: 1rem;
      color: var(--muted);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: color .2s, border-color .2s;
      line-height: 1;
    }
    .modal-close:hover { color: var(--gold); border-color: var(--gold-line); }
    .modal-header { margin-bottom: 2rem; }
    .modal-header h2 {
      font-family: var(--font-serif);
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--white);
      margin-bottom: .4rem;
    }
    .modal-header p { font-size: .88rem; color: var(--muted); line-height: 1.6; }
    .consultation-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: .45rem; }
    .form-group label {
      font-size: .72rem;
      font-weight: 600;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--gold);
    }
    .req { color: #e07070; }
    .form-group input,
    .form-group select,
    .form-group textarea {
      background: rgba(7,16,31,.7);
      border: 1px solid var(--gold-line);
      border-radius: 4px;
      padding: .8rem 1rem;
      font-family: var(--font-sans);
      font-size: .88rem;
      color: var(--white);
      transition: border-color .2s, box-shadow .2s;
      width: 100%;
    }
    .form-group input::placeholder,
    .form-group textarea::placeholder { color: var(--muted); }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--gold-bright);
      box-shadow: 0 0 0 3px rgba(201,151,58,.18);
    }
    .form-group input.invalid,
    .form-group select.invalid,
    .form-group textarea.invalid {
      border-color: #e07070;
      box-shadow: 0 0 0 3px rgba(224,112,112,.15);
    }
    .form-group select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath fill='%23c9973a' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 12px;
      padding-right: 2.5rem;
      background-color: rgba(7,16,31,.7);
    }
    .form-group select option { background: #0d1a2e; color: var(--white); }
    .form-group.checkbox {
      flex-direction: row;
      align-items: center;
      gap: .7rem;
    }
    .form-group.checkbox input[type=checkbox] {
      width: 18px; height: 18px;
      flex-shrink: 0;
      accent-color: var(--gold);
      border-radius: 3px;
    }
    .form-group textarea { resize: vertical; min-height: 100px; }
    .form-error {
      background: rgba(224,112,112,.1);
      border: 1px solid rgba(224,112,112,.35);
      border-radius: 4px;
      padding: .75rem 1rem;
      font-size: .84rem;
      color: #f0a0a0;
      line-height: 1.55;
    }
    .submit-btn {
      width: 100%;
      justify-content: center;
      margin-top: .5rem;
      gap: .65rem;
      min-height: 48px;
    }
    .submit-btn:disabled {
      opacity: .7;
      cursor: not-allowed;
      transform: none !important;
    }
    .form-note {
      font-size: .72rem;
      color: var(--muted);
      text-align: center;
    }
    .modal-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.25rem;
      padding: 2.5rem 0 1rem;
    }
    .success-icon {
      font-size: 3rem;
      color: var(--gold);
      animation: popIn .5s cubic-bezier(.22,.68,0,1.2);
    }
    @keyframes popIn {
      from { transform: scale(0) rotate(-30deg); opacity: 0; }
      to   { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    .modal-success h3 {
      font-family: var(--font-serif);
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--white);
    }
    .modal-success p {
      font-size: .9rem;
      color: var(--muted);
      line-height: 1.7;
      max-width: 380px;
    }
    @media (max-width: 560px) {
      .modal-content { padding: 2rem 1.25rem; }
      .form-row { grid-template-columns: 1fr; }
      .modal-header h2 { font-size: 1.5rem; }
    }
  `;
  document.head.appendChild(style);

  // ── Element refs ───────────────────────────────────────
  const modal      = document.getElementById('consultationModal');
  const overlay    = modal.querySelector('.modal-overlay');
  const closeBtn   = modal.querySelector('.modal-close');
  const form       = document.getElementById('consultationForm');
  const successBox = modal.querySelector('.modal-success');
  const submitBtn  = document.getElementById('submitBtn');
  const btnLabel   = submitBtn.querySelector('.btn-label');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');
  const formError  = document.getElementById('formError');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');

  // ── Open / Close ───────────────────────────────────────
  window.openConsultationModal = () => {
    modal.style.display = 'flex';
    requestAnimationFrame(() => { modal.style.opacity = '1'; });
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      form.reset();
      form.style.display = '';
      successBox.style.display = 'none';
      formError.style.display = 'none';
      form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
      setLoading(false);
    }, 350);
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  closeSuccessBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

  // ── Loading state ──────────────────────────────────────
  function setLoading(loading) {
    submitBtn.disabled = loading;
    btnLabel.style.display  = loading ? 'none' : '';
    btnSpinner.style.display = loading ? 'inline-flex' : 'none';
  }

  // ── Validation ─────────────────────────────────────────
  function validate() {
    let ok = true;
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    ['fullName','company','email','interest'].forEach(name => {
      const el = form.querySelector(`[name="${name}"]`);
      if (!el.value.trim()) { el.classList.add('invalid'); ok = false; }
    });

    const email = form.querySelector('[name="email"]');
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('invalid'); ok = false;
    }

    const consent = form.querySelector('[name="consent"]');
    if (!consent.checked) {
      consent.classList.add('invalid'); ok = false;
    }

    return ok;
  }

  // ── Send via PHPMailer backend ─────────────────────────────
  async function sendEmail(data) {
    const res = await fetch(MAILER_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Server error. Please try again.');
    }
  }

  // ── Submit handler ─────────────────────────────────────
  form.addEventListener('submit', async e => {
    e.preventDefault();
    formError.style.display = 'none';

    if (!validate()) {
      formError.textContent = 'Please fill in all required fields and accept the consent checkbox.';
      formError.style.display = 'block';
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
      form.style.display = 'none';
      successBox.style.display = 'flex';
    } catch (err) {
      console.error('[PHI Resilience] Email send error:', err);
      formError.innerHTML =
        'Something went wrong sending your message. Please try emailing us directly at ' +
        '<a href="mailto:info@mardietorres.com" style="color:var(--gold)">info@mardietorres.com</a>.';
      formError.style.display = 'block';
      setLoading(false);
    }
  });
})();