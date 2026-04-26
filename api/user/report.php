<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('user');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$pdo = get_db();
$userId = current_user_id();
$startDate = sanitize_string(get_query_param('start_date', date('Y-m-d', strtotime('-6 days'))));
$endDate = sanitize_string(get_query_param('end_date', date('Y-m-d')));

$limitStmt = $pdo->prepare('SELECT calorie_limit FROM health_data WHERE user_id = :user_id LIMIT 1');
$limitStmt->execute(['user_id' => $userId]);
$health = $limitStmt->fetch();
$calorieLimit = isset($health['calorie_limit']) ? (int) $health['calorie_limit'] : null;

$reportStmt = $pdo->prepare(
    'SELECT logged_date AS date, SUM(calories) AS total_calories
     FROM food_logs
     WHERE user_id = :user_id AND logged_date BETWEEN :start_date AND :end_date
     GROUP BY logged_date
     ORDER BY logged_date ASC'
);
$reportStmt->execute([
    'user_id' => $userId,
    'start_date' => $startDate,
    'end_date' => $endDate,
]);

$rows = $reportStmt->fetchAll();
$summary = [];

foreach ($rows as $row) {
    $totalCalories = (int) $row['total_calories'];
    $summary[] = [
        'date' => $row['date'],
        'total_calories' => $totalCalories,
        'calorie_limit' => $calorieLimit,
        'exceeded' => $calorieLimit !== null ? $totalCalories > $calorieLimit : false,
    ];
}

send_json([
    'success' => true,
    'data' => $summary,
]);
