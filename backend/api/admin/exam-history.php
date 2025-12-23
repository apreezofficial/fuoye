<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH - Admin only
$user = requireAuth($db);

// Check admin role
if (!isset($user['role']) || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch exam attempts with details
if ($method === 'GET') {
    $filters = [];
    $params = [];

    // Filter by exam_id if provided
    if (isset($_GET['exam_id'])) {
        $filters[] = "ea.exam_id = ?";
        $params[] = (int)$_GET['exam_id'];
    }

    // Filter by user_id if provided
    if (isset($_GET['user_id'])) {
        $filters[] = "ea.user_id = ?";
        $params[] = (int)$_GET['user_id'];
    }

    // Filter by course_id if provided
    if (isset($_GET['course_id'])) {
        $filters[] = "e.course_id = ?";
        $params[] = (int)$_GET['course_id'];
    }

    $whereClause = count($filters) > 0 ? "WHERE " . implode(" AND ", $filters) : "";

    $stmt = $db->prepare(
        "SELECT ea.id, ea.user_id, ea.exam_id, ea.score, ea.total_questions, ea.answers, 
                ea.started_at, ea.completed_at, ea.created_at,
                e.title as exam_title, e.duration_minutes, e.total_points,
                c.id as course_id, c.title as course_title, c.code as course_code,
                u.first_name, u.last_name, u.email
         FROM exam_attempts ea
         JOIN exams e ON ea.exam_id = e.id
         JOIN courses c ON e.course_id = c.id
         JOIN users u ON ea.user_id = u.id
         $whereClause
         ORDER BY COALESCE(ea.completed_at, ea.created_at) DESC"
    );
    
    $stmt->execute($params);
    $attempts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Enhance with answer details
    $enhanced = array_map(function($attempt) use ($db) {
        $answers = [];
        $score = $attempt['score'] ?? 0;
        $totalQuestions = $attempt['total_questions'] ?? 0;
        
        if ($attempt['answers']) {
            try {
                $decodedAnswers = json_decode($attempt['answers'], true);
                if (is_array($decodedAnswers)) {
                    $answers = $decodedAnswers;
                }
            } catch (Exception $e) {
                // answers JSON is invalid or empty
            }
        }

        // Get question details from exam_questions table for this attempt
        $detailedAnswers = [];
        if (count($answers) > 0) {
            $qStmt = $db->prepare(
                "SELECT id, question_order, question_text, options, correct_answer_index 
                 FROM exam_questions 
                 WHERE attempt_id = ? 
                 ORDER BY question_order ASC"
            );
            $qStmt->execute([$attempt['id']]);
            $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($questions as $q) {
                $options = json_decode($q['options'], true) ?? [];
                $correctAnswer = isset($options[$q['correct_answer_index']]) ? $options[$q['correct_answer_index']] : 'Unknown';
                $qOrder = $q['question_order'];
                
                // Find the user's answer for this question (answers are keyed by question number)
                $answerData = $answers[$qOrder] ?? $answers[(string)$qOrder] ?? null;
                
                $detailedAnswers[] = [
                    'question_id' => (int)$q['id'],
                    'question_text' => $q['question_text'],
                    'user_answer' => $answerData['user_answer'] ?? null,
                    'correct_answer' => $correctAnswer,
                    'is_correct' => $answerData['is_correct'] ?? false
                ];
            }
        }

        return [
            'id' => (int)$attempt['id'],
            'user_id' => (int)$attempt['user_id'],
            'user_name' => $attempt['first_name'] . ' ' . $attempt['last_name'],
            'user_email' => $attempt['email'],
            'exam_id' => (int)$attempt['exam_id'],
            'exam_title' => $attempt['exam_title'],
            'course_id' => (int)$attempt['course_id'],
            'course_title' => $attempt['course_title'],
            'course_code' => $attempt['course_code'],
            'score' => $score !== null ? (int)$score : null,
            'total_questions' => (int)$totalQuestions,
            'total_points' => $attempt['total_points'] !== null ? (int)$attempt['total_points'] : null,
            'started_at' => $attempt['started_at'],
            'completed_at' => $attempt['completed_at'],
            'is_completed' => $attempt['completed_at'] !== null,
            'answers' => $detailedAnswers
        ];
    }, $attempts);

    echo json_encode(['data' => $enhanced, 'total' => count($enhanced)]);
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed']);
