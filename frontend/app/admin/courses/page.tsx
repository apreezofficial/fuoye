'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { BookOpen, MoreVertical, GraduationCap, Users, Folder, Plus } from 'lucide-react';

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
                <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Add New Course</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200">
                                {course.code}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[56px]">{course.title}</h3>

                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                            <div className="flex items-center gap-3">
                                <Folder className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{course.faculty}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                <span>{course.level} Level</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{course.lecturer}</span>
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
