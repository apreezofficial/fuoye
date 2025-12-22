<?php

namespace Controllers;

use Core\Controller;
use Models\User;
use Utils\Jwt;

class AuthController extends Controller {
    public function login() {
        $input = $this->getInput();
        if (!isset($input['email']) || !isset($input['password'])) {
            return $this->json(['error' => 'Email and password required'], 400);
        }

        $userModel = new User();
        $user = $userModel->findByEmail($input['email']);

        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            return $this->json(['error' => 'Invalid credentials'], 401);
        }

        $tokenPayload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'exp' => time() + (60 * 60 * 24) // 24 hours
        ];

        $token = Jwt::encode($tokenPayload);

        return $this->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'full_name' => $user['full_name'],
                'role' => $user['role']
            ]
        ]);
    }

    public function register() {
        $input = $this->getInput();
        // TODO: Add strict validation based on Admin settings (Matric regex etc.)
        
        if (!isset($input['email']) || !isset($input['password']) || !isset($input['full_name'])) {
            return $this->json(['error' => 'Missing fields'], 400);
        }

        $userModel = new User();
        if ($userModel->findByEmail($input['email'])) {
            return $this->json(['error' => 'Email already exists'], 409);
        }

        $success = $userModel->create([
            'full_name' => $input['full_name'],
            'email' => $input['email'],
            'password_hash' => password_hash($input['password'], PASSWORD_DEFAULT),
            'role' => 'student', // Default to student
            'matric_number' => $input['matric_number'] ?? null
        ]);

        if ($success) {
            return $this->json(['message' => 'Registration successful'], 201);
        } else {
            return $this->json(['error' => 'Registration failed'], 500);
        }
    }
}
