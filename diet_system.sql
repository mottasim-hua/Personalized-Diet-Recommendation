-- ============================================================================
-- PERSONALIZED DIET RECOMMENDATION SYSTEM - DATABASE SCHEMA
-- Database: MySQL 8.0+
-- Description: Complete relational schema for managing users, dietitians,
--              meal plans, food logs, and health tracking
-- ============================================================================

-- Drop existing objects (for fresh setup)
DROP TRIGGER IF EXISTS create_daily_calorie_summary;
DROP TRIGGER IF EXISTS update_daily_calorie_summary;
DROP TRIGGER IF EXISTS check_calorie_limit;
DROP VIEW IF EXISTS user_daily_nutrition_summary;
DROP VIEW IF EXISTS dietitian_workload;
DROP TABLE IF EXISTS dietitian_feedback;
DROP TABLE IF EXISTS calorie_warnings;
DROP TABLE IF EXISTS daily_calorie_summary;
DROP TABLE IF EXISTS meal_plan_items;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS diet_goals;
DROP TABLE IF EXISTS food_logs;
DROP TABLE IF EXISTS health_profiles;
DROP TABLE IF EXISTS food_items;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS dietitians;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
-- Purpose: Stores user authentication and basic profile information
-- Used by: User registration, login, and account management
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    date_of_birth DATE NOT NULL,
    role ENUM('User', 'Dietitian', 'Admin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) COMMENT='Core user authentication and profile information for all system users';

-- ============================================================================
-- 2. HEALTH_PROFILES TABLE
-- ============================================================================
-- Purpose: Stores detailed health information and metrics for users
-- Used by: Calorie calculation, meal plan personalization, progress tracking
CREATE TABLE health_profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    weight DECIMAL(5, 2) COMMENT='Current weight in kg',
    height DECIMAL(5, 2) COMMENT='Height in cm',
    activity_level ENUM('Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active') NOT NULL,
    bmi DECIMAL(4, 2) COMMENT='Body Mass Index (automatically calculated)',
    daily_calorie_goal INT COMMENT='Target daily calorie intake in kcal',
    medical_conditions TEXT COMMENT='Comma-separated or JSON list of medical conditions',
    allergies TEXT COMMENT='Comma-separated or JSON list of allergies',
    dietary_preferences TEXT COMMENT='Vegetarian, vegan, gluten-free, etc.',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_bmi (bmi)
) COMMENT='Extended health profile with medical and dietary information';

-- ============================================================================
-- 3. DIET_GOALS TABLE
-- ============================================================================
-- Purpose: Tracks user weight and health goals
-- Used by: Personalized recommendations, progress monitoring
CREATE TABLE diet_goals (
    goal_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    goal_type ENUM('Weight Loss', 'Weight Gain', 'Maintenance') NOT NULL,
    target_weight DECIMAL(5, 2) COMMENT='Target weight in kg',
    current_weight DECIMAL(5, 2) COMMENT='Current weight in kg',
    target_date DATE COMMENT='Goal achievement date',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
) COMMENT='User-defined weight and health goals with target timelines';

-- ============================================================================
-- 4. FOOD_ITEMS TABLE
-- ============================================================================
-- Purpose: Master database of food items with nutritional information
-- Used by: Food logging, meal plan creation, nutritional calculations
CREATE TABLE food_items (
    food_id INT PRIMARY KEY AUTO_INCREMENT,
    food_name VARCHAR(150) NOT NULL UNIQUE,
    category ENUM('Grain', 'Protein', 'Vegetable', 'Fruit', 'Dairy', 'Fat', 'Beverage', 'Other') NOT NULL,
    calories_per_100g INT COMMENT='Calories per 100g serving',
    protein_g DECIMAL(5, 2) COMMENT='Protein in grams per 100g',
    carbs_g DECIMAL(5, 2) COMMENT='Carbohydrates in grams per 100g',
    fat_g DECIMAL(5, 2) COMMENT='Fat in grams per 100g',
    fiber_g DECIMAL(5, 2) COMMENT='Dietary fiber in grams per 100g',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_food_name (food_name),
    INDEX idx_category (category),
    INDEX idx_is_available (is_available)
) COMMENT='Master food database with complete nutritional information per 100g';

