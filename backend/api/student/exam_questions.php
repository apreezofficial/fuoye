<?php
require_once __DIR__ . '/../../core/bootstrap.php';

function logExamQuestions($message) {
    $logPath = __DIR__ . '/../../exam-attempt.log';
    $entry = '[' . date('c') . '] ' . $message . PHP_EOL;
    @file_put_contents($logPath, $entry, FILE_APPEND);
}

// Strict auth
$user = requireAuth($db);
$method = $_SERVER['REQUEST_METHOD'];

// GET: fetch questions for an attempt
if ($method === 'GET' && isset($_GET['attempt_id'])) {
    $attemptId = filter_var($_GET['attempt_id'], FILTER_VALIDATE_INT);
    if ($attemptId === false || $attemptId <= 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid attempt_id']);
        exit;
    }

    // Verify attempt belongs to user
    $stmt = $db->prepare("SELECT ea.*, e.title as exam_title, e.duration_minutes, c.title as course_title, c.code as course_code
        FROM exam_attempts ea
        JOIN exams e ON ea.exam_id = e.id
        JOIN courses c ON e.course_id = c.id
        WHERE ea.id = ? AND ea.user_id = ?");
    $stmt->execute([$attemptId, $user['id']]);
    $attempt = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$attempt) {
        http_response_code(404);
        echo json_encode(['message' => 'Attempt not found']);
        exit;
    }

    // Get questions
    $qStmt = $db->prepare("SELECT id, question_text, options, question_order FROM exam_questions WHERE attempt_id = ? ORDER BY question_order ASC");
    $qStmt->execute([$attemptId]);
    $rows = $qStmt->fetchAll(PDO::FETCH_ASSOC);

    $questions = [];
    $storedAnswers = json_decode($attempt['answers'], true) ?: [];
    foreach ($rows as $r) {
        $qa = $storedAnswers[$r['id']] ?? null;
        $questions[] = [
            'id' => (int)$r['id'],
            'question' => $r['question_text'],
            'options' => json_decode($r['options'], true) ?: [],
            'order' => (int)$r['question_order'],
            'user_answer' => $qa ? $qa['user_answer'] : null,
            'is_correct' => $qa ? (bool)$qa['is_correct'] : null
        ];
    }

    logExamQuestions("Served questions for attempt_id={$attemptId} user_id={$user['id']} questions=" . count($questions));

    echo json_encode([
        'attempt' => $attempt,
        'questions' => $questions
    ]);
    exit;
}

// POST: submit answers and grade (accepts JSON { attempt_id, answers: { questionId: selectedIndex } })
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['attempt_id']) || !isset($data['answers']) || !is_array($data['answers'])) {
        http_response_code(400);
        echo json_encode(['message' => 'attempt_id and answers required']);
        exit;
    }

    $attemptId = filter_var($data['attempt_id'], FILTER_VALIDATE_INT);
    if ($attemptId === false || $attemptId <= 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid attempt_id']);
        exit;
    }

    // Verify attempt belongs to user
    $stmt = $db->prepare("SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?");
    $stmt->execute([$attemptId, $user['id']]);
    $attempt = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$attempt) {
        http_response_code(404);
        echo json_encode(['message' => 'Attempt not found']);
        exit;
    }

    if ($attempt['completed_at'] !== null) {
        http_response_code(400);
        echo json_encode(['message' => 'Exam already submitted']);
        exit;
    }

    // Fetch correct answers
    $qStmt = $db->prepare("SELECT id, correct_answer_index FROM exam_questions WHERE attempt_id = ?");
    $qStmt->execute([$attemptId]);
    $rows = $qStmt->fetchAll(PDO::FETCH_ASSOC);

    $answersInput = $data['answers'];
    $score = 0;
    $total = count($rows);
    $answersData = [];

    foreach ($rows as $r) {
        $qid = (int)$r['id'];
        $correct = (int)$r['correct_answer_index'];
        $userAns = isset($answersInput[$qid]) ? (int)$answersInput[$qid] : null;
        $isCorrect = ($userAns !== null && $userAns === $correct);
        if ($isCorrect) $score++;
        $answersData[$qid] = [
            'user_answer' => $userAns,
            'correct_answer' => $correct,
            'is_correct' => $isCorrect
        ];
    }

    // Update attempt
    $update = $db->prepare("UPDATE exam_attempts SET score = ?, answers = ?, completed_at = NOW() WHERE id = ?");
    $update->execute([$score, json_encode($answersData), $attemptId]);

    logExamQuestions("Graded attempt_id={$attemptId} user_id={$user['id']} score={$score}/{$total}");

    echo json_encode([
        'message' => 'Exam submitted',
        'score' => $score,
        'total_questions' => $total,
        'percentage' => $total > 0 ? round(($score / $total) * 100, 2) : 0
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed']);
exit;
