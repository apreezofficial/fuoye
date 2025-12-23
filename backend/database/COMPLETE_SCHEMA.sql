-- =====================================================
-- FUOYE SMART CAMPUS - COMPLETE DATABASE SCHEMA
-- =====================================================
-- This file contains the complete database schema for the FUOYE Smart Campus platform
-- Created: 2025-12-23

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Faculties Table
CREATE TABLE IF NOT EXISTS faculties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    faculty_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Student', 'Lecturer', 'Admin') DEFAULT 'Student',
    matric_number VARCHAR(20) UNIQUE,
    department_id INT,
    faculty_id INT,
    level VARCHAR(10), -- Current level (100, 200, 300, 400)
    token VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_matric_number (matric_number)
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    unit INT DEFAULT 2,
    level VARCHAR(10) NOT NULL, -- 100, 200, 300, 400
    department_id INT,
    faculty_id INT, -- Faculty-based filtering
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL,
    INDEX idx_code (code),
    INDEX idx_level (level),
    INDEX idx_department_id (department_id)
);

-- Course Registration Table
CREATE TABLE IF NOT EXISTS course_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    session VARCHAR(50) NOT NULL, -- e.g., "2024/2025"
    semester ENUM('Harmattan', 'Rain') NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (user_id, course_id, session, semester),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_session (session)
);

-- =====================================================
-- EXAM & CBT TABLES
-- =====================================================

-- Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT DEFAULT 60,
    total_questions INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id)
);

-- Exam Attempts Table
CREATE TABLE IF NOT EXISTS exam_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    score INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    answers JSON, -- Store user answers with structure: {question_id: {user_answer, correct_answer, is_correct}}
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_exam_id (exam_id),
    INDEX idx_started_at (started_at)
);

-- Exam Questions Table (Questions per attempt for unique exam generation)
CREATE TABLE IF NOT EXISTS exam_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL, -- Array of 4 options: ["option1", "option2", "option3", "option4"]
    correct_answer_index INT NOT NULL, -- 0-3 index of correct answer
    question_order INT NOT NULL, -- Order of question in exam (1, 2, 3...)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    INDEX idx_attempt_id (attempt_id),
    INDEX idx_question_order (attempt_id, question_order)
);

-- =====================================================
-- COURSE MATERIALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS course_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    uploaded_by INT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_course_id (course_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_verified (is_verified)
);

-- =====================================================
-- ASSIGNMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    due_date DATETIME,
    max_score INT DEFAULT 100,
    created_by INT NOT NULL, -- User ID (admin/lecturer)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_created_by (created_by),
    INDEX idx_due_date (due_date)
);

-- Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    ai_solution TEXT, -- AI-generated solution if requested
    score INT DEFAULT NULL,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_submission (assignment_id, user_id),
    INDEX idx_assignment_id (assignment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_submitted_at (submitted_at)
);

-- =====================================================
-- CHAT & COMMUNICATION TABLES
-- =====================================================

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT, -- NULL for group messages
    group_id INT, -- NULL for direct messages
    message TEXT NOT NULL,
    message_type ENUM('text', 'file', 'image') DEFAULT 'text',
    file_url VARCHAR(500),
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_group (group_id),
    INDEX idx_created (created_at)
);

-- =====================================================
-- STUDY GROUPS TABLES
-- =====================================================

-- Study Groups Table
CREATE TABLE IF NOT EXISTS study_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    course_id INT, -- Optional: can be course-specific or general
    created_by INT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    max_members INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_created_by (created_by),
    INDEX idx_is_public (is_public)
);

-- Study Group Members Table
CREATE TABLE IF NOT EXISTS study_group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(255) DEFAULT 'Federal University Oye-Ekiti',
    platform_name VARCHAR(255) DEFAULT 'FUOYE Nexus',
    tagline VARCHAR(255) DEFAULT 'Innovation and Character',
    logo_url VARCHAR(255) DEFAULT '',
    icon_url VARCHAR(255) DEFAULT '',
    footer_text VARCHAR(255) DEFAULT '© 2025 FUOYE. All Rights Reserved.',
    primary_color VARCHAR(50) DEFAULT '#228B22',
    secondary_color VARCHAR(50) DEFAULT '#0F172A',
    default_theme ENUM('light', 'dark') DEFAULT 'light',
    allow_theme_switch BOOLEAN DEFAULT TRUE,
    font_family VARCHAR(50) DEFAULT 'Inter',
    enable_registration BOOLEAN DEFAULT TRUE,
    matric_regex VARCHAR(255) DEFAULT '^FUO\/[0-9]{2}\/[A-Z]{3}\/[0-9]{3}$',
    min_password_length INT DEFAULT 8,
    current_session VARCHAR(50) DEFAULT '2024/2025',
    current_semester ENUM('Harmattan', 'Rain') DEFAULT 'Harmattan',
    course_reg_open BOOLEAN DEFAULT TRUE,
    exam_period_open BOOLEAN DEFAULT FALSE,
    feature_cbt BOOLEAN DEFAULT TRUE,
    feature_ai_tutor BOOLEAN DEFAULT TRUE,
    feature_games BOOLEAN DEFAULT FALSE,
    feature_events BOOLEAN DEFAULT TRUE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT DEFAULT 'We are currently performing scheduled maintenance.',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- INITIAL DATA / SEED DATA
-- =====================================================

-- Insert default settings (only if not exists)
INSERT INTO settings (id) VALUES (1) ON DUPLICATE KEY UPDATE id=id;

-- Insert default faculties
INSERT INTO faculties (name, code) VALUES 
('Science', 'SCI'),
('Arts', 'ART'),
('Engineering', 'ENG') 
ON DUPLICATE KEY UPDATE code=code;

-- Insert default departments
INSERT INTO departments (name, code, faculty_id) VALUES 
('Computer Science', 'CSC', 1),
('Mathematics', 'MTH', 1),
('English', 'ENG', 2) 
ON DUPLICATE KEY UPDATE code=code;

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
/*
TABLE RELATIONSHIPS:
- faculties → departments (1:M)
- faculties → users (1:M) via faculty_id
- faculties → courses (1:M) via faculty_id
- departments → users (1:M)
- departments → courses (1:M)
- users → course_registrations (1:M)
- users → exams (1:M) via exam_attempts
- users → exam_attempts (1:M)
- users → assignments (1:M) via assignment_submissions
- users → chat_messages (1:M) via sender_id
- users → study_groups (1:M) via created_by
- users → study_group_members (1:M)
- courses → course_registrations (1:M)
- courses → exams (1:M)
- courses → course_materials (1:M)
- courses → assignments (1:M)
- courses → study_groups (1:M)
- exams → exam_attempts (1:M)
- exam_attempts → exam_questions (1:M)
- assignments → assignment_submissions (1:M)
- study_groups → study_group_members (1:M)

KEY FEATURES:
1. Faculty & Department Structure: Hierarchical organization
2. Course Registration: Tracks student enrollment with session and semester
3. Exam System: 
   - Dynamic question generation per attempt (via Gemini AI)
   - Questions stored in exam_questions for each attempt
   - JSON-based answer storage for flexible data format
4. Assignments: Full submission tracking with AI solution generation
5. Chat: Support for both direct messages and group conversations
6. Study Groups: Collaborative learning spaces with role-based membership
7. Course Materials: Versioned with verification system
8. Settings: Centralized configuration for the entire platform
*/
