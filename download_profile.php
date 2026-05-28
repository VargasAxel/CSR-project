<?php
/**
 * PHI Resilience — download_profile.php
 *
 * SECURE PDF download gate.
 * ─────────────────────────────────────────────────────────────
 * • Requires an active login session.
 * • Serves the file with X-Sendfile / readfile() — the browser
 *   cannot bypass auth by hitting the PDF path directly.
 * • Sets no-cache headers so the file isn't cached by proxies.
 * • Logs every successful download (optional, to a log file).
 * ─────────────────────────────────────────────────────────────
 */
require_once __DIR__ . '/auth.php';

// ── 1. Auth gate ──────────────────────────────────────────────
if (!isLoggedIn()) {
    // Store intended download destination and redirect to login
    $returnTo = urlencode('/download_profile.php');
    header("Location: login.php?redirect={$returnTo}&msg=login_required");
    exit;
}

// ── 2. Locate the PDF ─────────────────────────────────────────
// Adjust path if your PDF lives elsewhere (e.g. /var/private/pdfs/)
$pdfPath = __DIR__ . '/PHI_Resilience_Company_Profile.pdf';

if (!file_exists($pdfPath) || !is_readable($pdfPath)) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>File Not Found</title></head><body>';
    echo '<h2>Company Profile Not Available</h2>';
    echo '<p>The requested file could not be found. Please contact <a href="mailto:info@mardietorres.com">info@mardietorres.com</a>.</p>';
    echo '<p><a href="index.html">Return to homepage</a></p>';
    echo '</body></html>';
    exit;
}

// ── 3. Optional: log the download ────────────────────────────
$logFile = __DIR__ . '/logs/download_log.txt';
if (!is_dir(dirname($logFile))) @mkdir(dirname($logFile), 0755, true);
if (is_writable(dirname($logFile))) {
    $logEntry = sprintf(
        "[%s] User: %s (%s) | IP: %s | UA: %s\n",
        date('Y-m-d H:i:s'),
        $_SESSION['user_name']  ?? 'Unknown',
        $_SESSION['user_email'] ?? 'Unknown',
        $_SERVER['REMOTE_ADDR'] ?? '-',
        substr($_SERVER['HTTP_USER_AGENT'] ?? '-', 0, 120)
    );
    @file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

// ── 4. Serve the PDF ──────────────────────────────────────────
$filename = 'PHI_Resilience_Company_Profile.pdf';
$filesize = filesize($pdfPath);
$etag     = '"' . md5_file($pdfPath) . '"';

// Prevent caching of the protected file
header('Cache-Control: private, no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Content headers
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . $filesize);
header('ETag: ' . $etag);
header('X-Content-Type-Options: nosniff');

// Nginx X-Accel-Redirect (comment out if not using Nginx)
// header('X-Accel-Redirect: /protected/' . $filename);

// Flush and stream the file
if (ob_get_level()) ob_end_clean();
readfile($pdfPath);
exit;
