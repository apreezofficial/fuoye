<?php
require_once __DIR__ . '/../../core/bootstrap.php';

function logExamResults($message) {
    $logPath = __DIR__ . '/../../exam-attempt.log';
    $entry = '[' . date('c') . '] ' . $message . PHP_EOL;
    @file_put_contents($logPath, $entry, FILE_APPEND);
}

$user = requireAuth($db);

if (!isset($_GET['attempt_id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'attempt_id required']);
    exit;
}

$attemptId = filter_var($_GET['attempt_id'], FILTER_VALIDATE_INT);
if ($attemptId === false || $attemptId <= 0) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid attempt_id']);
    exit;
}

// Fetch attempt
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

// Fetch questions and answers
$qStmt = $db->prepare("SELECT id, question_text, options, correct_answer_index, question_order FROM exam_questions WHERE attempt_id = ? ORDER BY question_order ASC");
$qStmt->execute([$attemptId]);
$rows = $qStmt->fetchAll(PDO::FETCH_ASSOC);

$storedAnswers = json_decode($attempt['answers'], true) ?: [];
$questions = [];
foreach ($rows as $r) {
    $qa = $storedAnswers[$r['id']] ?? null;
    $questions[] = [
        'id' => (int)$r['id'],
        'order' => (int)$r['question_order'],
        'question' => $r['question_text'],
        'options' => json_decode($r['options'], true) ?: [],
        'correct_answer' => isset($r['correct_answer_index']) ? (int)$r['correct_answer_index'] : null,
        'user_answer' => $qa ? $qa['user_answer'] : null,
        'is_correct' => $qa ? (bool)$qa['is_correct'] : null
    ];
}

$payload = [
    'attempt' => $attempt,
    'questions' => $questions
];

$format = isset($_GET['format']) ? strtolower($_GET['format']) : 'json';

if ($format === 'csv') {
    // Build CSV
    $filename = "exam_result_{$attemptId}.csv";
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    $out = fopen('php://output', 'w');
    // header row
    fputcsv($out, ['Question Order', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Index', 'User Answer', 'Is Correct']);
    foreach ($questions as $q) {
        $options = $q['options'];
        $row = [
            $q['order'],
            $q['question'],
            $options[0] ?? '',
            $options[1] ?? '',
            $options[2] ?? '',
            $options[3] ?? '',
            $q['correct_answer'],
            $q['user_answer'] === null ? '' : $q['user_answer'],
            $q['is_correct'] ? '1' : '0'
        ];
        fputcsv($out, $row);
    }
    fclose($out);
    exit;
}

// default JSON
header('Content-Type: application/json');
echo json_encode($payload);
exit;
