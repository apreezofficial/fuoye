<?php

namespace Utils;

class Uploader {
    public static function upload($file, $destinationDir, $allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg']) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => 'File upload error code: ' . $file['error']];
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $allowedTypes)) {
            return ['success' => false, 'error' => 'Invalid file type'];
        }

        // Generate unique filename
        $filename = uniqid() . '_' . str_replace(' ', '_', $file['name']);
        $targetPath = $destinationDir . '/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return ['success' => true, 'filename' => $filename, 'path' => $targetPath];
        }

        return ['success' => false, 'error' => 'Failed to move uploaded file'];
    }
}
