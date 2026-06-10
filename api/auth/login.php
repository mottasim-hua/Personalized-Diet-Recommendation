<?php

declare(strict_types=1);

require_once __DIR__ . '/../db.php';

function expects_json_response(): bool
{
    $accept = strtolower((string) ($_SERVER['HTTP_ACCEPT'] ?? ''));
    $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    $requestedWith = strtolower((string) ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? ''));

    return str_contains($accept, 'application/json')
        || str_contains($contentType, 'application/json')
        || $requestedWith === 'xmlhttprequest';
}

function finish_login_error(string $message, int $statusCode): never
{
    if (expects_json_response()) {
        send_json(['success' => false, 'message' => $message], $statusCode);
    }

    $_SESSION['auth_error'] = $message;
    header('Location: ../../index.html');
    exit;
}

function finish_login_success(array $user): never
{
    $role = normalize_user_role((string) $user['role']);
    $payload = [
        'success' => true,
        'message' => 'Login successful.',
        'role' => $role,
        'user_id' => (int) $user['id'],
        'user' => [
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $role,
            'loginTime' => date(DATE_ATOM),
        ],
    ];

    if (expects_json_response()) {
        send_json($payload);
    }

    $redirect = '../../user-dashboard.html?v=20260608-2';

    if ($role === 'admin') {
        $redirect = '../../admin-dashboard.html?v=20260608-2';
    } elseif ($role === 'dietitian') {
        $redirect = '../../dietitian-dashboard.html?v=20260608-2';
    }

    header('Location: ' . $redirect);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
    finish_login_error('Method not allowed.', 405);
}

$data = get_request_data();
$email = strtolower(sanitize_string($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');

if ($email === '' || $password === '') {
    send_json(['success' => false, 'message' => 'Email and password are required.'], 422);
    finish_login_error('Email and password are required.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(['success' => false, 'message' => 'Invalid email address.'], 422);
    finish_login_error('Invalid email address.', 422);
}

$pdo = get_db();

$userPk = user_primary_key_column($pdo);
$nameExpr = user_name_expression($pdo, 'u');
$roleExpr = user_role_expression('u');

$query = $pdo->prepare(
    "SELECT u.$userPk AS id, $nameExpr AS name, u.email, u.password_hash, $roleExpr AS role
     FROM users u
     WHERE u.email = :email
     LIMIT 1"
);
$query->execute(['email' => $email]);
$user = $query->fetch();

if (!$user) {
    send_json(['success' => false, 'message' => 'Invalid email or password.'], 401);
    finish_login_error('Invalid email or password.', 401);
}

$storedHash = (string) ($user['password_hash'] ?? '');
$isValid = password_verify($password, $storedHash);


if (!$isValid) {
    send_json(['success' => false, 'message' => 'Invalid email or password.'], 401);
    finish_login_error('Invalid email or password.', 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['role'] = normalize_user_role((string) $user['role']);
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];

$updateLogin = $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE $userPk = :id");
$updateLogin->execute(['id' => (int) $user['id']]);

send_json([
    'success' => true,
    'message' => 'Login successful.',
    'role' => normalize_user_role((string) $user['role']),
    'user_id' => (int) $user['id'],
    'user' => [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => normalize_user_role((string) $user['role']),
        'loginTime' => date(DATE_ATOM),
    ],
]);
