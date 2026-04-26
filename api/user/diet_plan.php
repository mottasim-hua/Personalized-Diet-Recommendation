<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('user');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$pdo = get_db();
$stmt = $pdo->prepare(
    'SELECT mp.id, mp.title, mp.plan_type, mp.calories, mp.duration_days, mp.meals_json, mp.notes, mp.assigned_by_role,
            mp.assigned_at, mp.updated_at, u.name AS dietitian_name
     FROM meal_plans mp
     LEFT JOIN users u ON u.id = mp.dietitian_id
     WHERE mp.user_id = :user_id
     ORDER BY mp.updated_at DESC
     LIMIT 1'
);
$stmt->execute(['user_id' => current_user_id()]);
$plan = $stmt->fetch();

if ($plan) {
    $plan['meals'] = $plan['meals_json'] ? json_decode((string) $plan['meals_json'], true) : null;
}

send_json([
    'success' => true,
    'data' => $plan ?: null,
]);
