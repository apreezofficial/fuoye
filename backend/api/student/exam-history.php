<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH
$user = requireAuth($db);

// Get user's exam history
$sql = "SELECT 
    ea.*, 
    e.title as exam_title,
    e.duration_minutes,
    e.total_questions,
    c.title as course_title,
    c.code as course_code
FROM exam_attempts ea
JOIN exams e ON ea.exam_id = e.id
JOIN courses c ON e.course_id = c.id
WHERE ea.user_id = ?
ORDER BY ea.started_at DESC";

$stmt = $db->prepare($sql);
$stmt->execute([$user['id']]);
$attempts = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($attempts);
