<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('admin');

$pdo = get_db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query(
        'SELECT mp.id, mp.user_id, mp.dietitian_id, mp.title, mp.plan_type, mp.calories, mp.duration_days, mp.notes, mp.assigned_by_role,
                mp.assigned_at, mp.updated_at, u.name AS user_name, u.email AS user_email,
                d.name AS dietitian_name
         FROM meal_plans mp
         INNER JOIN users u ON u.id = mp.user_id
         LEFT JOIN users d ON d.id = mp.dietitian_id
         ORDER BY mp.updated_at DESC'
    );

    $plans = $stmt->fetchAll();
    foreach ($plans as &$plan) {
        $plan['meals'] = null;
    }

    send_json([
        'success' => true,
        'data' => $plans,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = get_request_data();

    $planId = sanitize_int($data['id'] ?? 0, 0);
    $userId = sanitize_int($data['user_id'] ?? 0, 0);
    $dietitianId = sanitize_int($data['dietitian_id'] ?? 0, 0) ?: null;
    $title = sanitize_string($data['title'] ?? $data['name'] ?? 'Admin Assigned Plan');
    $planType = sanitize_nullable_string($data['plan_type'] ?? $data['type'] ?? null);
    $calories = sanitize_int($data['calories'] ?? 0, 0) ?: null;
    $durationDays = sanitize_int($data['duration_days'] ?? $data['duration'] ?? 0, 0) ?: null;
    $notes = sanitize_nullable_string($data['notes'] ?? null);
    $meals = $data['meals'] ?? null;
    $mealsJson = $meals !== null ? json_encode($meals, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;

    if ($userId <= 0) {
        send_json(['success' => false, 'message' => 'user_id is required.'], 422);
    }

    if ($dietitianId !== null) {
        $pdo->prepare(
            'INSERT IGNORE INTO dietitian_patients (dietitian_id, user_id) VALUES (:dietitian_id, :user_id)'
        )->execute([
            'dietitian_id' => $dietitianId,
            'user_id' => $userId,
        ]);
    }

    if ($planId > 0) {
        $stmt = $pdo->prepare(
            'UPDATE meal_plans
             SET user_id = :user_id,
                 dietitian_id = :dietitian_id,
                 title = :title,
                 plan_type = :plan_type,
                 calories = :calories,
                 duration_days = :duration_days,
                 meals_json = :meals_json,
                 notes = :notes,
                 assigned_by_role = "admin"
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $planId,
            'user_id' => $userId,
            'dietitian_id' => $dietitianId,
            'title' => $title,
            'plan_type' => $planType,
            'calories' => $calories,
            'duration_days' => $durationDays,
            'meals_json' => $mealsJson,
            'notes' => $notes,
        ]);

        send_json([
            'success' => true,
            'message' => 'Plan updated successfully.',
        ]);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO meal_plans (user_id, dietitian_id, title, plan_type, calories, duration_days, meals_json, notes, assigned_by_role)
         VALUES (:user_id, :dietitian_id, :title, :plan_type, :calories, :duration_days, :meals_json, :notes, "admin")'
    );
    $stmt->execute([
        'user_id' => $userId,
        'dietitian_id' => $dietitianId,
        'title' => $title,
        'plan_type' => $planType,
        'calories' => $calories,
        'duration_days' => $durationDays,
        'meals_json' => $mealsJson,
        'notes' => $notes,
    ]);

    send_json([
        'success' => true,
        'message' => 'Plan assigned successfully.',
        'id' => (int) $pdo->lastInsertId(),
    ], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = get_request_data();
    $planId = sanitize_int($data['id'] ?? get_query_param('id', 0), 0);

    if ($planId <= 0) {
        send_json(['success' => false, 'message' => 'Plan id is required.'], 422);
    }

    $stmt = $pdo->prepare('DELETE FROM meal_plans WHERE id = :id');
    $stmt->execute(['id' => $planId]);

    send_json([
        'success' => true,
        'message' => 'Plan deleted successfully.',
    ]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
