# Exam History System - Architecture & Workflow Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FUOYE Smart Campus                       │
│                    Exam History & Corrections                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│      FRONTEND (Next.js)          │    │      BACKEND (PHP)               │
├──────────────────────────────────┤    ├──────────────────────────────────┤
│                                  │    │                                  │
│  ┌────────────────────────────┐  │    │  ┌──────────────────────────┐  │
│  │  Student Dashboard         │  │    │  │  Student Endpoints       │  │
│  │  - Results Page            │  │◄───┼──┤  - /student/exams.php    │  │
│  │  - Shows exam history      │  │    │  │    ?history=1            │  │
│  │  - Calculates grades       │  │    │  └──────────────────────────┘  │
│  │  - Progress visualization  │  │    │                                  │
│  └────────────────────────────┘  │    │  ┌──────────────────────────┐  │
│                                  │    │  │  Admin Endpoints         │  │
│  ┌────────────────────────────┐  │    │  │  - /admin/exam-history   │  │
│  │  Admin Panel               │  │    │  │    (NEW)                 │  │
│  │  - Exams Submenu           │  │    │  │  - Supports filtering    │  │
│  │  - Exam History Page       │  │◄───┼──┤  - Role-based auth       │  │
│  │  - Expandable rows         │  │    │  │  - Answer comparison     │  │
│  │  - Answer review           │  │    │  └──────────────────────────┘  │
│  │  - Filter controls         │  │    │                                  │
│  └────────────────────────────┘  │    │                                  │
│                                  │    │  ┌──────────────────────────┐  │
│  ┌────────────────────────────┐  │    │  │  Database                │  │
│  │  Shared Components         │  │    │  │  ┌────────────────────┐  │  │
│  │  - Axios API Client        │  │    │  │  │ exam_attempts      │  │  │
│  │  - Error handling          │  │    │  │  │ exam_questions     │  │  │
│  │  - JWT interceptor         │  │    │  │  │ exams              │  │  │
│  └────────────────────────────┘  │    │  │  │ courses            │  │  │
│                                  │    │  │  │ users              │  │  │
└──────────────────────────────────┘    │  │  └────────────────────┘  │  │
                                        │  └──────────────────────────┘  │
                                        └──────────────────────────────────┘
