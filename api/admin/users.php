<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('admin');

$pdo = get_db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userPk = user_primary_key_column($pdo);
    $nameExpr = user_name_expression($pdo, 'u');
    $healthTable = table_exists($pdo, 'health_profiles') ? 'health_profiles' : (table_exists($pdo, 'app_health_data') ? 'app_health_data' : null);
    $summaryTable = table_exists($pdo, 'daily_calorie_summary') ? 'daily_calorie_summary' : null;
    $patientTable = table_exists($pdo, 'dietitian_patients') ? 'dietitian_patients' : (table_exists($pdo, 'app_dietitian_patients') ? 'app_dietitian_patients' : null);
    $planTable = table_exists($pdo, 'meal_plans') ? 'meal_plans' : (table_exists($pdo, 'app_meal_plans') ? 'app_meal_plans' : null);
    $goalTable = table_exists($pdo, 'diet_goals') ? 'diet_goals' : null;
    $healthSelect = 'NULL AS age, NULL AS weight, NULL AS height, NULL AS activity_level, NULL AS dietary_pref, NULL AS health_goal, NULL AS calorie_limit, NULL AS bmi';
    $todayCaloriesSelect = '0 AS food_today';
    $assignedDietitianSelect = 'NULL AS assigned_dietitian_id, NULL AS assigned_dietitian_name, NULL AS plan_status';

    if ($healthTable === 'health_profiles') {
        $healthSelect = 'hp.age AS age, hp.weight AS weight, hp.height AS height, hp.activity_level AS activity_level, hp.dietary_preferences AS dietary_pref, hp.daily_calorie_goal AS calorie_limit, hp.bmi AS bmi';
        $healthJoin = "LEFT JOIN health_profiles hp ON hp.user_id = u.$userPk";
        if ($goalTable) {
            $healthSelect .= ', COALESCE(dg.goal_type, hp.notes, "Other") AS health_goal';
            $healthJoin .= " LEFT JOIN diet_goals dg ON dg.user_id = u.$userPk AND dg.is_active = 1";
        } else {
            $healthSelect .= ', COALESCE(hp.notes, "Other") AS health_goal';
        }
        if ($summaryTable) {
            $todayCaloriesSelect = '(SELECT COALESCE(total_calories, 0) FROM daily_calorie_summary dcs WHERE dcs.user_id = u.' . $userPk . ' AND dcs.summary_date = CURDATE() LIMIT 1) AS food_today';
        }
    } else {
        $healthJoin = '';
        if ($healthTable === 'app_health_data') {
            $healthSelect = 'adh.age AS age, adh.weight AS weight, adh.height AS height, adh.activity_level AS activity_level, adh.dietary_preference AS dietary_pref, adh.calorie_limit AS calorie_limit, ROUND(adh.weight / POW(adh.height / 100, 2), 2) AS bmi, adh.health_goal AS health_goal';
            $healthJoin = "LEFT JOIN app_health_data adh ON adh.user_id = u.$userPk";
            $todayCaloriesSelect = '(SELECT COALESCE(total_calories, 0) FROM daily_calorie_summary dcs WHERE dcs.user_id = u.' . $userPk . ' AND dcs.summary_date = CURDATE() LIMIT 1) AS food_today';
        }
    }

    if ($patientTable) {
        $patientAlias = $patientTable === 'dietitian_patients' ? 'dp' : 'adp';
        $patientUserColumn = $patientTable === 'dietitian_patients' ? 'dietitian_id' : 'dietitian_user_id';
        $clientColumn = $patientTable === 'dietitian_patients' ? 'user_id' : 'client_user_id';
        $assignedDietitianSelect = "(SELECT {$patientAlias}.{$patientUserColumn} FROM {$patientTable} {$patientAlias} WHERE {$patientAlias}.{$clientColumn} = u.$userPk LIMIT 1) AS assigned_dietitian_id, (SELECT d.name FROM users d INNER JOIN {$patientTable} {$patientAlias} ON {$patientAlias}.{$patientUserColumn} = d.$userPk WHERE {$patientAlias}.{$clientColumn} = u.$userPk LIMIT 1) AS assigned_dietitian_name";
    } elseif ($planTable) {
        $planDietitianColumn = $planTable === 'meal_plans' ? 'dietitian_id' : 'dietitian_user_id';
        $planUserColumn = 'user_id';
        $assignedDietitianSelect = "(SELECT p.$planDietitianColumn FROM {$planTable} p WHERE p.$planUserColumn = u.$userPk ORDER BY p.updated_at DESC LIMIT 1) AS assigned_dietitian_id, (SELECT d.name FROM users d INNER JOIN {$planTable} p ON p.$planDietitianColumn = d.$userPk WHERE p.$planUserColumn = u.$userPk ORDER BY p.updated_at DESC LIMIT 1) AS assigned_dietitian_name";
        $assignedDietitianSelect .= ", (SELECT p.status FROM {$planTable} p WHERE p.$planUserColumn = u.$userPk ORDER BY p.updated_at DESC LIMIT 1) AS plan_status";
    }
    
    $stmt = $pdo->query(
        "SELECT u.$userPk as id, 
                $nameExpr as name, 
                u.email, 
                COALESCE(u.phone, '') as phone,
                u.role, 
                u.created_at,
                " . ($healthTable ? $healthSelect . ',' : '') . "
                $todayCaloriesSelect,
                $assignedDietitianSelect
         FROM users u
         " . ($healthTable ? $healthJoin : '') . "
         WHERE LOWER(u.role) = 'user'
         ORDER BY u.created_at DESC"
    );

    send_json([
        'success' => true,
        'data' => $stmt->fetchAll(),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = get_request_data();

    $id = sanitize_int($data['id'] ?? 0, 0);
    $name = sanitize_string($data['name'] ?? '');
    $email = strtolower(sanitize_string($data['email'] ?? ''));
    $phone = sanitize_nullable_string($data['phone'] ?? '');
    $password = (string) ($data['password'] ?? '');

    if ($name === '' || $email === '') {
        send_json(['success' => false, 'message' => 'name and email are required.'], 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        send_json(['success' => false, 'message' => 'Invalid email address.'], 422);
    }

    $userPk = user_primary_key_column($pdo);
    $hasNameColumn = users_has_column($pdo, 'name');
    $hasFirstName = users_has_column($pdo, 'first_name');
    $nameParts = split_full_name($name);

    $duplicateSql = "SELECT $userPk AS id FROM users WHERE LOWER(email) = :email";
    $duplicateParams = ['email' => $email];

    if ($id > 0) {
        $duplicateSql .= " AND $userPk <> :id";
        $duplicateParams['id'] = $id;
    }

    $duplicateSql .= ' LIMIT 1';
    $duplicateStmt = $pdo->prepare($duplicateSql);
    $duplicateStmt->execute($duplicateParams);

    if ($duplicateStmt->fetch()) {
        send_json(['success' => false, 'message' => 'An account with this email already exists.'], 409);
    }

    if ($id > 0) {
        // Update existing user
        try {
            $params = [
                'id' => $id,
                'email' => $email,
            ];

            if ($phone !== null) {
                $params['phone'] = $phone;
            }

            if ($hasNameColumn) {
                $params['name'] = $name;
                $sql = "UPDATE users SET name = :name, email = :email";
            } else {
                $params['first_name'] = $nameParts['first_name'];
                $params['last_name'] = $nameParts['last_name'];
                $sql = "UPDATE users SET first_name = :first_name, last_name = :last_name, email = :email";
            }

            if ($phone !== null) {
                $sql .= ", phone = :phone";
            }

            if ($password !== '') {
                $sql .= ', password_hash = :password_hash';
                $params['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
            }

            $sql .= " WHERE $userPk = :id AND LOWER(role) = 'user'";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } catch (PDOException $exception) {
            if ((int) $exception->errorInfo[1] === 1062) {
                send_json(['success' => false, 'message' => 'An account with this email already exists.'], 409);
            }

            throw $exception;
        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            send_json(['success' => false, 'message' => 'Unable to update user right now.'], 500);
        }

        send_json([
            'success' => true,
            'message' => 'User updated successfully.',
        ]);
    }

    // Create new user
    $passwordHash = password_hash($password !== '' ? $password : 'ChangeMe123!', PASSWORD_DEFAULT);

    try {
        if ($hasNameColumn) {
            $stmt = $pdo->prepare(
                'INSERT INTO users (name, email, phone, password_hash, role) 
                 VALUES (:name, :email, :phone, :password_hash, :role)'
            );
            $stmt->execute([
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'password_hash' => $passwordHash,
                'role' => 'user',
            ]);
        } else {
            // Schema with first_name and last_name
            $stmt = $pdo->prepare(
                'INSERT INTO users (first_name, last_name, email, phone, password_hash, role, gender, date_of_birth) 
                 VALUES (:first_name, :last_name, :email, :phone, :password_hash, :role, :gender, :date_of_birth)'
            );
            $stmt->execute([
                'first_name' => $nameParts['first_name'],
                'last_name' => $nameParts['last_name'],
                'email' => $email,
                'phone' => $phone,
                'password_hash' => $passwordHash,
                'role' => 'user',
                'gender' => 'Other',
                'date_of_birth' => date('Y-m-d'),
            ]);
        }
    } catch (PDOException $exception) {
        if ((int) $exception->errorInfo[1] === 1062) {
            send_json(['success' => false, 'message' => 'An account with this email already exists.'], 409);
        }

        throw $exception;
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        send_json(['success' => false, 'message' => 'Unable to create user right now.'], 500);
    }

    send_json([
        'success' => true,
        'message' => 'User created successfully.',
        'id' => (int) $pdo->lastInsertId(),
    ], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = get_request_data();
    $id = sanitize_int($data['id'] ?? get_query_param('id', 0), 0);

    if ($id <= 0) {
        send_json(['success' => false, 'message' => 'User id is required.'], 422);
    }

    $userPk = user_primary_key_column($pdo);
    $stmt = $pdo->prepare("DELETE FROM users WHERE $userPk = :id AND LOWER(role) = 'user'");
    $stmt->execute(['id' => $id]);

    send_json([
        'success' => true,
        'message' => 'User deleted successfully.',
    ]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
