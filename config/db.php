<?php

declare(strict_types=1);

require_once __DIR__ . '/cors.php';

const DB_HOST = '127.0.0.1';
const DB_PORT = 3306;
const DB_NAME = 'diet_system';
const DB_USER = 'root';
const DB_PASS = '';

function send_json(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function get_request_data(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);

    if (is_array($data)) {
        return $data;
    }

    return $_POST ?: [];
}

function sanitize_string(mixed $value): string
{
    return htmlspecialchars(trim((string) $value), ENT_QUOTES, 'UTF-8');
}

function sanitize_nullable_string(mixed $value): ?string
{
    $sanitized = sanitize_string($value);

    return $sanitized === '' ? null : $sanitized;
}

function sanitize_int(mixed $value, int $default = 0): int
{
    if ($value === null || $value === '') {
        return $default;
    }

    return (int) filter_var($value, FILTER_SANITIZE_NUMBER_INT);
}

function sanitize_float(mixed $value, float $default = 0.0): float
{
    if ($value === null || $value === '') {
        return $default;
    }

    return (float) filter_var($value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
}

function get_query_param(string $key, mixed $default = null): mixed
{
    return $_GET[$key] ?? $default;
}

function get_db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    try {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    } catch (PDOException $exception) {
        send_json([
            'success' => false,
            'message' => 'Database connection failed. Check MySQL service and database configuration.',
            'error' => $exception->getMessage(),
        ], 500);
    }

    ensure_schema($pdo);

    return $pdo;
}

function ensure_schema(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS users (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM("user", "dietitian", "admin") NOT NULL DEFAULT "user",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    migrate_legacy_users_table($pdo);

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS health_data (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL UNIQUE,
            age INT NULL,
            gender VARCHAR(20) NULL,
            weight DECIMAL(6,2) NULL,
            height DECIMAL(6,2) NULL,
            activity_level VARCHAR(50) NULL,
            dietary_preference VARCHAR(50) NULL,
            health_goal VARCHAR(50) NULL,
            calorie_limit INT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_health_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS food_logs (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            food_name VARCHAR(150) NOT NULL,
            calories INT NOT NULL,
            meal_type VARCHAR(50) NOT NULL,
            logged_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_food_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS dietitian_patients (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            dietitian_id INT UNSIGNED NOT NULL,
            user_id INT UNSIGNED NOT NULL,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_dietitian_patient (dietitian_id, user_id),
            CONSTRAINT fk_dp_dietitian FOREIGN KEY (dietitian_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_dp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS meal_plans (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            dietitian_id INT UNSIGNED NULL,
            title VARCHAR(150) NOT NULL,
            plan_type VARCHAR(50) NULL,
            calories INT NULL,
            duration_days INT NULL,
            meals_json LONGTEXT NULL,
            notes TEXT NULL,
            assigned_by_role VARCHAR(20) NOT NULL DEFAULT "dietitian",
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_plan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_plan_dietitian FOREIGN KEY (dietitian_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS feedback (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            dietitian_id INT UNSIGNED NOT NULL,
            subject VARCHAR(150) NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_feedback_dietitian FOREIGN KEY (dietitian_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
}

function migrate_legacy_users_table(PDO $pdo): void
{
    $columns = get_users_columns($pdo);

    if (!in_array('password_hash', $columns, true)) {
        $pdo->exec('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL AFTER email');
        $columns[] = 'password_hash';
    }

    if (in_array('password', $columns, true)) {
        $legacyUsers = $pdo->query(
            'SELECT id, password, password_hash FROM users'
        )->fetchAll();

        $update = $pdo->prepare(
            'UPDATE users SET password_hash = :password_hash WHERE id = :id'
        );

        foreach ($legacyUsers as $user) {
            $legacyPassword = (string) ($user['password'] ?? '');
            $currentHash = (string) ($user['password_hash'] ?? '');

            if ($legacyPassword === '' || $currentHash !== '') {
                continue;
            }

            $passwordInfo = password_get_info($legacyPassword);
            $hashToStore = $passwordInfo['algo'] !== null
                ? $legacyPassword
                : password_hash($legacyPassword, PASSWORD_DEFAULT);

            $update->execute([
                'id' => (int) $user['id'],
                'password_hash' => $hashToStore,
            ]);
        }

        // Legacy dumps often require the old password column on INSERT.
        // Make it nullable after migration so the app can rely on password_hash.
        $pdo->exec('ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL');
    }
}

function get_users_columns(PDO $pdo): array
{
    static $columns = null;

    if (is_array($columns)) {
        return $columns;
    }

    $columns = [];
    $stmt = $pdo->query('SHOW COLUMNS FROM users');

    foreach ($stmt->fetchAll() as $column) {
        $columns[] = $column['Field'];
    }

    return $columns;
}

function users_has_column(PDO $pdo, string $column): bool
{
    return in_array($column, get_users_columns($pdo), true);
}
