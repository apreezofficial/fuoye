-- FUOYE Smart Campus - Database Diagnostic Queries
-- Run these queries to check your database health

-- 1. Check table row counts
SELECT 'faculties' as table_name, COUNT(*) as rows FROM faculties
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'course_registrations', COUNT(*) FROM course_registrations
UNION ALL
SELECT 'exams', COUNT(*) FROM exams
UNION ALL
SELECT 'exam_attempts', COUNT(*) FROM exam_attempts
UNION ALL
SELECT 'exam_questions', COUNT(*) FROM exam_questions
UNION ALL
SELECT 'course_materials', COUNT(*) FROM course_materials
UNION ALL
SELECT 'assignments', COUNT(*) FROM assignments
UNION ALL
SELECT 'assignment_submissions', COUNT(*) FROM assignment_submissions
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages
UNION ALL
SELECT 'study_groups', COUNT(*) FROM study_groups
UNION ALL
SELECT 'study_group_members', COUNT(*) FROM study_group_members
UNION ALL
SELECT 'settings', COUNT(*) FROM settings;

-- 2. Check exam attempts and their questions
SELECT 
    ea.id as attempt_id,
    ea.user_id,
    e.id as exam_id,
    e.title as exam_title,
    COUNT(eq.id) as question_count,
    ea.score,
    ea.started_at,
    ea.completed_at
FROM exam_attempts ea
JOIN exams e ON ea.exam_id = e.id
LEFT JOIN exam_questions eq ON ea.id = eq.attempt_id
GROUP BY ea.id
ORDER BY ea.created_at DESC
LIMIT 10;

-- 3. Check courses with exam counts
SELECT 
    c.id,
    c.code,
    c.title,
    COUNT(DISTINCT e.id) as exam_count,
    COUNT(DISTINCT cr.user_id) as student_count
FROM courses c
LEFT JOIN exams e ON c.id = e.course_id
LEFT JOIN course_registrations cr ON c.id = cr.course_id
GROUP BY c.id
ORDER BY c.code;

-- 4. Check students and their registrations
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.matric_number,
    u.level,
    COUNT(cr.id) as registered_courses,
    COUNT(ea.id) as exam_attempts
FROM users u
LEFT JOIN course_registrations cr ON u.id = cr.user_id
LEFT JOIN exam_attempts ea ON u.id = ea.user_id
WHERE u.role = 'Student'
GROUP BY u.id
ORDER BY u.created_at DESC
LIMIT 20;

-- 5. Recent questions added to system
SELECT 
    eq.id,
    eq.attempt_id,
    eq.question_text,
    eq.question_order,
    ea.user_id,
    e.course_id,
    c.code as course_code,
    eq.created_at
FROM exam_questions eq
JOIN exam_attempts ea ON eq.attempt_id = ea.id
JOIN exams e ON ea.exam_id = e.id
JOIN courses c ON e.course_id = c.id
ORDER BY eq.created_at DESC
LIMIT 50;
