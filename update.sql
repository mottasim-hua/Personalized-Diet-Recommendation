-- =====================================================
-- SIMPLIFIED DIET SYSTEM DATABASE SCHEMA
-- =====================================================

CREATE DATABASE IF NOT EXISTS diet_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE diet_system;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS meal_plan_items;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS food_logs;
DROP TABLE IF EXISTS daily_summaries;
DROP TABLE IF EXISTS health_profiles;
DROP TABLE IF EXISTS dietitian_patients;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. USERS TABLE (Everyone who uses the system)
-- =====================================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- Role: 'user', 'dietitian', 'admin'
    role VARCHAR(20) DEFAULT 'user',
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- =====================================================
-- 2. HEALTH PROFILES (User's health information)
-- =====================================================
CREATE TABLE health_profiles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    
    -- Body measurements
    weight DECIMAL(5,2),  -- in kg
    height DECIMAL(5,2),  -- in cm
    
    -- Lifestyle
    activity_level ENUM('Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'),
    
    -- Goals
    health_goal ENUM('Weight Loss', 'Weight Gain', 'Maintenance'),
    daily_calorie_goal INT,
    
    -- Additional info
    allergies TEXT,
    dietary_preferences TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
);

-- =====================================================
-- 3. FOOD ITEMS (Database of foods)
-- =====================================================
CREATE TABLE food_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    category ENUM('Grain', 'Protein', 'Vegetable', 'Fruit', 'Dairy', 'Fat', 'Beverage'),
    
    -- Nutrition per 100g
    calories INT,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_category (category)
);

-- =====================================================
-- 4. FOOD LOGS (What users eat each day)
-- =====================================================
CREATE TABLE food_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    food_id INT UNSIGNED NOT NULL,
    
    -- How much they ate (in grams)
    quantity_g DECIMAL(6,2),
    
    -- When they ate
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack'),
    log_date DATE NOT NULL,
    
    -- Calculated nutrition
    calories_consumed INT,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_items(id),
    INDEX idx_user_date (user_id, log_date),
    INDEX idx_date (log_date)
);

-- =====================================================
-- 5. DAILY SUMMARIES (Auto-calculated totals per day)
-- =====================================================
CREATE TABLE daily_summaries (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    summary_date DATE NOT NULL,
    
    -- Totals for the day
    total_calories INT DEFAULT 0,
    total_protein_g DECIMAL(7,2) DEFAULT 0,
    total_carbs_g DECIMAL(7,2) DEFAULT 0,
    total_fat_g DECIMAL(7,2) DEFAULT 0,
    
    -- Goal tracking
    calorie_goal INT,
    is_over_goal BOOLEAN DEFAULT FALSE,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, summary_date),
    INDEX idx_date (summary_date)
);