```

---

## Student Exam History Flow

```
┌─────────────────┐
│ Student Login   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Authenticated Session Created        │
│ (JWT Token in localStorage)          │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Navigate to Dashboard                │
│ /app/dashboard/page.tsx              │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Click "Results" Menu Item            │
│ Route: /dashboard/results            │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ results/page.tsx Loads               │
│ - Show Loading Spinner               │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ useEffect Hook Triggers              │
│ - Calls fetchHistory()               │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ API Call: GET /student/exams.php?h=1    │
│ Headers: Authorization: Bearer {token}   │
└────────┬───────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Backend Validation                       │
│ 1. Check JWT token valid                 │
│ 2. Extract user_id from token            │
│ 3. Verify user exists                    │
└────────┬───────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Database Query                           │
│ SELECT * FROM exam_attempts              │
│ WHERE user_id = {authenticated_user_id}  │
│ JOIN exams, courses                      │
└────────┬───────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Backend Response                         │
│ {                                        │
│   "attempts": [                          │
│     {id, exam_title, score, ...}         │
│   ]                                      │
│ }                                        │
└────────┬───────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Frontend Response Handling               │
│ - Check if response is array             │
│ - Check if response.attempts exists      │
│ - Normalize to array                     │
│ - Log for debugging                      │
└────────┬───────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ State Update                             │
│ setAttempts(normalizedList)              │
│ setLoading(false)                        │
└────────┬───────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Component Render                         │
│ - Check if attempts.length > 0           │
│ - If yes: Render exam list               │
│ - If no: Show "No exam history" message  │
└────────┬───────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Display Exam Cards                       │
│ For each attempt:                        │
│ - Exam title                             │
│ - Course code & title                    │
│ - Score (15/20)                          │
│ - Grade (A-F)                            │
│ - Percentage (75%)                       │
│ - Progress bar                           │
│ - Date taken                             │
│ - Status (Completed/In Progress)         │
└──────────────────────────────────────────┘
```

---

## Admin Exam History Flow

```
┌──────────────────┐
│ Admin Login      │
│ role='admin'     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Navigate to Admin Portal     │
│ /admin/page.tsx              │
└────────┬──────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Click Exams in Navigation            │
│ (Submenu expands)                    │
│ - Manage Exams                       │
│ - Exam History (New!)                │
└────────┬───────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Click "Exam History"                 │
│ Route: /admin/exams/history          │
└────────┬───────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ history/page.tsx Loads               │
│ - Show Loading Spinner               │
│ - Show Filter Controls               │
└────────┬───────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ useEffect Hook Triggers                  │
│ - Calls fetchExamHistory()               │
│ - Builds query params from filters       │
└────────┬────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ API Call: GET /admin/exam-history.php    │
│ Query Params (optional):                 │
│ ?exam_id=1&user_id=2&course_id=3         │
│ Headers: Authorization: Bearer {token}   │
└────────┬────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Backend Authorization Check             │
│ 1. Check JWT token valid                │
│ 2. Check user.role === 'admin'          │
│ 3. If not admin: Return 403 Forbidden   │
└────────┬────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Backend Database Query                      │
│ SELECT * FROM exam_attempts ea              │
│ JOIN exams e ON ea.exam_id = e.id           │
│ JOIN courses c ON e.course_id = c.id        │
│ JOIN users u ON ea.user_id = u.id           │
│ WHERE (filters applied if provided)         │
│ ORDER BY completed_at DESC                  │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ For Each Exam Attempt:                      │
│ 1. Get exam_questions for this attempt_id   │
│    SELECT * FROM exam_questions             │
│    WHERE attempt_id = {id}                  │
│ 2. Parse answers JSON from exam_attempts    │
│ 3. Compare user answers with correct        │
│ 4. Build detailed answer array              │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Backend Response with Full Details          │
│ {                                           │
│   "data": [                                 │
│     {                                       │
│       "id": 1,                              │
│       "user_name": "John Doe",              │
│       "exam_title": "CSC 201",              │
│       "score": 15,                          │
│       "answers": [                          │
│         {                                   │
│           "question_text": "...",           │
│           "user_answer": "B",               │
│           "correct_answer": "B",            │
│           "is_correct": true                │
│         }                                   │
│       ]                                     │
│     }                                       │
│   ],                                        │
│   "total": 1                                │
│ }                                           │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ Frontend State Management                   │
│ setAttempts(data.data)                      │
│ setLoading(false)                           │
│ Log response for debugging                  │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│ Render Exam Attempts List                     │
│ For each attempt, show:                       │
│ ┌──────────────────────────────────────────┐  │
│ │ [Expandable Row Button]                  │  │
│ │ Exam: CSC 201 Mid Semester               │  │
│ │ Student: John Doe (john@fuoye.edu)       │  │
│ │ Course: CSC 201 - Programming            │  │
│ │ Score: 15/20 (75%)                       │  │
│ │ [Expand ▼]                               │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│ [When Expanded]                               │
│ ┌──────────────────────────────────────────┐  │
│ │ Started: 2024-01-15 10:00 AM             │  │
│ │ Completed: 2024-01-15 10:45 AM           │  │
│ │                                          │  │
│ │ Answer Review:                           │  │
│ │ ┌────────────────────────────────────┐   │  │
│ │ │ ✓ Q1: What is the output? [Green] │   │  │
│ │ │ Student: B ✓                       │   │  │
│ │ └────────────────────────────────────┘   │  │
│ │ ┌────────────────────────────────────┐   │  │
│ │ │ ✗ Q2: What does this do? [Red]     │   │  │
│ │ │ Student: A                         │   │  │
│ │ │ Correct: C                         │   │  │
│ │ └────────────────────────────────────┘   │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│ Admin Reviews Answer Details                  │
│ - Identifies which questions students miss   │
│ - Sees common wrong answers                  │
│ - Understands knowledge gaps                 │
│ - Can use to improve instruction             │
└────────────────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ first_name      │
│ last_name       │
│ email           │
│ role            │◄──────┐
│ ...             │       │
└────────┬────────┘       │
         │ 1:N            │
         │                │
         ▼                │
┌──────────────────────┐  │
│  exam_attempts       │  │
├──────────────────────┤  │
│ id (PK)              │  │
│ user_id (FK)         │──┘
│ exam_id (FK)         │─────┐
│ score                │     │
│ total_questions      │     │
│ answers (JSON)       │     │
│ started_at           │     │
│ completed_at         │     │
│ 1:N                  │     │
│ ▼                    │     │
│ exam_questions       │     │
│ - id (PK)            │     │
│ - attempt_id (FK)◄───┘     │
│ - question_text      │     │
│ - options (JSON)     │     │
│ - correct_answer_idx │     │
│ - question_order     │     │
└──────────────────────┘     │
                             │
         ┌───────────────────┘
         │
         ▼
┌─────────────────┐
│     exams       │
├─────────────────┤
│ id (PK)         │
│ course_id (FK)  │
│ title           │
│ duration_minutes│
│ ...             │
└────────┬────────┘
         │ N:1
         │
         ▼
