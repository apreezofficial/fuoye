'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Clock, FileText, Play, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ExamsPage() {
    const router = useRouter();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const { data } = await api.get('/student/exams.php');
                setExams(data);
            } catch (error) {
                console.error("Failed to fetch exams", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const startExam = async (examId: number) => {
        try {
            const { data } = await api.post('/student/exams.php', { exam_id: examId });
            // Navigate to exam taking page with attempt data
            router.push(`/dashboard/exams/${data.attempt_id}`);
        } catch (error) {
            alert('Failed to start exam');
        }
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Exams & CBT</h1>
                <p className="text-gray-500">Take computer-based tests for your registered courses.</p>
            </div>

            {exams.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No exams available</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        There are no active exams for your courses at the moment.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exams.map((exam) => (
                        <div key={exam.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                                    <p className="text-sm text-gray-500">{exam.course_code} - {exam.course_title}</p>
                                </div>
                                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                    Active
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>{exam.duration_minutes} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FileText className="w-4 h-4" />
                                    <span>{exam.total_questions} questions</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => startExam(exam.id)}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <Play className="w-4 h-4" />
                                Start Exam
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
