<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH - Admin Only
$admin = requireAuth($db, 'Admin');

$method = $_SERVER['REQUEST_METHOD'];

// GET: List all materials
if ($method === 'GET') {
    $stmt = $db->query("
        SELECT m.*, c.code as course_code, c.title as course_title, u.full_name as uploader_name,
               v.full_name as verified_by_name
        FROM course_materials m
        JOIN courses c ON m.course_id = c.id
        JOIN users u ON m.uploaded_by = u.id
        LEFT JOIN users v ON m.verified_by = v.id
        ORDER BY m.created_at DESC
    ");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// POST: Verify or unverify material
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['material_id']) || !isset($data['is_verified'])) {
        http_response_code(400);
        echo json_encode(['message' => 'material_id and is_verified required']);
        exit;
    }

    $materialId = filter_var($data['material_id'], FILTER_VALIDATE_INT);
    $isVerified = (bool)$data['is_verified'];

    $stmt = $db->prepare("
        UPDATE course_materials
        SET is_verified = ?, verified_by = ?, verified_at = CASE WHEN ? = 1 THEN NOW() ELSE NULL END
        WHERE id = ?
    ");
    $stmt->execute([$isVerified ? 1 : 0, $admin['id'], $isVerified ? 1 : 0, $materialId]);

    echo json_encode(['message' => 'Material verification updated']);
    exit;
}

// DELETE: Remove material
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['message' => 'Material ID required']);
        exit;
    }

    $stmt = $db->prepare("DELETE FROM course_materials WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['message' => 'Material deleted']);
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed']);

