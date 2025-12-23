<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH
$user = requireAuth($db);

$method = $_SERVER['REQUEST_METHOD'];

// GET: List study groups
if ($method === 'GET') {
    $type = $_GET['type'] ?? 'all'; // 'my_groups', 'available', 'all'
    
    if ($type === 'my_groups' || $type === 'all') {
        // Get user's groups
        $stmt = $db->prepare("
            SELECT sg.*, c.code as course_code, c.title as course_title,
                   u.full_name as creator_name,
                   (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id) as member_count,
                   (SELECT role FROM study_group_members WHERE group_id = sg.id AND user_id = ?) as my_role
            FROM study_groups sg
            LEFT JOIN courses c ON sg.course_id = c.id
            JOIN users u ON sg.created_by = u.id
            JOIN study_group_members sgm ON sg.id = sgm.group_id
            WHERE sgm.user_id = ?
            ORDER BY sg.created_at DESC
        ");
        $stmt->execute([$user['id'], $user['id']]);
        $myGroups = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $myGroups = [];
    }
    
    if ($type === 'available' || $type === 'all') {
        // Get available public groups user is not in
        $stmt = $db->prepare("
            SELECT sg.*, c.code as course_code, c.title as course_title,
                   u.full_name as creator_name,
                   (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id) as member_count
            FROM study_groups sg
            LEFT JOIN courses c ON sg.course_id = c.id
            JOIN users u ON sg.created_by = u.id
            WHERE sg.is_public = 1
              AND sg.id NOT IN (SELECT group_id FROM study_group_members WHERE user_id = ?)
            ORDER BY sg.created_at DESC
        ");
        $stmt->execute([$user['id']]);
        $availableGroups = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $availableGroups = [];
    }
    
    echo json_encode([
        'my_groups' => $myGroups,
        'available_groups' => $availableGroups
    ]);
    exit;
}

// POST: Create or join study group
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['action']) && $data['action'] === 'join') {
        // Join existing group
        if (!isset($data['group_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Group ID required']);
            exit;
        }
        
        $groupId = filter_var($data['group_id'], FILTER_VALIDATE_INT);
        
        // Check if group exists and is public or user has permission
        $stmt = $db->prepare("SELECT * FROM study_groups WHERE id = ?");
        $stmt->execute([$groupId]);
        $group = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$group) {
            http_response_code(404);
            echo json_encode(['message' => 'Group not found']);
            exit;
        }
        
        // Check if already a member
        $stmt = $db->prepare("SELECT * FROM study_group_members WHERE group_id = ? AND user_id = ?");
        $stmt->execute([$groupId, $user['id']]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['message' => 'You are already a member of this group']);
            exit;
        }
        
        // Check member limit
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM study_group_members WHERE group_id = ?");
        $stmt->execute([$groupId]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        if ($count >= $group['max_members']) {
            http_response_code(400);
            echo json_encode(['message' => 'Group is full']);
            exit;
        }
        
        // Add member
        $stmt = $db->prepare("INSERT INTO study_group_members (group_id, user_id, role) VALUES (?, ?, 'member')");
        $stmt->execute([$groupId, $user['id']]);
        
        echo json_encode(['message' => 'Successfully joined group']);
        exit;
    }
    
    // Create new group
    if (!isset($data['name']) || empty(trim($data['name']))) {
        http_response_code(400);
        echo json_encode(['message' => 'Group name required']);
        exit;
    }
    
    $name = trim($data['name']);
    $description = $data['description'] ?? '';
    $courseId = isset($data['course_id']) ? filter_var($data['course_id'], FILTER_VALIDATE_INT) : null;
    $isPublic = isset($data['is_public']) ? (bool)$data['is_public'] : true;
    $maxMembers = isset($data['max_members']) ? (int)$data['max_members'] : 50;
    
    $stmt = $db->prepare("
        INSERT INTO study_groups (name, description, course_id, created_by, is_public, max_members)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $description, $courseId, $user['id'], $isPublic ? 1 : 0, $maxMembers]);
    $groupId = $db->lastInsertId();
    
    // Add creator as admin
    $stmt = $db->prepare("INSERT INTO study_group_members (group_id, user_id, role) VALUES (?, ?, 'admin')");
    $stmt->execute([$groupId, $user['id']]);
    
    echo json_encode(['message' => 'Group created successfully', 'group_id' => $groupId]);
    exit;
}

// DELETE: Leave group
if ($method === 'DELETE') {
    $groupId = isset($_GET['group_id']) ? filter_var($_GET['group_id'], FILTER_VALIDATE_INT) : null;
    
    if (!$groupId) {
        http_response_code(400);
        echo json_encode(['message' => 'Group ID required']);
        exit;
    }
    
    // Check if user is member
    $stmt = $db->prepare("SELECT * FROM study_group_members WHERE group_id = ? AND user_id = ?");
    $stmt->execute([$groupId, $user['id']]);
    $membership = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$membership) {
        http_response_code(404);
        echo json_encode(['message' => 'You are not a member of this group']);
        exit;
    }
    
    // Check if user is the only admin
    if ($membership['role'] === 'admin') {
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM study_group_members WHERE group_id = ? AND role = 'admin'");
        $stmt->execute([$groupId]);
        $adminCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        if ($adminCount === 1) {
            // Delete group if last admin
            $stmt = $db->prepare("DELETE FROM study_groups WHERE id = ?");
            $stmt->execute([$groupId]);
            echo json_encode(['message' => 'Group deleted (last admin left)']);
        } else {
            // Just remove member
            $stmt = $db->prepare("DELETE FROM study_group_members WHERE group_id = ? AND user_id = ?");
            $stmt->execute([$groupId, $user['id']]);
            echo json_encode(['message' => 'Left group successfully']);
        }
    } else {
        // Just remove member
        $stmt = $db->prepare("DELETE FROM study_group_members WHERE group_id = ? AND user_id = ?");
        $stmt->execute([$groupId, $user['id']]);
        echo json_encode(['message' => 'Left group successfully']);
    }
    exit;
}

// GET: Get group details
if ($method === 'GET' && isset($_GET['id'])) {
    $groupId = filter_var($_GET['id'], FILTER_VALIDATE_INT);
    
    $stmt = $db->prepare("
        SELECT sg.*, c.code as course_code, c.title as course_title,
               u.full_name as creator_name
        FROM study_groups sg
        LEFT JOIN courses c ON sg.course_id = c.id
        JOIN users u ON sg.created_by = u.id
        WHERE sg.id = ?
    ");
    $stmt->execute([$groupId]);
    $group = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$group) {
        http_response_code(404);
        echo json_encode(['message' => 'Group not found']);
        exit;
    }
    
    // Get members
    $stmt = $db->prepare("
        SELECT sgm.*, u.full_name, u.email, u.matric_number
        FROM study_group_members sgm
        JOIN users u ON sgm.user_id = u.id
        WHERE sgm.group_id = ?
        ORDER BY sgm.role DESC, sgm.joined_at ASC
    ");
    $stmt->execute([$groupId]);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check if user is member
    $stmt = $db->prepare("SELECT * FROM study_group_members WHERE group_id = ? AND user_id = ?");
    $stmt->execute([$groupId, $user['id']]);
    $isMember = $stmt->fetch() !== false;
    
    echo json_encode([
        'group' => $group,
        'members' => $members,
        'is_member' => $isMember
    ]);
    exit;
}


