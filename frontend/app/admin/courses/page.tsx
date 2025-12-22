'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

// Mock data
const mockCourses = [
    { id: 1, code: 'CSC 101', title: 'Introduction to Computer Science', faculty: 'Science', level: '100', lecturer: 'Dr. Johnson' },
    { id: 2, code: 'MTH 101', title: 'General Mathematics I', faculty: 'Science', level: '100', lecturer: 'Prof. Ade' },
    { id: 3, code: 'GST 101', title: 'Use of English', faculty: 'General Studies', level: '100', lecturer: 'Mrs. Obi' },
];

export default function CoursesPage() {
    const [courses] = useState(mockCourses);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
                    <p className="text-gray-500">Manage courses, materials, and lecturers.</p>
                </div>
                <Button>+ Add New Course</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                {course.code}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600">
                                •••
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                                <span className="w-20 font-medium">Faculty:</span>
                                <span>{course.faculty}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-20 font-medium">Level:</span>
                                <span>{course.level}L</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-20 font-medium">Lecturer:</span>
                                <span>{course.lecturer}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-2">
                            <Button variant="outline" size="sm" className="w-full">Materials</Button>
                            <Button variant="outline" size="sm" className="w-full">Students</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
