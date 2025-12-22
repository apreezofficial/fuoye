<?php
require_once __DIR__ . '/../../core/bootstrap.php';
use Utils\Jwt;

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(['message' => 'Email and password required']);
    exit;
}

$stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$data->email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($data->password, $user['password_hash'])) {

    // Fetch Global Settings
    $settings = getSystemSettings($db);
    
    // Maintenance Mode Check
    if ($settings && isset($settings['maintenance_mode']) && $settings['maintenance_mode']) {
        if ($user['role'] !== 'Admin') {
            http_response_code(503);
            echo json_encode([
                'message' => $settings['maintenance_message'] ?? 'System is under maintenance.'
            ]);
            exit;
        }
    }
    
    // Generate Token
    $payload = [
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'exp' => time() + (60 * 60 * 24)
    ];
    $token = Jwt::encode($payload);

    // Persist Token to DB
    $updateStmt = $db->prepare("UPDATE users SET token = ? WHERE id = ?");
    $updateStmt->execute([$token, $user['id']]);

    echo json_encode([
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'matric' => $user['matric_number'] ?? null,
            'department_id' => $user['department_id'],
            'level' => $user['level']
        ]
    ]);
} else {
    // USER REQUESTED 404 FOR INVALID CREDENTIALS
    http_response_code(404);
    echo json_encode(['message' => 'Invalid credentials']);
}
