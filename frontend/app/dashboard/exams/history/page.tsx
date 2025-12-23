"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ExamsHistoryPage() {
    const router = useRouter();
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/student/exams.php?history=1');
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

    if (loading) return <div className="h-48 flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen py-6">
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Past Exams</h1>
                        <p className="text-sm text-gray-600">All your previous exam attempts.</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/dashboard/exams')}>
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                </div>

                {attempts.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 border text-center">No past exams found.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
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
                )}
            </div>
        </div>
    );
}
