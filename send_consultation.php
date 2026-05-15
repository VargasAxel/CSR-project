<?php
/**
 * PHI Resilience — Consultation Form Mailer
 * Uses PHPMailer via Composer. Run `composer install` before deploying.
 *
 * ── SMTP CONFIG ─────────────────────────────────────────────────────────────
 * Fill in the five constants below with your SMTP credentials.
 * For Gmail: enable 2FA → generate an App Password at
 *   https://myaccount.google.com/apppasswords
 * For other hosts: use your host's SMTP details.
 * ────────────────────────────────────────────────────────────────────────────
 */

define('SMTP_HOST',     'smtp.gmail.com');          // Your SMTP server
define('SMTP_PORT',     587);                        // 587 = TLS  |  465 = SSL
define('SMTP_USERNAME', 'axelv7247@gmail.com');           // Your sending email
define('SMTP_PASSWORD', 'niex bzyx hilx bypo');   // App password (not your login password)
define('MAIL_FROM',     'axelv7247@gmail.com');           // From address (must match SMTP_USERNAME for Gmail)
define('MAIL_FROM_NAME','PHI Resilience Website');   // Sender display name
define('MAIL_TO',       'jamesaxel39@gmail.com');    // Where to deliver the consultation request
define('MAIL_TO_NAME',  'PHI Resilience');

// ── CORS / HEADERS ────────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Allow requests from same origin; adjust if your site is on a different domain
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'https://www.phiresilience.com',
    'https://phiresilience.com',
    'http://localhost',
    'http://127.0.0.1',
];
if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── METHOD CHECK ──────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

// ── RATE LIMITING (simple session-based) ─────────────────────────────────────
session_start();
$now = time();
if (!isset($_SESSION['phi_last_submit'])) {
    $_SESSION['phi_last_submit'] = 0;
    $_SESSION['phi_submit_count'] = 0;
}
// Reset count every 10 minutes
if ($now - $_SESSION['phi_last_submit'] > 600) {
    $_SESSION['phi_submit_count'] = 0;
}
if ($_SESSION['phi_submit_count'] >= 5) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Too many requests. Please try again later.']);
    exit;
}
$_SESSION['phi_last_submit']   = $now;
$_SESSION['phi_submit_count']++;

// ── PARSE INPUT ───────────────────────────────────────────────────────────────
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

// Fall back to $_POST if not JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    $body = $_POST;
}

