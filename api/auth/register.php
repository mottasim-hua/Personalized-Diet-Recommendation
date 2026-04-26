<?php

declare(strict_types=1);

require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$data = get_request_data();

$name = sanitize_string($data['name'] ?? '');
$email = strtolower(sanitize_string($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');
$role = sanitize_string($data['role'] ?? 'user');

if ($name === '' || $email === '' || $password === '' || $role === '') {
    send_json(['success' => false, 'message' => 'All fields are required.'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(['success' => false, 'message' => 'Invalid email address.'], 422);
}

if (!in_array($role, ['user', 'dietitian', 'admin'], true)) {
    send_json(['success' => false, 'message' => 'Invalid role selected.'], 422);
}

$pdo = get_db();

$check = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$check->execute(['email' => $email]);

if ($check->fetch()) {
    send_json(['success' => false, 'message' => 'An account with this email already exists.'], 409);
}

$insert = $pdo->prepare(
    users_has_column($pdo, 'password')
        ? 'INSERT INTO users (name, email, password, password_hash, role) VALUES (:name, :email, :password, :password_hash, :role)'
        : 'INSERT INTO users (name, email, password_hash, role) VALUES (:name, :email, :password_hash, :role)'
);

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$params = [
    'name' => $name,
    'email' => $email,
    'password_hash' => $passwordHash,
    'role' => $role,
];

if (users_has_column($pdo, 'password')) {
    $params['password'] = $passwordHash;
}

$insert->execute($params);

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $pdo->lastInsertId();
$_SESSION['role'] = $role;
$_SESSION['user_name'] = $name;

send_json([
    'success' => true,
    'message' => 'Registration successful.',
    'role' => $role,
    'user_id' => (int) $_SESSION['user_id'],
    'user' => [
        'id' => (int) $_SESSION['user_id'],
        'name' => $name,
        'email' => $email,
        'role' => $role,
    ],
]);