-- ============================================================================
-- 5. FOOD_LOGS TABLE
-- ============================================================================
-- Purpose: Records daily food intake for each user
-- Used by: Daily calorie tracking, nutrition reports, feedback analysis
CREATE TABLE food_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    portion_size DECIMAL(5, 2) COMMENT='Portion size in grams',
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
    log_date DATE NOT NULL,
    log_time TIME,
    calories_consumed INT COMMENT='Calculated calories for this entry',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_items(food_id) ON DELETE RESTRICT,
    INDEX idx_user_id_date (user_id, log_date),
    INDEX idx_log_date (log_date),
    INDEX idx_meal_type (meal_type)
) COMMENT='Daily food intake log for nutritional tracking and analysis';

-- ============================================================================
-- 6. DAILY_CALORIE_SUMMARY TABLE
-- ============================================================================
-- Purpose: Aggregated daily calorie totals per user
-- Used by: Dashboard reports, warning triggers, nutritional summaries
CREATE TABLE daily_calorie_summary (
    summary_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    summary_date DATE NOT NULL,
    total_calories INT DEFAULT 0,
    total_protein DECIMAL(7, 2) DEFAULT 0,
    total_carbs DECIMAL(7, 2) DEFAULT 0,
    total_fat DECIMAL(7, 2) DEFAULT 0,
    total_fiber DECIMAL(7, 2) DEFAULT 0,
    calorie_goal INT,
    exceeded_limit BOOLEAN DEFAULT FALSE,
    meal_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, summary_date),
    INDEX idx_user_id (user_id),
    INDEX idx_summary_date (summary_date),
    INDEX idx_exceeded_limit (exceeded_limit)
) COMMENT='Aggregated daily nutrition summary for each user';

-- ============================================================================
-- 7. CALORIE_WARNINGS TABLE
-- ============================================================================
-- Purpose: Logs instances when users exceed their daily calorie limit
-- Used by: User notifications, historical tracking, admin monitoring
CREATE TABLE calorie_warnings (
    warning_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    warning_date DATE NOT NULL,
    daily_goal INT,
    calories_consumed INT,
    excess_calories INT COMMENT='Amount over limit',
    warning_level ENUM('Caution', 'Warning', 'Critical') DEFAULT 'Caution' COMMENT='Severity: 10% over=Caution, 20% over=Warning, 30%+ over=Critical',
    user_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_warning_date (warning_date),
    INDEX idx_warning_level (warning_level)
) COMMENT='Historical log of calorie limit exceedances for monitoring and feedback';

-- ============================================================================
-- 8. DIETITIANS TABLE
-- ============================================================================
-- Purpose: Extended profile information for dietitian users
-- Used by: User-dietitian assignment, workload management, availability
CREATE TABLE dietitians (
    dietitian_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    license_number VARCHAR(50) UNIQUE,
    specialization TEXT COMMENT='Areas of expertise: weight management, sports nutrition, etc.',
    experience_years INT,
    max_patients INT DEFAULT 50 COMMENT='Maximum number of patients this dietitian can manage',
    current_patient_count INT DEFAULT 0,
    bio TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_available (is_available),
    INDEX idx_specialization (specialization(50))
) COMMENT='Dietitian-specific profile information and availability';

-- ============================================================================
-- 9. ADMINS TABLE
-- ============================================================================
-- Purpose: Extended profile for admin users with permission levels
-- Used by: Admin dashboard, system-wide operations, audit trails
CREATE TABLE admins (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    permission_level ENUM('Super Admin', 'Admin', 'Moderator') DEFAULT 'Admin',
    department VARCHAR(100),
    can_manage_users BOOLEAN DEFAULT FALSE,
    can_manage_dietitians BOOLEAN DEFAULT FALSE,
    can_manage_food_database BOOLEAN DEFAULT FALSE,
    can_view_reports BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_permission_level (permission_level)
) COMMENT='Admin-specific profile with granular permission controls';

