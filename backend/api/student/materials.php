<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH
$user = requireAuth($db);

$method = $_SERVER['REQUEST_METHOD'];

// GET: List materials for a course (or all registered courses)
if ($method === 'GET') {
    $courseId = isset($_GET['course_id']) ? filter_var($_GET['course_id'], FILTER_VALIDATE_INT) : null;

    $settings = getSystemSettings($db);
    $currentSession = $settings['current_session'] ?? '2024/2025';
    $currentSemester = $settings['current_semester'] ?? 'Harmattan';

    // Build course filter based on registrations
    $params = [$user['id'], $currentSession, $currentSemester];
    $courseFilter = "";
    if ($courseId) {
        $courseFilter = "AND cr.course_id = ?";
        $params[] = $courseId;
    }

    $stmt = $db->prepare("
        SELECT DISTINCT cr.course_id
        FROM course_registrations cr
        WHERE cr.user_id = ? AND cr.session = ? AND cr.semester = ?
        $courseFilter
    ");
    $stmt->execute($params);
    $registeredCourseIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($registeredCourseIds)) {
        echo json_encode([]);
        exit;
    }

    $placeholders = implode(',', array_fill(0, count($registeredCourseIds), '?'));
    $sql = "
        SELECT m.*, c.code as course_code, c.title as course_title, u.full_name as uploader_name
        FROM course_materials m
        JOIN courses c ON m.course_id = c.id
        JOIN users u ON m.uploaded_by = u.id
        WHERE m.course_id IN ($placeholders)
        ORDER BY m.is_verified DESC, m.created_at DESC
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute($registeredCourseIds);
    $materials = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($materials);
    exit;
}

// POST: Upload material (any user registered in course)
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['course_id']) || !isset($data['title']) || !isset($data['file_url'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Course, title and file_url are required']);
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
    $fileUrl = trim($data['file_url']);

    $stmt = $db->prepare("
        INSERT INTO course_materials (course_id, title, description, file_url, uploaded_by)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$courseId, $title, $description, $fileUrl, $user['id']]);

    echo json_encode(['message' => 'Material uploaded', 'id' => $db->lastInsertId()]);
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed']);

