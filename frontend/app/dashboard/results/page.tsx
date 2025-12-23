"use client";

import React, { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardResultsPage() {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/student/exams.php?history=1');
                console.log('Full API response:', response);
                const data = response.data || response;
                console.log('Response data:', data);

                // Normalize response to an array. Backend returns { attempts: [...] }
                let list: any[] = [];
                if (Array.isArray(data)) {
                    list = data;
                    console.log('Data is array');
                } else if (data && Array.isArray(data.attempts)) {
                    list = data.attempts;
                    console.log('Data.attempts is array');
                } else if (data && typeof data.attempts === 'object' && data.attempts !== null) {
                    // If attempts is an object, convert values to an array
                    list = Object.values(data.attempts);
                    console.log('Data.attempts is object, converted to array');
                } else {
                    console.warn('Unexpected data structure:', data);
                }

                console.log('Final attempts list:', list);
                setAttempts(Array.isArray(list) ? list : []);
            } catch (error) {
                console.error("Failed to fetch exam history", error);
                setAttempts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    const calculatePercentage = (score: number, total: number) => {
        return total > 0 ? Math.round((score / total) * 100) : 0;
    };

    const getGrade = (percentage: number) => {
        if (percentage >= 70) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
        if (percentage >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
        if (percentage >= 40) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-50' };
        return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50' };
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Exam History & Results</h1>
                <p className="text-gray-500">View your past exam attempts and scores.</p>
            </div>

            {!Array.isArray(attempts) || attempts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No exam history</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        You haven't taken any exams yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {attempts.map((attempt) => {
                        const percentage = calculatePercentage(attempt.score, attempt.total_questions);
                        const gradeInfo = getGrade(percentage);
                        const isCompleted = attempt.completed_at !== null;

                        return (
                            <div key={attempt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{attempt.exam_title}</h3>
                                            {isCompleted ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-orange-600" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{attempt.course_code} - {attempt.course_title}</p>

                                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{new Date(attempt.started_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                <span>{attempt.total_questions} questions</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isCompleted && (
                                        <div className="text-right">
                                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${gradeInfo.bg} ${gradeInfo.color} font-bold text-2xl mb-2`}>
                                                {gradeInfo.grade}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {attempt.score}/{attempt.total_questions}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {percentage}%
                                            </div>
                                        </div>
                                    )}

                                    {!isCompleted && (
                                        <div className="text-center px-4 py-2 bg-orange-50 text-orange-700 rounded-lg">
                                            <p className="text-sm font-medium">In Progress</p>
                                        </div>
                                    )}
                                </div>

                                {isCompleted && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full ${percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
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
