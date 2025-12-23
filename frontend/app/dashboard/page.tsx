'use client';

import React, { useEffect, useState } from 'react';
import { Clock, BookOpen, GraduationCap, Calendar, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function StudentDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/student/dashboard.php');
                setData(data);
            } catch (error: any) {
                console.error("Failed to fetch dashboard data", error);
                toast.error('Failed to load dashboard', {
                    description: error.response?.data?.message || 'Please refresh the page'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
    if (!data) return <div className="text-center py-10">Failed to load data. Please login again.</div>;

    const { user, stats, next_exam, upcoming_classes } = data;

    return (
        <div className="space-y-8">
            {/* User Welcome Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl">
                        {user.name?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {user.role}</span>
                            <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {user.level} Level</span>
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {user.department}</span>
                            {user.matric && <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{user.matric}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Current CGPA</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.gpa}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Courses</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.courses_count} Available</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">Total Units: {stats.units}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Next Exam</p>
                            <p className="text-xl font-bold text-gray-900">{next_exam.time}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{next_exam.course} • {next_exam.date}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-2">Academic Session Active 🚀</h2>
                            <p className="text-gray-300 mb-6 max-w-lg">
                                Check your courses and ensure you've completed all requirements for the semester.
                            </p>
                            <Button className="bg-white text-gray-900 hover:bg-gray-100 border-none">View Courses</Button>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900 text-lg">Upcoming Classes</h3>
                            <Button variant="ghost" size="sm" className="text-green-600">View Schedule</Button>
                        </div>
                        <div className="space-y-4">
                            {upcoming_classes.map((item: any, i: number) => (
                                <div key={i} className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group">
                                    <div className="w-16 flex-shrink-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg py-2 mr-4 group-hover:bg-green-50 group-hover:text-green-700 transition-colors">
                                        <span className="text-xs font-bold">{item.time.split(' ')[0]}</span>
                                        <span className="text-[10px] text-gray-500 group-hover:text-green-600">{item.time.split(' ')[1]}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{item.code}</h4>
                                        <p className="text-sm text-gray-500">{item.title}</p>
                                    </div>
                                    <div className="text-right text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                        {item.loc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-3 bg-gray-50 rounded-xl text-center hover:bg-green-50 hover:text-green-700 transition-colors group">
                                <BookOpen className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-green-600" />
                                <span className="text-xs font-medium">Library</span>
                            </button>
                            <button className="p-3 bg-gray-50 rounded-xl text-center hover:bg-green-50 hover:text-green-700 transition-colors group">
                                <Clock className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-green-600" />
                                <span className="text-xs font-medium">Timetable</span>
                            </button>
                            <button className="p-3 bg-gray-50 rounded-xl text-center hover:bg-green-50 hover:text-green-700 transition-colors group">
                                <GraduationCap className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-green-600" />
                                <span className="text-xs font-medium">Results</span>
                            </button>
                            <button className="p-3 bg-gray-50 rounded-xl text-center hover:bg-green-50 hover:text,green-700 transition-colors group">
                                <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-green-600" />
                                <span className="text-xs font-medium">Events</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                        <h3 className="font-bold text-green-900 mb-2">Need Help?</h3>
                        <p className="text-sm text-green-700 mb-4">
                            Our AI assistant is ready to help you with your studies.
                        </p>
                        <Button className="w-full bg-green-600 hover:bg-green-700 border-none shadow-lg shadow-green-200">Chat with AI</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
