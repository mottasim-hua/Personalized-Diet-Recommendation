<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('dietitian');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$pdo = get_db();
$data = get_request_data();

$userId = sanitize_int($data['user_id'] ?? 0, 0);
$title = sanitize_string($data['title'] ?? $data['name'] ?? 'Personalized Meal Plan');
$planType = sanitize_nullable_string($data['plan_type'] ?? $data['type'] ?? null);
$calories = sanitize_int($data['calories'] ?? 0, 0) ?: null;
$durationDays = sanitize_int($data['duration_days'] ?? $data['duration'] ?? 0, 0) ?: null;
$notes = sanitize_nullable_string($data['notes'] ?? null);
$meals = $data['meals'] ?? null;
$mealsJson = $meals !== null ? json_encode($meals, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;

if ($userId <= 0) {
    send_json(['success' => false, 'message' => 'user_id is required.'], 422);
}

$userCheck = $pdo->prepare('SELECT id FROM users WHERE id = :id AND role = "user" LIMIT 1');
$userCheck->execute(['id' => $userId]);
if (!$userCheck->fetch()) {
    send_json(['success' => false, 'message' => 'Assigned user was not found.'], 404);
}

$pdo->prepare(
    'INSERT IGNORE INTO dietitian_patients (dietitian_id, user_id) VALUES (:dietitian_id, :user_id)'
)->execute([
    'dietitian_id' => current_user_id(),
    'user_id' => $userId,
]);

$existing = $pdo->prepare(
    'SELECT id FROM meal_plans WHERE user_id = :user_id AND dietitian_id = :dietitian_id LIMIT 1'
);
$existing->execute([
    'user_id' => $userId,
    'dietitian_id' => current_user_id(),
]);
$plan = $existing->fetch();

if ($plan) {
    $stmt = $pdo->prepare(
        'UPDATE meal_plans
         SET title = :title,
             plan_type = :plan_type,
             calories = :calories,
             duration_days = :duration_days,
             meals_json = :meals_json,
             notes = :notes,
             assigned_by_role = "dietitian"
         WHERE id = :id'
    );
    $stmt->execute([
        'id' => $plan['id'],
        'title' => $title,
        'plan_type' => $planType,
        'calories' => $calories,
        'duration_days' => $durationDays,
        'meals_json' => $mealsJson,
        'notes' => $notes,
    ]);

    send_json([
        'success' => true,
        'message' => 'Meal plan updated successfully.',
        'plan_id' => (int) $plan['id'],
    ]);
}

$stmt = $pdo->prepare(
    'INSERT INTO meal_plans (user_id, dietitian_id, title, plan_type, calories, duration_days, meals_json, notes, assigned_by_role)
     VALUES (:user_id, :dietitian_id, :title, :plan_type, :calories, :duration_days, :meals_json, :notes, "dietitian")'
);
$stmt->execute([
    'user_id' => $userId,
    'dietitian_id' => current_user_id(),
    'title' => $title,
    'plan_type' => $planType,
    'calories' => $calories,
    'duration_days' => $durationDays,
    'meals_json' => $mealsJson,
    'notes' => $notes,
]);

send_json([
    'success' => true,
    'message' => 'Meal plan created successfully.',
    'plan_id' => (int) $pdo->lastInsertId(),
], 201);
