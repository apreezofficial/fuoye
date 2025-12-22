<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH - Admin Only
$admin = requireAuth($db, 'Admin');

// Real Stats from DB
$stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE role = 'Student'");
$totalStudents = $stmt->fetch()['count'];

$stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE role = 'Lecturer'");
$totalLecturers = $stmt->fetch()['count'];

$stmt = $db->query("SELECT COUNT(*) as count FROM courses");
$totalCourses = $stmt->fetch()['count'];

$stmt = $db->query("SELECT COUNT(*) as count FROM departments");
$totalDepts = $stmt->fetch()['count'];

echo json_encode([
    'total_students' => $totalStudents,
    'total_lecturers' => $totalLecturers,
    'total_courses' => $totalCourses,
    'total_departments' => $totalDepts,
    'active_exams' => 0,
    'recent_activity' => [
        ['user' => 'System', 'action' => 'Stats refreshed', 'time' => 'Just now']
    ]
]);
