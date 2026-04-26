<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('dietitian');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$pdo = get_db();
$stmt = $pdo->prepare(
    'SELECT u.id, u.name, u.email, u.created_at, dp.assigned_at
     FROM dietitian_patients dp
     INNER JOIN users u ON u.id = dp.user_id
     WHERE dp.dietitian_id = :dietitian_id
     ORDER BY dp.assigned_at DESC'
);
$stmt->execute(['dietitian_id' => current_user_id()]);

send_json([
    'success' => true,
    'data' => $stmt->fetchAll(),
]);
