-- Updated schema with faculty support

CREATE TABLE IF NOT EXISTS faculties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    faculty_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL
);

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
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL
);

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
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL
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
    UNIQUE KEY unique_registration (user_id, course_id, session, semester)
);

CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT DEFAULT 60,
    total_questions INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    score INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    answers JSON,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

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

-- Seed data
INSERT INTO settings (id) VALUES (1) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO faculties (name, code) VALUES 
('Science', 'SCI'),
('Arts', 'ART'),
('Engineering', 'ENG') 
ON DUPLICATE KEY UPDATE code=code;

INSERT INTO departments (name, code, faculty_id) VALUES 
('Computer Science', 'CSC', 1),
('Mathematics', 'MTH', 1),
('English', 'ENG', 2) 
ON DUPLICATE KEY UPDATE code=code;
