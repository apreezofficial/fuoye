<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH - Admin Only
$admin = requireAuth($db, 'Admin');

$method = $_SERVER['REQUEST_METHOD'];

// GET: List all courses
if ($method === 'GET') {
    $sql = "SELECT c.*, d.name as dept_name FROM courses c LEFT JOIN departments d ON c.department_id = d.id ORDER BY c.level, c.code";
    $stmt = $db->query($sql);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// POST: Create new course
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->title) || !isset($data->code) || !isset($data->level)) {
        http_response_code(400);
        echo json_encode(['message' => 'Missing required fields']);
        exit;
    }

    try {
        $stmt = $db->prepare("INSERT INTO courses (title, code, unit, level, department_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data->title, 
            $data->code, 
            $data->unit ?? 2, 
            $data->level, 
            $data->department_id ?? null
        ]);
        echo json_encode(['message' => 'Course created', 'id' => $db->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Error: ' . $e->getMessage()]);
    }
    exit;
}

// DELETE
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        exit;
    }
    $stmt = $db->prepare("DELETE FROM courses WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['message' => 'Course deleted']);
    exit;
}
