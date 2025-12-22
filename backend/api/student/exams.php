<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH
$user = requireAuth($db);

$method = $_SERVER['REQUEST_METHOD'];

// GET: List exams for user's REGISTERED courses only
if ($method === 'GET') {
    $settings = getSystemSettings($db);
    $currentSession = $settings['current_session'] ?? '2024/2025';
    $currentSemester = $settings['current_semester'] ?? 'Harmattan';
    
    // Get exams for registered courses
    $sql = "SELECT e.*, c.title as course_title, c.code as course_code 
            FROM exams e
            JOIN courses c ON e.course_id = c.id
            JOIN course_registrations cr ON cr.course_id = c.id
            WHERE cr.user_id = ? AND cr.session = ? AND cr.semester = ?
            ORDER BY e.created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([$user['id'], $currentSession, $currentSemester]);
    $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($exams);
    exit;
}

// POST: Start exam
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->exam_id)) {
        http_response_code(400);
        echo json_encode(['message' => 'Exam ID required']);
        exit;
    }
    
    // Verify user is registered for this course
    $stmt = $db->prepare("
        SELECT e.*, c.title as course_title, c.code as course_code
        FROM exams e
        JOIN courses c ON e.course_id = c.id
        JOIN course_registrations cr ON cr.course_id = c.id
        WHERE e.id = ? AND cr.user_id = ?
    ");
    $stmt->execute([$data->exam_id, $user['id']]);
    $exam = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$exam) {
        http_response_code(403);
        echo json_encode(['message' => 'You are not registered for this course']);
        exit;
    }
    
    // Create exam attempt
    $stmt = $db->prepare("INSERT INTO exam_attempts (user_id, exam_id, total_questions) VALUES (?, ?, ?)");
    $stmt->execute([$user['id'], $exam['id'], $exam['total_questions']]);
    $attemptId = $db->lastInsertId();
    
    // Generate sample questions (TODO: Integrate Gemini API)
    $questions = [];
    for ($i = 1; $i <= $exam['total_questions']; $i++) {
        $questions[] = [
            'id' => $i,
            'question' => "Question $i for {$exam['course_title']}?",
            'options' => ['Option A', 'Option B', 'Option C', 'Option D'],
            'correct_answer' => rand(0, 3)
        ];
    }
    
    echo json_encode([
        'attempt_id' => $attemptId,
        'exam' => $exam,
        'questions' => $questions
    ]);
    exit;
}
