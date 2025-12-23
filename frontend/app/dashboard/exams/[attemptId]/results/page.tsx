'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Trophy, ArrowLeft, Download } from 'lucide-react';
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

    useEffect(() => {
        const loadResults = async () => {
            try {
                // Use dedicated results endpoint which supports CSV export too
                const { data } = await api.get(`/student/exam_results.php?attempt_id=${attemptId}`);
                // endpoint returns { attempt, questions }
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

    const percentage = attempt ? Math.round((attempt.score / attempt.total_questions) * 100) : 0;
    const getGrade = (percent: number) => {
        if (percent >= 70) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
        if (percent >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
        if (percent >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        if (percent >= 40) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
        return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
    };

    const gradeInfo = getGrade(percentage);

    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Loading results...</p>
                </div>
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Results</h1>
                            <p className="text-gray-600">{attempt.course_code} - {attempt.course_title}</p>
                            <p className="text-sm text-gray-500 mt-1">{attempt.exam_title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard/exams')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Exams
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
                        <Button
                            onClick={() => {
                                try {
                                    const win = window.open('', '_blank');
                                    if (!win) throw new Error('Unable to open print window');
                                    const style = `\n                                        body { font-family: Arial, sans-serif; padding: 20px; }\n                                        h1 { font-size: 20px; }\n                                        table { width: 100%; border-collapse: collapse; }\n                                        th, td { border: 1px solid #ddd; padding: 8px; }\n                                        th { background: #f3f4f6; }\n                                    `;
                                    const rowsHtml = questions.map((q: any) => {
                                        const options = q.options.map((o: string, i: number) => {
                                            const mark = i === q.correct_answer ? ' (Correct)' : (i === q.user_answer ? ' (Your answer)' : '');
                                            return `<div>${String.fromCharCode(65 + i)}. ${o}${mark}</div>`;
                                        }).join('');
                                        return `\n                                            <tr>\n                                                <td>${q.order}</td>\n                                                <td>${q.question}</td>\n                                                <td>${options}</td>\n                                                <td>${q.user_answer === null ? '' : q.user_answer}</td>\n                                                <td>${q.is_correct ? 'Yes' : 'No'}</td>\n                                            </tr>\n                                        `;
                                    }).join('');

                                    const html = `\n                                        <html>\n                                        <head><title>Exam Result ${attemptId}</title><style>${style}</style></head>\n                                        <body>\n                                            <h1>Exam Results - ${attempt?.course_code} ${attempt?.course_title}</h1>\n                                            <p>Score: ${attempt?.score}/${attempt?.total_questions} (${Math.round((attempt?.score / attempt?.total_questions) * 100)}%)</p>\n                                            <table>\n                                                <thead>\n                                                    <tr><th>Order</th><th>Question</th><th>Options</th><th>User Answer</th><th>Correct</th></tr>\n                                                </thead>\n                                                <tbody>\n                                                    ${rowsHtml}\n                                                </tbody>\n                                            </table>\n                                        </body>\n                                        </html>\n                                    `;
                                    win.document.open();
                                    win.document.write(html);
                                    win.document.close();
                                    setTimeout(() => { win.print(); }, 500);
                                } catch (error) {
                                    console.error('Failed to open print view', error);
                                    toast.error('Failed to export PDF');
                                }
                            }}
                            className="flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </Button>
                    </div>
                    </div>

                    {/* Score Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <div className={`text-center p-6 rounded-xl border ${gradeInfo.bg} ${gradeInfo.color} border-current`}>
                            <div className="text-4xl font-bold mb-2">
                                {gradeInfo.grade}
                            </div>
                            <div className="text-sm font-medium">Grade</div>
                        </div>
                    </div>
                </div>

                {/* Questions Review */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Question Review</h2>
                    <div className="space-y-8">
                        {questions.map((q, index) => {
                            const isCorrect = q.is_correct === true;
                            const userSelected = q.user_answer !== null;

                            return (
                                <div
                                    key={q.id}
                                    className={`p-6 rounded-xl border-2 ${
                                        isCorrect
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-red-200 bg-red-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-900">Question {index + 1}</span>
                                            {isCorrect ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            isCorrect
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                    </div>

                                    <p className="text-lg font-medium text-gray-900 mb-4">{q.question}</p>

                                    <div className="space-y-2">
                                        {q.options.map((option, optIndex) => {
                                            const isCorrectAnswer = optIndex === q.correct_answer;
                                            const isUserAnswer = optIndex === q.user_answer;

                                            return (
                                                <div
                                                    key={optIndex}
                                                    className={`p-3 rounded-lg border-2 ${
                                                        isCorrectAnswer
                                                            ? 'border-green-500 bg-green-100'
                                                            : isUserAnswer && !isCorrectAnswer
                                                            ? 'border-red-500 bg-red-100'
                                                            : 'border-gray-200 bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`font-bold ${
                                                            isCorrectAnswer
                                                                ? 'text-green-700'
                                                                : isUserAnswer && !isCorrectAnswer
                                                                ? 'text-red-700'
                                                                : 'text-gray-600'
                                                        }`}>
                                                            {String.fromCharCode(65 + optIndex)}.
                                                        </span>
                                                        <span className={isCorrectAnswer ? 'text-green-900 font-medium' : ''}>
                                                            {option}
                                                        </span>
                                                        {isCorrectAnswer && (
                                                            <span className="ml-auto text-green-700 font-medium text-sm">
                                                                ✓ Correct Answer
                                                            </span>
                                                        )}
                                                        {isUserAnswer && !isCorrectAnswer && (
                                                            <span className="ml-auto text-red-700 font-medium text-sm">
                                                                ✗ Your Answer
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
                </div>
            </div>
        </div>
    );
}


