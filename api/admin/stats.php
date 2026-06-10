<?php

declare(strict_types=1);

require_once __DIR__ . '/../../helpers/auth_check.php';

require_role('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$pdo = get_db();
$range = max(7, min(90, sanitize_int(get_query_param('range', 30), 30)));
$chart = sanitize_string(get_query_param('chart', ''));

function table_name(PDO $pdo, array $candidates): ?string
{
    foreach ($candidates as $candidate) {
        if (table_exists($pdo, $candidate)) {
            return $candidate;
        }
    }

    return null;
}

function fetch_all_assoc(PDO $pdo, string $sql, array $params = []): array
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    return $stmt->fetchAll();
}

function fetch_value(PDO $pdo, string $sql, array $params = []): mixed
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    return $stmt->fetchColumn();
}

function build_date_series(int $days): array
{
    $series = [];
    for ($i = $days - 1; $i >= 0; $i--) {
        $date = new DateTimeImmutable("-{$i} days");
        $series[] = $date->format('Y-m-d');
    }

    return $series;
}

$usersTable = table_name($pdo, ['users']);
$plansTable = table_name($pdo, ['meal_plans', 'app_meal_plans']);
$healthTable = table_name($pdo, ['health_profiles', 'app_health_data']);
$warningsTable = table_name($pdo, ['calorie_warnings', 'daily_calorie_summary']);
$foodLogsTable = table_name($pdo, ['food_logs', 'app_food_logs']);

$totalUsers = (int) fetch_value($pdo, "SELECT COUNT(*) FROM {$usersTable} WHERE LOWER(role) = 'user'");
$totalDietitians = (int) fetch_value($pdo, "SELECT COUNT(*) FROM {$usersTable} WHERE LOWER(role) = 'dietitian'");
$activePlans = $plansTable ? (int) fetch_value($pdo, "SELECT COUNT(*) FROM {$plansTable} WHERE LOWER(COALESCE(status, 'active')) IN ('active', 'draft')") : 0;
$alertsToday = 0;

if ($warningsTable) {
    if ($warningsTable === 'daily_calorie_summary') {
        $alertsToday = (int) fetch_value($pdo, "SELECT COUNT(*) FROM daily_calorie_summary WHERE summary_date = CURDATE() AND exceeded_limit = 1");
    } else {
        $alertsToday = (int) fetch_value($pdo, "SELECT COUNT(*) FROM calorie_warnings WHERE warning_date = CURDATE()");
    }
}

$avgBmi = 0.0;
if ($healthTable) {
    if ($healthTable === 'health_profiles' && table_exists($pdo, 'health_profiles')) {
        $avgBmi = (float) fetch_value($pdo, 'SELECT COALESCE(AVG(bmi), 0) FROM health_profiles');
    } else {
        $avgBmi = (float) fetch_value(
            $pdo,
            "SELECT COALESCE(AVG(ROUND(weight / POW(height / 100, 2), 2)), 0)
             FROM app_health_data
             WHERE weight IS NOT NULL AND height IS NOT NULL AND height > 0"
        );
    }
}

$stats = [
    'total_users' => $totalUsers,
    'total_dietitians' => $totalDietitians,
    'active_plans' => $activePlans,
    'alerts_today' => $alertsToday,
    'avg_bmi' => round($avgBmi, 2),
    'feedback_messages_sent' => table_exists($pdo, 'feedback') ? (int) fetch_value($pdo, 'SELECT COUNT(*) FROM feedback') : 0,
];

$dates = build_date_series(7);
$weeklyRegistrations = [];
foreach ($dates as $date) {
    $weeklyRegistrations[] = [
        'date' => $date,
        'count' => (int) fetch_value(
            $pdo,
            "SELECT COUNT(*) FROM {$usersTable} WHERE DATE(created_at) = :date",
            ['date' => $date]
        ),
    ];
}

$registrationsRange = [];
for ($i = $range - 1; $i >= 0; $i--) {
    $date = (new DateTimeImmutable("-{$i} days"))->format('Y-m-d');
    $registrationsRange[] = [
        'date' => $date,
        'count' => (int) fetch_value(
            $pdo,
            "SELECT COUNT(*) FROM {$usersTable} WHERE DATE(created_at) = :date",
            ['date' => $date]
        ),
    ];
}

