<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH
$user = requireAuth($db);

$userLevel = $user['level'];
$userDept = $user['department_id'];

// Fetch relevant courses
$sql = "SELECT c.*, d.code as dept_code, d.name as dept_name 
        FROM courses c 
        LEFT JOIN departments d ON c.department_id = d.id 
        WHERE c.level = ? 
        AND (c.department_id IS NULL OR c.department_id = ?)";

$stmt = $db->prepare($sql);
$stmt->execute([$userLevel, $userDept]);
$availableCourses = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'user' => [
        'name' => $user['full_name'],
        'level' => $userLevel,
        'department_id' => $userDept
    ],
    'level' => $userLevel,
    'courses' => $availableCourses
]);
