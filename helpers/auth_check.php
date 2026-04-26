<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

function current_user_id(): int
{
    return (int) ($_SESSION['user_id'] ?? 0);
}

function current_user_role(): string
{
    return (string) ($_SESSION['role'] ?? '');
}

function require_login(): void
{
    if (current_user_id() <= 0) {
        send_json([
            'success' => false,
            'message' => 'Authentication required.',
        ], 401);
    }
}

function require_role(string|array $roles): void
{
    require_login();

    $allowedRoles = is_array($roles) ? $roles : [$roles];

    if (!in_array(current_user_role(), $allowedRoles, true)) {
        send_json([
            'success' => false,
            'message' => 'You do not have permission to access this resource.',
        ], 403);
    }
}
