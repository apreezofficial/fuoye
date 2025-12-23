<?php
require_once __DIR__ . '/../../core/bootstrap.php';
require_once __DIR__ . '/../../utils/GeminiService.php';

use Utils\GeminiService;

// STRICT AUTH
$user = requireAuth($db);

$method = $_SERVER['REQUEST_METHOD'];

// GET: Get assignment details and submission
if ($method === 'GET' && isset($_GET['id'])) {
    $assignmentId = filter_var($_GET['id'], FILTER_VALIDATE_INT);
    
    $stmt = $db->prepare("
        SELECT a.*, c.code as course_code, c.title as course_title,
               u.full_name as created_by_name
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN users u ON a.created_by = u.id
        WHERE a.id = ?
    ");
    $stmt->execute([$assignmentId]);
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$assignment) {
        http_response_code(404);
        echo json_encode(['message' => 'Assignment not found']);
        exit;
    }
    
    // Get user's submission if exists
    $stmt = $db->prepare("
        SELECT * FROM assignment_submissions
        WHERE assignment_id = ? AND user_id = ?
    ");
    $stmt->execute([$assignmentId, $user['id']]);
    $submission = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'assignment' => $assignment,
        'submission' => $submission
    ]);
    exit;
}

// GET: List assignments for user's registered courses
if ($method === 'GET') {
    $settings = getSystemSettings($db);
    $currentSession = $settings['current_session'] ?? '2024/2025';
    $currentSemester = $settings['current_semester'] ?? 'Harmattan';
    
    // Get user's registered courses
    $stmt = $db->prepare("
        SELECT DISTINCT cr.course_id
        FROM course_registrations cr
        WHERE cr.user_id = ? AND cr.session = ? AND cr.semester = ?
    ");
    $stmt->execute([$user['id'], $currentSession, $currentSemester]);
    $registeredCourseIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($registeredCourseIds)) {
        echo json_encode([]);
        exit;
    }
    
    // Get assignments for registered courses
    $placeholders = implode(',', array_fill(0, count($registeredCourseIds), '?'));
    $sql = "
        SELECT a.*, c.code as course_code, c.title as course_title,
               u.full_name as created_by_name,
               (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id AND user_id = ?) as has_submitted
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN users u ON a.created_by = u.id
        WHERE a.course_id IN ($placeholders)
        ORDER BY a.due_date ASC, a.created_at DESC
    ";
    
    $params = array_merge([$user['id']], $registeredCourseIds);
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($assignments);
    exit;
}

// POST: Submit assignment or get AI solution
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    // CREATE NEW ASSIGNMENT (any registered user for that course)
    if (isset($data['action']) && $data['action'] === 'create') {
        if (!isset($data['course_id']) || !isset($data['title'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Course ID and title required']);
            exit;
        }

        $courseId = filter_var($data['course_id'], FILTER_VALIDATE_INT);
        if ($courseId === false || $courseId <= 0) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid course ID']);
            exit;
        }

        // Ensure user is registered for this course
        $settings = getSystemSettings($db);
        $currentSession = $settings['current_session'] ?? '2024/2025';
        $currentSemester = $settings['current_semester'] ?? 'Harmattan';

        $stmt = $db->prepare("
            SELECT 1 FROM course_registrations
            WHERE user_id = ? AND course_id = ? AND session = ? AND semester = ?
        ");
        $stmt->execute([$user['id'], $courseId, $currentSession, $currentSemester]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['message' => 'You are not registered for this course']);
            exit;
        }

        $title = trim($data['title']);
        $description = $data['description'] ?? '';
        $instructions = $data['instructions'] ?? '';
        $dueDate = $data['due_date'] ?? null;
        $maxScore = isset($data['max_score']) ? (int)$data['max_score'] : 100;

        $stmt = $db->prepare("
            INSERT INTO assignments (course_id, title, description, instructions, due_date, max_score, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$courseId, $title, $description, $instructions, $dueDate, $maxScore, $user['id']]);

        echo json_encode(['message' => 'Assignment created', 'id' => $db->lastInsertId()]);
        exit;
    }

    if (!isset($data['assignment_id'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Assignment ID required']);
        exit;
    }
    
    $assignmentId = filter_var($data['assignment_id'], FILTER_VALIDATE_INT);
    
    // Get assignment details
    $stmt = $db->prepare("
        SELECT a.*, c.code as course_code, c.title as course_title
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        WHERE a.id = ?
    ");
    $stmt->execute([$assignmentId]);
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$assignment) {
        http_response_code(404);
        echo json_encode(['message' => 'Assignment not found']);
        exit;
    }
    
    // Check if requesting AI solution
    if (isset($data['get_ai_solution']) && $data['get_ai_solution']) {
        // Generate AI solution using Gemini
        $prompt = "Solve this assignment:\n\nTitle: {$assignment['title']}\n\nDescription: {$assignment['description']}\n\nInstructions: {$assignment['instructions']}\n\nCourse: {$assignment['course_code']} - {$assignment['course_title']}\n\nProvide a detailed, step-by-step solution.";
        
        // Use Gemini to generate solution
        $aiSolution = GeminiService::generateSolution($prompt);
        
        // Update or create submission with AI solution
        $stmt = $db->prepare("
            INSERT INTO assignment_submissions (assignment_id, user_id, content, ai_solution)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE ai_solution = ?
        ");
        $content = isset($data['content']) ? $data['content'] : '';
        $stmt->execute([$assignmentId, $user['id'], $content, $aiSolution, $aiSolution]);
        
        echo json_encode([
            'message' => 'AI solution generated',
            'ai_solution' => $aiSolution
        ]);
        exit;
    }
    
    // Regular submission
    if (!isset($data['content']) || empty(trim($data['content']))) {
        http_response_code(400);
        echo json_encode(['message' => 'Submission content required']);
        exit;
    }
    
    $stmt = $db->prepare("
        INSERT INTO assignment_submissions (assignment_id, user_id, content)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE content = ?, submitted_at = NOW()
    ");
    $stmt->execute([$assignmentId, $user['id'], $data['content'], $data['content']]);
    
    echo json_encode(['message' => 'Assignment submitted successfully']);
    exit;
}

// GET: Get assignment details and submission
if ($method === 'GET' && isset($_GET['id'])) {
    $assignmentId = filter_var($_GET['id'], FILTER_VALIDATE_INT);
    
    $stmt = $db->prepare("
        SELECT a.*, c.code as course_code, c.title as course_title,
               u.full_name as created_by_name
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN users u ON a.created_by = u.id
        WHERE a.id = ?
    ");
    $stmt->execute([$assignmentId]);
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$assignment) {
        http_response_code(404);
        echo json_encode(['message' => 'Assignment not found']);
        exit;
    }
    
    // Get user's submission if exists
    $stmt = $db->prepare("
        SELECT * FROM assignment_submissions
        WHERE assignment_id = ? AND user_id = ?
    ");
    $stmt->execute([$assignmentId, $user['id']]);
    $submission = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'assignment' => $assignment,
        'submission' => $submission
    ]);
    exit;
}


