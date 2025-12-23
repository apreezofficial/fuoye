<?php
require_once __DIR__ . '/../../core/bootstrap.php';

function logExamHistory($message) {
    $logPath = __DIR__ . '/../../exam-history.log';
    $entry = '[' . date('c') . '] ' . $message . PHP_EOL;
    @file_put_contents($logPath, $entry, FILE_APPEND);
}

// STRICT AUTH
$user = requireAuth($db);

try {
    logExamHistory("=== EXAM HISTORY REQUEST ===");
    logExamHistory("User ID: " . $user['id']);
    
    // Get user's exam history with enhanced metadata
    $sql = "SELECT 
        ea.id,
        ea.user_id,
        ea.exam_id,
        ea.score,
        ea.total_questions,
        ea.started_at,
        ea.completed_at,
        e.title as exam_title,
        e.duration_minutes,
        c.title as course_title,
        c.code as course_code,
        c.level
    FROM exam_attempts ea
    JOIN exams e ON ea.exam_id = e.id
    JOIN courses c ON e.course_id = c.id
    WHERE ea.user_id = ?
    ORDER BY ea.started_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([$user['id']]);
    $attempts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    logExamHistory("Attempts found: " . count($attempts));
    
    // Calculate percentage and grade for each attempt
    $enrichedAttempts = array_map(function($attempt) {
        $score = (int)$attempt['score'];
        $total = (int)$attempt['total_questions'];
        $percentage = $total > 0 ? round(($score / $total) * 100, 2) : 0;
        
        // Calculate grade
        $grade = 'F';
        if ($percentage >= 70) $grade = 'A';
        else if ($percentage >= 60) $grade = 'B';
        else if ($percentage >= 50) $grade = 'C';
        else if ($percentage >= 40) $grade = 'D';
        
        return [
            'id' => (int)$attempt['id'],
            'exam_id' => (int)$attempt['exam_id'],
            'exam_title' => $attempt['exam_title'],
            'course_title' => $attempt['course_title'],
            'course_code' => $attempt['course_code'],
            'level' => $attempt['level'],
            'score' => $score,
            'total_questions' => $total,
            'percentage' => $percentage,
            'grade' => $grade,
            'duration_minutes' => (int)$attempt['duration_minutes'],
            'started_at' => $attempt['started_at'],
            'completed_at' => $attempt['completed_at'],
            'is_completed' => $attempt['completed_at'] !== null
        ];
    }, $attempts);
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'attempts' => $enrichedAttempts,
        'total_count' => count($enrichedAttempts)
    ]);
    
} catch (Exception $e) {
    logExamHistory("ERROR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load exam history',
        'error' => $e->getMessage()
    ]);
}
