<?php
/**
 * PHI Resilience — login.php
 * Session-based login page with redirect-back support.
 */
require_once __DIR__ . '/auth.php';

// Already logged in? Send them home.
if (isLoggedIn()) {
    $go = isset($_GET['redirect']) ? safeRedirect($_GET['redirect']) : 'index.html';
    header("Location: {$go}");
    exit;
}

$error    = '';
$msgParam = $_GET['msg'] ?? '';
$redirect = $_GET['redirect'] ?? 'index.html';

// ── Handle POST ───────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $csrfToken = $_POST['csrf_token'] ?? '';
    $email     = trim($_POST['email']    ?? '');
    $password  = $_POST['password']      ?? '';
    $redirect  = $_POST['redirect']      ?? 'index.html';

    // Basic CSRF check
    if (empty($_SESSION['csrf_token']) || $csrfToken !== $_SESSION['csrf_token']) {
        $error = 'Invalid request. Please try again.';
    } elseif (empty($email) || empty($password)) {
        $error = 'Please enter both your email and password.';
    } else {
        $user = findUserByEmail($email, $USERS);
        if ($user && password_verify($password, $user['password'])) {
            loginUser($user);
            $safeRedirect = safeRedirect($redirect);
            // Append auto-download flag so JS knows to trigger download
            $separator = (strpos($safeRedirect, '?') !== false) ? '&' : '?';
            header("Location: {$safeRedirect}{$separator}auto_download=1#contact");
            exit;
        } else {
            // Timing-safe: always take ~same time whether user exists or not
            usleep(200000 + random_int(0, 100000));
            $error = 'Incorrect email or password. Please try again.';
        }
    }
}

