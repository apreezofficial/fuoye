"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
    ArrowLeft,
    BookOpen,
    Trophy,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    TrendingUp,
    Calendar,
    Award,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ExamAttempt {
    id: number;
    exam_id: number;
    exam_title: string;
    course_title: string;
    course_code: string;
    level: string;
    score: number;
    total_questions: number;
    percentage: number;
    grade: string;
    duration_minutes: number;
    started_at: string;
    completed_at: string | null;
    is_completed: boolean;
}

export default function ExamsHistoryPage() {
    const router = useRouter();
    const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourse, setFilterCourse] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'score' | 'course'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/student/exam-history.php');
                setAttempts(data.attempts || []);
            } catch (err: any) {
                console.error('Failed to load history', err);
                toast.error('Failed to load exam history');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Get unique courses for filter
    const courses = useMemo(() => {
        const uniqueCourses = new Set(attempts.map(a => a.course_code));
        return Array.from(uniqueCourses).sort();
    }, [attempts]);

    // Filter and sort attempts
    const filteredAttempts = useMemo(() => {
        let filtered = attempts;

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(a =>
                a.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.exam_title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply course filter
        if (filterCourse !== 'all') {
            filtered = filtered.filter(a => a.course_code === filterCourse);
        }

        // Apply sorting
        filtered = [...filtered].sort((a, b) => {
            let comparison = 0;

            if (sortBy === 'date') {
                comparison = new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
            } else if (sortBy === 'score') {
                comparison = a.percentage - b.percentage;
            } else if (sortBy === 'course') {
                comparison = a.course_code.localeCompare(b.course_code);
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [attempts, searchQuery, filterCourse, sortBy, sortOrder]);

    // Calculate statistics
    const stats = useMemo(() => {
        const completed = attempts.filter(a => a.is_completed);
        const avgScore = completed.length > 0
            ? completed.reduce((sum, a) => sum + a.percentage, 0) / completed.length
            : 0;
        const bestScore = completed.length > 0
            ? Math.max(...completed.map(a => a.percentage))
            : 0;

        return {
            total: attempts.length,
            completed: completed.length,
            avgScore: Math.round(avgScore),
            bestScore: Math.round(bestScore)
        };
    }, [attempts]);

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'bg-green-100 text-green-700 border-green-300';
            case 'B': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'D': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'F': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 py-8">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam History</h1>
                        <p className="text-gray-600">Review your past exam attempts and track your progress</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/exams')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Exams
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Exams</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Average Score</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Best Score</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.bestScore}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by course or exam..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Course Filter */}
                        <div>
                            <select
                                value={filterCourse}
                                onChange={(e) => setFilterCourse(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="all">All Courses</option>
                                {courses.map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [by, order] = e.target.value.split('-');
                                    setSortBy(by as 'date' | 'score' | 'course');
                                    setSortOrder(order as 'asc' | 'desc');
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="score-desc">Highest Score</option>
                                <option value="score-asc">Lowest Score</option>
                                <option value="course-asc">Course A-Z</option>
                                <option value="course-desc">Course Z-A</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Exam Attempts List */}
                {filteredAttempts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery || filterCourse !== 'all'
                                ? 'Try adjusting your filters or search query'
                                : 'You haven\'t taken any exams yet'}
                        </p>
                        {!searchQuery && filterCourse === 'all' && (
                            <Button onClick={() => router.push('/dashboard/exams')}>
                                Take Your First Exam
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredAttempts.map((attempt) => (
                            <div
                                key={attempt.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => router.push(`/dashboard/exams/${attempt.id}/results`)}
                            >
                                <div className="flex items-start justify-between gap-6">
                                    {/* Left Section - Course Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{attempt.course_code}</h3>
                                                <p className="text-sm text-gray-600">{attempt.course_title}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-3">{attempt.exam_title}</p>

                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(attempt.started_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{attempt.duration_minutes} mins</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Award className="w-4 h-4" />
                                                <span>Level {attempt.level}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section - Score & Grade */}
                                    <div className="flex items-center gap-6">
                                        {/* Score Progress */}
                                        <div className="text-center">
                                            <div className="relative w-24 h-24">
                                                <svg className="w-24 h-24 transform -rotate-90">
                                                    <circle
                                                        cx="48"
                                                        cy="48"
                                                        r="40"
                                                        stroke="#e5e7eb"
                                                        strokeWidth="8"
                                                        fill="none"
                                                    />
                                                    <circle
                                                        cx="48"
                                                        cy="48"
                                                        r="40"
                                                        stroke={attempt.percentage >= 70 ? '#10b981' : attempt.percentage >= 50 ? '#f59e0b' : '#ef4444'}
                                                        strokeWidth="8"
                                                        fill="none"
                                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - attempt.percentage / 100)}`}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-bold text-gray-900">{attempt.percentage}%</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">{attempt.score}/{attempt.total_questions}</p>
                                        </div>

                                        {/* Grade Badge */}
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center ${getGradeColor(attempt.grade)}`}>
                                                <span className="text-3xl font-bold">{attempt.grade}</span>
                                            </div>
                                            <span className="text-xs text-gray-600">Grade</span>
                                        </div>

                                        {/* Status */}
                                        <div className="flex flex-col items-center gap-2">
                                            {attempt.is_completed ? (
                                                <>
                                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                                    <span className="text-xs text-green-600 font-medium">Completed</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-8 h-8 text-orange-600" />
                                                    <span className="text-xs text-orange-600 font-medium">Incomplete</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
