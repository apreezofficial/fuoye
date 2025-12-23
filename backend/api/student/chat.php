<?php
require_once __DIR__ . '/../../core/bootstrap.php';

// STRICT AUTH
$user = requireAuth($db);

$method = $_SERVER['REQUEST_METHOD'];

// GET: Get conversations (direct messages and groups)
if ($method === 'GET') {
    $type = $_GET['type'] ?? 'all'; // 'direct', 'groups', 'all'
    
    // Get direct message conversations
    if ($type === 'direct' || $type === 'all') {
        $stmt = $db->prepare("
            SELECT DISTINCT 
                CASE 
                    WHEN sender_id = ? THEN receiver_id
                    ELSE sender_id
                END as other_user_id,
                u.full_name as other_user_name,
                u.email as other_user_email,
                (SELECT message FROM chat_messages 
                 WHERE (sender_id = ? AND receiver_id = other_user_id) 
                    OR (sender_id = other_user_id AND receiver_id = ?)
                 ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM chat_messages 
                 WHERE (sender_id = ? AND receiver_id = other_user_id) 
                    OR (sender_id = other_user_id AND receiver_id = ?)
                 ORDER BY created_at DESC LIMIT 1) as last_message_time,
                (SELECT COUNT(*) FROM chat_messages 
                 WHERE sender_id = other_user_id AND receiver_id = ? AND read_at IS NULL) as unread_count
            FROM chat_messages cm
            JOIN users u ON u.id = CASE 
                WHEN cm.sender_id = ? THEN cm.receiver_id
                ELSE cm.sender_id
            END
            WHERE (cm.sender_id = ? OR cm.receiver_id = ?) AND cm.group_id IS NULL
            GROUP BY other_user_id, u.full_name, u.email
            ORDER BY last_message_time DESC
        ");
        $stmt->execute([$user['id'], $user['id'], $user['id'], $user['id'], $user['id'], $user['id'], $user['id'], $user['id'], $user['id']]);
        $directMessages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $directMessages = [];
    }
    
    // Get group conversations
    if ($type === 'groups' || $type === 'all') {
        $stmt = $db->prepare("
            SELECT sg.*, 
                   (SELECT message FROM chat_messages 
                    WHERE group_id = sg.id 
                    ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT created_at FROM chat_messages 
                    WHERE group_id = sg.id 
                    ORDER BY created_at DESC LIMIT 1) as last_message_time,
                   (SELECT COUNT(*) FROM chat_messages 
                    WHERE group_id = sg.id AND sender_id != ? AND read_at IS NULL) as unread_count
            FROM study_groups sg
            JOIN study_group_members sgm ON sg.id = sgm.group_id
            WHERE sgm.user_id = ?
            ORDER BY last_message_time DESC
        ");
        $stmt->execute([$user['id'], $user['id']]);
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $groups = [];
    }
    
    echo json_encode([
        'direct_messages' => $directMessages,
        'groups' => $groups
    ]);
    exit;
}

// POST: Send message
if ($method === 'POST') {
    // Support JSON body and form-encoded POSTs
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        // fallback to $_POST for form submissions
        $data = $_POST;
    }

    $messageText = isset($data['message']) ? trim($data['message']) : (isset($data['text']) ? trim($data['text']) : '');
    if ($messageText === '') {
        http_response_code(400);
        echo json_encode(['message' => 'Message content required']);
        exit;
    }

    // Accept multiple possible parameter names for compatibility
    $possibleReceiverKeys = ['receiver_id', 'other_id', 'to', 'receiver', 'other_user_id'];
    $possibleGroupKeys = ['group_id', 'group', 'groupId'];

    $receiverId = null;
    foreach ($possibleReceiverKeys as $k) {
        if (isset($data[$k])) {
            $receiverId = filter_var($data[$k], FILTER_VALIDATE_INT);
            break;
        }
    }

    $groupId = null;
    foreach ($possibleGroupKeys as $k) {
        if (isset($data[$k])) {
            $groupId = filter_var($data[$k], FILTER_VALIDATE_INT);
            break;
        }
    }

    $messageType = $data['message_type'] ?? ($data['type'] ?? 'text');
    $fileUrl = $data['file_url'] ?? ($data['fileUrl'] ?? null);

    if ((!$receiverId || $receiverId === false) && (!$groupId || $groupId === false)) {
        http_response_code(400);
        echo json_encode(['message' => 'Either receiver_id or group_id required']);
        exit;
    }
    
    // If group message, verify user is member
    if ($groupId) {
        $stmt = $db->prepare("SELECT * FROM study_group_members WHERE group_id = ? AND user_id = ?");
        $stmt->execute([$groupId, $user['id']]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['message' => 'You are not a member of this group']);
            exit;
        }
    }
    
    $stmt = $db->prepare("
        INSERT INTO chat_messages (sender_id, receiver_id, group_id, message, message_type, file_url)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$user['id'], $receiverId, $groupId, $messageText, $messageType, $fileUrl]);
    $messageId = $db->lastInsertId();
    
    // Get the created message
    $stmt = $db->prepare("
        SELECT cm.*, u.full_name as sender_name
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.id
        WHERE cm.id = ?
    ");
    $stmt->execute([$messageId]);
    $message = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['message' => $message]);
    exit;
}

// GET: Get messages for a conversation
if ($method === 'GET' && isset($_GET['conversation'])) {
    $conversationType = $_GET['type'] ?? 'direct'; // 'direct' or 'group'
    $otherId = isset($_GET['other_id']) ? filter_var($_GET['other_id'], FILTER_VALIDATE_INT) : null;
    $groupId = isset($_GET['group_id']) ? filter_var($_GET['group_id'], FILTER_VALIDATE_INT) : null;
    
    if ($conversationType === 'direct' && $otherId) {
        // Get direct messages
        $stmt = $db->prepare("
            SELECT cm.*, u.full_name as sender_name
            FROM chat_messages cm
            JOIN users u ON cm.sender_id = u.id
            WHERE ((cm.sender_id = ? AND cm.receiver_id = ?) 
                   OR (cm.sender_id = ? AND cm.receiver_id = ?))
              AND cm.group_id IS NULL
            ORDER BY cm.created_at ASC
        ");
        $stmt->execute([$user['id'], $otherId, $otherId, $user['id']]);
        
        // Mark as read
        $updateStmt = $db->prepare("
            UPDATE chat_messages 
            SET read_at = NOW() 
            WHERE receiver_id = ? AND sender_id = ? AND read_at IS NULL
        ");
        $updateStmt->execute([$user['id'], $otherId]);
    } elseif ($conversationType === 'group' && $groupId) {
        // Verify membership
        $stmt = $db->prepare("SELECT * FROM study_group_members WHERE group_id = ? AND user_id = ?");
        $stmt->execute([$groupId, $user['id']]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['message' => 'You are not a member of this group']);
            exit;
        }
        
        // Get group messages
        $stmt = $db->prepare("
            SELECT cm.*, u.full_name as sender_name
            FROM chat_messages cm
            JOIN users u ON cm.sender_id = u.id
            WHERE cm.group_id = ?
            ORDER BY cm.created_at ASC
        ");
        $stmt->execute([$groupId]);
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid conversation parameters']);
        exit;
    }
    
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($messages);
    exit;
}


