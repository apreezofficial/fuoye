# Quick Start Guide - Exam History Feature

## What's New?

### For Students
📊 **Dashboard → Results** now shows:
- List of all completed exams
- Score (15/20), Percentage (75%), and Letter Grade (A)
- Course name and exam date
- Progress bar visualization
- Status indicator (Completed vs In Progress)

### For Admins  
👨‍💼 **Admin → Exams → Exam History** now shows:
- All student exam attempts across all courses
- Student name, email, exam details, and final score
- **Expandable rows** with question-by-question answer review
- Color-coded correct (✓ Green) vs wrong (✗ Red) answers
- Shows student answer and correct answer for wrong ones
- Filter options to find specific students, exams, or courses

---

## How to Use

### As a Student
1. Go to **Dashboard** (after login)
2. Click **Results** in the left menu
3. See your exam history and scores
4. Each exam card shows:
   - Exam title
   - Course code
   - Date taken
   - Number of questions
   - Your score and grade

### As an Administrator
1. Go to **Admin Portal** (after login as admin)
2. Find **Exams** menu and expand it
3. Click **Exam History**
4. See all student exam attempts
5. **To view detailed answers:**
   - Click on any exam row to expand it
   - Review answers question-by-question
   - Green background = Correct
   - Red background = Wrong (shows correct answer below)

### Filter Results
1. Use the filter fields at the top:
   - **Filter by Exam ID**: Enter exam number to see one exam
   - **Filter by User ID**: Enter student ID to see one student's attempts
   - **Filter by Course ID**: Enter course ID to see one course's exams
2. Click **Apply Filters**
3. Results update to match your filter

---

## API Endpoints

### For Students: Get Your Exam History
```
GET http://localhost/backend/api/student/exams.php?history=1

Headers:
  Authorization: Bearer {your_jwt_token}

Response:
{
  "attempts": [
    {
      "id": 1,
      "exam_title": "CSC 201 Mid Semester Test",
      "course_code": "CSC 201",
      "score": 15,
      "total_questions": 20,
      "started_at": "2024-01-15 10:00:00",
      "completed_at": "2024-01-15 10:45:00"
    }
  ]
}
```

### For Admins: Get All Exam Attempts
```
GET http://localhost/backend/api/admin/exam-history.php

Optional Query Parameters:
  ?exam_id=1       - Filter by exam ID
  ?user_id=2       - Filter by student user ID
  ?course_id=3     - Filter by course ID

Headers:
  Authorization: Bearer {admin_jwt_token}

Response:
{
  "data": [
    {
      "id": 1,
      "user_name": "John Doe",
      "user_email": "john@fuoye.edu",
      "exam_title": "CSC 201 Mid Semester Test",
      "score": 15,
      "total_questions": 20,
      "answers": [
        {
          "question_text": "What is...?",
          "user_answer": "B",
          "correct_answer": "B",
          "is_correct": true
        }
      ]
    }
  ],
  "total": 1
}
```

---

## Troubleshooting

### ❌ "No exam history" displayed
**Check:**
- Are you logged in? (Green user icon should show)
- Have you completed any exams? (Check database for exam_attempts records)
- Check browser console (F12) for error logs

### ❌ Admin page shows "Unauthorized" 
**Fix:**
- Verify your user role is 'admin' in database
- Try logging out and back in
- Check JWT token hasn't expired

### ❌ Answer details show "Unknown Question"
**Issue:**
- Questions not properly linked in database
- Admin should check exam_questions table is populated

### 🔍 Slow loading?
- If you have many exam attempts, use filters to narrow results
- Filter by user_id or exam_id to see specific data

---

## Files Changed

### Created
- ✅ `/backend/api/admin/exam-history.php` - Admin API endpoint
- ✅ `/frontend/app/admin/exams/history/page.tsx` - Admin page

### Modified
- ✅ `/frontend/app/admin/layout.tsx` - Added Exams submenu
- ✅ `/frontend/app/dashboard/results/page.tsx` - Added logging & error handling

---

## Database Requirements

The feature uses these existing tables:
- **exam_attempts** - Student exam attempt records
- **exam_questions** - Questions shown to each student
- **exams** - Exam definitions
- **courses** - Course information
- **users** - Student and admin user accounts

---

## FAQ

**Q: Can students see other students' exams?**
A: No, students only see their own exam history. The backend validates this.

**Q: Can admins edit grades?**
A: Not yet - the current interface is read-only for reviewing answers. Grading edits can be added later.

**Q: How are answers stored?**
A: Answers are stored as JSON in the `exam_attempts.answers` column with the format:
```json
{
  "1": {"user_answer": "B", "correct_answer": "B", "is_correct": true},
  "2": {"user_answer": "A", "correct_answer": "C", "is_correct": false}
}
```

**Q: What if an exam is in progress (not completed)?**
A: It still shows in the list but marked as "In Progress" without a grade or score.

**Q: Can I export exam results?**
A: Not yet - that feature can be added later. Currently view and print from browser.

---

## Tips & Tricks

💡 **For Better Performance:**
- Use filters if viewing large amounts of data
- Filter by recent date in admin if available
- Check filters are cleared before viewing all attempts

💡 **For Reviewing Answers:**
- Sort by student name mentally to group by student
- Use User ID filter to review all attempts by one student
- Scroll through expanded answers to identify common wrong answers

💡 **Debugging:**
- Check browser DevTools Console (F12) for detailed logs
- Look for API response in Network tab if having issues
- Check backend error log files for more details

---

## Support

If something isn't working:
1. **Refresh the page** - Sometimes caching causes issues
2. **Check console logs** - F12 → Console tab → Look for errors
3. **Verify login** - Logout and login again
4. **Check database** - Verify exam attempts exist in database
5. **Clear filters** - Reset all filter fields and try again

Contact your administrator if issues persist.