-- =====================================================
-- 6. MEAL PLANS (Dietitian-created plans)
-- =====================================================
CREATE TABLE meal_plans (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,      -- Who gets this plan
    dietitian_id INT UNSIGNED,          -- Who created it
    
    title VARCHAR(150) NOT NULL,
    description TEXT,
    
    daily_calorie_target INT,
    duration_days INT,                  -- Plan length in days
    
    status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dietitian_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- =====================================================
-- 7. MEAL PLAN ITEMS (Detailed daily meals)
-- =====================================================
CREATE TABLE meal_plan_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plan_id INT UNSIGNED NOT NULL,
    food_id INT UNSIGNED NOT NULL,
    
    day_number INT NOT NULL,            -- Day 1, Day 2, etc.
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
    portion_g DECIMAL(5,2),              -- Recommended grams
    
    FOREIGN KEY (plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_items(id),
    INDEX idx_plan_day (plan_id, day_number),
    INDEX idx_meal_type (meal_type)
);

-- =====================================================
-- 8. DIETITIAN-PATIENT RELATIONSHIP
-- =====================================================
CREATE TABLE dietitian_patients (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dietitian_id INT UNSIGNED NOT NULL,
    patient_id INT UNSIGNED NOT NULL,
    
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (dietitian_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pair (dietitian_id, patient_id),
    INDEX idx_dietitian (dietitian_id),
    INDEX idx_patient (patient_id)
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Sample users
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john@example.com', 'hashed_password_here', 'user'),
('Sarah Smith', 'sarah@example.com', 'hashed_password_here', 'user'),
('Dr. Mike Johnson', 'mike@dietitian.com', 'hashed_password_here', 'dietitian'),
('Admin User', 'admin@system.com', 'hashed_password_here', 'admin');

-- Sample health profile
INSERT INTO health_profiles (user_id, weight, height, activity_level, health_goal, daily_calorie_goal) VALUES
(1, 75.5, 175, 'Moderate', 'Weight Loss', 2000),
(2, 65.0, 165, 'Light', 'Maintenance', 1800);

-- Sample food items
INSERT INTO food_items (name, category, calories, protein_g, carbs_g, fat_g) VALUES
('Chicken Breast', 'Protein', 165, 31, 0, 3.6),
('Brown Rice', 'Grain', 111, 2.6, 23, 0.9),
('Apple', 'Fruit', 52, 0.3, 14, 0.2),
('Broccoli', 'Vegetable', 34, 2.8, 7, 0.4),
('Salmon', 'Protein', 208, 20, 0, 13),
('Quinoa', 'Grain', 120, 4.4, 21, 1.9),
('Avocado', 'Fat', 160, 2, 8.5, 14.7);

-- Sample food log
INSERT INTO food_logs (user_id, food_id, quantity_g, meal_type, log_date, calories_consumed) VALUES
(1, 1, 150, 'Lunch', CURDATE(), 247),
(1, 2, 200, 'Lunch', CURDATE(), 222);

-- Sample meal plan
INSERT INTO meal_plans (user_id, dietitian_id, title, daily_calorie_target, duration_days) VALUES
(1, 3, 'Weight Loss Plan - Week 1', 1800, 7);

-- Sample dietitian-patient relationship
INSERT INTO dietitian_patients (dietitian_id, patient_id) VALUES
(3, 1),
(3, 2);

-- =====================================================
-- USEFUL VIEWS (Simplifies common queries)
-- =====================================================

-- View: Today's food log with nutrition details
CREATE VIEW v_today_food_log AS
SELECT 
    u.name,
    fl.log_date,
    fl.meal_type,
    fi.name as food_name,
    fl.quantity_g,
    fl.calories_consumed
FROM food_logs fl
JOIN users u ON fl.user_id = u.id
JOIN food_items fi ON fl.food_id = fi.id
WHERE fl.log_date = CURDATE();

-- View: User daily summary with goal status
CREATE VIEW v_user_daily_status AS
SELECT 
    u.name,
    ds.summary_date,
    ds.total_calories,
    hp.daily_calorie_goal,
    CASE 
        WHEN ds.total_calories > hp.daily_calorie_goal THEN 'Over Goal'
        WHEN ds.total_calories < hp.daily_calorie_goal THEN 'Under Goal'
        ELSE 'On Track'
    END as status
FROM daily_summaries ds
JOIN users u ON ds.user_id = u.id
JOIN health_profiles hp ON u.id = hp.user_id;

-- =====================================================
-- STORED PROCEDURE: Update daily summary
-- =====================================================
DELIMITER $$
CREATE PROCEDURE update_daily_summary(IN p_user_id INT, IN p_date DATE)
BEGIN
    INSERT INTO daily_summaries (user_id, summary_date, total_calories, 
        total_protein_g, total_carbs_g, total_fat_g, calorie_goal, is_over_goal)
    SELECT 
        fl.user_id,
        fl.log_date,
        SUM(fl.calories_consumed),
        SUM(fi.protein_g * fl.quantity_g / 100),
        SUM(fi.carbs_g * fl.quantity_g / 100),
        SUM(fi.fat_g * fl.quantity_g / 100),
        hp.daily_calorie_goal,
        SUM(fl.calories_consumed) > hp.daily_calorie_goal
    FROM food_logs fl
    JOIN food_items fi ON fl.food_id = fi.id
    JOIN health_profiles hp ON fl.user_id = hp.user_id
    WHERE fl.user_id = p_user_id AND fl.log_date = p_date
    GROUP BY fl.user_id, fl.log_date
    ON DUPLICATE KEY UPDATE
        total_calories = VALUES(total_calories),
        total_protein_g = VALUES(total_protein_g),
        total_carbs_g = VALUES(total_carbs_g),
        total_fat_g = VALUES(total_fat_g),
        is_over_goal = VALUES(is_over_goal);
END$$
DELIMITER ;

-- =====================================================
-- TRIGGER: Auto-update daily summary when food logged
-- =====================================================
DELIMITER $$
CREATE TRIGGER after_food_log_insert
AFTER INSERT ON food_logs
FOR EACH ROW
BEGIN
    CALL update_daily_summary(NEW.user_id, NEW.log_date);
END$$
DELIMITER ;

-- =====================================================
-- SIMPLE QUERIES FOR YOUR APPLICATION
-- =====================================================

-- 1. Get user's calorie consumption for today
-- SELECT total_calories FROM daily_summaries 
-- WHERE user_id = 1 AND summary_date = CURDATE();

-- 2. Get all patients for a dietitian
-- SELECT u.* FROM users u
-- JOIN dietitian_patients dp ON u.id = dp.patient_id
-- WHERE dp.dietitian_id = 3;

-- 3. Get active meal plan for a user
-- SELECT * FROM meal_plans 
-- WHERE user_id = 1 AND status = 'Active';

-- 4. Get today's recommended meals from plan
-- SELECT mpi.*, fi.name, fi.calories 
-- FROM meal_plan_items mpi
-- JOIN meal_plans mp ON mpi.plan_id = mp.id
-- JOIN food_items fi ON mpi.food_id = fi.id
-- WHERE mp.user_id = 1 AND mpi.day_number = 1;

-- 5. Check if user exceeded calorie goal
-- SELECT is_over_goal FROM daily_summaries 
-- WHERE user_id = 1 AND summary_date = CURDATE();
