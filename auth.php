<?php
/**
 * PHI Resilience — auth.php
 * Shared session authentication helper.
 * Include this at the top of every protected PHP file.
 */

// Security-hardened session config — must be called BEFORE session_start()
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure',   isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 1 : 0);
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.use_strict_mode', 1);
    ini_set('session.gc_maxlifetime',  3600); // 1-hour session lifetime
    session_start();
}

// ── USERS DATABASE ────────────────────────────────────────────
// In production replace this with a real database (PDO/MySQLi).
// Passwords are stored as bcrypt hashes.
// To generate a hash: php -r "echo password_hash('your_password', PASSWORD_BCRYPT);"
$USERS = [
    [
        'id'       => 1,
        'email'    => 'admin@phiresilience.com',
        'name'     => 'PHI Admin',
        'password' => password_hash('Admin@2025', PASSWORD_BCRYPT),
    ],
    [
        'id'       => 2,
        'email'    => 'demo@phiresilience.com',
        'name'     => 'Demo User',
        'password' => password_hash('Demo@2025', PASSWORD_BCRYPT),
    ],
];

// ── HELPERS ───────────────────────────────────────────────────

/**
 * Check if the current visitor is logged in.
 */
function isLoggedIn(): bool {
    return !empty($_SESSION['user_id']) && !empty($_SESSION['user_email']);
}

/**
 * Require login. If not logged in, redirect to login page
 * carrying the current URL as the redirect-back destination.
 */
function requireLogin(string $loginPage = 'login.php'): void {
    if (!isLoggedIn()) {
        $returnTo = urlencode($_SERVER['REQUEST_URI'] ?? '');
        header("Location: {$loginPage}?redirect={$returnTo}&msg=login_required");
        exit;
    }
}

/**
 * Find a user by email (case-insensitive).
 */
function findUserByEmail(string $email, array $users): ?array {
    $email = strtolower(trim($email));
    foreach ($users as $u) {
        if (strtolower($u['email']) === $email) return $u;
    }
    return null;
}

/**
 * Log in a user — stores minimal info in the session.
 */
function loginUser(array $user): void {
    session_regenerate_id(true); // Prevent session fixation
    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name']  = $user['name'];
    $_SESSION['logged_in_at'] = time();
}

/**
 * Log out the current user and destroy the session.
 */
function logoutUser(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

/**
 * Return sanitised redirect URL — only allow relative paths on this server.
 */
function safeRedirect(string $url, string $fallback = 'index.html'): string {
    $decoded = urldecode($url);
    // Only allow relative paths (no protocol, no external domains)
    if (preg_match('/^[a-zA-Z0-9\/\-_\.?=&#%]+$/', $decoded) && strpos($decoded, '//') === false) {
        return $decoded;
    }
    return $fallback;
}
