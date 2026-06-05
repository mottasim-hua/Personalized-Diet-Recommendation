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
    $usersTableExists = (bool) $pdo->query("SHOW TABLES LIKE 'users'")->fetchColumn();

    if (!$usersTableExists) {
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
    }

    migrate_legacy_users_table($pdo);
    ensure_users_login_tracking_columns($pdo);

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS app_health_data (
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
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS app_food_logs (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            food_name VARCHAR(150) NOT NULL,
            calories INT NOT NULL,
            meal_type VARCHAR(50) NOT NULL,
            logged_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $userPk = user_primary_key_column($pdo);

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS app_dietitian_patients (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            dietitian_user_id INT NOT NULL,
            client_user_id INT NULL,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(150) NULL,
            age INT NULL,
            weight DECIMAL(6,2) NULL,
            height DECIMAL(6,2) NULL,
            goal VARCHAR(100) NULL,
            diet_type VARCHAR(100) NULL,
            allergies TEXT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY idx_dietitian_user_id (dietitian_user_id),
            KEY idx_client_user_id (client_user_id),
            CONSTRAINT fk_app_patient_dietitian FOREIGN KEY (dietitian_user_id) REFERENCES users($userPk) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS app_meal_plans (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            patient_id INT UNSIGNED NOT NULL,
            dietitian_user_id INT NOT NULL,
            plan_name VARCHAR(150) NOT NULL,
            start_date DATE NULL,
            end_date DATE NULL,
            calorie_target INT NULL,
            day_count INT NULL,
            days_json LONGTEXT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY idx_patient_id (patient_id),
            KEY idx_dietitian_user_id (dietitian_user_id),
            CONSTRAINT fk_app_plan_patient FOREIGN KEY (patient_id) REFERENCES app_dietitian_patients(id) ON DELETE CASCADE,
            CONSTRAINT fk_app_plan_dietitian FOREIGN KEY (dietitian_user_id) REFERENCES users($userPk) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS app_feedback (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            patient_id INT UNSIGNED NOT NULL,
            plan_id INT UNSIGNED NULL,
            dietitian_user_id INT NOT NULL,
            subject VARCHAR(150) NULL,
            message TEXT NOT NULL,
            response TEXT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY idx_patient_id (patient_id),
            KEY idx_plan_id (plan_id),
            KEY idx_dietitian_user_id (dietitian_user_id),
            CONSTRAINT fk_app_feedback_patient FOREIGN KEY (patient_id) REFERENCES app_dietitian_patients(id) ON DELETE CASCADE,
            CONSTRAINT fk_app_feedback_plan FOREIGN KEY (plan_id) REFERENCES app_meal_plans(id) ON DELETE SET NULL,
            CONSTRAINT fk_app_feedback_dietitian FOREIGN KEY (dietitian_user_id) REFERENCES users($userPk) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS dietitians (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL UNIQUE,
            license_number VARCHAR(50) UNIQUE,
            specialization VARCHAR(200),
            experience_years INT,
            max_patients INT DEFAULT 50,
            current_patient_count INT DEFAULT 0,
            bio TEXT,
            is_available BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_dietitian_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS admins (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL UNIQUE,
            permission_level ENUM("Super Admin", "Admin", "Moderator") DEFAULT "Admin",
            department VARCHAR(100),
            can_manage_users BOOLEAN DEFAULT FALSE,
            can_manage_dietitians BOOLEAN DEFAULT FALSE,
            can_manage_food_database BOOLEAN DEFAULT FALSE,
            can_view_reports BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS food_items (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            food_name VARCHAR(150) NOT NULL UNIQUE,
            category ENUM("Grain", "Protein", "Vegetable", "Fruit", "Dairy", "Fat", "Beverage", "Other") NOT NULL,
            calories_per_100g INT,
            protein_g DECIMAL(5,2),
            carbs_g DECIMAL(5,2),
            fat_g DECIMAL(5,2),
            fiber_g DECIMAL(5,2),
            is_available BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS diet_goals (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            goal_type ENUM("Weight Loss", "Weight Gain", "Maintenance") NOT NULL,
            target_weight DECIMAL(5,2),
            current_weight DECIMAL(5,2),
            target_date DATE,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS daily_calorie_summary (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            summary_date DATE NOT NULL,
            total_calories INT DEFAULT 0,
            total_protein DECIMAL(7,2) DEFAULT 0,
            total_carbs DECIMAL(7,2) DEFAULT 0,
            total_fat DECIMAL(7,2) DEFAULT 0,
            total_fiber DECIMAL(7,2) DEFAULT 0,
            calorie_goal INT,
            exceeded_limit BOOLEAN DEFAULT FALSE,
            meal_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_date (user_id, summary_date),
            CONSTRAINT fk_summary_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS calorie_warnings (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            warning_date DATE NOT NULL,
            daily_goal INT,
            calories_consumed INT,
            excess_calories INT,
            warning_level ENUM("Caution", "Warning", "Critical") DEFAULT "Caution",
            user_notified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_warning_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS meal_plan_items (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            plan_id INT UNSIGNED NOT NULL,
            food_id INT UNSIGNED NOT NULL,
            meal_day INT,
            meal_type ENUM("Breakfast", "Lunch", "Dinner", "Snack") NOT NULL,
            recommended_portion DECIMAL(5,2),
            calories_target INT,
            preparation_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_mpi_plan FOREIGN KEY (plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
            CONSTRAINT fk_mpi_food FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE RESTRICT
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

function user_primary_key_column(PDO $pdo): string
{
    return users_has_column($pdo, 'user_id') ? 'user_id' : 'id';
}

function user_name_expression(PDO $pdo, string $alias = 'u'): string
{
    if (users_has_column($pdo, 'name')) {
        return "$alias.name";
    }

    if (users_has_column($pdo, 'first_name') && users_has_column($pdo, 'last_name')) {
        return "TRIM(CONCAT(COALESCE($alias.first_name, ''), ' ', COALESCE($alias.last_name, '')))";
    }

    return "$alias.email";
}

function user_role_expression(string $alias = 'u'): string
{
    return "LOWER($alias.role)";
}

function normalize_user_role(string $role): string
{
    return strtolower(trim($role));
}

function split_full_name(string $name): array
{
    $trimmed = trim($name);

    if ($trimmed === '') {
        return ['first_name' => '', 'last_name' => ''];
    }

    $parts = preg_split('/\s+/', $trimmed) ?: [];
    $firstName = array_shift($parts) ?: '';
    $lastName = trim(implode(' ', $parts));

    return [
        'first_name' => $firstName,
        'last_name' => $lastName,
    ];
}

function ensure_users_login_tracking_columns(PDO $pdo): void
{
    $columns = get_users_columns($pdo);

    if (!in_array('last_login_at', $columns, true)) {
        $pdo->exec('ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL DEFAULT NULL AFTER created_at');
    }
}
