-- FUOYE Smart Campus Database Schema

CREATE DATABASE IF NOT EXISTS fuoye_smart_campus;
USE fuoye_smart_campus;

-- Settings Table (Admin configurable)
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(50) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matric_number VARCHAR(20) UNIQUE, -- Nullable for staff
    staff_id VARCHAR(20) UNIQUE,      -- Nullable for students
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('student', 'lecturer', 'admin') NOT NULL DEFAULT 'student',
    faculty VARCHAR(100),
    department VARCHAR(100),
    level INT, -- 100, 200, etc.
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(10) UNIQUE NOT NULL, -- e.g., CSC101
    title VARCHAR(100) NOT NULL,
    description TEXT,
    faculty VARCHAR(100),
    department VARCHAR(100),
    level INT,
    lecturer_id INT, -- Main lecturer
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam/Test Table
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    duration_minutes INT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    is_active BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT, -- Can be null if it's just in the bank
    course_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('mcq', 'true_false', 'short_answer') NOT NULL,
    options JSON, -- For MCQs: ["A", "B", "C", "D"]
    correct_answer TEXT NOT NULL,
    points INT DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam Results
CREATE TABLE IF NOT EXISTS exam_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    score DECIMAL(5, 2),
    total_score INT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Default Admin (Password: admin123)
-- Hash generated for 'admin123'
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('admin@fuoye.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin', 'admin')
ON DUPLICATE KEY UPDATE email=email;

-- Insert Default Settings
INSERT INTO settings (key_name, value) VALUES 
('school_name', 'Federal University Oye-Ekiti'),
('theme_mode', 'light'),
('primary_color', '#228B22') -- Forest Green
ON DUPLICATE KEY UPDATE value=value;
