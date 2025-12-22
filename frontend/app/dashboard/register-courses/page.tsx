'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { BookOpen, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function CourseRegistrationPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/student/register-courses.php');
            setData(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const registerCourse = async (courseId: number) => {
        setRegistering(courseId);
        try {
            await api.post('/student/register-courses.php', { course_id: courseId });
            await fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to register course');
        } finally {
            setRegistering(null);
        }
    };

    const dropCourse = async (courseId: number) => {
        if (!confirm('Are you sure you want to drop this course?')) return;
        try {
            await api.delete(`/student/register-courses.php?course_id=${courseId}`);
            await fetchData();
        } catch (error) {
            alert('Failed to drop course');
        }
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
    if (!data) return <div className="text-center py-20">Failed to load courses.</div>;

    const { available_courses, registered_courses, session, semester } = data;
    const groupedByLevel = available_courses.reduce((acc: any, course: any) => {
        if (!acc[course.level]) acc[course.level] = [];
        acc[course.level].push(course);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-900">Course Registration</h1>
                <p className="text-gray-500">Register courses for {session} - {semester} Semester</p>
                <div className="mt-4 flex items-center gap-4">
                    <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
                        {registered_courses.length} Courses Registered
                    </div>
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                        {registered_courses.reduce((sum: number, id: number) => {
                            const course = available_courses.find((c: any) => c.id === id);
                            return sum + (course?.unit || 0);
                        }, 0)} Total Units
                    </div>
                </div>
            </div>

            {Object.keys(groupedByLevel).sort().map(level => (
                <div key={level} className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                            {level}
                        </div>
                        {level} Level Courses
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupedByLevel[level].map((course: any) => {
                            const isRegistered = registered_courses.includes(course.id);
                            return (
                                <div key={course.id} className={`bg-white rounded-xl shadow-sm border p-4 transition-all ${isRegistered ? 'border-green-500 ring-1 ring-green-100' : 'border-gray-100'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                                                    {course.code}
                                                </span>
                                                <span className="text-xs text-gray-500">{course.unit} Units</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900">{course.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{course.dept_code || 'General'}</p>
                                        </div>

                                        {isRegistered ? (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <button
                                                    onClick={() => dropCourse(course.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => registerCourse(course.id)}
                                                disabled={registering === course.id}
                                                className="flex items-center gap-1"
                                            >
                                                {registering === course.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Plus className="w-4 h-4" />
                                                        Add
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
