<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$pdo = get_db();

$stats = [
    'total_users' => (int) $pdo->query('SELECT COUNT(*) FROM users WHERE role = "user"')->fetchColumn(),
    'total_dietitians' => (int) $pdo->query('SELECT COUNT(*) FROM users WHERE role = "dietitian"')->fetchColumn(),
    'total_admins' => (int) $pdo->query('SELECT COUNT(*) FROM users WHERE role = "admin"')->fetchColumn(),
    'total_plans' => (int) $pdo->query('SELECT COUNT(*) FROM meal_plans')->fetchColumn(),
    'total_food_logs' => (int) $pdo->query('SELECT COUNT(*) FROM food_logs')->fetchColumn(),
    'total_feedback' => (int) $pdo->query('SELECT COUNT(*) FROM feedback')->fetchColumn(),
];

send_json([
    'success' => true,
    'data' => $stats,
]);
