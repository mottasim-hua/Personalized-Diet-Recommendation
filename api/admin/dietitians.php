<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('admin');

$pdo = get_db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query(
        'SELECT u.id, u.name, u.email, u.created_at, COUNT(dp.user_id) AS patients
         FROM users u
         LEFT JOIN dietitian_patients dp ON dp.dietitian_id = u.id
         WHERE u.role = "dietitian"
         GROUP BY u.id, u.name, u.email, u.created_at
         ORDER BY u.created_at DESC'
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
    $password = (string) ($data['password'] ?? '');

    if ($name === '' || $email === '') {
        send_json(['success' => false, 'message' => 'name and email are required.'], 422);
    }

    if ($id > 0) {
        $params = [
            'id' => $id,
            'name' => $name,
            'email' => $email,
        ];

        $sql = 'UPDATE users SET name = :name, email = :email';

        if ($password !== '') {
            $sql .= ', password_hash = :password_hash';
            $params['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        }

        $sql .= ' WHERE id = :id AND role = "dietitian"';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        send_json([
            'success' => true,
            'message' => 'Dietitian updated successfully.',
        ]);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO users (name, email, password_hash, role)
         VALUES (:name, :email, :password_hash, "dietitian")'
    );
    $stmt->execute([
        'name' => $name,
        'email' => $email,
        'password_hash' => password_hash($password !== '' ? $password : 'ChangeMe123!', PASSWORD_DEFAULT),
    ]);

    send_json([
        'success' => true,
        'message' => 'Dietitian created successfully.',
        'id' => (int) $pdo->lastInsertId(),
    ], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = get_request_data();
    $id = sanitize_int($data['id'] ?? get_query_param('id', 0), 0);

    if ($id <= 0) {
        send_json(['success' => false, 'message' => 'Dietitian id is required.'], 422);
    }

    $stmt = $pdo->prepare('DELETE FROM users WHERE id = :id AND role = "dietitian"');
    $stmt->execute(['id' => $id]);

    send_json([
        'success' => true,
        'message' => 'Dietitian deleted successfully.',
    ]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