// ── SANITIZE ──────────────────────────────────────────────────────────────────
function clean(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

$fullName = clean($body['fullName'] ?? '');
$company  = clean($body['company']  ?? '');
$email    = filter_var(trim($body['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone    = clean($body['phone']    ?? '');
$interest = clean($body['interest'] ?? '');
$message  = clean($body['message']  ?? '');

// ── VALIDATE ──────────────────────────────────────────────────────────────────
$errors = [];
if (empty($fullName)) $errors[] = 'Full name is required.';
if (empty($company))  $errors[] = 'Organization is required.';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid email address is required.';
if (empty($interest)) $errors[] = 'Please select an area of interest.';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => implode(' ', $errors)]);
    exit;
}

// ── HONEYPOT CHECK (spam trap) ────────────────────────────────────────────────
if (!empty($body['website'])) {   // bots fill hidden fields
    http_response_code(200);      // pretend success
    echo json_encode(['success' => true]);
    exit;
}

// ── LOAD PHPMAILER ────────────────────────────────────────────────────────────
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// ── BUILD & SEND EMAIL ────────────────────────────────────────────────────────
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host        = SMTP_HOST;
    $mail->SMTPAuth    = true;
    $mail->Username    = SMTP_USERNAME;
    $mail->Password    = SMTP_PASSWORD;
    $mail->SMTPSecure  = PHPMailer::ENCRYPTION_STARTTLS; // Use ENCRYPTION_SMTPS for port 465
    $mail->Port        = SMTP_PORT;
    $mail->CharSet     = 'UTF-8';

    // Sender & recipient
    $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
    $mail->addAddress(MAIL_TO, MAIL_TO_NAME);
    $mail->addReplyTo($email, $fullName);   // replies go straight to the enquirer

    // Subject
    $mail->Subject = "New Consultation Request — $fullName ($company)";

    // ── Plain-text fallback ───────────────────────────────────────────────────
    $mail->AltBody = <<<TEXT
New Consultation Request — PHI Resilience

Name:         $fullName
Organization: $company
Email:        $email
Phone:        {$phone}
Interest:     $interest

Message:
$message

---
Submitted: {$now} UTC
IP: {$_SERVER['REMOTE_ADDR']}
TEXT;

    // ── HTML body ─────────────────────────────────────────────────────────────
    $phoneDisplay   = $phone    ?: 'Not provided';
    $messageDisplay = $message  ?: '<em style="color:#8b9db5">No message provided.</em>';
    $submittedAt    = date('d M Y, H:i') . ' UTC';

    $mail->isHTML(true);
    $mail->Body = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>New Consultation Request</title>
<style>
  body  { margin:0; padding:0; background:#07101f; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }
  table { border-collapse:collapse; }
  a     { color:#c9973a; }
</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#07101f;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#0d1a2e,#162338);border-bottom:2px solid #c9973a;
                   padding:32px 40px;border-radius:6px 6px 0 0;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9973a;font-weight:600;">
            PHI Resilience Strategic Management Services
          </p>
          <h1 style="margin:0;font-size:22px;font-weight:800;color:#f4f1ec;letter-spacing:-0.3px;">
            New Consultation Request
          </h1>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#101e33;padding:36px 40px;">

          <!-- Enquirer details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(201,151,58,.15);">
                <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9973a;font-weight:600;padding-bottom:4px;">Full Name</p>
                <p style="margin:0;font-size:16px;color:#f4f1ec;font-weight:600;">$fullName</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(201,151,58,.15);">
                <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9973a;font-weight:600;padding-bottom:4px;">Organization</p>
                <p style="margin:0;font-size:16px;color:#f4f1ec;">$company</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(201,151,58,.15);">
                <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9973a;font-weight:600;padding-bottom:4px;">Email</p>
                <p style="margin:0;font-size:15px;color:#f4f1ec;"><a href="mailto:$email" style="color:#c9973a;text-decoration:none;">$email</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(201,151,58,.15);">
                <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9973a;font-weight:600;padding-bottom:4px;">Phone</p>
                <p style="margin:0;font-size:15px;color:#f4f1ec;">$phoneDisplay</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9973a;font-weight:600;padding-bottom:4px;">Area of Interest</p>
                <p style="margin:0;">
                  <span style="display:inline-block;background:rgba(201,151,58,.12);border:1px solid rgba(201,151,58,.35);
                               color:#e8b84b;font-size:13px;font-weight:600;padding:4px 12px;border-radius:100px;">
                    $interest
                  </span>
                </p>
              </td>
            </tr>
          </table>

          <!-- Message -->
          <p style="margin:0 0 10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9973a;font-weight:600;">Message</p>
          <div style="background:#0d1a2e;border-left:3px solid #c9973a;border-radius:0 4px 4px 0;
                      padding:16px 20px;font-size:14px;color:#ddd8cf;line-height:1.7;">
            $messageDisplay
          </div>

          <!-- Reply CTA -->
          <div style="margin-top:28px;text-align:center;">
            <a href="mailto:$email?subject=Re: Consultation Request — PHI Resilience"
               style="display:inline-block;background:linear-gradient(135deg,#c9973a,#8a6520);
                      color:#07101f;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;
                      padding:13px 28px;border-radius:3px;text-decoration:none;">
              Reply to $fullName
            </a>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0d1a2e;border-top:1px solid rgba(201,151,58,.15);
                   padding:20px 40px;border-radius:0 0 6px 6px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#8b9db5;">
            Submitted $submittedAt · PHI Resilience Strategic Management Services
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
HTML;

    $mail->send();

    // ── Auto-reply to the sender ──────────────────────────────────────────────
    $autoReply = new PHPMailer(true);
    $autoReply->isSMTP();
    $autoReply->Host       = SMTP_HOST;
    $autoReply->SMTPAuth   = true;
    $autoReply->Username   = SMTP_USERNAME;
    $autoReply->Password   = SMTP_PASSWORD;
    $autoReply->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $autoReply->Port       = SMTP_PORT;
    $autoReply->CharSet    = 'UTF-8';

    $autoReply->setFrom(MAIL_FROM, MAIL_FROM_NAME);
    $autoReply->addAddress($email, $fullName);
    $autoReply->Subject = 'Thank you for reaching out — PHI Resilience';
    $autoReply->AltBody = "Dear $fullName,\n\nThank you for your consultation request. We have received your message and will respond within 1–2 business days.\n\n— PHI Resilience Team\ninfo@mardietorres.com | +63 919 002 4845";

    $autoReply->isHTML(true);
    $autoReply->Body = <<<HTML2
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Thank You</title></head>
<body style="margin:0;padding:0;background:#07101f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#07101f;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr>
        <td style="background:#0d1a2e;border-top:3px solid #c9973a;border-radius:6px;padding:44px 44px 36px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9973a;font-weight:600;">
            PHI Resilience
          </p>
          <h1 style="margin:0 0 20px;font-size:26px;font-weight:800;color:#f4f1ec;letter-spacing:-0.3px;line-height:1.2;">
            Thank you, $fullName.
          </h1>
          <p style="margin:0 0 16px;font-size:15px;color:#ddd8cf;line-height:1.75;">
            We've received your consultation request and will review it shortly.
            A member of our team will be in touch within <strong style="color:#f4f1ec;">1–2 business days</strong>.
          </p>
          <p style="margin:0 0 28px;font-size:15px;color:#ddd8cf;line-height:1.75;">
            In the meantime, feel free to explore our website or reach us directly:
          </p>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#8b9db5;width:80px;">Phone</td>
              <td style="padding:6px 0;font-size:13px;color:#f4f1ec;">+63 919 002 4845</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#8b9db5;">Email</td>
              <td style="padding:6px 0;font-size:13px;"><a href="mailto:info@mardietorres.com" style="color:#c9973a;text-decoration:none;">info@mardietorres.com</a></td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#8b9db5;">Web</td>
              <td style="padding:6px 0;font-size:13px;"><a href="https://www.phiresilience.com" style="color:#c9973a;text-decoration:none;">www.phiresilience.com</a></td>
            </tr>
          </table>
          <p style="margin:0;font-size:13px;color:#8b9db5;line-height:1.6;border-top:1px solid rgba(201,151,58,.15);padding-top:20px;">
            "Partner with Purpose. Act with Impact. Rebuilding stronger, together."<br>
            <strong style="color:#c9973a;">PHI Resilience Strategic Management Services</strong>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>
HTML2;

    $autoReply->send();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    error_log('[PHI Resilience] Mailer error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Could not send your message. Please email us directly at info@mardietorres.com.',
    ]);
}