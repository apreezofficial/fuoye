<?php

namespace Utils;

/**
 * Security Utilities
 * Provides input validation, rate limiting, and CSRF protection
 */
class Security {
    
    /**
     * Sanitize input string
     */
    public static function sanitize($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitize'], $input);
        }
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Validate email
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate integer
     */
    public static function validateInt($value, $min = null, $max = null) {
        $int = filter_var($value, FILTER_VALIDATE_INT);
        if ($int === false) return false;
        if ($min !== null && $int < $min) return false;
        if ($max !== null && $int > $max) return false;
        return $int;
    }

    /**
     * Rate limiting check (simple in-memory, for production use Redis)
     */
    private static $rateLimitStore = [];

    public static function checkRateLimit($identifier, $maxRequests = 10, $windowSeconds = 60) {
        $now = time();
        $key = $identifier . '_' . floor($now / $windowSeconds);
        
        if (!isset(self::$rateLimitStore[$key])) {
            self::$rateLimitStore[$key] = 0;
        }
        
        self::$rateLimitStore[$key]++;
        
        // Clean old entries
        foreach (self::$rateLimitStore as $k => $v) {
            if (strpos($k, $identifier) === 0) {
                $keyTime = (int)explode('_', $k)[1];
                if ($now - ($keyTime * $windowSeconds) > $windowSeconds * 2) {
                    unset(self::$rateLimitStore[$k]);
                }
            }
        }
        
        return self::$rateLimitStore[$key] <= $maxRequests;
    }

    /**
     * Generate CSRF token
     */
    public static function generateCsrfToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        return $token;
    }

    /**
     * Verify CSRF token
     */
    public static function verifyCsrfToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Validate password strength
     */
    public static function validatePassword($password, $minLength = 8) {
        if (strlen($password) < $minLength) {
            return false;
        }
        // At least one letter and one number
        if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
            return false;
        }
        return true;
    }

    /**
     * Prevent SQL injection by using prepared statements (already done via PDO)
     * This is a reminder to always use prepared statements
     */
    public static function preventSqlInjection($db, $query, $params = []) {
        // Always use prepared statements - this is just a wrapper reminder
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Validate JSON input
     */
    public static function validateJson($jsonString) {
        $decoded = json_decode($jsonString, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : null;
    }

    /**
     * Get client IP address
     */
    public static function getClientIp() {
        $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}


