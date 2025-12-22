<?php

namespace Models;

use Core\Model;

class Question extends Model {
    protected $table = 'questions';

    public function create($data) {
        $stmt = $this->db->prepare("INSERT INTO {$this->table} (course_id, question_text, question_type, options, correct_answer, points) VALUES (:course_id, :question_text, :question_type, :options, :correct_answer, :points)");
        return $stmt->execute([
            'course_id' => $data['course_id'],
            'question_text' => $data['question_text'],
            'question_type' => $data['question_type'],
            'options' => json_encode($data['options']),
            'correct_answer' => $data['correct_answer'],
            'points' => $data['points'] ?? 1
        ]);
    }

    public function findByCourse($courseId) {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE course_id = :course_id");
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetchAll();
    }
}
