<?php

namespace Controllers;

use Core\Controller;
use Models\Exam;
use Models\Question;

class ExamController extends Controller {
    public function index() {
        $examModel = new Exam();
        $exams = $examModel->findAll();
        // TODO: Join with course name for better display
        return $this->json($exams);
    }

    public function createExam() {
        $input = $this->getInput();
        $examModel = new Exam();
        
        if (!isset($input['course_id']) || !isset($input['title']) || !isset($input['duration_minutes'])) {
            return $this->json(['error' => 'Missing fields'], 400);
        }

        $success = $examModel->create($input);
        if ($success) {
            return $this->json(['message' => 'Exam created successfully'], 201);
        }
        return $this->json(['error' => 'Failed to create exam'], 500);
    }

    public function addQuestion() {
        $input = $this->getInput();
        $questionModel = new Question();

        if (!isset($input['course_id']) || !isset($input['question_text']) || !isset($input['correct_answer'])) {
            return $this->json(['error' => 'Missing fields'], 400);
        }

        $success = $questionModel->create($input);
        if ($success) {
            return $this->json(['message' => 'Question added successfully'], 201);
        }
        return $this->json(['error' => 'Failed to add question'], 500);
    }

    public function getQuestions() {
        $courseId = $_GET['course_id'] ?? null;
        if (!$courseId) return $this->json(['error' => 'Course ID required'], 400);

        $questionModel = new Question();
        $questions = $questionModel->findByCourse($courseId);
        return $this->json($questions);
    }
}
