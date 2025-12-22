<?php

namespace Models;

use Core\Model;

class Exam extends Model {
    protected $table = 'exams';

    public function create($data) {
        $stmt = $this->db->prepare("INSERT INTO {$this->table} (course_id, title, duration_minutes, start_time, end_time, is_active) VALUES (:course_id, :title, :duration_minutes, :start_time, :end_time, :is_active)");
        return $stmt->execute([
            'course_id' => $data['course_id'],
            'title' => $data['title'],
            'duration_minutes' => $data['duration_minutes'],
            'start_time' => $data['start_time'] ?? null,
            'end_time' => $data['end_time'] ?? null,
            'is_active' => $data['is_active'] ?? 0
        ]);
    }
}
