<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH
$user = requireAuth($db);

$method = $_SERVER['REQUEST_METHOD'];

// GET: Get available courses for registration (faculty-based)
if ($method === 'GET') {
    $userFaculty = $user['faculty_id'];
    
    // Get all courses from user's faculty (any level - allows carry-overs)
    $sql = "SELECT c.*, d.name as dept_name, d.code as dept_code 
            FROM courses c 
            LEFT JOIN departments d ON c.department_id = d.id 
            WHERE c.faculty_id = ? OR c.faculty_id IS NULL
            ORDER BY c.level, c.code";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([$userFaculty]);
    $availableCourses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get user's registered courses for current session
    $settings = getSystemSettings($db);
    $currentSession = $settings['current_session'] ?? '2024/2025';
    $currentSemester = $settings['current_semester'] ?? 'Harmattan';
    
    $stmt = $db->prepare("SELECT course_id FROM course_registrations WHERE user_id = ? AND session = ? AND semester = ?");
    $stmt->execute([$user['id'], $currentSession, $currentSemester]);
    $registered = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'available_courses' => $availableCourses,
        'registered_courses' => $registered,
        'session' => $currentSession,
        'semester' => $currentSemester
    ]);
    exit;
}

// POST: Register for a course
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->course_id)) {
        http_response_code(400);
        echo json_encode(['message' => 'Course ID required']);
        exit;
    }
    
    $settings = getSystemSettings($db);
    $currentSession = $settings['current_session'] ?? '2024/2025';
    $currentSemester = $settings['current_semester'] ?? 'Harmattan';
    
    // Check if registration is open
    if (!$settings['course_reg_open']) {
        http_response_code(403);
        echo json_encode(['message' => 'Course registration is currently closed']);
        exit;
    }
    
    try {
        $stmt = $db->prepare("INSERT INTO course_registrations (user_id, course_id, session, semester) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user['id'], $data->course_id, $currentSession, $currentSemester]);
        echo json_encode(['message' => 'Course registered successfully']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            http_response_code(409);
            echo json_encode(['message' => 'Already registered for this course']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Registration failed']);
        }
    }
    exit;
}

// DELETE: Drop a course
if ($method === 'DELETE') {
    $courseId = $_GET['course_id'] ?? null;
    
    if (!$courseId) {
        http_response_code(400);
        exit;
    }
    
    $settings = getSystemSettings($db);
    $currentSession = $settings['current_session'] ?? '2024/2025';
    $currentSemester = $settings['current_semester'] ?? 'Harmattan';
    
    $stmt = $db->prepare("DELETE FROM course_registrations WHERE user_id = ? AND course_id = ? AND session = ? AND semester = ?");
    $stmt->execute([$user['id'], $courseId, $currentSession, $currentSemester]);
    
    echo json_encode(['message' => 'Course dropped successfully']);
    exit;
}
