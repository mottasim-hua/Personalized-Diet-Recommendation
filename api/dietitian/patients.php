<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('dietitian');

$pdo = get_db();
$dietitianId = current_user_id();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare(
        'SELECT id, client_user_id, name, email, age, weight, height, goal, diet_type, allergies, status, created_at, updated_at
         FROM app_dietitian_patients
         WHERE dietitian_user_id = :dietitian_user_id
         ORDER BY updated_at DESC, created_at DESC'
    );
    $stmt->execute(['dietitian_user_id' => $dietitianId]);

    send_json([
        'success' => true,
        'data' => $stmt->fetchAll(),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = get_request_data();

    $id = sanitize_int($data['id'] ?? 0, 0);
    $name = sanitize_string($data['name'] ?? '');
    $email = sanitize_nullable_string($data['email'] ?? null);
    $age = sanitize_int($data['age'] ?? null, 0) ?: null;
    $weight = sanitize_float($data['weight'] ?? null, 0.0) ?: null;
    $height = sanitize_float($data['height'] ?? null, 0.0) ?: null;
    $goal = sanitize_nullable_string($data['goal'] ?? null);
    $dietType = sanitize_nullable_string($data['dietType'] ?? $data['diet_type'] ?? null);
    $allergies = sanitize_nullable_string($data['allergies'] ?? null);
    $status = sanitize_string($data['status'] ?? 'Active') ?: 'Active';

    if ($name === '') {
        send_json(['success' => false, 'message' => 'name is required.'], 422);
    }

    $payload = [
        'dietitian_user_id' => $dietitianId,
        'name' => $name,
        'email' => $email,
        'age' => $age,
        'weight' => $weight,
        'height' => $height,
        'goal' => $goal,
        'diet_type' => $dietType,
        'allergies' => $allergies,
        'status' => $status,
    ];

    if ($id > 0) {
        $payload['id'] = $id;

        $stmt = $pdo->prepare(
            'UPDATE app_dietitian_patients
             SET name = :name,
                 email = :email,
                 age = :age,
                 weight = :weight,
                 height = :height,
                 goal = :goal,
                 diet_type = :diet_type,
                 allergies = :allergies,
                 status = :status
             WHERE id = :id AND dietitian_user_id = :dietitian_user_id'
        );
        $stmt->execute($payload);

        send_json([
            'success' => true,
            'message' => 'Patient updated successfully.',
        ]);
        return;
    }

    $stmt = $pdo->prepare(
        'INSERT INTO app_dietitian_patients (dietitian_user_id, name, email, age, weight, height, goal, diet_type, allergies, status)
         VALUES (:dietitian_user_id, :name, :email, :age, :weight, :height, :goal, :diet_type, :allergies, :status)'
    );
    $stmt->execute($payload);

    send_json([
        'success' => true,
        'message' => 'Patient created successfully.',
        'id' => (int) $pdo->lastInsertId(),
    ], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = get_request_data();
    $id = sanitize_int($data['id'] ?? get_query_param('id', 0), 0);

    if ($id <= 0) {
        send_json(['success' => false, 'message' => 'Patient id is required.'], 422);
    }

    $stmt = $pdo->prepare(
        'DELETE FROM app_dietitian_patients WHERE id = :id AND dietitian_user_id = :dietitian_user_id'
    );
    $stmt->execute([
        'id' => $id,
        'dietitian_user_id' => $dietitianId,
    ]);

    send_json([
        'success' => true,
        'message' => 'Patient deleted successfully.',
    ]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
