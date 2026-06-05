<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('user');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$pdo = get_db();
$userPk = user_primary_key_column($pdo);
$dietitianNameExpr = user_name_expression($pdo, 'u');
$stmt = $pdo->prepare(
    "SELECT mp.id, mp.plan_name, mp.start_date, mp.end_date, mp.calorie_target, mp.day_count, mp.days_json,
            mp.status, mp.created_at, mp.updated_at, $dietitianNameExpr AS dietitian_name
     FROM app_dietitian_patients p
     INNER JOIN app_meal_plans mp ON mp.patient_id = p.id
     LEFT JOIN users u ON u.$userPk = mp.dietitian_user_id
     WHERE p.client_user_id = :user_id
     ORDER BY mp.updated_at DESC
     LIMIT 1"
);
$stmt->execute(['user_id' => current_user_id()]);
$plan = $stmt->fetch();

if ($plan) {
    $plan['days'] = $plan['days_json'] ? json_decode((string) $plan['days_json'], true) : [];
}

send_json([
    'success' => true,
    'data' => $plan ?: null,
]);
