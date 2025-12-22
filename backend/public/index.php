<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/Database.php';

// Global Error Handler
set_exception_handler(function ($e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal Server Error',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    exit;
});

// Autoload controllers
spl_autoload_register(function ($class) {
    if (file_exists(__DIR__ . '/../controllers/' . $class . '.php')) {
        require_once __DIR__ . '/../controllers/' . $class . '.php';
    } elseif (file_exists(__DIR__ . '/../models/' . $class . '.php')) {
        require_once __DIR__ . '/../models/' . $class . '.php';
    }
});

use Core\Router;

$router = new Router();

require_once __DIR__ . '/../routes/api.php';

// Test Route
$router->get('/api/test', function() {
    echo json_encode(['message' => 'FUOYE Smart Campus Backend is Running 🚀']);
});

$router->dispatch();
