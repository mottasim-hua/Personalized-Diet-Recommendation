CREATE DATABASE IF NOT EXISTS diet_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE diet_system;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS meal_plan_items;
DROP TABLE IF EXISTS app_feedback;
DROP TABLE IF EXISTS app_meal_plans;
DROP TABLE IF EXISTS app_dietitian_patients;
DROP TABLE IF EXISTS app_food_logs;
DROP TABLE IF EXISTS app_health_data;
DROP TABLE IF EXISTS calorie_warnings;
DROP TABLE IF EXISTS daily_calorie_summary;
DROP TABLE IF EXISTS diet_goals;
DROP TABLE IF EXISTS dietitians;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS food_items;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS dietitian_patients;
DROP TABLE IF EXISTS health_profiles;
DROP TABLE IF EXISTS food_logs;
DROP TABLE IF EXISTS app_settings;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NULL,
    first_name VARCHAR(50) NULL,
    last_name VARCHAR(50) NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    gender VARCHAR(20) NULL,
    date_of_birth DATE NULL,
    password VARCHAR(255) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    KEY idx_email (email),
    KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE health_profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    weight DECIMAL(5, 2) NULL,
    height DECIMAL(5, 2) NULL,
    activity_level VARCHAR(50) NOT NULL,
    bmi DECIMAL(4, 2) NULL,
    daily_calorie_goal INT NULL,
    medical_conditions TEXT NULL,
    allergies TEXT NULL,
    dietary_preferences TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_health_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE diet_goals (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    goal_type ENUM('Weight Loss', 'Weight Gain', 'Maintenance') NOT NULL,
    target_weight DECIMAL(5, 2) NULL,
    current_weight DECIMAL(5, 2) NULL,
    target_date DATE NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE food_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    food_name VARCHAR(150) NOT NULL UNIQUE,
    category ENUM('Grain', 'Protein', 'Vegetable', 'Fruit', 'Dairy', 'Fat', 'Beverage', 'Other') NOT NULL,
    calories_per_100g INT NULL,
    protein_g DECIMAL(5, 2) NULL,
    carbs_g DECIMAL(5, 2) NULL,
    fat_g DECIMAL(5, 2) NULL,
    fiber_g DECIMAL(5, 2) NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE food_logs (
    log_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    food_id INT UNSIGNED NOT NULL,
    portion_size DECIMAL(5, 2) NULL,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
    log_date DATE NOT NULL,
    log_time TIME NULL,
    calories_consumed INT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_food_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_food_logs_food FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE daily_calorie_summary (
    summary_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    summary_date DATE NOT NULL,
    total_calories INT DEFAULT 0,
    total_protein DECIMAL(7, 2) DEFAULT 0,
    total_carbs DECIMAL(7, 2) DEFAULT 0,
    total_fat DECIMAL(7, 2) DEFAULT 0,
    total_fiber DECIMAL(7, 2) DEFAULT 0,
    calorie_goal INT NULL,
    exceeded_limit BOOLEAN DEFAULT FALSE,
    meal_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, summary_date),
    CONSTRAINT fk_summary_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE calorie_warnings (
    warning_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    warning_date DATE NOT NULL,
    daily_goal INT NULL,
    calories_consumed INT NULL,
    excess_calories INT NULL,
    warning_level ENUM('Caution', 'Warning', 'Critical') DEFAULT 'Caution',
    user_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_warning_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE dietitians (
    dietitian_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    license_number VARCHAR(50) UNIQUE,
    specialization TEXT NULL,
    experience_years INT NULL,
    max_patients INT DEFAULT 50,
    current_patient_count INT DEFAULT 0,
    bio TEXT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dietitian_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admins (
    admin_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    permission_level ENUM('Super Admin', 'Admin', 'Moderator') DEFAULT 'Admin',
    department VARCHAR(100) NULL,
    can_manage_users BOOLEAN DEFAULT FALSE,
    can_manage_dietitians BOOLEAN DEFAULT FALSE,
    can_manage_food_database BOOLEAN DEFAULT FALSE,
    can_view_reports BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE dietitian_patients (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dietitian_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NULL,
    age INT NULL,
    weight DECIMAL(6, 2) NULL,
    height DECIMAL(6, 2) NULL,
    goal VARCHAR(100) NULL,
    diet_type VARCHAR(100) NULL,
    allergies TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_dietitian_patient (dietitian_id, user_id),
    CONSTRAINT fk_dietitian_patients_dietitian FOREIGN KEY (dietitian_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_dietitian_patients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE meal_plans (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    dietitian_id INT UNSIGNED NULL,
    title VARCHAR(150) NOT NULL,
    plan_type VARCHAR(100) NULL,
    calories INT NULL,
    duration_days INT NULL,
    meals_json LONGTEXT NULL,
    notes TEXT NULL,
    assigned_by_role VARCHAR(20) NOT NULL DEFAULT 'admin',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_user_id (user_id),
    KEY idx_dietitian_id (dietitian_id),
    CONSTRAINT fk_meal_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_meal_plans_dietitian FOREIGN KEY (dietitian_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE meal_plan_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plan_id INT UNSIGNED NOT NULL,
    food_id INT UNSIGNED NOT NULL,
    meal_day INT NULL,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
    recommended_portion DECIMAL(5, 2) NULL,
    calories_target INT NULL,
    preparation_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mpi_plan FOREIGN KEY (plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_mpi_food FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE app_health_data (
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
    CONSTRAINT fk_app_health_data_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE app_food_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    food_name VARCHAR(150) NOT NULL,
    calories INT NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    logged_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_food_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE app_dietitian_patients (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dietitian_user_id INT UNSIGNED NOT NULL,
    client_user_id INT UNSIGNED NULL,
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
    CONSTRAINT fk_app_patient_dietitian FOREIGN KEY (dietitian_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_patient_client FOREIGN KEY (client_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE app_meal_plans (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id INT UNSIGNED NOT NULL,
    dietitian_user_id INT UNSIGNED NOT NULL,
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
    CONSTRAINT fk_app_plan_dietitian FOREIGN KEY (dietitian_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE app_feedback (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id INT UNSIGNED NOT NULL,
    plan_id INT UNSIGNED NULL,
    dietitian_user_id INT UNSIGNED NOT NULL,
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
    CONSTRAINT fk_app_feedback_dietitian FOREIGN KEY (dietitian_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE app_settings (
    id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    site_name VARCHAR(150) NOT NULL DEFAULT 'Personalized Diet Recommendation System',
    default_calorie_limit INT NOT NULL DEFAULT 2000,
    allow_self_registration TINYINT(1) NOT NULL DEFAULT 1,
    default_role VARCHAR(20) NOT NULL DEFAULT 'user',
    email_alerts TINYINT(1) NOT NULL DEFAULT 1,
    new_registration_alerts TINYINT(1) NOT NULL DEFAULT 1,
    alert_threshold INT NOT NULL DEFAULT 20,
    admin_name VARCHAR(150) NOT NULL DEFAULT 'Admin User',
    admin_email VARCHAR(150) NOT NULL DEFAULT 'admin@diet.com',
    admin_avatar VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO app_settings (
    id, site_name, default_calorie_limit, allow_self_registration,
    default_role, email_alerts, new_registration_alerts,
    alert_threshold, admin_name, admin_email
) VALUES (
    1, 'Personalized Diet Recommendation System', 2000, 1,
    'user', 1, 1,
    20, 'Admin User', 'admin@diet.com'
) ON DUPLICATE KEY UPDATE
    site_name = VALUES(site_name),
    default_calorie_limit = VALUES(default_calorie_limit),
    allow_self_registration = VALUES(allow_self_registration),
    default_role = VALUES(default_role),
    email_alerts = VALUES(email_alerts),
    new_registration_alerts = VALUES(new_registration_alerts),
    alert_threshold = VALUES(alert_threshold),
    admin_name = VALUES(admin_name),
    admin_email = VALUES(admin_email);

