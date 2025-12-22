<?php
require_once __DIR__ . '/../core/bootstrap.php';

// Public GET for registration forms and admin dropdowns
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("SELECT * FROM departments ORDER BY name");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Protected POST/DELETE for Admins only
$admin = requireAuth($db, 'Admin');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->name) || !isset($data->code)) {
        http_response_code(400);
        echo json_encode(['message' => 'Missing fields']);
        exit;
    }

    try {
        $stmt = $db->prepare("INSERT INTO departments (name, code) VALUES (?, ?)");
        $stmt->execute([$data->name, $data->code]);
        echo json_encode(['message' => 'Department created', 'id' => $db->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Error: ' . $e->getMessage()]);
    }
    exit;
}
