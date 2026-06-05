<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('admin');

$pdo = get_db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userPk = user_primary_key_column($pdo);
    $nameExpr = user_name_expression($pdo, 'u');
    
    $stmt = $pdo->query(
        "SELECT u.$userPk as id, 
                $nameExpr as name, 
                u.email, 
                COALESCE(u.phone, '') as phone,
                u.role, 
                u.created_at
         FROM users u
         WHERE LOWER(u.role) = 'user'
         ORDER BY u.created_at DESC"
    );

    send_json([
        'success' => true,
        'data' => $stmt->fetchAll(),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = get_request_data();

    $id = sanitize_int($data['id'] ?? 0, 0);
    $name = sanitize_string($data['name'] ?? '');
    $email = strtolower(sanitize_string($data['email'] ?? ''));
    $phone = sanitize_nullable_string($data['phone'] ?? '');
    $password = (string) ($data['password'] ?? '');

    if ($name === '' || $email === '') {
        send_json(['success' => false, 'message' => 'name and email are required.'], 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_json(['success' => false, 'message' => 'Invalid email address.'], 422);
    }

    $userPk = user_primary_key_column($pdo);
    $hasNameColumn = users_has_column($pdo, 'name');
    $hasFirstName = users_has_column($pdo, 'first_name');
    $nameParts = split_full_name($name);

    if ($id > 0) {
        // Update existing user
        $params = [
            'id' => $id,
            'email' => $email,
        ];

        if ($phone !== null) {
            $params['phone'] = $phone;
        }

        if ($hasNameColumn) {
            $params['name'] = $name;
            $sql = "UPDATE users SET name = :name, email = :email";
        } else {
            $params['first_name'] = $nameParts['first_name'];
            $params['last_name'] = $nameParts['last_name'];
            $sql = "UPDATE users SET first_name = :first_name, last_name = :last_name, email = :email";
        }

        if ($phone !== null) {
            $sql .= ", phone = :phone";
        }

        if ($password !== '') {
            $sql .= ', password_hash = :password_hash';
            $params['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        }

        $sql .= " WHERE $userPk = :id AND LOWER(role) = 'user'";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        send_json([
            'success' => true,
            'message' => 'User updated successfully.',
        ]);
    }

    // Create new user
    $passwordHash = password_hash($password !== '' ? $password : 'ChangeMe123!', PASSWORD_DEFAULT);

    if ($hasNameColumn) {
        $stmt = $pdo->prepare(
            'INSERT INTO users (name, email, phone, password_hash, role) 
             VALUES (:name, :email, :phone, :password_hash, :role)'
        );
        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'password_hash' => $passwordHash,
            'role' => 'user',
        ]);
    } else {
        // Schema with first_name and last_name
        $stmt = $pdo->prepare(
            'INSERT INTO users (first_name, last_name, email, phone, password_hash, role, gender, date_of_birth) 
             VALUES (:first_name, :last_name, :email, :phone, :password_hash, :role, :gender, :date_of_birth)'
        );
        $stmt->execute([
            'first_name' => $nameParts['first_name'],
            'last_name' => $nameParts['last_name'],
            'email' => $email,
            'phone' => $phone,
            'password_hash' => $passwordHash,
            'role' => 'User',
            'gender' => 'Other',
            'date_of_birth' => date('Y-m-d'),
        ]);
    }

    send_json([
        'success' => true,
        'message' => 'User created successfully.',
        'id' => (int) $pdo->lastInsertId(),
    ], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = get_request_data();
    $id = sanitize_int($data['id'] ?? get_query_param('id', 0), 0);

    if ($id <= 0) {
        send_json(['success' => false, 'message' => 'User id is required.'], 422);
    }

    $userPk = user_primary_key_column($pdo);
    $stmt = $pdo->prepare("DELETE FROM users WHERE $userPk = :id AND LOWER(role) = 'user'");
    $stmt->execute(['id' => $id]);

    send_json([
        'success' => true,
        'message' => 'User deleted successfully.',
    ]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);

