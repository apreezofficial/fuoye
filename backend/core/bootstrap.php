<?php
// backend/core/bootstrap.php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");         
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/../utils/Jwt.php';

use Core\Database;

try {
    $db = Database::getInstance()->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed']);
    exit;
}

// Helper: Get Settings
function getSystemSettings($db) {
    try {
        $stmt = $db->query("SELECT * FROM settings LIMIT 1");
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return null;
    }
}

/**
 * STRICT AUTH HELPER
 * Call this at the top of any protected endpoint.
 * Returns the full user array if authenticated, or exits with 401.
 * @param PDO $db
 * @param string|null $requiredRole - Optional role check ('Admin', 'Lecturer', 'Student')
 * @return array The authenticated user record
 */
function requireAuth($db, $requiredRole = null) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);

    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['message' => 'Authentication required']);
        exit;
    }

    $stmt = $db->prepare("SELECT * FROM users WHERE token = ? LIMIT 1");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['message' => 'Invalid or expired session']);
        exit;
    }

    // Role Check
    if ($requiredRole && $user['role'] !== $requiredRole) {
        http_response_code(403);
        echo json_encode(['message' => 'Access denied. Required role: ' . $requiredRole]);
        exit;
    }

    return $user;
}
