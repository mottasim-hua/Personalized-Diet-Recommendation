<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('user');

$pdo = get_db();
$userId = current_user_id();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $date = sanitize_string(get_query_param('date', date('Y-m-d')));

    $query = $pdo->prepare(
        'SELECT id, food_name, calories, meal_type, logged_date, created_at
         FROM app_food_logs
         WHERE user_id = :user_id AND logged_date = :logged_date
         ORDER BY created_at DESC'
    );
    $query->execute([
        'user_id' => $userId,
        'logged_date' => $date,
    ]);

    send_json([
        'success' => true,
        'data' => $query->fetchAll(),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = get_request_data();

    $foodName = sanitize_string($data['food_name'] ?? $data['foodName'] ?? '');
    $calories = sanitize_int($data['calories'] ?? 0, 0);
    $mealType = sanitize_string($data['meal_type'] ?? $data['mealType'] ?? '');
    $loggedDate = sanitize_string($data['date'] ?? $data['logged_date'] ?? date('Y-m-d'));

    if ($foodName === '' || $calories <= 0 || $mealType === '') {
        send_json([
            'success' => false,
            'message' => 'food_name, calories, and meal_type are required.',
        ], 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO app_food_logs (user_id, food_name, calories, meal_type, logged_date)
         VALUES (:user_id, :food_name, :calories, :meal_type, :logged_date)'
    );
    $stmt->execute([
        'user_id' => $userId,
        'food_name' => $foodName,
        'calories' => $calories,
        'meal_type' => $mealType,
        'logged_date' => $loggedDate,
    ]);

    send_json([
        'success' => true,
        'message' => 'Food entry added successfully.',
        'id' => (int) $pdo->lastInsertId(),
    ], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = get_request_data();
    $entryId = sanitize_int($data['id'] ?? get_query_param('id', 0), 0);

    if ($entryId <= 0) {
        send_json(['success' => false, 'message' => 'Food log id is required.'], 422);
    }

    $stmt = $pdo->prepare('DELETE FROM app_food_logs WHERE id = :id AND user_id = :user_id');
    $stmt->execute([
        'id' => $entryId,
        'user_id' => $userId,
    ]);

    send_json([
        'success' => true,
        'message' => 'Food log entry deleted successfully.',
    ]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
