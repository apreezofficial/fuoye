'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// Mock exams
const mockExams = [
    { id: 1, title: 'CSC 201 Mid Semester Test', course: 'CSC 201', duration: '45 mins', status: 'Active' },
    { id: 2, title: 'GST 101 Final Exam', course: 'GST 101', duration: '60 mins', status: 'Scheduled' },
];

export default function ExamsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exams & CBT</h1>
                    <p className="text-gray-500">Create, monitor, and grade exams.</p>
                </div>
                <Link href="/admin/exams/create">
                    <Button>+ Create New Exam</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockExams.map((exam) => (
                    <div key={exam.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${exam.status === 'Active' ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {exam.status}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">{exam.course} • {exam.duration}</p>
                        </div>

                        <div className="mt-6 flex space-x-3">
                            <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                            <Button variant="secondary" size="sm" className="flex-1">Monitor</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
