<?php

namespace Controllers;

use Core\Controller;
use Core\Database;

class SettingsController extends Controller {
    public function index() {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query("SELECT * FROM settings");
        $settings = $stmt->fetchAll();
        
        $formatted = [];
        foreach ($settings as $setting) {
            $formatted[$setting['key_name']] = $setting['value'];
        }

        return $this->json($formatted);
    }

    public function update() {
        // TODO: Add admin auth check here
        $input = $this->getInput();
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("INSERT INTO settings (key_name, value) VALUES (:key, :value) ON DUPLICATE KEY UPDATE value = :value");
        
        foreach ($input as $key => $value) {
            $stmt->execute(['key' => $key, 'value' => $value]);
        }

        return $this->json(['message' => 'Settings updated successfully']);
    }
}
