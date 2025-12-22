'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function CreateExamPage() {
    const [formData, setFormData] = useState({
        title: '',
        courseCode: '',
        duration: '',
        startTime: ''
    });

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
                <p className="text-gray-500">Configure exam details and add questions.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Exam Title"
                        placeholder="e.g. 2024/2025 Harmattan Semester Exam"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    <Input
                        label="Course Code"
                        placeholder="CSC 101"
                        value={formData.courseCode}
                        onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    />
                    <Input
                        label="Duration (Minutes)"
                        type="number"
                        placeholder="60"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                    <Input
                        label="Start Time"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Questions</h3>
                    <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 text-sm mb-4">No questions added yet</p>
                        <Button variant="outline">Import from Question Bank</Button>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button size="lg">Create Exam</Button>
                </div>
            </div>
        </div>
    );
}
