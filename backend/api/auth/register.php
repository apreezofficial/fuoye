<?php
require_once __DIR__ . '/../../core/bootstrap.php';

$data = json_decode(file_get_contents("php://input"));

// Fetch Global Settings
$settings = getSystemSettings($db);

if (!$settings) {
    http_response_code(500);
    echo json_encode(['message' => 'System configuration error']);
    exit;
}

// Check if Registration is Enabled
if (isset($settings['enable_registration']) && !$settings['enable_registration']) {
    http_response_code(403);
    echo json_encode(['message' => 'Registration is currently closed by the administration.']);
    exit;
}

if (!isset($data->full_name) || !isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing required fields']);
    exit;
}

// Check Password Length
$minLength = $settings['min_password_length'] ?? 8;
if (strlen($data->password) < $minLength) {
    http_response_code(400);
    echo json_encode(['message' => "Password must be at least $minLength characters long."]);
    exit;
}

// Regex Validation for Matric
if (isset($data->matric_number) && !empty($data->matric_number)) {
    $pattern = $settings['matric_regex'];
    $regex = "/$pattern/"; 
    if (@preg_match($regex, $data->matric_number) === 0) {
        http_response_code(400);
        echo json_encode(['message' => "Matric number format is invalid. Expected format: FUO/YY/XXX/NNN"]);
        exit;
    }
}

// Check email
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$data->email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['message' => 'Email already registered']);
    exit;
}

$passwordHash = password_hash($data->password, PASSWORD_DEFAULT);
$role = $data->role ?? 'Student';
$matric = $data->matric_number ?? null;
$facultyId = $data->faculty_id ?? null;
$deptId = $data->department_id ?? null;
$level = $data->level ?? '100';

try {
    $stmt = $db->prepare("INSERT INTO users (full_name, email, password_hash, role, matric_number, faculty_id, department_id, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data->full_name, $data->email, $passwordHash, $role, $matric, $facultyId, $deptId, $level]);
    
    http_response_code(201);
    echo json_encode(['message' => 'Registration successful']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
}
