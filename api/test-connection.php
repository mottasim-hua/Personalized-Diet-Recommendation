<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

$pdo = get_db();

send_json([
    'success' => true,
    'message' => 'Database connection successful.',
    'database' => DB_NAME,
    'server_time' => date(DATE_ATOM),
]);
