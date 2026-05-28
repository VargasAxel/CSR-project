<?php
/**
 * PHI Resilience — logout.php
 * Destroys the user's session and redirects to the homepage.
 */
require_once __DIR__ . '/auth.php';

// Validate optional CSRF token (GET logout is acceptable for simplicity,
// but you may want a POST form with a token in production)
logoutUser();

// Redirect to homepage with a logout confirmation flag
header('Location: index.html?logged_out=1');
exit;
