<?php

namespace Models;

use Core\Model;

class User extends Model {
    protected $table = 'users';

    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = :email");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch();
    }

    public function create($data) {
        $stmt = $this->db->prepare("INSERT INTO {$this->table} (full_name, email, password_hash, role, matric_number) VALUES (:full_name, :email, :password_hash, :role, :matric_number)");
        return $stmt->execute([
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'password_hash' => $data['password_hash'],
            'role' => $data['role'] ?? 'student',
            'matric_number' => $data['matric_number'] ?? null
        ]);
    }
}
