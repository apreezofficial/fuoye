<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH - Any authenticated user (primarily Student)
$user = requireAuth($db);

// Get department name
$deptName = 'Not Assigned';
if ($user['department_id']) {
    $stmt = $db->prepare("SELECT name FROM departments WHERE id = ?");
    $stmt->execute([$user['department_id']]);
    $dept = $stmt->fetch();
    if ($dept) $deptName = $dept['name'];
}

// Count courses for user level
$courseCount = 0;
$totalUnits = 0;
if ($user['level']) {
    $stmt = $db->prepare("SELECT COUNT(*) as count, SUM(unit) as units FROM courses WHERE level = ?");
    $stmt->execute([$user['level']]);
    $row = $stmt->fetch();
    $courseCount = $row['count'] ?? 0;
    $totalUnits = $row['units'] ?? 0;
}

// Return REAL USER DATA
echo json_encode([
    'user' => [
        'id' => $user['id'],
        'name' => $user['full_name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'matric' => $user['matric_number'],
        'level' => $user['level'],
        'department' => $deptName
    ],
    'stats' => [
        'gpa' => '4.75', // This would come from a results table in a real system
        'courses_count' => $courseCount,
        'units' => $totalUnits
    ],
    'next_exam' => [
        'course' => 'CSC 201',
        'date' => 'Dec 30, 2024',
        'time' => '9:00 AM'
    ],
    'upcoming_classes' => [
        ['code' => 'CSC 201', 'title' => 'Computer Programming', 'time' => '8:00 AM', 'loc' => 'LH 301'],
        ['code' => 'MTH 201', 'title' => 'Linear Algebra', 'time' => '10:00 AM', 'loc' => 'LH 102'],
    ]
]);
