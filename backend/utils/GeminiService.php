<?php

namespace Utils;

/**
 * Gemini AI Service for Question Generation
 * Uses Google Gemini API to generate unique CBT questions
 */
class GeminiService {
    private static $apiKey = null;
    // Use GA endpoint on generativelanguage.googleapis.com
    private static $apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
    private static $logFile = __DIR__ . '/../gemini-error.log';

    private static function logError($message, $context = []) {
        $entry = '[' . date('c') . '] ' . $message;
        if (!empty($context)) {
            $entry .= ' | ' . json_encode($context);
        }
        $entry .= PHP_EOL;
        @file_put_contents(self::$logFile, $entry, FILE_APPEND);
    }

    /**
     * Initialize API Key from environment or config
     */
    private static function getApiKey() {
        if (self::$apiKey !== null) {
            return self::$apiKey;
        }
        
        // Try to get from environment variable first
        $apiKey = getenv('GEMINI_API_KEY');
        
        // If not found, try config file (you can create backend/config/gemini.php)
        if (empty($apiKey)) {
            $configPath = __DIR__ . '/../config/gemini.php';
            if (file_exists($configPath)) {
                $config = require $configPath;
                $apiKey = $config['api_key'] ?? null;
            }
        }
        
        // Fallback: You should set this via environment variable
        // For now, return null and handle error gracefully
        self::$apiKey = $apiKey;
        return self::$apiKey;
    }

    /**
     * Generate unique questions for a CBT exam
     * 
     * @param string $courseTitle Course title
     * @param string $courseCode Course code
     * @param int $numQuestions Number of questions to generate
     * @param string $level Academic level (100, 200, 300, 400)
     * @return array Array of question objects
     */
    public static function generateQuestions($courseTitle, $courseCode, $numQuestions = 20, $level = '100') {
        $apiKey = self::getApiKey();
        
        if (empty($apiKey)) {
            // Fallback to generating basic questions if API key not set
            return self::generateFallbackQuestions($courseTitle, $courseCode, $numQuestions);
        }

        $prompt = "Generate {$numQuestions} unique multiple-choice questions for a {$level}-level course: {$courseCode} - {$courseTitle}.

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- One option must be clearly correct
- Questions should be appropriate for {$level}-level students
- Cover different topics within {$courseTitle}
- Format as JSON array with this structure:
[
  {
    \"question\": \"Question text here?\",
    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],
    \"correct_answer\": 0
  }
]
- correct_answer is the index (0-3) of the correct option
- Return ONLY valid JSON, no markdown, no explanations";

        try {
            $data = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 8192,
                ]
            ];

            $ch = curl_init(self::$apiUrl . '?key=' . urlencode($apiKey));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error) {
                self::logError("Gemini API cURL Error", ['error' => $error]);
                return self::generateFallbackQuestions($courseTitle, $courseCode, $numQuestions);
            }

            if ($httpCode !== 200) {
                self::logError("Gemini API HTTP Error", ['http_code' => $httpCode, 'response' => $response]);
                return self::generateFallbackQuestions($courseTitle, $courseCode, $numQuestions);
            }

            $result = json_decode($response, true);
            
            if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                error_log("Gemini API: Invalid response structure");
                return self::generateFallbackQuestions($courseTitle, $courseCode, $numQuestions);
            }

            $text = $result['candidates'][0]['content']['parts'][0]['text'];
            
            // Clean up the response - remove markdown code blocks if present
            $text = preg_replace('/```json\s*/', '', $text);
            $text = preg_replace('/```\s*/', '', $text);
            $text = trim($text);

            $questions = json_decode($text, true);

            if (!is_array($questions) || empty($questions)) {
                error_log("Gemini API: Failed to parse questions");
                return self::generateFallbackQuestions($courseTitle, $courseCode, $numQuestions);
            }

            // Validate and format questions
            $formattedQuestions = [];
            foreach ($questions as $q) {
                if (isset($q['question']) && isset($q['options']) && isset($q['correct_answer'])) {
                    if (count($q['options']) === 4 && $q['correct_answer'] >= 0 && $q['correct_answer'] < 4) {
                        $formattedQuestions[] = [
                            'question' => $q['question'],
                            'options' => $q['options'],
                            'correct_answer' => (int)$q['correct_answer']
                        ];
                    }
                }
            }

            // If we got fewer questions than requested, fill with fallback
            if (count($formattedQuestions) < $numQuestions) {
                $fallback = self::generateFallbackQuestions($courseTitle, $courseCode, $numQuestions - count($formattedQuestions));
                $formattedQuestions = array_merge($formattedQuestions, $fallback);
            }

            // Limit to requested number
            return array_slice($formattedQuestions, 0, $numQuestions);

        } catch (Exception $e) {
            self::logError("Gemini API Exception", ['message' => $e->getMessage()]);
            return self::generateFallbackQuestions($courseTitle, $courseCode, $numQuestions);
        }
    }

    /**
     * Generate AI solution for assignments
     */
    public static function generateSolution($prompt) {
        $apiKey = self::getApiKey();
        
        if (empty($apiKey)) {
            return "AI solution generation is currently unavailable. Please contact your instructor.";
        }

        try {
            $data = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.3,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 8192,
                ]
            ];

            $ch = curl_init(self::$apiUrl . '?key=' . urlencode($apiKey));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error || $httpCode !== 200) {
                self::logError("Gemini API Error", ['curl_error' => $error, 'http_code' => $httpCode, 'response' => $response]);
                return "AI solution generation failed. Please try again later.";
            }

            $result = json_decode($response, true);
            
            if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                return "AI solution generation failed. Please try again later.";
            }

            return $result['candidates'][0]['content']['parts'][0]['text'];

        } catch (Exception $e) {
            self::logError("Gemini API Exception", ['message' => $e->getMessage()]);
            return "AI solution generation failed. Please try again later.";
        }
    }

    /**
     * Generate fallback questions when API is unavailable
     */
    private static function generateFallbackQuestions($courseTitle, $courseCode, $numQuestions) {
        $questions = [];
        $topics = ['Introduction', 'Fundamentals', 'Advanced Concepts', 'Applications', 'Theory'];
        
        for ($i = 1; $i <= $numQuestions; $i++) {
            $topic = $topics[($i - 1) % count($topics)];
            $questions[] = [
                'question' => "Question {$i}: What is a key concept related to {$topic} in {$courseCode}?",
                'options' => [
                    "Option A: Basic concept",
                    "Option B: Intermediate concept",
                    "Option C: Advanced concept",
                    "Option D: Expert concept"
                ],
                'correct_answer' => ($i % 4) // Distribute correct answers
            ];
        }
        
        return $questions;
    }
}

