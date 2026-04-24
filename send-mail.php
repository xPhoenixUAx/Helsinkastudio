<?php
declare(strict_types=1);

function clean_input(string $value): string
{
    return trim(filter_var($value, FILTER_SANITIZE_FULL_SPECIAL_CHARS));
}

function clean_header_value(string $value): string
{
    return str_replace(["\r", "\n"], '', $value);
}

function respond(string $message, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: text/html; charset=UTF-8');
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>Contact Form Response | Helsinka Studio</title><link rel="stylesheet" href="/css/bundle.css"></head><body>';
    echo '<main class="section"><div class="container narrow">';
    echo '<p class="eyebrow">Contact form</p><h1>' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</h1>';
    echo '<p><a class="button" href="/contact.html">Back to contact page</a></p>';
    echo '</div></main></body></html>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond('This form accepts POST submissions only.', 405);
}

$honeypot = $_POST['website'] ?? '';
if (!empty($honeypot)) {
    respond('Your message could not be sent.', 400);
}

$name = clean_input((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$company = clean_input((string)($_POST['company'] ?? ''));
$serviceInterest = clean_input((string)($_POST['service_interest'] ?? ''));
$budgetRange = clean_input((string)($_POST['budget_range'] ?? ''));
$projectTimeline = clean_input((string)($_POST['project_timeline'] ?? ''));
$projectDetails = clean_input((string)($_POST['project_details'] ?? ''));
$consent = (string)($_POST['consent'] ?? '');

if (
    $name === '' ||
    $email === '' ||
    $serviceInterest === '' ||
    $budgetRange === '' ||
    $projectTimeline === '' ||
    $projectDetails === '' ||
    $consent !== 'yes'
) {
    respond('Please complete all required fields and confirm consent.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond('Please enter a valid email address.', 422);
}

if (strlen($projectDetails) < 20) {
    respond('Please add a few more details about your project.', 422);
}

$to = 'support@helsinkastudio.com';
$subject = 'New project inquiry from helsinkastudio.com';

$body = "New project inquiry submitted through helsinkastudio.com\n\n";
$body .= "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "Company: " . ($company !== '' ? $company : 'Not provided') . "\n";
$body .= "Service interest: {$serviceInterest}\n";
$body .= "Budget range: {$budgetRange}\n";
$body .= "Project timeline: {$projectTimeline}\n";
$body .= "Consent: {$consent}\n\n";
$body .= "Project details:\n{$projectDetails}\n\n";
$body .= "Submitted at: " . gmdate('Y-m-d H:i:s') . " UTC\n";
$body .= "IP address: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n";

$safeFrom = 'no-reply@helsinkastudio.com';
$replyName = clean_header_value($name);
$replyEmail = clean_header_value($email);
$headers = [
    'From: Helsinka Studio Website <' . $safeFrom . '>',
    'Reply-To: ' . $replyName . ' <' . $replyEmail . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond('Your message could not be sent. Please email support@helsinkastudio.com directly.', 500);
}

respond('Thank you. Your project inquiry has been sent.');
