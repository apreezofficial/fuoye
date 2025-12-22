<?php

namespace Controllers;

use Core\Controller;
use Models\Course;

class CourseController extends Controller {
    public function index() {
        $courseModel = new Course();
        $courses = $courseModel->findAll();
        return $this->json($courses);
    }

    public function create() {
        // TODO: Admin/Lecturer only
        $input = $this->getInput();
        
        if (!isset($input['course_code']) || !isset($input['title'])) {
            return $this->json(['error' => 'Course code and title required'], 400);
        }

        $courseModel = new Course();
        if ($courseModel->findByCode($input['course_code'])) {
            return $this->json(['error' => 'Course code already exists'], 409);
        }

        $success = $courseModel->create($input);

        if ($success) {
            return $this->json(['message' => 'Course created successfully'], 201);
        } else {
            return $this->json(['error' => 'Failed to create course'], 500);
        }
    }
}
