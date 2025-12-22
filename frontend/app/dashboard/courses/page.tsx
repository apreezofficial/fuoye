'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { BookOpen, User, Clock, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function StudentCoursesPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/student/courses.php');
                setData(data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
    if (!data) return <div className="text-center py-20">Failed to load courses. Please login again.</div>;

    const { user, courses } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Courses ({user.level} Level)</h1>
                    <p className="text-gray-500">Registered courses for the current semester.</p>
                </div>
                <Link href="/dashboard/register-courses">
                    <Button className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Register Courses
                    </Button>
                </Link>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No courses registered</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-4">
                        You haven't registered for any courses yet. Click the button below to get started.
                    </p>
                    <Link href="/dashboard/register-courses">
                        <Button>Register Courses Now</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {courses.map((course: any, i: number) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all">
                            <div className="md:w-64 h-40 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl flex items-center justify-center relative overflow-hidden border border-gray-200">
                                <div className="text-green-700 font-bold text-2xl">{course.code}</div>
                                <div className="absolute top-2 right-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                <User className="w-4 h-4" /> {course.unit} Units • {course.dept_code || 'General'}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" className="hidden md:flex">
                                            <Download className="w-4 h-4 mr-2" /> Syllabus
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4 md:mt-0">
                                    <Button className="flex-1">View Materials</Button>
                                    <Button variant="secondary" className="flex-1 md:flex-none">Resources</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
