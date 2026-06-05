<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('dietitian');

$pdo = get_db();
$dietitianId = current_user_id();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare(
        'SELECT f.id, f.patient_id, f.plan_id, f.subject, f.message, f.response, f.status, f.created_at, f.updated_at,
                p.name AS patient_name
         FROM app_feedback f
         INNER JOIN app_dietitian_patients p ON p.id = f.patient_id
         WHERE f.dietitian_user_id = :dietitian_user_id
         ORDER BY f.updated_at DESC, f.created_at DESC'
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
    $patientId = sanitize_int($data['patient_id'] ?? $data['user_id'] ?? 0, 0);
    $planId = sanitize_int($data['plan_id'] ?? 0, 0) ?: null;
    $subject = sanitize_nullable_string($data['subject'] ?? null);
    $message = sanitize_string($data['message'] ?? '');
    $response = sanitize_nullable_string($data['response'] ?? null);
    $status = sanitize_string($data['status'] ?? 'Pending') ?: 'Pending';

    if ($patientId <= 0 || $message === '') {
        send_json(['success' => false, 'message' => 'patient_id and message are required.'], 422);
    }

    if ($id > 0) {
        $stmt = $pdo->prepare(
            'UPDATE app_feedback
             SET subject = :subject,
                 message = :message,
                 response = :response,
                 status = :status
             WHERE id = :id AND dietitian_user_id = :dietitian_user_id'
        );
        $stmt->execute([
            'id' => $id,
            'subject' => $subject,
            'message' => $message,
            'response' => $response,
            'status' => $status,
            'dietitian_user_id' => $dietitianId,
        ]);

        send_json([
            'success' => true,
            'message' => 'Feedback updated successfully.',
        ]);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO app_feedback (patient_id, plan_id, dietitian_user_id, subject, message, response, status)
         VALUES (:patient_id, :plan_id, :dietitian_user_id, :subject, :message, :response, :status)'
    );
    $stmt->execute([
        'patient_id' => $patientId,
        'plan_id' => $planId,
        'dietitian_user_id' => $dietitianId,
        'subject' => $subject,
        'message' => $message,
        'response' => $response,
        'status' => $status,
    ]);

    send_json([
        'success' => true,
        'message' => 'Feedback sent successfully.',
        'id' => (int) $pdo->lastInsertId(),
    ], 201);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
