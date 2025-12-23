'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Clock, CheckCircle2, XCircle, AlertCircle, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Question {
    id: number;
    question: string;
    options: string[];
    correct_answer: number;
    order: number;
    user_answer?: number | null;
    is_correct?: boolean | null;
}

interface Exam {
    id: number;
    title: string;
    course_title: string;
    course_code: string;
    duration_minutes: number;
    total_questions: number;
}

export default function ExamTakingPage() {
    const router = useRouter();
    const params = useParams();
    const attemptId = params.attemptId as string;

    const [exam, setExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);

    // Load exam data
    useEffect(() => {
        const loadExam = async () => {
            try {
                console.log('Loading exam with attemptId:', attemptId);
                const response = await api.get(`/student/exam_questions.php?attempt_id=${attemptId}`);
                console.log('Full HTTP Response:', response);
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                console.log('Full HTTP Response:', response);
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                const data = response.data;
                console.log('Full response data:', data);
                console.log('Data type:', typeof data);
                console.log('Is data an array?', Array.isArray(data));
                console.log('Data keys:', Object.keys(data || {}));
                console.log('Attempt data:', data?.attempt);
                console.log('Questions data:', data?.questions);
                console.log('Questions count:', data?.questions?.length);
                
                const attemptData = data?.attempt;
                const incomingQuestions: Question[] = Array.isArray(data?.questions) ? data.questions : [];

                console.log('Processed questions:', incomingQuestions);
                console.log('Attempt found:', !!attemptData);
                console.log('Questions found:', incomingQuestions.length);

                if (!attemptData || incomingQuestions.length === 0) {
                    console.error('ERROR: No attempt data or no questions');
                    console.error('Attempt is:', attemptData);
                    console.error('Questions is:', incomingQuestions);
                    toast.error('Exam not found or no questions returned. Please start again.');
                    setLoading(false);
                    router.push('/dashboard/exams');
                    return;
                }

                setExam(attemptData);
                setQuestions(incomingQuestions);
                
                // Initialize answers from existing data
                const existingAnswers: Record<number, number> = {};
                incomingQuestions.forEach((q: Question) => {
                    if (q.user_answer !== null && q.user_answer !== undefined) {
                        existingAnswers[q.id] = q.user_answer;
                    }
                });
                setAnswers(existingAnswers);
                
                // Check if exam is completed
                if (attemptData.completed_at) {
                    setIsCompleted(true);
                } else {
                    // Calculate time remaining
                    const startedAt = new Date(attemptData.started_at).getTime();
                    const durationMs = attemptData.duration_minutes * 60 * 1000;
                    const elapsed = Date.now() - startedAt;
                    const remaining = Math.max(0, durationMs - elapsed);
                    setTimeRemaining(Math.floor(remaining / 1000));
                }
                
                setLoading(false);
            } catch (error: any) {
                console.error('Failed to load exam - Full error:', error);
                console.error('Error response status:', error.response?.status);
                console.error('Error response data:', error.response?.data);
                toast.error(error.response?.data?.message || 'Failed to load exam');
                router.push('/dashboard/exams');
            }
        };

        if (attemptId) {
            loadExam();
        }
    }, [attemptId, router]);

    // Timer countdown
    useEffect(() => {
        if (isCompleted || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, isCompleted]);

    // Auto-save answers every 30 seconds
    useEffect(() => {
        if (isCompleted) return;

        const interval = setInterval(() => {
            saveAnswers();
        }, 30000); // Auto-save every 30 seconds

        setAutoSaveInterval(interval);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [answers, isCompleted]);

    // Warn before leaving page
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isCompleted && Object.keys(answers).length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isCompleted, answers]);

    const saveAnswers = useCallback(async () => {
        if (isCompleted || Object.keys(answers).length === 0) return;

        try {
            // Save answers to localStorage as backup
            localStorage.setItem(`exam_answers_${attemptId}`, JSON.stringify(answers));
        } catch (error) {
            console.error('Failed to save answers locally', error);
        }
    }, [answers, attemptId, isCompleted]);

    const handleAnswerSelect = (questionId: number, optionIndex: number) => {
        if (isCompleted) return;
        
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionIndex
        }));
        
        toast.success('Answer saved', { duration: 2000 });
    };

    const handleAutoSubmit = async () => {
        if (isCompleted) return;
        
        toast.warning('Time is up! Submitting your exam automatically...');
        await submitExam();
    };

    const submitExam = async () => {
        if (isCompleted) return;

        setSubmitting(true);
            try {
            const resp = await api.post('/student/exam_questions.php', {
                attempt_id: parseInt(attemptId),
                answers: answers
            });

            setIsCompleted(true);
            toast.success(`Exam submitted successfully! Score: ${resp.data.score}/${resp.data.total_questions}`);

            // Redirect to results after 2 seconds
            setTimeout(() => {
                router.push(`/dashboard/exams/${attemptId}/results`);
            }, 2000);
        } catch (error: any) {
            console.error('Failed to submit exam', error);
            toast.error(error.response?.data?.message || 'Failed to submit exam. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getAnsweredCount = () => {
        return Object.keys(answers).length;
    };

    const getQuestionStatus = (index: number) => {
        const question = questions[index];
        if (!question) return 'unanswered';
        if (answers[question.id] !== undefined) return 'answered';
        return 'unanswered';
    };

    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    if (!exam || questions.length === 0) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Exam not found</h3>
                <Button onClick={() => router.push('/dashboard/exams')}>Back to Exams</Button>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    const isLastQuestion = currentQuestion === questions.length - 1;
    const isFirstQuestion = currentQuestion === 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
                            <p className="text-sm text-gray-600">{exam.course_code} - {exam.course_title}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {!isCompleted && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                    timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    <Clock className="w-5 h-5" />
                                    <span className="font-bold text-lg">{formatTime(timeRemaining)}</span>
                                </div>
                            )}
                            <div className="text-sm text-gray-600">
                                {getAnsweredCount()} / {questions.length} answered
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Navigation Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Questions</h3>
                            <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                                {questions.map((_, index) => {
                                    const status = getQuestionStatus(index);
                                    const isCurrent = index === currentQuestion;
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentQuestion(index)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                                                isCurrent
                                                    ? 'bg-green-600 text-white ring-2 ring-green-300'
                                                    : status === 'answered'
                                                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            {!isCompleted && (
                                <Button
                                    onClick={submitExam}
                                    disabled={submitting}
                                    className="w-full mt-6 bg-green-600 hover:bg-green-700"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Exam'
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Main Question Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-sm text-gray-600">
                                    Question {currentQuestion + 1} of {questions.length}
                                </div>
                                {answers[currentQ.id] !== undefined && (
                                    <div className="flex items-center gap-2 text-green-600 text-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Answered
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-8">
                                {currentQ.question}
                            </h2>

                            <div className="space-y-4 mb-8">
                                {currentQ.options.map((option, index) => {
                                    const isSelected = answers[currentQ.id] === index;
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(currentQ.id, index)}
                                            disabled={isCompleted}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                                isSelected
                                                    ? 'border-green-600 bg-green-50 text-green-900'
                                                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                            } ${isCompleted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                                                    isSelected
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className="text-lg">{option}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <Button
                                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                    disabled={isFirstQuestion}
                                    variant="outline"
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (isLastQuestion) {
                                            submitExam();
                                        } else {
                                            setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1));
                                        }
                                    }}
                                    disabled={submitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isLastQuestion ? 'Submit Exam' : 'Next'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


