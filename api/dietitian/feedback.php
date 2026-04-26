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
$subject = sanitize_nullable_string($data['subject'] ?? null);
$message = sanitize_string($data['message'] ?? '');

if ($userId <= 0 || $message === '') {
    send_json([
        'success' => false,
        'message' => 'user_id and message are required.',
    ], 422);
}

$stmt = $pdo->prepare(
    'INSERT INTO feedback (user_id, dietitian_id, subject, message)
     VALUES (:user_id, :dietitian_id, :subject, :message)'
);
$stmt->execute([
    'user_id' => $userId,
    'dietitian_id' => current_user_id(),
    'subject' => $subject,
    'message' => $message,
]);

send_json([
    'success' => true,
    'message' => 'Feedback sent successfully.',
    'feedback_id' => (int) $pdo->lastInsertId(),
], 201);
