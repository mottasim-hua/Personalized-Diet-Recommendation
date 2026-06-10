<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('user');

$pdo = get_db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = current_user_id();
    $query = $pdo->prepare(
        'SELECT age, gender, weight, height, activity_level, dietary_preference, health_goal, calorie_limit, updated_at
         FROM app_health_data
         WHERE user_id = :user_id
         LIMIT 1'
    );
    $query->execute(['user_id' => $userId]);
    $profile = $query->fetch();

    send_json([
        'success' => true,
        'data' => $profile ?: null,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = get_request_data();
    $sessionUserId = current_user_id();
    $postedUserId = sanitize_int($data['user_id'] ?? 0, 0);
    $userId = $sessionUserId > 0 ? $sessionUserId : $postedUserId;

    if ($userId <= 0) {
        send_json(['success' => false, 'message' => 'Unable to determine the current user. Please log in again.'], 401);
    }

    if ($postedUserId > 0 && $sessionUserId > 0 && $postedUserId !== $sessionUserId) {
        send_json(['success' => false, 'message' => 'User mismatch detected. Please log in again.'], 403);
    }

    $payload = [
        'user_id' => $userId,
        'age' => sanitize_int($data['age'] ?? null, 0) ?: null,
        'gender' => sanitize_nullable_string($data['gender'] ?? null),
        'weight' => sanitize_float($data['weight'] ?? null, 0.0) ?: null,
        'height' => sanitize_float($data['height'] ?? null, 0.0) ?: null,
        'activity_level' => sanitize_nullable_string($data['activity_level'] ?? $data['activityLevel'] ?? null),
        'dietary_preference' => sanitize_nullable_string($data['dietary_preference'] ?? $data['dietaryPreference'] ?? null),
        'health_goal' => sanitize_nullable_string($data['health_goal'] ?? $data['healthGoal'] ?? null),
        'calorie_limit' => sanitize_int($data['calorie_limit'] ?? $data['calorieLimit'] ?? null, 0) ?: null,
    ];

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            'INSERT INTO app_health_data (user_id, age, gender, weight, height, activity_level, dietary_preference, health_goal, calorie_limit)
             VALUES (:user_id, :age, :gender, :weight, :height, :activity_level, :dietary_preference, :health_goal, :calorie_limit)
             ON DUPLICATE KEY UPDATE
                age = VALUES(age),
                gender = VALUES(gender),
                weight = VALUES(weight),
                height = VALUES(height),
                activity_level = VALUES(activity_level),
                dietary_preference = VALUES(dietary_preference),
                health_goal = VALUES(health_goal),
                calorie_limit = VALUES(calorie_limit)'
        );
        $stmt->execute($payload);
        $pdo->commit();
    } catch (PDOException $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $exception;
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        send_json(['success' => false, 'message' => 'Unable to save health profile right now.'], 500);
    }

    send_json([
        'success' => true,
        'message' => 'Health profile saved successfully.',
        'data' => $payload,
    ]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