-- ============================================================================
-- 10. MEAL_PLANS TABLE
-- ============================================================================
-- Purpose: Dietitian-created meal plans assigned to users
-- Used by: Meal plan distribution, user guidance, progress tracking
CREATE TABLE meal_plans (
    plan_id INT PRIMARY KEY AUTO_INCREMENT,
    dietitian_id INT NOT NULL,
    user_id INT NOT NULL,
    plan_name VARCHAR(150) NOT NULL,
    description TEXT,
    duration_days INT COMMENT='Duration of the meal plan in days',
    daily_calorie_target INT,
    start_date DATE,
    end_date DATE,
    status ENUM('Draft', 'Active', 'Completed', 'Cancelled') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (dietitian_id) REFERENCES dietitians(dietitian_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_dietitian_id (dietitian_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) COMMENT='Customized meal plans created by dietitians for individual users';

-- ============================================================================
-- 11. MEAL_PLAN_ITEMS TABLE
-- ============================================================================
-- Purpose: Individual meal entries within a meal plan
-- Used by: Detailed meal plan guidance, nutrition specifications
CREATE TABLE meal_plan_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    food_id INT NOT NULL,
    meal_day INT COMMENT='Day number within the meal plan (1-N)',
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
    recommended_portion DECIMAL(5, 2) COMMENT='Recommended portion in grams',
    calories_target INT COMMENT='Expected calories for this meal item',
    preparation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (plan_id) REFERENCES meal_plans(plan_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_items(food_id) ON DELETE RESTRICT,
    INDEX idx_plan_id (plan_id),
    INDEX idx_food_id (food_id),
    INDEX idx_meal_day_type (meal_day, meal_type)
) COMMENT='Individual food items and portions within a meal plan';

-- ============================================================================
-- 12. DIETITIAN_FEEDBACK TABLE
-- ============================================================================
-- Purpose: Progress notes and feedback from dietitian to user
-- Used by: User guidance, motivation, progress tracking
CREATE TABLE dietitian_feedback (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    dietitian_id INT NOT NULL,
    user_id INT NOT NULL,
    feedback_type ENUM('Progress Update', 'Encouragement', 'Warning', 'Suggestion', 'General Note') NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (dietitian_id) REFERENCES dietitians(dietitian_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_dietitian_id (dietitian_id),
    INDEX idx_is_read (is_read),
    INDEX idx_feedback_type (feedback_type)
) COMMENT='Personalized feedback and progress notes from dietitians to users';

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- ============================================================================
-- VIEW: user_daily_nutrition_summary
-- ============================================================================
-- Purpose: Get detailed daily nutrition summary for users
-- Usage: SELECT * FROM user_daily_nutrition_summary WHERE user_id = 1 AND summary_date = '2024-01-15';
CREATE VIEW user_daily_nutrition_summary AS
SELECT 
    dcs.summary_date,
    dcs.user_id,
    u.first_name,
    u.last_name,
    u.email,
    dcs.total_calories,
    dcs.calorie_goal,
    (dcs.calorie_goal - dcs.total_calories) AS remaining_calories,
    CASE 
        WHEN dcs.total_calories > dcs.calorie_goal THEN 'Over Limit'
        WHEN dcs.total_calories > (dcs.calorie_goal * 0.9) THEN 'Close to Limit'
        ELSE 'On Track'
    END AS status,
    dcs.total_protein,
    dcs.total_carbs,
    dcs.total_fat,
    dcs.total_fiber,
    dcs.meal_count
FROM daily_calorie_summary dcs
JOIN users u ON dcs.user_id = u.user_id;

-- ============================================================================
-- VIEW: dietitian_workload
-- ============================================================================
-- Purpose: Show workload distribution among dietitians
-- Usage: SELECT * FROM dietitian_workload;
CREATE VIEW dietitian_workload AS
SELECT 
    d.dietitian_id,
    u.first_name,
    u.last_name,
    u.email,
    d.max_patients,
    d.current_patient_count,
    (d.max_patients - d.current_patient_count) AS available_slots,
    COUNT(DISTINCT mp.plan_id) AS active_plans
FROM dietitians d
JOIN users u ON d.user_id = u.user_id
LEFT JOIN meal_plans mp ON d.dietitian_id = mp.dietitian_id AND mp.status = 'Active'
GROUP BY d.dietitian_id;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC FUNCTIONALITY
-- ============================================================================

-- ============================================================================
-- TRIGGER: create_daily_calorie_summary
-- ============================================================================
-- Purpose: Automatically create or update daily calorie summary when a food log is inserted
-- Functionality: Aggregates all food logs for a user on a specific date
DELIMITER $$

CREATE TRIGGER create_daily_calorie_summary
AFTER INSERT ON food_logs
FOR EACH ROW
BEGIN
    DECLARE total_cal INT;
    DECLARE total_prot DECIMAL(7, 2);
    DECLARE total_carb DECIMAL(7, 2);
    DECLARE total_f DECIMAL(7, 2);
    DECLARE total_fb DECIMAL(7, 2);
    DECLARE meal_cnt INT;
    DECLARE calorie_lim INT;
    
    -- Calculate totals from food logs
    SELECT 
        COALESCE(SUM(CAST(fl.portion_size * fi.calories_per_100g / 100 AS INT)), 0),
        COALESCE(SUM(fl.portion_size * fi.protein_g / 100), 0),
        COALESCE(SUM(fl.portion_size * fi.carbs_g / 100), 0),
        COALESCE(SUM(fl.portion_size * fi.fat_g / 100), 0),
        COALESCE(SUM(fl.portion_size * fi.fiber_g / 100), 0),
        COUNT(DISTINCT fl.log_id)
    INTO total_cal, total_prot, total_carb, total_f, total_fb, meal_cnt
    FROM food_logs fl
    JOIN food_items fi ON fl.food_id = fi.food_id
    WHERE fl.user_id = NEW.user_id AND fl.log_date = NEW.log_date;
    
    -- Get calorie goal from health profile
    SELECT daily_calorie_goal INTO calorie_lim
    FROM health_profiles
    WHERE user_id = NEW.user_id;
    
    -- Insert or update daily calorie summary
    INSERT INTO daily_calorie_summary (user_id, summary_date, total_calories, total_protein, 
                                      total_carbs, total_fat, total_fiber, calorie_goal, 
                                      exceeded_limit, meal_count)
    VALUES (NEW.user_id, NEW.log_date, total_cal, total_prot, total_carb, total_f, 
            total_fb, calorie_lim, IF(total_cal > COALESCE(calorie_lim, 0), TRUE, FALSE), meal_cnt)
    ON DUPLICATE KEY UPDATE
        total_calories = total_cal,
        total_protein = total_prot,
        total_carbs = total_carb,
        total_fat = total_f,
        total_fiber = total_fb,
        exceeded_limit = IF(total_cal > COALESCE(calorie_lim, 0), TRUE, FALSE),
        meal_count = meal_cnt,
        updated_at = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- ============================================================================
-- TRIGGER: check_calorie_limit
-- ============================================================================
-- Purpose: Create warning entry when user exceeds daily calorie limit
-- Functionality: Automatically logs calorie warnings with severity levels
DELIMITER $$

CREATE TRIGGER check_calorie_limit
AFTER UPDATE ON daily_calorie_summary
FOR EACH ROW
BEGIN
    DECLARE excess INT;
    DECLARE warning_sev ENUM('Caution', 'Warning', 'Critical');
    
    -- Only process if calorie limit was exceeded
    IF NEW.exceeded_limit = TRUE AND OLD.exceeded_limit = FALSE THEN
        SET excess = NEW.total_calories - NEW.calorie_goal;
        
        -- Determine warning severity based on percentage over limit
        IF excess >= (NEW.calorie_goal * 0.3) THEN
            SET warning_sev = 'Critical';
        ELSEIF excess >= (NEW.calorie_goal * 0.2) THEN
            SET warning_sev = 'Warning';
        ELSE
            SET warning_sev = 'Caution';
        END IF;
        
        -- Insert warning record
        INSERT INTO calorie_warnings (user_id, warning_date, daily_goal, 
                                     calories_consumed, excess_calories, warning_level)
        VALUES (NEW.user_id, NEW.summary_date, NEW.calorie_goal, 
                NEW.total_calories, excess, warning_sev);
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert Admin User
INSERT INTO users (email, password_hash, first_name, last_name, gender, date_of_birth, role)
VALUES ('admin@dietsystem.com', SHA2('admin123', 256), 'System', 'Administrator', 'Other', '1990-01-01', 'Admin');

SET @admin_user_id = LAST_INSERT_ID();

INSERT INTO admins (user_id, permission_level, can_manage_users, can_manage_dietitians, 
                   can_manage_food_database, can_view_reports)
VALUES (@admin_user_id, 'Super Admin', TRUE, TRUE, TRUE, TRUE);

-- Insert Dietitian User
INSERT INTO users (email, password_hash, first_name, last_name, gender, date_of_birth, role)
VALUES ('dr.sarah@dietsystem.com', SHA2('diet123', 256), 'Sarah', 'Martinez', 'Female', '1985-05-15', 'Dietitian');

SET @dietitian_user_id = LAST_INSERT_ID();

INSERT INTO dietitians (user_id, license_number, specialization, experience_years, max_patients)
VALUES (@dietitian_user_id, 'RD-12345', 'Weight Management, Sports Nutrition', 8, 50);

SET @dietitian_id = LAST_INSERT_ID();

-- Insert Test Users
INSERT INTO users (email, password_hash, first_name, last_name, gender, date_of_birth, role)
VALUES 
('john.doe@example.com', SHA2('user123', 256), 'John', 'Doe', 'Male', '1995-08-20', 'User'),
('jane.smith@example.com', SHA2('user123', 256), 'Jane', 'Smith', 'Female', '1998-03-10', 'User');

SET @user1_id = LAST_INSERT_ID() - 1;
SET @user2_id = LAST_INSERT_ID();

-- Insert Health Profiles for Users
INSERT INTO health_profiles (user_id, weight, height, activity_level, daily_calorie_goal, 
                            medical_conditions, allergies, dietary_preferences)
VALUES 
(@user1_id, 85.5, 180, 'Moderately Active', 2500, 'None', 'None', 'No restrictions'),
(@user2_id, 65.0, 165, 'Lightly Active', 2000, 'None', 'Peanuts, Shellfish', 'Vegetarian');

-- Insert Diet Goals
INSERT INTO diet_goals (user_id, goal_type, target_weight, current_weight, target_date)
VALUES 
(@user1_id, 'Weight Loss', 80.0, 85.5, '2024-06-01'),
(@user2_id, 'Weight Maintenance', 65.0, 65.0, '2024-12-31');

-- Insert Food Items (5+ items as required)
INSERT INTO food_items (food_name, category, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g)
VALUES 
('Chicken Breast (Cooked)', 'Protein', 165, 31, 0, 3.6, 0),
('Brown Rice (Cooked)', 'Grain', 111, 2.6, 23, 0.9, 1.8),
('Broccoli (Raw)', 'Vegetable', 34, 2.8, 7, 0.4, 2.4),
('Banana (Medium)', 'Fruit', 89, 1.1, 23, 0.3, 2.6),
('Olive Oil', 'Fat', 884, 0, 0, 100, 0),
('Salmon (Cooked)', 'Protein', 208, 25, 0, 13, 0),
('Sweet Potato (Cooked)', 'Vegetable', 86, 1.6, 20, 0.1, 3);

-- Insert Food Logs for User 1 (Today's date)
INSERT INTO food_logs (user_id, food_id, portion_size, meal_type, log_date, log_time, notes)
VALUES 
(@user1_id, 1, 150, 'Breakfast', CURDATE(), '08:00:00', 'Grilled chicken breast'),
(@user1_id, 3, 200, 'Breakfast', CURDATE(), '08:00:00', 'Fresh broccoli'),
(@user1_id, 2, 100, 'Lunch', CURDATE(), '12:30:00', 'Brown rice with lunch'),
(@user1_id, 6, 120, 'Lunch', CURDATE(), '12:30:00', 'Baked salmon'),
(@user1_id, 4, 120, 'Snack', CURDATE(), '15:00:00', 'Medium banana');

-- Insert Food Logs for User 2 (Today's date)
INSERT INTO food_logs (user_id, food_id, portion_size, meal_type, log_date, log_time, notes)
VALUES 
(@user2_id, 3, 150, 'Breakfast', CURDATE(), '07:30:00', 'Broccoli salad'),
(@user2_id, 7, 150, 'Breakfast', CURDATE(), '08:00:00', 'Sweet potato'),
(@user2_id, 2, 150, 'Lunch', CURDATE(), '13:00:00', 'Brown rice bowl'),
(@user2_id, 4, 100, 'Snack', CURDATE(), '16:00:00', 'Banana snack');

-- Insert Meal Plan
INSERT INTO meal_plans (dietitian_id, user_id, plan_name, description, duration_days, 
                       daily_calorie_target, start_date, end_date, status)
VALUES (@dietitian_id, @user1_id, 'Weight Loss Plan - 30 Days', 
        'Customized 30-day plan for sustainable weight loss', 30, 2300, 
        CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Active');

SET @meal_plan_id = LAST_INSERT_ID();

-- Insert Meal Plan Items
INSERT INTO meal_plan_items (plan_id, food_id, meal_day, meal_type, recommended_portion, calories_target)
VALUES 
(@meal_plan_id, 1, 1, 'Breakfast', 150, 250),
(@meal_plan_id, 3, 1, 'Breakfast', 100, 34),
(@meal_plan_id, 2, 1, 'Lunch', 150, 167),
(@meal_plan_id, 6, 1, 'Lunch', 120, 250),
(@meal_plan_id, 4, 1, 'Snack', 100, 89);

-- Insert Dietitian Feedback
INSERT INTO dietitian_feedback (dietitian_id, user_id, feedback_type, subject, message)
VALUES 
(@dietitian_id, @user1_id, 'Encouragement', 'Great Start!', 
 'You are doing great with your meal plan! Keep up the consistency with your food logs.'),
(@dietitian_id, @user1_id, 'Suggestion', 'Hydration Reminder', 
 'Remember to drink at least 2 liters of water daily to support your weight loss goals.');

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================
-- Note: Most indexes have been added directly in table creation.
-- Additional composite indexes for common queries:

CREATE INDEX idx_user_meal_date ON food_logs(user_id, meal_type, log_date);
CREATE INDEX idx_dietitian_user_plans ON meal_plans(dietitian_id, user_id, status);
CREATE INDEX idx_feedback_dates ON dietitian_feedback(user_id, created_at);

-- ============================================================================
-- USEFUL QUERIES FOR APPLICATION DEVELOPMENT
-- ============================================================================

/*

-- Get user's daily calorie summary
SELECT * FROM user_daily_nutrition_summary 
WHERE user_id = ? AND summary_date = CURDATE();

-- Get dietitian workload
SELECT * FROM dietitian_workload 
WHERE is_available = TRUE;

-- Get active meal plans for a user
SELECT * FROM meal_plans 
WHERE user_id = ? AND status = 'Active';

-- Get all feedback for a user
SELECT * FROM dietitian_feedback 
WHERE user_id = ? 
ORDER BY created_at DESC;

-- Get recent calorie warnings
SELECT * FROM calorie_warnings 
WHERE user_id = ? 
ORDER BY warning_date DESC 
LIMIT 10;

-- Get user's food log for a specific date
SELECT fl.*, fi.food_name, fi.calories_per_100g,
       (fl.portion_size * fi.calories_per_100g / 100) AS calories
FROM food_logs fl
JOIN food_items fi ON fl.food_id = fi.food_id
WHERE fl.user_id = ? AND fl.log_date = ?
ORDER BY fl.meal_type, fl.log_time;

-- Get meal plan details with food items
SELECT mpi.*, fi.food_name, fi.calories_per_100g, fi.protein_g, fi.carbs_g, fi.fat_g
FROM meal_plan_items mpi
JOIN food_items fi ON mpi.food_id = fi.food_id
WHERE mpi.plan_id = ?
ORDER BY mpi.meal_day, FIELD(mpi.meal_type, 'Breakfast', 'Lunch', 'Dinner', 'Snack');

-- Get users exceeding calorie limits today
SELECT DISTINCT cw.user_id, u.first_name, u.last_name, u.email,
       cw.daily_goal, cw.calories_consumed, cw.excess_calories, cw.warning_level
FROM calorie_warnings cw
JOIN users u ON cw.user_id = u.user_id
WHERE cw.warning_date = CURDATE()
AND cw.warning_level IN ('Warning', 'Critical');

*/

-- ============================================================================
-- DATABASE SETUP COMPLETE
-- ============================================================================
-- To verify the setup:
-- SHOW TABLES;
-- SELECT * FROM users;
-- SELECT * FROM food_items;
-- SELECT * FROM user_daily_nutrition_summary;
