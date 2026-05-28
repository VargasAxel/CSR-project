<?php
/**
 * PHI Resilience — check_auth.php
 * Returns JSON with login state for the frontend JS to query.
 * 
 * GET /check_auth.php
 * Response: { "loggedIn": true, "name": "John Doe" }
 *        or { "loggedIn": false }
 */
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache');
header('X-Content-Type-Options: nosniff');

if (isLoggedIn()) {
    echo json_encode([
        'loggedIn' => true,
        'name'     => $_SESSION['user_name'] ?? '',
        'email'    => $_SESSION['user_email'] ?? '',
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
exit;
