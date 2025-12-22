<?php

namespace Controllers;

use Core\Controller;
use Utils\Uploader;
use Core\Database; // Direct DB access for now, or make a Material model

class UploadController extends Controller {
    public function uploadMaterial() {
        // TODO: Validate Lecturer/Admin role
        
        if (!isset($_FILES['file'])) {
            return $this->json(['error' => 'No file uploaded'], 400);
        }

        $courseId = $_POST['course_id'] ?? null;
        if (!$courseId) {
            return $this->json(['error' => 'Course ID required'], 400);
        }

        $uploadDir = __DIR__ . '/../public/uploads';
        $result = Uploader::upload($_FILES['file'], $uploadDir);

        if (!$result['success']) {
            return $this->json(['error' => $result['error']], 500);
        }

        // Save metadata to DB (Assuming a 'materials' table or separate logic)
        // For now, we'll just mock saving to DB
        // $materialModel->create(...)

        return $this->json([
            'message' => 'File uploaded successfully',
            'file_url' => '/uploads/' . $result['filename']
        ], 201);
    }
}
