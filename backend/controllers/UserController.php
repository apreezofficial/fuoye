<?php

namespace Controllers;

use Core\Controller;
use Models\User;

class UserController extends Controller {
    public function index() {
        // TODO: Add auth check/admin check
        $userModel = new User();
        $users = $userModel->findAll();
        
        // Remove passwords from output
        foreach ($users as &$user) {
            unset($user['password_hash']);
        }
        
        return $this->json($users);
    }
}
