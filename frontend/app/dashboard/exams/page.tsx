'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { BookOpen, Play, Loader2, FileText, Clock, GraduationCap } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ExamsPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [showConfig, setShowConfig] = useState(false);
    const [examConfig, setExamConfig] = useState({
        duration_minutes: 60,
        total_questions: 20
    });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/student/courses.php');
                // Get registered courses
                const registeredStmt = await api.get('/student/register-courses.php');
                const registeredIds = registeredStmt.data.registered_courses || [];
                
                // Filter to only show registered courses
                const registeredCourses = data.courses.filter((course: any) => 
                    registeredIds.includes(course.id)
                );
                
                setCourses(registeredCourses);
                // Fetch past attempts/history
                try {
                    const hist = await api.get('/student/exams.php?history=1');
                    setAttempts(hist.data.attempts || []);
                } catch (err) {
                    console.warn('Failed to fetch exam history', err);
                }
            } catch (error: any) {
                console.error("Failed to fetch courses", error);
                toast.error('Failed to load courses', {
                    description: error.response?.data?.message || 'Please try again later'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const startExam = async (course: any) => {
        try {
            toast.loading('Generating questions with AI...', {
                id: 'exam-start'
            });
            
            const { data } = await api.post('/student/exams.php', {
                course_id: course.id,
                duration_minutes: examConfig.duration_minutes,
                total_questions: examConfig.total_questions
            });
            
            toast.success('Exam ready!', {
                id: 'exam-start',
                description: 'Good luck!'
            });
            
            router.push(`/dashboard/exams/${data.attempt_id}`);
        } catch (error: any) {
            toast.error('Failed to start exam', {
                id: 'exam-start',
                description: error.response?.data?.message || 'Please try again'
            });
        }
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button variant="outline" onClick={() => router.push('/dashboard/exams/history')}>View Past Exams</Button>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Take CBT Exam</h1>
                <p className="text-gray-500">Select a course to take an AI-generated exam.</p>
            </div>

            {/* Exam Configuration */}
            {showConfig && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Exam Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                min="15"
                                max="180"
                                value={examConfig.duration_minutes}
                                onChange={(e) => setExamConfig({
                                    ...examConfig,
                                    duration_minutes: parseInt(e.target.value) || 60
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Number of Questions
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="50"
                                value={examConfig.total_questions}
                                onChange={(e) => setExamConfig({
                                    ...examConfig,
                                    total_questions: parseInt(e.target.value) || 20
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button onClick={() => setShowConfig(false)} variant="outline">
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No registered courses</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-4">
                        You need to register for courses first before taking exams.
                    </p>
                    <Button onClick={() => router.push('/dashboard/register-courses')}>
                        Register Courses
                    </Button>
                </div>
                ) : (
                <>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setShowConfig(!showConfig)}>
                            {showConfig ? 'Hide' : 'Show'} Settings
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center mb-3">
                                            <BookOpen className="w-6 h-6 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{course.code}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{course.title}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4" />
                                        <span>{course.level} Level</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>{course.unit} Units</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => startExam(course)}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                >
                                    <Play className="w-4 h-4" />
                                    Start Exam
                                </Button>
                            </div>
                        ))}
                    </div>
                    {/* Past Exams History */}
                    {attempts.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">Past Exams</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {attempts.map((a) => (
                                    <div key={a.id} className="bg-white rounded-xl p-4 border shadow-sm flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-gray-500">{a.course_code} • {a.course_title}</div>
                                            <div className="font-medium">{a.exam_title}</div>
                                            <div className="text-sm text-gray-600">Score: {a.score === null ? 'Not graded' : `${a.score}/${a.total_questions}`} • {a.completed_at ? new Date(a.completed_at).toLocaleString() : 'Not completed'}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => router.push(`/dashboard/exams/${a.id}/results`)}>View Results</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