// Generate CSRF token for the form
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrfToken = $_SESSION['csrf_token'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Sign In — PHI Resilience</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --teal:       #0D7377;
      --teal-dark:  #0A5A5D;
      --teal-light: #E8F5F5;
      --gold:       #D4A017;
      --gold-dark:  #A67C10;
      --navy:       #1A2E4A;
      --navy-deep:  #0f1e30;
      --slate:      #64748B;
      --border:     #E2E8F0;
      --white:      #FFFFFF;
      --gray-bg:    #F8FAFC;
      --font-serif: 'Playfair Display', Georgia, serif;
      --font-sans:  'DM Sans', system-ui, sans-serif;
      --ease-spring: cubic-bezier(.34,1.56,.64,1);
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; -webkit-font-smoothing: antialiased; }
    body {
      font-family: var(--font-sans);
      background: linear-gradient(150deg, var(--navy-deep) 0%, var(--navy) 45%, var(--teal-dark) 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
    }
    /* Background pattern */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
      opacity: .4;
    }
    /* Glow */
    body::after {
      content: '';
      position: fixed;
      width: 600px; height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(13,115,119,.25) 0%, transparent 65%);
      top: -150px; right: -200px;
      pointer-events: none;
    }

    /* ── Card ── */
    .login-card {
      position: relative;
      z-index: 1;
      background: var(--white);
      border-radius: 20px;
      width: 100%;
      max-width: 460px;
      padding: 3rem 2.75rem;
      box-shadow: 0 32px 80px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.05);
      animation: cardIn .55s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes cardIn {
      from { transform: translateY(-30px) scale(.96); opacity: 0; }
      to   { transform: none; opacity: 1; }
    }

    /* ── Header ── */
    .login-brand {
      display: flex;
      align-items: center;
      gap: .75rem;
      margin-bottom: 2rem;
      text-decoration: none;
    }
    .login-brand-logo {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, var(--teal), var(--teal-dark));
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-serif);
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--white);
      flex-shrink: 0;
    }
    .login-brand-text { display: flex; flex-direction: column; }
    .login-brand-name {
      font-family: var(--font-serif);
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--navy);
    }
    .login-brand-name span { color: var(--teal); font-style: italic; }
    .login-brand-tag {
      font-size: .6rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--slate);
    }

    .login-title {
      font-family: var(--font-serif);
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--navy);
      margin-bottom: .35rem;
    }
    .login-subtitle {
      font-size: .9rem;
      color: var(--slate);
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    /* ── Download notice banner ── */
    .download-notice {
      background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
      border: 1px solid #BFDBFE;
      border-left: 4px solid var(--teal);
      border-radius: 8px;
      padding: .9rem 1.1rem;
      margin-bottom: 1.75rem;
      display: flex;
      gap: .75rem;
      align-items: flex-start;
    }
    .download-notice .dn-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .download-notice p {
      font-size: .84rem;
      color: #1e40af;
      line-height: 1.55;
    }
    .download-notice strong { color: #1e3a8a; }

    /* ── Form ── */
    .form-group { margin-bottom: 1.25rem; }
    .form-group label {
      display: block;
      font-size: .74rem;
      font-weight: 600;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--teal);
      margin-bottom: .45rem;
    }
    .form-group input {
      width: 100%;
      background: var(--gray-bg);
      border: 1.5px solid var(--border);
      border-radius: 8px;
      padding: .85rem 1rem;
      font-family: var(--font-sans);
      font-size: .9rem;
      color: var(--navy);
      transition: border-color .25s, box-shadow .25s, background .25s;
    }
    .form-group input::placeholder { color: #94a3b8; }
    .form-group input:focus {
      outline: none;
      border-color: var(--teal);
      box-shadow: 0 0 0 3px rgba(13,115,119,.12);
      background: var(--white);
    }

    .password-wrap { position: relative; }
    .password-wrap input { padding-right: 3rem; }
    .toggle-pw {
      position: absolute;
      right: .85rem; top: 50%;
      transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: var(--slate); padding: .25rem; font-size: 1.05rem;
      transition: color .2s;
      display: flex; align-items: center;
    }
    .toggle-pw:hover { color: var(--teal); }

    /* ── Error alert ── */
    .error-alert {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-left: 4px solid #EF4444;
      border-radius: 8px;
      padding: .85rem 1.1rem;
      margin-bottom: 1.5rem;
      font-size: .85rem;
      color: #991B1B;
      display: flex; gap: .65rem; align-items: flex-start;
      animation: errIn .3s ease;
    }
    @keyframes errIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: none; }
    }
    .error-alert .err-icon { flex-shrink: 0; font-size: 1rem; margin-top: 1px; }

    /* ── Submit button ── */
    .btn-submit {
      width: 100%;
      background: var(--gold);
      color: var(--navy);
      border: none;
      border-radius: 8px;
      padding: .95rem 1.5rem;
      font-family: var(--font-sans);
      font-size: .95rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: .5rem;
      box-shadow: 0 4px 16px rgba(212,160,23,.3);
      transition: background .25s, transform .25s var(--ease-spring), box-shadow .25s;
      display: flex; align-items: center; justify-content: center; gap: .5rem;
    }
    .btn-submit:hover {
      background: var(--gold-dark);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(212,160,23,.4);
    }
    .btn-submit:active { transform: translateY(0); }

    /* ── Footer links ── */
    .login-footer {
      margin-top: 1.75rem;
      text-align: center;
      font-size: .82rem;
      color: var(--slate);
    }
    .login-footer a { color: var(--teal); font-weight: 600; text-decoration: none; }
    .login-footer a:hover { color: var(--teal-dark); text-decoration: underline; }

    .divider {
      display: flex; align-items: center; gap: 1rem;
      margin: 1.5rem 0;
      color: var(--slate); font-size: .78rem;
    }
    .divider::before, .divider::after {
      content: ''; flex: 1; height: 1px; background: var(--border);
    }

    .back-link {
      display: inline-flex; align-items: center; gap: .4rem;
      font-size: .8rem; color: var(--slate);
      text-decoration: none;
      transition: color .2s;
      margin-bottom: 1.5rem;
    }
    .back-link:hover { color: var(--teal); }

    @media (max-width: 500px) {
      .login-card { padding: 2rem 1.5rem; }
      .login-title { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
<div class="login-card">

  <a href="index.html" class="back-link">
    ← Back to PHI Resilience
  </a>

  <a href="index.html" class="login-brand">
    <div class="login-brand-logo">PHI</div>
    <div class="login-brand-text">
      <div class="login-brand-name">PHI <span>Resilience</span></div>
      <span class="login-brand-tag">Strategic Management Services</span>
    </div>
  </a>

  <h1 class="login-title">Welcome back</h1>
  <p class="login-subtitle">Sign in to access the company profile and other exclusive resources.</p>

  <?php if ($msgParam === 'login_required'): ?>
  <div class="download-notice">
    <span class="dn-icon">📄</span>
    <p><strong>Sign in required.</strong> Please log in first to download the PHI Resilience Company Profile.</p>
  </div>
  <?php endif; ?>

  <?php if (!empty($error)): ?>
  <div class="error-alert" role="alert">
    <span class="err-icon">⚠️</span>
    <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?>
  </div>
  <?php endif; ?>

  <form method="POST" action="login.php" autocomplete="on" novalidate>
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>"/>
    <input type="hidden" name="redirect"   value="<?= htmlspecialchars($redirect) ?>"/>

    <div class="form-group">
      <label for="email">Email Address</label>
      <input
        type="email" id="email" name="email"
        placeholder="you@company.com"
        autocomplete="email"
        value="<?= htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8') ?>"
        required
      />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <div class="password-wrap">
        <input
          type="password" id="password" name="password"
          placeholder="Enter your password"
          autocomplete="current-password"
          required
        />
        <button type="button" class="toggle-pw" aria-label="Toggle password visibility" onclick="togglePw()">👁</button>
      </div>
    </div>

    <button type="submit" class="btn-submit">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      Sign In &amp; Continue
    </button>
  </form>

  <div class="divider">or</div>

  <div class="login-footer">
    Don't have an account? <a href="register.php?redirect=<?= urlencode($redirect) ?>">Create one here</a>
  </div>
  <div class="login-footer" style="margin-top:.5rem">
    <a href="index.html">← Return to homepage without signing in</a>
  </div>

</div>

<script>
function togglePw() {
  const pw = document.getElementById('password');
  const btn = document.querySelector('.toggle-pw');
  if (pw.type === 'password') {
    pw.type = 'text';
    btn.textContent = '🙈';
  } else {
    pw.type = 'password';
    btn.textContent = '👁';
  }
}
// Auto-focus email if empty
window.addEventListener('DOMContentLoaded', () => {
  const email = document.getElementById('email');
  if (!email.value) email.focus();
});
</script>
</body>
</html>
