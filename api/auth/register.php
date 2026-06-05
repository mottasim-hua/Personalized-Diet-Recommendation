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

$role = normalize_user_role($role);

if (!in_array($role, ['user', 'dietitian', 'admin'], true)) {
    send_json(['success' => false, 'message' => 'Invalid role selected.'], 422);
}

$pdo = get_db();

$userPk = user_primary_key_column($pdo);
$check = $pdo->prepare("SELECT $userPk AS id FROM users WHERE email = :email LIMIT 1");
$check->execute(['email' => $email]);

if ($check->fetch()) {
    send_json(['success' => false, 'message' => 'An account with this email already exists.'], 409);
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$roleValue = ucfirst($role);

if (users_has_column($pdo, 'name')) {
    $insert = $pdo->prepare(
        users_has_column($pdo, 'password')
            ? 'INSERT INTO users (name, email, password, password_hash, role) VALUES (:name, :email, :password, :password_hash, :role)'
            : 'INSERT INTO users (name, email, password_hash, role) VALUES (:name, :email, :password_hash, :role)'
    );

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
} else {
    $nameParts = split_full_name($name);
    $insert = $pdo->prepare(
        'INSERT INTO users (email, password_hash, first_name, last_name, gender, date_of_birth, role)
         VALUES (:email, :password_hash, :first_name, :last_name, :gender, :date_of_birth, :role)'
    );
    $insert->execute([
        'email' => $email,
        'password_hash' => $passwordHash,
        'first_name' => $nameParts['first_name'] !== '' ? $nameParts['first_name'] : 'User',
        'last_name' => $nameParts['last_name'],
        'gender' => 'Other',
        'date_of_birth' => '1990-01-01',
        'role' => $roleValue,
    ]);
}

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
