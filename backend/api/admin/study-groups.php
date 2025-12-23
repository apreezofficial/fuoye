<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH - Admin Only
$admin = requireAuth($db, 'Admin');

$method = $_SERVER['REQUEST_METHOD'];

// GET: List all study groups
if ($method === 'GET') {
    $sql = "
        SELECT sg.*, c.code as course_code, c.title as course_title,
               u.full_name as creator_name,
               (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id) as member_count
        FROM study_groups sg
        LEFT JOIN courses c ON sg.course_id = c.id
        JOIN users u ON sg.created_by = u.id
        ORDER BY sg.created_at DESC
    ";
    
    $stmt = $db->query($sql);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// DELETE: Delete study group
if ($method === 'DELETE') {
    $groupId = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;
    
    if (!$groupId) {
        http_response_code(400);
        echo json_encode(['message' => 'Group ID required']);
        exit;
    }
    
    $stmt = $db->prepare("DELETE FROM study_groups WHERE id = ?");
    $stmt->execute([$groupId]);
    
    echo json_encode(['message' => 'Study group deleted successfully']);
    exit;
}


