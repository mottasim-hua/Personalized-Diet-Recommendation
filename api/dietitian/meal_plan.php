<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('dietitian');

$pdo = get_db();
$dietitianId = current_user_id();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare(
        'SELECT mp.id, mp.patient_id, mp.plan_name, mp.start_date, mp.end_date, mp.calorie_target,
                mp.day_count, mp.days_json, mp.status, mp.created_at, mp.updated_at,
                p.name AS patient_name, p.goal, p.diet_type
         FROM app_meal_plans mp
         INNER JOIN app_dietitian_patients p ON p.id = mp.patient_id
         WHERE mp.dietitian_user_id = :dietitian_user_id
         ORDER BY mp.updated_at DESC, mp.created_at DESC'
    );
    $stmt->execute(['dietitian_user_id' => $dietitianId]);
    $plans = $stmt->fetchAll();

    foreach ($plans as &$plan) {
        $plan['days'] = $plan['days_json'] ? json_decode((string) $plan['days_json'], true) : [];
        unset($plan['days_json']);
    }

    send_json([
        'success' => true,
        'data' => $plans,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = get_request_data();

    $id = sanitize_int($data['id'] ?? 0, 0);
    $patientId = sanitize_int($data['patient_id'] ?? $data['user_id'] ?? 0, 0);
    $planName = sanitize_string($data['plan_name'] ?? $data['title'] ?? $data['planName'] ?? '');
    $startDate = sanitize_nullable_string($data['start_date'] ?? $data['startDate'] ?? null);
    $endDate = sanitize_nullable_string($data['end_date'] ?? $data['endDate'] ?? null);
    $calorieTarget = sanitize_int($data['calorie_target'] ?? $data['calorieTarget'] ?? 0, 0) ?: null;
    $dayCount = sanitize_int($data['day_count'] ?? $data['dayCount'] ?? 0, 0) ?: null;
    $days = $data['days'] ?? null;
    $daysJson = $days !== null ? json_encode($days, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;

    if ($patientId <= 0 || $planName === '') {
        send_json(['success' => false, 'message' => 'patient_id and plan_name are required.'], 422);
    }

    $patientCheck = $pdo->prepare(
        'SELECT id FROM app_dietitian_patients WHERE id = :id AND dietitian_user_id = :dietitian_user_id LIMIT 1'
    );
    $patientCheck->execute([
        'id' => $patientId,
        'dietitian_user_id' => $dietitianId,
    ]);

    if (!$patientCheck->fetch()) {
        send_json(['success' => false, 'message' => 'Assigned patient not found.'], 404);
    }

    $payload = [
        'patient_id' => $patientId,
        'dietitian_user_id' => $dietitianId,
        'plan_name' => $planName,
        'start_date' => $startDate,
        'end_date' => $endDate,
        'calorie_target' => $calorieTarget,
        'day_count' => $dayCount,
        'days_json' => $daysJson,
        'status' => 'Active',
    ];

    if ($id > 0) {
        $payload['id'] = $id;
        $stmt = $pdo->prepare(
            'UPDATE app_meal_plans
             SET patient_id = :patient_id,
                 plan_name = :plan_name,
                 start_date = :start_date,
                 end_date = :end_date,
                 calorie_target = :calorie_target,
                 day_count = :day_count,
                 days_json = :days_json,
                 status = :status
             WHERE id = :id AND dietitian_user_id = :dietitian_user_id'
        );
        $stmt->execute($payload);

        send_json([
            'success' => true,
            'message' => 'Meal plan updated successfully.',
            'id' => $id,
        ]);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO app_meal_plans (patient_id, dietitian_user_id, plan_name, start_date, end_date, calorie_target, day_count, days_json, status)
         VALUES (:patient_id, :dietitian_user_id, :plan_name, :start_date, :end_date, :calorie_target, :day_count, :days_json, :status)'
    );
    $stmt->execute($payload);
    $planId = (int) $pdo->lastInsertId();

    $feedbackStmt = $pdo->prepare(
        'INSERT INTO app_feedback (patient_id, plan_id, dietitian_user_id, subject, message, status)
         VALUES (:patient_id, :plan_id, :dietitian_user_id, :subject, :message, :status)'
    );
    $feedbackStmt->execute([
        'patient_id' => $patientId,
        'plan_id' => $planId,
        'dietitian_user_id' => $dietitianId,
        'subject' => 'Meal Plan Assigned',
        'message' => 'A new meal plan has been assigned. Follow up on adherence, progress, and comfort.',
        'status' => 'Pending',
    ]);

    send_json([
        'success' => true,
        'message' => 'Meal plan created successfully.',
        'id' => $planId,
    ], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = get_request_data();
    $id = sanitize_int($data['id'] ?? get_query_param('id', 0), 0);

    if ($id <= 0) {
        send_json(['success' => false, 'message' => 'Meal plan id is required.'], 422);
    }

    $stmt = $pdo->prepare(
        'DELETE FROM app_meal_plans WHERE id = :id AND dietitian_user_id = :dietitian_user_id'
    );
    $stmt->execute([
        'id' => $id,
        'dietitian_user_id' => $dietitianId,
    ]);

    send_json([
        'success' => true,
        'message' => 'Meal plan deleted successfully.',
    ]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
