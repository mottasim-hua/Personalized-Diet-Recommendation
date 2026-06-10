<?php

declare(strict_types=1);

require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$isLoggedIn = isset($_SESSION['user_id']) && (int) $_SESSION['user_id'] > 0;
$role = normalize_user_role((string) ($_SESSION['role'] ?? ''));

send_json([
    'success' => true,
    'data' => [
        'authenticated' => $isLoggedIn,
        'user_id' => $isLoggedIn ? (int) $_SESSION['user_id'] : null,
        'role' => $role,
        'name' => (string) ($_SESSION['user_name'] ?? ''),
        'email' => (string) ($_SESSION['user_email'] ?? ''),
    ],
]);
