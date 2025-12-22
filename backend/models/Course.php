<?php

namespace Models;

use Core\Model;

class Course extends Model {
    protected $table = 'courses';

    public function create($data) {
        $stmt = $this->db->prepare("INSERT INTO {$this->table} (course_code, title, description, faculty, department, level, lecturer_id) VALUES (:course_code, :title, :description, :faculty, :department, :level, :lecturer_id)");
        return $stmt->execute([
            'course_code' => $data['course_code'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'faculty' => $data['faculty'],
            'department' => $data['department'],
            'level' => $data['level'],
            'lecturer_id' => $data['lecturer_id'] ?? null
        ]);
    }

    public function findByCode($code) {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE course_code = :code");
        $stmt->execute(['code' => $code]);
        return $stmt->fetch();
    }
}
