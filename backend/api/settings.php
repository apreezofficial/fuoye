<?php
require_once __DIR__ . '/../core/bootstrap.php';

// GET Settings
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $db->query("SELECT * FROM settings LIMIT 1");
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Ensure booleans are returned as actual booleans/integers, not strings if possible, 
        // though PHP PDO often returns strings. Frontend should handle type conversion.
        echo json_encode($settings);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Database error']);
    }
    exit;
}

// UPDATE Settings
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Construct Dynamic Update Query
    // This allows us to update only passed fields, or all.
    // However, for this massive form, usually full update is easier.
    
    $fields = [
        'school_name', 'platform_name', 'tagline', 'logo_url', 'footer_text',
        'primary_color', 'secondary_color', 'default_theme', 'allow_theme_switch', 'font_family',
        'enable_registration', 'matric_regex', 'min_password_length',
        'current_session', 'current_semester', 'course_reg_open', 'exam_period_open',
        'feature_cbt', 'feature_ai_tutor', 'feature_games', 'feature_events',
        'maintenance_mode', 'maintenance_message'
    ];

    $updateParts = [];
    $params = [];

    foreach ($fields as $field) {
        if (isset($data[$field])) {
            $updateParts[] = "$field = ?";
            // Handle boolean conversion if necessary (e.g. true -> 1)
            $val = $data[$field];
            if (is_bool($val)) $val = $val ? 1 : 0;
            $params[] = $val;
        }
    }

    if (empty($updateParts)) {
        echo json_encode(['message' => 'No changes provided']);
        exit;
    }

    $sql = "UPDATE settings SET " . implode(', ', $updateParts) . " WHERE id = 1";
    
    try {
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['message' => 'Settings updated successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Update failed: ' . $e->getMessage()]);
    }
    exit;
}
