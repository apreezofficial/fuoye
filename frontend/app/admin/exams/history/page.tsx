"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, Eye, ChevronDown } from 'lucide-react';
import api from '@/lib/api';

export default function AdminExamHistoryPage() {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedAttempt, setExpandedAttempt] = useState<number | null>(null);
    const [filters, setFilters] = useState({
        exam_id: '',
        user_id: '',
        course_id: ''
    });

    useEffect(() => {
        fetchExamHistory();
    }, []);

    const fetchExamHistory = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.exam_id) queryParams.append('exam_id', filters.exam_id);
            if (filters.user_id) queryParams.append('user_id', filters.user_id);
            if (filters.course_id) queryParams.append('course_id', filters.course_id);

            const { data } = await api.get(`/admin/exam-history.php${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
            console.log('Exam history data:', data);
            setAttempts(data.data || data.attempts || []);
        } catch (error) {
            console.error('Failed to fetch exam history', error);
            setAttempts([]);
        } finally {
            setLoading(false);
        }
    };

    const calculatePercentage = (score: number | null, total: number) => {
        if (score === null || total === 0) return 0;
        return Math.round((score / total) * 100);
    };

    const getGradeColor = (percentage: number) => {
        if (percentage >= 70) return 'text-green-600 bg-green-50';
        if (percentage >= 60) return 'text-blue-600 bg-blue-50';
        if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
        if (percentage >= 40) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Exam History & Corrections</h1>
                <p className="text-gray-500">View all student exam attempts and their answers with corrections.</p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Exam ID</label>
                    <input
                        type="text"
                        placeholder="Exam ID"
                        value={filters.exam_id}
                        onChange={(e) => setFilters({ ...filters, exam_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User ID</label>
                    <input
                        type="text"
                        placeholder="User ID"
                        value={filters.user_id}
                        onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Course ID</label>
                    <input
                        type="text"
                        placeholder="Course ID"
                        value={filters.course_id}
                        onChange={(e) => setFilters({ ...filters, course_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                </div>
            </div>
            <button
                onClick={fetchExamHistory}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
                Apply Filters
            </button>

            {/* Results */}
            {attempts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No exam attempts found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        Try adjusting your filters or check back later.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {attempts.map((attempt) => {
                        const percentage = calculatePercentage(attempt.score, attempt.total_questions);
                        const isExpanded = expandedAttempt === attempt.id;
                        const gradeColorClass = getGradeColor(percentage);

                        return (
                            <div
                                key={attempt.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                {/* Summary Row */}
                                <button
                                    onClick={() => setExpandedAttempt(isExpanded ? null : attempt.id)}
                                    className="w-full p-4 hover:bg-gray-50 transition text-left flex items-center justify-between"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-gray-900">{attempt.exam_title}</h3>
                                            {attempt.is_completed ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-orange-600" />
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">{attempt.user_name}</span><br />
                                                <span className="text-xs text-gray-500">{attempt.user_email}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">{attempt.course_code}</span><br />
                                                <span className="text-xs text-gray-500">{attempt.course_title}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    {attempt.score !== null ? `${attempt.score}/${attempt.total_questions}` : 'Not completed'}
                                                </span><br />
                                                <span className="text-xs text-gray-500">Questions</span>
                                            </div>
                                            {attempt.is_completed && (
                                                <div>
                                                    <span className={`font-bold text-lg ${gradeColorClass} px-3 py-1 rounded-lg inline-block`}>
                                                        {percentage}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-400 transition ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Started:</span>
                                                    <p className="text-gray-600">
                                                        {new Date(attempt.started_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Completed:</span>
                                                    <p className="text-gray-600">
                                                        {attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : 'Not completed'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Answers Review */}
                                            {attempt.answers && attempt.answers.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="font-bold text-gray-900 mb-3">Answer Review</h4>
                                                    <div className="space-y-3">
                                                        {attempt.answers.map((answer: any, idx: number) => (
                                                            <div
                                                                key={idx}
                                                                className={`p-3 rounded-lg border ${
                                                                    answer.is_correct
                                                                        ? 'bg-green-50 border-green-200'
                                                                        : 'bg-red-50 border-red-200'
                                                                }`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    {answer.is_correct ? (
                                                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                                    ) : (
                                                                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-gray-900 mb-1">
                                                                            Q{idx + 1}: {answer.question_text}
                                                                        </p>
                                                                        <div className="space-y-1 text-sm">
                                                                            <p className="text-gray-700">
                                                                                <span className="font-medium">Student Answer:</span>{' '}
                                                                                <span className={answer.is_correct ? 'text-green-700' : 'text-red-700'}>
                                                                                    {answer.user_answer || '(Not answered)'}
                                                                                </span>
                                                                            </p>
                                                                            {!answer.is_correct && (
                                                                                <p className="text-gray-700">
                                                                                    <span className="font-medium">Correct Answer:</span>{' '}
                                                                                    <span className="text-green-700">{answer.correct_answer}</span>
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
