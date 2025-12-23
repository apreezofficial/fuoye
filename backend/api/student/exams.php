<?php
require_once __DIR__ . '/../../core/bootstrap.php';
require_once __DIR__ . '/../../utils/GeminiService.php';

use Utils\GeminiService;

function logGeminiError($message) {
    $logPath = __DIR__ . '/../../gemini-error.log';
    $entry = '[' . date('c') . '] ' . $message . PHP_EOL;
    @file_put_contents($logPath, $entry, FILE_APPEND);
}

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

// POST: Start exam (dynamic - course-based)
if ($method === 'POST') {
    try {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->course_id)) {
            http_response_code(400);
            echo json_encode(['message' => 'Course ID required']);
            exit;
        }
        
        // Input validation
        $courseId = filter_var($data->course_id, FILTER_VALIDATE_INT);
        if ($courseId === false || $courseId <= 0) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid course ID']);
            exit;
        }
        
        $durationMinutes = isset($data->duration_minutes) ? (int)$data->duration_minutes : 60;
        $totalQuestions = isset($data->total_questions) ? (int)$data->total_questions : 20;
        
        // Validate ranges
        if ($durationMinutes < 15 || $durationMinutes > 180) {
            http_response_code(400);
            echo json_encode(['message' => 'Duration must be between 15 and 180 minutes']);
            exit;
        }
        
        if ($totalQuestions < 5 || $totalQuestions > 50) {
            http_response_code(400);
            echo json_encode(['message' => 'Questions must be between 5 and 50']);
            exit;
        }
        
        // Verify user is registered for this course
        $settings = getSystemSettings($db);
        $currentSession = $settings['current_session'] ?? '2024/2025';
        $currentSemester = $settings['current_semester'] ?? 'Harmattan';
        
        $stmt = $db->prepare("
            SELECT c.*, d.name as dept_name
            FROM courses c
            LEFT JOIN departments d ON c.department_id = d.id
            JOIN course_registrations cr ON cr.course_id = c.id
            WHERE c.id = ? AND cr.user_id = ? AND cr.session = ? AND cr.semester = ?
        ");
        $stmt->execute([$courseId, $user['id'], $currentSession, $currentSemester]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$course) {
            http_response_code(403);
            echo json_encode(['message' => 'You are not registered for this course']);
            exit;
        }
        
        // Create a virtual exam record for tracking
        $stmt = $db->prepare("
            INSERT INTO exams (course_id, title, duration_minutes, total_questions) 
            VALUES (?, ?, ?, ?)
        ");
        $examTitle = "CBT Exam - " . $course['code'];
        $stmt->execute([$courseId, $examTitle, $durationMinutes, $totalQuestions]);
        $examId = $db->lastInsertId();
        
        // Create exam attempt
        $stmt = $db->prepare("INSERT INTO exam_attempts (user_id, exam_id, total_questions) VALUES (?, ?, ?)");
        $stmt->execute([$user['id'], $examId, $totalQuestions]);
        $attemptId = $db->lastInsertId();
        
        // Prepare exam data for response
        $exam = [
            'id' => $examId,
            'title' => $examTitle,
            'course_title' => $course['title'],
            'course_code' => $course['code'],
            'level' => $course['level'],
            'duration_minutes' => $durationMinutes,
            'total_questions' => $totalQuestions
        ];
        
        // Check if questions already exist for this attempt
        $questionStmt = $db->prepare("
            SELECT id, question_text, options, correct_answer_index, question_order
            FROM exam_questions
            WHERE attempt_id = ?
            ORDER BY question_order ASC
        ");
        $questionStmt->execute([$attemptId]);
        $existingQuestions = $questionStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($existingQuestions) > 0) {
            // Return existing questions
            $questions = [];
            foreach ($existingQuestions as $q) {
                $questions[] = [
                    'id' => $q['id'],
                    'question' => $q['question_text'],
                    'options' => json_decode($q['options'], true),
                    'correct_answer' => (int)$q['correct_answer_index'],
                    'order' => (int)$q['question_order']
                ];
            }
        } else {
            // Generate unique questions using Gemini AI
            $level = $exam['level'] ?? '100';
            $generatedQuestions = GeminiService::generateQuestions(
                $exam['course_title'],
                $exam['course_code'],
                $exam['total_questions'],
                $level
            );
            
            // Store questions in database
            $insertQuestion = $db->prepare("
                INSERT INTO exam_questions (attempt_id, question_text, options, correct_answer_index, question_order)
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $questions = [];
            foreach ($generatedQuestions as $index => $q) {
                $questionText = $q['question'];
                $options = json_encode($q['options']);
                $correctAnswer = $q['correct_answer'];
                
                $insertQuestion->execute([
                    $attemptId,
                    $questionText,
                    $options,
                    $correctAnswer,
                    $index + 1
                ]);
                
                $questionId = $db->lastInsertId();
                
                $questions[] = [
                    'id' => $questionId,
                    'question' => $questionText,
                    'options' => $q['options'],
                    'correct_answer' => $correctAnswer,
                    'order' => $index + 1
                ];
            }
        }
        
        echo json_encode([
            'attempt_id' => $attemptId,
            'exam' => $exam,
            'questions' => $questions
        ]);
        exit;
    } catch (Throwable $e) {
        logGeminiError("POST /student/exams.php failed: " . $e->getMessage());
        logGeminiError("POST /student/exams.php failed: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['message' => 'Failed to start exam']);
        exit;
    }
}

// PUT: Submit exam answers
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['attempt_id']) || !isset($data['answers'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Attempt ID and answers required']);
        exit;
    }
    
    $attemptId = filter_var($data['attempt_id'], FILTER_VALIDATE_INT);
    if ($attemptId === false || $attemptId <= 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid attempt ID']);
        exit;
    }
    
    // Verify attempt belongs to user
    $stmt = $db->prepare("SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?");
    $stmt->execute([$attemptId, $user['id']]);
    $attempt = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$attempt) {
        http_response_code(403);
        echo json_encode(['message' => 'Attempt not found']);
        exit;
    }
    
    if ($attempt['completed_at'] !== null) {
        http_response_code(400);
        echo json_encode(['message' => 'Exam already submitted']);
        exit;
    }
    
    // Get correct answers
    $questionStmt = $db->prepare("
        SELECT id, correct_answer_index FROM exam_questions WHERE attempt_id = ?
    ");
    $questionStmt->execute([$attemptId]);
    $questions = $questionStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate score
    $score = 0;
    $totalQuestions = count($questions);
    $answersData = [];
    
    foreach ($questions as $q) {
        $questionId = $q['id'];
        $correctAnswer = (int)$q['correct_answer_index'];
        $userAnswer = isset($data['answers'][$questionId]) ? (int)$data['answers'][$questionId] : null;
        
        $isCorrect = ($userAnswer === $correctAnswer);
        if ($isCorrect) {
            $score++;
        }
        
        $answersData[$questionId] = [
            'user_answer' => $userAnswer,
            'correct_answer' => $correctAnswer,
            'is_correct' => $isCorrect
        ];
    }
    
    // Update attempt
    $updateStmt = $db->prepare("
        UPDATE exam_attempts 
        SET score = ?, answers = ?, completed_at = NOW()
        WHERE id = ?
    ");
    $updateStmt->execute([
        $score,
        json_encode($answersData),
        $attemptId
    ]);
    
    echo json_encode([
        'message' => 'Exam submitted successfully',
        'score' => $score,
        'total_questions' => $totalQuestions,
        'percentage' => round(($score / $totalQuestions) * 100, 2)
    ]);
    exit;
}

// GET: Get exam attempt details
if ($method === 'GET' && isset($_GET['attempt_id'])) {
    $attemptId = filter_var($_GET['attempt_id'], FILTER_VALIDATE_INT);
    
    if ($attemptId === false || $attemptId <= 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid attempt ID']);
        exit;
    }
    
    // Get attempt
    $stmt = $db->prepare("
        SELECT ea.*, e.title as exam_title, e.duration_minutes, 
               c.title as course_title, c.code as course_code
        FROM exam_attempts ea
        JOIN exams e ON ea.exam_id = e.id
        JOIN courses c ON e.course_id = c.id
        WHERE ea.id = ? AND ea.user_id = ?
    ");
    $stmt->execute([$attemptId, $user['id']]);
    $attempt = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$attempt) {
        http_response_code(404);
        echo json_encode(['message' => 'Attempt not found']);
        exit;
    }
    
    // Get questions
    $questionStmt = $db->prepare("
        SELECT id, question_text, options, correct_answer_index, question_order
        FROM exam_questions
        WHERE attempt_id = ?
        ORDER BY question_order ASC
    ");
    $questionStmt->execute([$attemptId]);
    $questions = $questionStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $formattedQuestions = [];
    foreach ($questions as $q) {
        $answers = json_decode($attempt['answers'], true);
        $questionAnswers = $answers[$q['id']] ?? null;
        
        $formattedQuestions[] = [
            'id' => $q['id'],
            'question' => $q['question_text'],
            'options' => json_decode($q['options'], true),
            'correct_answer' => (int)$q['correct_answer_index'],
            'order' => (int)$q['question_order'],
            'user_answer' => $questionAnswers ? $questionAnswers['user_answer'] : null,
            'is_correct' => $questionAnswers ? $questionAnswers['is_correct'] : null
        ];
    }
    
    echo json_encode([
        'attempt' => $attempt,
        'questions' => $formattedQuestions
    ]);
    exit;
}
