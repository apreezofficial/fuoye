<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH - Admin Only
$admin = requireAuth($db, 'Admin');

$method = $_SERVER['REQUEST_METHOD'];

// GET: List Users
if ($method === 'GET') {
    $role = $_GET['role'] ?? null;
    $sql = "SELECT id, full_name, email, role, matric_number, level, created_at FROM users";
    if ($role) {
        $sql .= " WHERE role = '" . addslashes($role) . "'";
    }
    $sql .= " ORDER BY created_at DESC";
    
    $stmt = $db->query($sql);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// POST: Create User
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->full_name) || !isset($data->email) || !isset($data->password) || !isset($data->role)) {
        http_response_code(400);
        echo json_encode(['message' => 'Missing fields']);
        exit;
    }

    $check = $db->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$data->email]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['message' => 'Email already exists']);
        exit;
    }

    $passwordHash = password_hash($data->password, PASSWORD_DEFAULT);
    $matric = $data->matric_number ?? null;
    $level = $data->level ?? null;
    $dept = $data->department_id ?? null;

    try {
        $stmt = $db->prepare("INSERT INTO users (full_name, email, password_hash, role, matric_number, level, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data->full_name, $data->email, $passwordHash, $data->role, $matric, $level, $dept]);
        
        echo json_encode(['message' => 'User created', 'id' => $db->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'DB Error']);
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
    
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['message' => 'User deleted']);
    exit;
}