$alertsRange = [];
for ($i = $range - 1; $i >= 0; $i--) {
    $date = (new DateTimeImmutable("-{$i} days"))->format('Y-m-d');
    $count = 0;
    if ($warningsTable === 'daily_calorie_summary') {
        $count = (int) fetch_value(
            $pdo,
            'SELECT COUNT(*) FROM daily_calorie_summary WHERE summary_date = :date AND exceeded_limit = 1',
            ['date' => $date]
        );
    } elseif ($warningsTable === 'calorie_warnings') {
        $count = (int) fetch_value(
            $pdo,
            'SELECT COUNT(*) FROM calorie_warnings WHERE warning_date = :date',
            ['date' => $date]
        );
    }

    $alertsRange[] = ['date' => $date, 'count' => $count];
}

$dietPrefs = [
    'vegetarian' => 0,
    'non_vegetarian' => 0,
    'vegan' => 0,
];

if ($healthTable === 'health_profiles') {
    $rows = fetch_all_assoc(
        $pdo,
        "SELECT COALESCE(dietary_preferences, '') AS pref, COUNT(*) AS total
         FROM health_profiles
         GROUP BY COALESCE(dietary_preferences, '')"
    );
    foreach ($rows as $row) {
        $pref = strtolower((string) $row['pref']);
        $count = (int) $row['total'];
        if (str_contains($pref, 'vegan')) {
            $dietPrefs['vegan'] += $count;
        } elseif (str_contains($pref, 'veget')) {
            $dietPrefs['vegetarian'] += $count;
        } else {
            $dietPrefs['non_vegetarian'] += $count;
        }
    }
} elseif ($healthTable === 'app_health_data') {
    $rows = fetch_all_assoc(
        $pdo,
        "SELECT COALESCE(dietary_preference, '') AS pref, COUNT(*) AS total
         FROM app_health_data
         GROUP BY COALESCE(dietary_preference, '')"
    );
    foreach ($rows as $row) {
        $pref = strtolower((string) $row['pref']);
        $count = (int) $row['total'];
        if (str_contains($pref, 'vegan')) {
            $dietPrefs['vegan'] += $count;
        } elseif (str_contains($pref, 'veget')) {
            $dietPrefs['vegetarian'] += $count;
        } else {
            $dietPrefs['non_vegetarian'] += $count;
        }
    }
}

$healthGoals = [
    'weight_loss' => 0,
    'muscle_gain' => 0,
    'maintenance' => 0,
    'other' => 0,
];

if ($healthTable === 'health_profiles') {
    $rows = fetch_all_assoc(
        $pdo,
        "SELECT COALESCE(health_goal, '') AS goal, COUNT(*) AS total
         FROM health_profiles
         GROUP BY COALESCE(health_goal, '')"
    );
    foreach ($rows as $row) {
        $goal = strtolower((string) $row['goal']);
        $count = (int) $row['total'];
        if (str_contains($goal, 'loss')) {
            $healthGoals['weight_loss'] += $count;
        } elseif (str_contains($goal, 'gain')) {
            $healthGoals['muscle_gain'] += $count;
        } elseif (str_contains($goal, 'maint')) {
            $healthGoals['maintenance'] += $count;
        } else {
            $healthGoals['other'] += $count;
        }
    }
}

$topDietitians = [];
if ($plansTable) {
    $topDietitians = fetch_all_assoc(
        $pdo,
        "SELECT u.name, COUNT(*) AS plan_count
         FROM {$plansTable} p
         LEFT JOIN users u ON u.id = p.dietitian_id
         GROUP BY u.name
         ORDER BY plan_count DESC
         LIMIT 5"
    );
}

$payload = [
    'success' => true,
    'data' => array_merge($stats, [
        'chart' => [
            'weekly_registrations' => $weeklyRegistrations,
            'registrations' => $registrationsRange,
            'alerts' => $alertsRange,
            'diet_prefs' => $dietPrefs,
            'health_goals' => $healthGoals,
            'top_dietitians' => $topDietitians,
        ],
    ]),
];

if ($chart !== '') {
    $payload['data'] = $payload['data']['chart'][$chart] ?? [];
}

send_json($payload);
