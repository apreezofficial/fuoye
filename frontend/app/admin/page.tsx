'use client';

import React from 'react';
import { Users, FileText, Database, Activity, Bell, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

const stats = [
    { label: 'Total Students', value: '12,450', change: '+12%', color: 'blue', icon: Users },
    { label: 'Active Exams', value: '8', change: 'Live Now', color: 'green', icon: Activity },
    { label: 'Questions in Bank', value: '45,200', change: '+500 today', color: 'purple', icon: Database },
    { label: 'System Status', value: 'Healthy', change: '99.9% Uptime', color: 'orange', icon: Settings },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className={`absolute top-4 right-4 p-2 bg-${stat.color}-50 rounded-lg`}>
                                <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                            </div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <div className="mt-2 flex items-baseline">
                                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                                <span className={`ml-2 text-sm font-medium text-${stat.color}-600 bg-${stat.color}-50 px-2 py-0.5 rounded-full`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">New Exam Created: CSC 201</p>
                                    <p className="text-xs text-gray-500">2 minutes ago by Dr. Adebayo</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-2xl shadow-lg text-white">
                    <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                    <p className="text-green-100 mb-6 text-sm">Manage the platform efficiently.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/exams/create" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-xl text-left transition-colors flex items-center space-x-2">
                            <FileText className="w-5 h-5" />
                            <span>Create New Exam</span>
                        </Link>
                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-xl text-left transition-colors flex items-center space-x-2">
                            <Bell className="w-5 h-5" />
                            <span>Post Announcement</span>
                        </button>
                        <Link href="/admin/users" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-xl text-left transition-colors flex items-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>Add New User</span>
                        </Link>
                        <Link href="/admin/settings" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-xl text-left transition-colors flex items-center space-x-2">
                            <Settings className="w-5 h-5" />
                            <span>System Settings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
