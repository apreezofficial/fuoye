<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH
$user = requireAuth($db);

// Get full user profile with department info
$deptName = 'Not Assigned';
if ($user['department_id']) {
    $stmt = $db->prepare("SELECT name, code FROM departments WHERE id = ?");
    $stmt->execute([$user['department_id']]);
    $dept = $stmt->fetch();
    if ($dept) {
        $deptName = $dept['name'];
    }
}

// Count courses for user
$courseCount = 0;
if ($user['level']) {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM courses WHERE level = ?");
    $stmt->execute([$user['level']]);
    $courseCount = $stmt->fetch()['count'] ?? 0;
}

// Return complete profile
echo json_encode([
    'id' => $user['id'],
    'full_name' => $user['full_name'],
    'email' => $user['email'],
    'role' => $user['role'],
    'matric_number' => $user['matric_number'],
    'level' => $user['level'],
    'department' => $deptName,
    'department_id' => $user['department_id'],
    'stats' => [
        'cgpa' => '3.85', // Would come from results table
        'courses' => $courseCount
    ]
]);
