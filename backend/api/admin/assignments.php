<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH - Admin Only
$admin = requireAuth($db, 'Admin');

$method = $_SERVER['REQUEST_METHOD'];

// GET: List all assignments
if ($method === 'GET') {
    $sql = "
        SELECT a.*, c.code as course_code, c.title as course_title,
               u.full_name as created_by_name,
               (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN users u ON a.created_by = u.id
        ORDER BY a.created_at DESC
    ";
    
    $stmt = $db->query($sql);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// POST: Create assignment
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['course_id']) || !isset($data['title'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Course ID and title required']);
        exit;
    }
    
    $courseId = filter_var($data['course_id'], FILTER_VALIDATE_INT);
    $title = trim($data['title']);
    $description = $data['description'] ?? '';
    $instructions = $data['instructions'] ?? '';
    $dueDate = isset($data['due_date']) ? $data['due_date'] : null;
    $maxScore = isset($data['max_score']) ? (int)$data['max_score'] : 100;
    
    $stmt = $db->prepare("
        INSERT INTO assignments (course_id, title, description, instructions, due_date, max_score, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$courseId, $title, $description, $instructions, $dueDate, $maxScore, $admin['id']]);
    
    echo json_encode(['message' => 'Assignment created successfully', 'id' => $db->lastInsertId()]);
    exit;
}

// PUT: Update assignment
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Assignment ID required']);
        exit;
    }
    
    $assignmentId = filter_var($data['id'], FILTER_VALIDATE_INT);
    
    $updates = [];
    $params = [];
    
    if (isset($data['title'])) {
        $updates[] = "title = ?";
        $params[] = trim($data['title']);
    }
    if (isset($data['description'])) {
        $updates[] = "description = ?";
        $params[] = $data['description'];
    }
    if (isset($data['instructions'])) {
        $updates[] = "instructions = ?";
        $params[] = $data['instructions'];
    }
    if (isset($data['due_date'])) {
        $updates[] = "due_date = ?";
        $params[] = $data['due_date'];
    }
    if (isset($data['max_score'])) {
        $updates[] = "max_score = ?";
        $params[] = (int)$data['max_score'];
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['message' => 'No fields to update']);
        exit;
    }
    
    $params[] = $assignmentId;
    $sql = "UPDATE assignments SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    echo json_encode(['message' => 'Assignment updated successfully']);
    exit;
}

// DELETE: Delete assignment
if ($method === 'DELETE') {
    $assignmentId = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;
    
    if (!$assignmentId) {
        http_response_code(400);
        echo json_encode(['message' => 'Assignment ID required']);
        exit;
    }
    
    $stmt = $db->prepare("DELETE FROM assignments WHERE id = ?");
    $stmt->execute([$assignmentId]);
    
    echo json_encode(['message' => 'Assignment deleted successfully']);
    exit;
}


