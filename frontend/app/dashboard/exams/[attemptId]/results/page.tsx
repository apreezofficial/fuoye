'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
    CheckCircle2,
    XCircle,
    Trophy,
    ArrowLeft,
    Download,
    Eye,
    EyeOff,
    BarChart3,
    Target,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Question {
    id: number;
    question: string;
    options: string[];
    correct_answer: number;
    user_answer: number | null;
    is_correct: boolean | null;
    order: number;
}

interface ExamAttempt {
    id: number;
    score: number;
    total_questions: number;
    completed_at: string;
    exam_title: string;
    course_title: string;
    course_code: string;
}

export default function ExamResultsPage() {
    const router = useRouter();
    const params = useParams();
    const attemptId = params.attemptId as string;

    const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);

    useEffect(() => {
        const loadResults = async () => {
            try {
                const { data } = await api.get(`/student/exam_results.php?attempt_id=${attemptId}`);
                setAttempt(data.attempt);
                setQuestions(data.questions || []);
                setLoading(false);
            } catch (error: any) {
                console.error('Failed to load results', error);
                toast.error(error.response?.data?.message || 'Failed to load results');
                router.push('/dashboard/exams');
            }
        };

        if (attemptId) {
            loadResults();
        }
    }, [attemptId, router]);

    // Filter questions based on review mode
    const displayedQuestions = useMemo(() => {
        if (showOnlyIncorrect) {
            return questions.filter(q => !q.is_correct);
        }
        return questions;
    }, [questions, showOnlyIncorrect]);

    // Calculate statistics
    const stats = useMemo(() => {
        const correct = questions.filter(q => q.is_correct).length;
        const incorrect = questions.filter(q => !q.is_correct).length;
        const unanswered = questions.filter(q => q.user_answer === null).length;

        return { correct, incorrect, unanswered };
    }, [questions]);

    const percentage = attempt ? Math.round((attempt.score / attempt.total_questions) * 100) : 0;

    const getGrade = (percent: number) => {
        if (percent >= 70) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' };
        if (percent >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300' };
        if (percent >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300' };
        if (percent >= 40) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300' };
        return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' };
    };

    const gradeInfo = getGrade(percentage);

    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-600">Results not found</p>
                <Button onClick={() => router.push('/dashboard/exams')} className="mt-4">
                    Back to Exams
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 py-8">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Results</h1>
                            <p className="text-gray-600">{attempt.course_code} - {attempt.course_title}</p>
                            <p className="text-sm text-gray-500 mt-1">{attempt.exam_title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/dashboard/exams/history')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            <Button
                                onClick={async () => {
                                    try {
                                        const url = `/student/exam_results.php?attempt_id=${attemptId}&format=csv`;
                                        const resp = await api.get(url, { responseType: 'blob' });
                                        const blob = new Blob([resp.data], { type: 'text/csv' });
                                        const link = document.createElement('a');
                                        link.href = window.URL.createObjectURL(blob);
                                        link.download = `exam_result_${attemptId}.csv`;
                                        link.click();
                                        toast.success('Downloaded successfully!');
                                    } catch (error: any) {
                                        console.error('Failed to download results', error);
                                        toast.error('Failed to download results');
                                    }
                                }}
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download CSV
                            </Button>
                        </div>
                    </div>

                    {/* Score Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <Trophy className="w-12 h-12 mx-auto mb-4 text-green-600" />
                            <div className="text-4xl font-bold text-gray-900 mb-2">
                                {attempt.score}/{attempt.total_questions}
                            </div>
                            <div className="text-sm text-gray-600">Score</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                            <div className="text-4xl font-bold text-gray-900 mb-2">
                                {percentage}%
                            </div>
                            <div className="text-sm text-gray-600">Percentage</div>
                        </div>
                        <div className={`text-center p-6 rounded-xl border-2 ${gradeInfo.bg} ${gradeInfo.color} ${gradeInfo.border}`}>
                            <div className="text-4xl font-bold mb-2">
                                {gradeInfo.grade}
                            </div>
                            <div className="text-sm font-medium">Grade</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                            <div className="text-sm text-gray-600 mb-1">Accuracy</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {Math.round((stats.correct / questions.length) * 100)}%
                            </div>
                        </div>
                    </div>

                    {/* Performance Breakdown */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-900">Correct</span>
                            </div>
                            <div className="text-2xl font-bold text-green-700">{stats.correct}</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                                <XCircle className="w-5 h-5 text-red-600" />
                                <span className="text-sm font-medium text-red-900">Incorrect</span>
                            </div>
                            <div className="text-2xl font-bold text-red-700">{stats.incorrect}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">Unanswered</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-700">{stats.unanswered}</div>
                        </div>
                    </div>
                </div>

                {/* Review Mode Toggle */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                {showOnlyIncorrect ? <EyeOff className="w-5 h-5 text-purple-600" /> : <Eye className="w-5 h-5 text-purple-600" />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Review Mode</h3>
                                <p className="text-sm text-gray-600">
                                    {showOnlyIncorrect
                                        ? `Showing ${displayedQuestions.length} incorrect answer${displayedQuestions.length !== 1 ? 's' : ''}`
                                        : `Showing all ${questions.length} questions`
                                    }
                                </p>
                            </div>
                        </div>
                        <Button
                            variant={showOnlyIncorrect ? "default" : "outline"}
                            onClick={() => setShowOnlyIncorrect(!showOnlyIncorrect)}
                            className="flex items-center gap-2"
                        >
                            {showOnlyIncorrect ? (
                                <>
                                    <Eye className="w-4 h-4" />
                                    Show All Questions
                                </>
                            ) : (
                                <>
                                    <EyeOff className="w-4 h-4" />
                                    Show Only Incorrect
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Questions Review */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        Question Review
                    </h2>

                    {displayedQuestions.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Perfect Score!</h3>
                            <p className="text-gray-600">You answered all questions correctly. Great job! 🎉</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {displayedQuestions.map((q) => {
                                const isCorrect = q.is_correct === true;

                                return (
                                    <div
                                        key={q.id}
                                        className={`p-6 rounded-xl border-2 transition-all ${isCorrect
                                                ? 'border-green-200 bg-green-50/50'
                                                : 'border-red-200 bg-red-50/50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-gray-900 text-lg">Question {q.order}</span>
                                                {isCorrect ? (
                                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-red-600" />
                                                )}
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${isCorrect
                                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                                    : 'bg-red-100 text-red-700 border border-red-300'
                                                }`}>
                                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                            </span>
                                        </div>

                                        <p className="text-lg font-medium text-gray-900 mb-5 leading-relaxed">{q.question}</p>

                                        <div className="space-y-3">
                                            {q.options.map((option, optIndex) => {
                                                const isCorrectAnswer = optIndex === q.correct_answer;
                                                const isUserAnswer = optIndex === q.user_answer;

                                                return (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-4 rounded-lg border-2 transition-all ${isCorrectAnswer
                                                                ? 'border-green-500 bg-green-50 shadow-sm'
                                                                : isUserAnswer && !isCorrectAnswer
                                                                    ? 'border-red-500 bg-red-50 shadow-sm'
                                                                    : 'border-gray-200 bg-white'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`font-bold text-lg min-w-[24px] ${isCorrectAnswer
                                                                    ? 'text-green-700'
                                                                    : isUserAnswer && !isCorrectAnswer
                                                                        ? 'text-red-700'
                                                                        : 'text-gray-600'
                                                                }`}>
                                                                {String.fromCharCode(65 + optIndex)}.
                                                            </span>
                                                            <span className={`flex-1 ${isCorrectAnswer ? 'text-green-900 font-medium' : 'text-gray-700'}`}>
                                                                {option}
                                                            </span>
                                                            {isCorrectAnswer && (
                                                                <span className="ml-auto text-green-700 font-semibold text-sm flex items-center gap-1">
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                    Correct Answer
                                                                </span>
                                                            )}
                                                            {isUserAnswer && !isCorrectAnswer && (
                                                                <span className="ml-auto text-red-700 font-semibold text-sm flex items-center gap-1">
                                                                    <XCircle className="w-4 h-4" />
                                                                    Your Answer
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
