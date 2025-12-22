'use client';

import React, { useEffect, useState } from 'react';
import { Users, FileText, Database, Activity, Bell, Plus, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats.php');
                setStats(data);
            } catch (error: any) {
                console.error("Failed to fetch admin stats", error);
                // If 401, user will be redirected by interceptor
                // If 403, likely not admin
                if (error.response?.status === 403) {
                    router.push('/dashboard'); // Redirect non-admins
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [router]);

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
    if (!stats) return <div className="text-center py-20">Failed to load admin data. Access denied.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500">Welcome back, Administrator.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push('/admin/settings')}>
                        <Settings className="w-4 h-4" /> Settings
                    </Button>
                    <Button className="flex items-center gap-2" onClick={() => router.push('/admin/users')}>
                        <Plus className="w-4 h-4" /> Create New User
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Students', value: stats.total_students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Lecturers', value: stats.total_lecturers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Total Courses', value: stats.total_courses, icon: Database, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Departments', value: stats.total_departments, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Live</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
                        <p className="text-sm text-gray-500">{item.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {stats.recent_activity?.map((activity: any, i: number) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                    <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Notifications */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">System Status</h3>
                        <Bell className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700 border border-green-100">
                            ✓ All systems operational
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700 border border-blue-100">
                            {stats.total_students} active students
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
