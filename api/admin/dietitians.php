<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('admin');

$pdo = get_db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $patientTable = table_exists($pdo, 'dietitian_patients') ? 'dietitian_patients' : (table_exists($pdo, 'app_dietitian_patients') ? 'app_dietitian_patients' : null);
    $patientJoin = '';
    $patientCount = '0 AS patients';

    if ($patientTable === 'dietitian_patients') {
        $patientJoin = 'LEFT JOIN dietitian_patients dp ON dp.dietitian_id = u.id';
        $patientCount = 'COUNT(dp.user_id) AS patients';
    } elseif ($patientTable === 'app_dietitian_patients') {
        $patientJoin = 'LEFT JOIN app_dietitian_patients dp ON dp.dietitian_user_id = u.id';
        $patientCount = 'COUNT(dp.client_user_id) AS patients';
    }

    $stmt = $pdo->query(
        "SELECT u.id, u.name, u.email, u.created_at, {$patientCount}
         FROM users u
         {$patientJoin}
         WHERE LOWER(u.role) = 'dietitian'
         GROUP BY u.id, u.name, u.email, u.created_at
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
    $password = (string) ($data['password'] ?? '');

    if ($name === '' || $email === '') {
        send_json(['success' => false, 'message' => 'name and email are required.'], 422);
    }

    $userPk = user_primary_key_column($pdo);
    $duplicateSql = "SELECT {$userPk} AS id FROM users WHERE LOWER(email) = :email";
    $duplicateParams = ['email' => $email];

    if ($id > 0) {
        $duplicateSql .= " AND {$userPk} <> :id";
        $duplicateParams['id'] = $id;
    }

    $duplicateSql .= ' LIMIT 1';
    $duplicateStmt = $pdo->prepare($duplicateSql);
    $duplicateStmt->execute($duplicateParams);

    if ($duplicateStmt->fetch()) {
        send_json(['success' => false, 'message' => 'Email already exists'], 409);
    }

    if ($id > 0) {
        try {
            $pdo->beginTransaction();

            $params = [
                'id' => $id,
                'name' => $name,
                'email' => $email,
            ];

            $sql = "UPDATE users SET name = :name, email = :email";

            if ($password !== '') {
                $sql .= ', password_hash = :password_hash';
                $params['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
            }

            $sql .= " WHERE {$userPk} = :id AND LOWER(role) = 'dietitian'";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $pdo->commit();
        } catch (PDOException $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            if ((int) ($exception->errorInfo[1] ?? 0) === 1062) {
                send_json(['success' => false, 'message' => 'Email already exists'], 409);
            }
            throw $exception;
        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            send_json(['success' => false, 'message' => 'Unable to update dietitian right now.'], 500);
        }

        send_json([
            'success' => true,
            'message' => 'Dietitian updated successfully.',
        ]);
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            'INSERT INTO users (name, email, password_hash, role)
             VALUES (:name, :email, :password_hash, "dietitian")'
        );
        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'password_hash' => password_hash($password !== '' ? $password : 'ChangeMe123!', PASSWORD_DEFAULT),
        ]);
        $pdo->commit();
    } catch (PDOException $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        if ((int) ($exception->errorInfo[1] ?? 0) === 1062) {
            send_json(['success' => false, 'message' => 'Email already exists'], 409);
        }
        throw $exception;
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        send_json(['success' => false, 'message' => 'Unable to create dietitian right now.'], 500);
    }

    send_json([
        'success' => true,
        'message' => 'Dietitian created successfully.',
        'id' => (int) $pdo->lastInsertId(),
    ], 201);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = get_request_data();
    $id = sanitize_int($data['id'] ?? get_query_param('id', 0), 0);

    if ($id <= 0) {
        send_json(['success' => false, 'message' => 'Dietitian id is required.'], 422);
    }

    $stmt = $pdo->prepare('DELETE FROM users WHERE id = :id AND LOWER(role) = \'dietitian\'');
    $stmt->execute(['id' => $id]);

    send_json([
        'success' => true,
        'message' => 'Dietitian deleted successfully.',
    ]);
}

send_json(['success' => false, 'message' => 'Method not allowed'], 405);