┌─────────────────┐
│    courses      │
├─────────────────┤
│ id (PK)         │
│ code            │
│ title           │
│ ...             │
└─────────────────┘
```

---

## File Structure

```
fuoye-edu/
├── backend/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── assignments.php
│   │   │   ├── courses.php
│   │   │   ├── exam-history.php     ⭐ NEW
│   │   │   ├── materials.php
│   │   │   ├── stats.php
│   │   │   ├── study-groups.php
│   │   │   └── users.php
│   │   ├── student/
│   │   │   ├── exams.php            (existing - returns history)
│   │   │   └── ...
│   │   └── ...
│   ├── core/
│   ├── database/
│   ├── models/
│   └── ...
│
└── frontend/
    ├── app/
    │   ├── admin/
    │   │   ├── layout.tsx            ⭐ MODIFIED (added Exams submenu)
    │   │   ├── exams/
    │   │   │   ├── page.tsx
    │   │   │   ├── create/
    │   │   │   └── history/
    │   │   │       └── page.tsx      ⭐ NEW
    │   │   └── ...
    │   ├── dashboard/
    │   │   ├── results/
    │   │   │   └── page.tsx          ⭐ MODIFIED (enhanced logging)
    │   │   └── ...
    │   └── ...
    └── ...
```

---

## Response Flow Diagram

```
CLIENT REQUEST
    ▼
┌────────────────────────────────────┐
│ Frontend (Next.js/React)           │
│ - results/page.tsx (Student)       │
│ - exams/history/page.tsx (Admin)   │
└────────┬─────────────────────────────┘
         │ HTTP GET Request
         │ + JWT Token
         ▼
┌────────────────────────────────────┐
│ API Gateway / Axios Interceptor    │
│ - Add Authorization header         │
│ - Handle 401 responses             │
│ - Log errors safely                │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Backend PHP Endpoint               │
│ - /student/exams.php?history=1     │
│ - /admin/exam-history.php          │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Authentication & Authorization     │
│ 1. requireAuth($db) - validate JWT │
│ 2. Check role (admin endpoint)     │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Database Layer                     │
│ - Query exam_attempts              │
│ - Join with related tables         │
│ - Load exam_questions              │
│ - Process answers                  │
└────────┬─────────────────────────────┘
         │ Data Retrieved
         ▼
┌────────────────────────────────────┐
│ Data Normalization (Backend)       │
│ - Map fields to response format    │
│ - Calculate percentages            │
│ - Build answer details             │
│ - JSON encode response             │
└────────┬─────────────────────────────┘
         │ JSON Response
         ▼
┌────────────────────────────────────┐
│ Response Interceptor (Frontend)    │
│ - Parse JSON                       │
│ - Check for errors                 │
│ - Handle 401 responses             │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Frontend Response Handler          │
│ - Normalize response format        │
│ - Handle multiple API shapes       │
│ - Validate data types              │
│ - Log for debugging                │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ State Management (React)           │
│ - setState with normalized data    │
│ - Clear loading state              │
│ - Trigger re-render                │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Component Render                   │
│ - Display exam history             │
│ - Show grades/scores               │
│ - Render expandable rows           │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ USER SEES RESULTS                  │
│ - List of exams with scores        │
│ - Answer details (admin)           │
│ - Filters working (admin)          │
└────────────────────────────────────┘
```

---

## Authentication Flow

```
┌──────────────────┐
│ User Credentials │
│ email + password │
└────────┬─────────┘
         │ POST /auth/login
         ▼
┌──────────────────────────────┐
│ Backend Auth Validation      │
│ - Check email exists         │
│ - Verify password hash       │
│ - Get user with role         │
└────────┬──────────────────────┘
         │ If valid
         ▼
┌──────────────────────────────┐
│ Generate JWT Token           │
│ Payload:                     │
│ {                            │
│   "id": 2,                   │
│   "email": "john@...",       │
│   "role": "student"          │
│ }                            │
└────────┬──────────────────────┘
         │ Return token
         ▼
┌──────────────────────────────┐
│ Frontend Storage             │
│ localStorage.setItem(        │
│   'token',                   │
│   jwt_token                  │
│ )                            │
└────────┬──────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Subsequent API Requests      │
│ Headers: {                   │
│   Authorization:             │
│   'Bearer ' + token          │
│ }                            │
└────────┬──────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend Verification         │
│ 1. Decode JWT                │
│ 2. Extract user_id & role    │
│ 3. Check permissions         │
│ 4. Execute request           │
└──────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────┐
│ Potential Error Point   │
└────────┬────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │ Type of Error?                  │
    └─────────────────────────────────┘
         │
    ┌────┼────┬─────────┬─────────┐
    │    │    │         │         │
    ▼    ▼    ▼         ▼         ▼
  [JWT] [DB] [Parse]   [Role]    [Invalid]
    │    │    │         │         │
    ▼    ▼    ▼         ▼         ▼
  401  500  400        403       400
  |    |    |          |         |
  └────┴────┴──────────┴─────────┘
         │
         ▼
┌────────────────────────────────┐
│ Frontend Error Handler         │
│ - Log error to console         │
│ - Show user-friendly message   │
│ - Suggest next action          │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ User Sees Error Message        │
│ & Knows How to Fix             │
└────────────────────────────────┘
```

---

This document provides visual representation of how the exam history system works at the architectural, workflow, and data flow levels.
