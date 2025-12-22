<?php

// Auth Routes
$router->post('/api/auth/login', ['Controllers\AuthController', 'login']);
$router->post('/api/auth/register', ['Controllers\AuthController', 'register']);

// Settings Routes
$router->get('/api/settings', ['Controllers\SettingsController', 'index']);
$router->post('/api/settings', ['Controllers\SettingsController', 'update']);

// User Routes
$router->get('/api/users', ['Controllers\UserController', 'index']);

// Course Routes
$router->get('/api/courses', ['Controllers\CourseController', 'index']);
$router->post('/api/courses', ['Controllers\CourseController', 'create']);
// Upload Route
$router->post('/api/upload', ['Controllers\UploadController', 'uploadMaterial']);

// CBT Routes
$router->get('/api/exams', ['Controllers\ExamController', 'index']);
$router->post('/api/exams', ['Controllers\ExamController', 'createExam']);
$router->get('/api/questions', ['Controllers\ExamController', 'getQuestions']);
$router->post('/api/questions', ['Controllers\ExamController', 'addQuestion']);