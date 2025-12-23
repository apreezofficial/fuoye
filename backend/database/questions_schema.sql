GIT-- Schema for storing exam questions per attempt
-- This ensures each user gets unique questions

CREATE TABLE IF NOT EXISTS exam_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL, -- Array of 4 options
    correct_answer_index INT NOT NULL, -- 0-3 index of correct answer
    question_order INT NOT NULL, -- Order of question in exam (1, 2, 3...)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    INDEX idx_attempt_id (attempt_id),
    INDEX idx_question_order (attempt_id, question_order)
);


