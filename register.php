<?php
/**
 * PHI Resilience — register.php
 * New user registration with redirect-back support.
 * 
 * NOTE: In production connect this to a real database.
 * For demo, successful registration stores user in session and logs them in.
 */
require_once __DIR__ . '/auth.php';

if (isLoggedIn()) {
    $go = isset($_GET['redirect']) ? safeRedirect($_GET['redirect']) : 'index.html';
    header("Location: {$go}");
    exit;
}

$error    = '';
$success  = '';
$redirect = $_GET['redirect'] ?? 'index.html';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $csrfToken = $_POST['csrf_token']     ?? '';
    $name      = trim($_POST['name']      ?? '');
    $org       = trim($_POST['org']       ?? '');
    $email     = strtolower(trim($_POST['email'] ?? ''));
    $password  = $_POST['password']       ?? '';
    $confirm   = $_POST['confirm']        ?? '';
    $redirect  = $_POST['redirect']       ?? 'index.html';

    if (empty($_SESSION['csrf_token']) || $csrfToken !== $_SESSION['csrf_token']) {
        $error = 'Invalid request. Please try again.';
    } elseif (strlen($name) < 2) {
        $error = 'Please enter your full name (at least 2 characters).';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } elseif (strlen($password) < 8) {
        $error = 'Password must be at least 8 characters.';
    } elseif (!preg_match('/[A-Z]/', $password) || !preg_match('/[0-9]/', $password)) {
        $error = 'Password must contain at least one uppercase letter and one number.';
    } elseif ($password !== $confirm) {
        $error = 'Passwords do not match.';
    } elseif (findUserByEmail($email, $USERS) !== null) {
        $error = 'An account with that email already exists. Please sign in instead.';
    } else {
        // ── In production: INSERT into database ──
        // For demo: log the user in with a temporary session user
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $newUser = [
            'id'       => 9000 + random_int(1, 999),
            'email'    => $email,
            'name'     => $name,
            'org'      => $org,
            'password' => $hash,
        ];

        // Log them in immediately
        loginUser($newUser);

        $safeRedirect = safeRedirect($redirect);
        $separator    = (strpos($safeRedirect, '?') !== false) ? '&' : '?';
        header("Location: {$safeRedirect}{$separator}auto_download=1#contact");
        exit;
    }
}

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
  <title>Create Account — PHI Resilience</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --teal:#0D7377;--teal-dark:#0A5A5D;--teal-light:#E8F5F5;
      --gold:#D4A017;--gold-dark:#A67C10;
      --navy:#1A2E4A;--navy-deep:#0f1e30;
      --slate:#64748B;--border:#E2E8F0;--white:#FFFFFF;--gray-bg:#F8FAFC;
      --font-serif:'Playfair Display',Georgia,serif;
      --font-sans:'DM Sans',system-ui,sans-serif;
      --ease-spring:cubic-bezier(.34,1.56,.64,1);
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{font-size:16px;-webkit-font-smoothing:antialiased}
    body{font-family:var(--font-sans);background:linear-gradient(150deg,var(--navy-deep) 0%,var(--navy) 45%,var(--teal-dark) 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;position:relative;overflow-x:hidden}
    body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;opacity:.4}
    .card{position:relative;z-index:1;background:var(--white);border-radius:20px;width:100%;max-width:480px;padding:2.75rem;box-shadow:0 32px 80px rgba(0,0,0,.45);animation:cardIn .55s var(--ease-spring)}
    @keyframes cardIn{from{transform:translateY(-28px) scale(.96);opacity:0}to{transform:none;opacity:1}}
    .brand{display:flex;align-items:center;gap:.75rem;margin-bottom:1.75rem;text-decoration:none}
    .brand-logo{width:42px;height:42px;background:linear-gradient(135deg,var(--teal),var(--teal-dark));border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-weight:800;font-size:1rem;color:var(--white);flex-shrink:0}
    .brand-name{font-family:var(--font-serif);font-size:1.05rem;font-weight:800;color:var(--navy)}
    .brand-name span{color:var(--teal);font-style:italic}
    .brand-tag{font-size:.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--slate)}
    h1{font-family:var(--font-serif);font-size:1.7rem;font-weight:800;color:var(--navy);margin-bottom:.3rem}
    .sub{font-size:.88rem;color:var(--slate);line-height:1.6;margin-bottom:1.75rem}
    .back-link{display:inline-flex;align-items:center;gap:.4rem;font-size:.78rem;color:var(--slate);text-decoration:none;transition:color .2s;margin-bottom:1.25rem}
    .back-link:hover{color:var(--teal)}
    .form-group{margin-bottom:1.15rem}
    .form-group label{display:block;font-size:.72rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--teal);margin-bottom:.4rem}
    .form-group input{width:100%;background:var(--gray-bg);border:1.5px solid var(--border);border-radius:8px;padding:.82rem 1rem;font-family:var(--font-sans);font-size:.88rem;color:var(--navy);transition:border-color .25s,box-shadow .25s,background .25s}
    .form-group input::placeholder{color:#94a3b8}
    .form-group input:focus{outline:none;border-color:var(--teal);box-shadow:0 0 0 3px rgba(13,115,119,.12);background:var(--white)}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
    .error-alert{background:#FEF2F2;border:1px solid #FECACA;border-left:4px solid #EF4444;border-radius:8px;padding:.85rem 1.1rem;margin-bottom:1.4rem;font-size:.84rem;color:#991B1B;animation:errIn .3s ease}
    @keyframes errIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}
    .pw-hint{font-size:.72rem;color:var(--slate);margin-top:.3rem}
    .btn-submit{width:100%;background:var(--gold);color:var(--navy);border:none;border-radius:8px;padding:.92rem 1.5rem;font-family:var(--font-sans);font-size:.93rem;font-weight:700;cursor:pointer;margin-top:.25rem;box-shadow:0 4px 16px rgba(212,160,23,.3);transition:background .25s,transform .25s var(--ease-spring),box-shadow .25s;display:flex;align-items:center;justify-content:center;gap:.5rem}
    .btn-submit:hover{background:var(--gold-dark);transform:translateY(-2px);box-shadow:0 8px 24px rgba(212,160,23,.4)}
    .footer{margin-top:1.5rem;text-align:center;font-size:.82rem;color:var(--slate)}
    .footer a{color:var(--teal);font-weight:600;text-decoration:none}
    .footer a:hover{text-decoration:underline}
    @media(max-width:500px){.card{padding:2rem 1.5rem}.form-row{grid-template-columns:1fr}}
  </style>
</head>
<body>
<div class="card">
  <a href="index.html" class="back-link">← Back to PHI Resilience</a>

  <a href="index.html" class="brand">
    <div class="brand-logo">PHI</div>
    <div>
      <div class="brand-name">PHI <span>Resilience</span></div>
      <div class="brand-tag">Strategic Management Services</div>
    </div>
  </a>

  <h1>Create Account</h1>
  <p class="sub">Register to download the company profile and stay updated on PHI Resilience programs.</p>

  <?php if (!empty($error)): ?>
  <div class="error-alert">⚠️ <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <form method="POST" action="register.php" autocomplete="on" novalidate>
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken) ?>"/>
    <input type="hidden" name="redirect"   value="<?= htmlspecialchars($redirect) ?>"/>

    <div class="form-row">
      <div class="form-group">
        <label for="name">Full Name *</label>
        <input type="text" id="name" name="name" placeholder="Your full name" autocomplete="name"
               value="<?= htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8') ?>" required/>
      </div>
      <div class="form-group">
        <label for="org">Organization</label>
        <input type="text" id="org" name="org" placeholder="Company / NGO" autocomplete="organization"
               value="<?= htmlspecialchars($_POST['org'] ?? '', ENT_QUOTES, 'UTF-8') ?>"/>
      </div>
    </div>

    <div class="form-group">
      <label for="email">Email Address *</label>
      <input type="email" id="email" name="email" placeholder="you@company.com" autocomplete="email"
             value="<?= htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8') ?>" required/>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="password">Password *</label>
        <input type="password" id="password" name="password" placeholder="Min. 8 characters" autocomplete="new-password" required/>
        <div class="pw-hint">Min. 8 chars, 1 uppercase, 1 number</div>
      </div>
      <div class="form-group">
        <label for="confirm">Confirm Password *</label>
        <input type="password" id="confirm" name="confirm" placeholder="Repeat password" autocomplete="new-password" required/>
      </div>
    </div>

    <button type="submit" class="btn-submit">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      Create Account &amp; Download
    </button>
  </form>

  <div class="footer" style="margin-top:1.25rem">Already have an account? <a href="login.php?redirect=<?= urlencode($redirect) ?>">Sign in here</a></div>
</div>
</body>
</html>
