<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$pdo = get_db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM app_settings WHERE id = 1 LIMIT 1');
    $settings = $stmt->fetch() ?: [];

    send_json([
        'success' => true,
        'data' => $settings,
    ]);
}

$data = get_request_data();

$siteName = sanitize_string($data['site_name'] ?? 'Personalized Diet Recommendation System');
$defaultCalorieLimit = sanitize_int($data['default_calorie_limit'] ?? 2000, 2000);
$allowSelfRegistration = !empty($data['allow_self_registration']) ? 1 : 0;
$defaultRole = strtolower(sanitize_string($data['default_role'] ?? 'user'));
if (!in_array($defaultRole, ['user', 'dietitian', 'admin'], true)) {
    $defaultRole = 'user';
}
$emailAlerts = !empty($data['email_alerts']) ? 1 : 0;
$newRegistrationAlerts = !empty($data['new_registration_alerts']) ? 1 : 0;
$alertThreshold = max(0, min(50, sanitize_int($data['alert_threshold'] ?? 20, 20)));
$adminName = sanitize_string($data['admin_name'] ?? 'Admin User');
$adminEmail = strtolower(sanitize_string($data['admin_email'] ?? 'admin@diet.com'));
$adminAvatar = sanitize_nullable_string($data['admin_avatar'] ?? null);

$stmt = $pdo->prepare(
    'UPDATE app_settings
     SET site_name = :site_name,
         default_calorie_limit = :default_calorie_limit,
         allow_self_registration = :allow_self_registration,
         default_role = :default_role,
         email_alerts = :email_alerts,
         new_registration_alerts = :new_registration_alerts,
         alert_threshold = :alert_threshold,
         admin_name = :admin_name,
         admin_email = :admin_email,
         admin_avatar = :admin_avatar
     WHERE id = 1'
);

$stmt->execute([
    'site_name' => $siteName,
    'default_calorie_limit' => $defaultCalorieLimit,
    'allow_self_registration' => $allowSelfRegistration,
    'default_role' => $defaultRole,
    'email_alerts' => $emailAlerts,
    'new_registration_alerts' => $newRegistrationAlerts,
    'alert_threshold' => $alertThreshold,
    'admin_name' => $adminName,
    'admin_email' => $adminEmail,
    'admin_avatar' => $adminAvatar,
]);

send_json([
    'success' => true,
    'message' => 'Settings saved successfully.',
]);
