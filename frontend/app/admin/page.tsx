import React from 'react';

const stats = [
    { label: 'Total Students', value: '12,450', change: '+12%', color: 'blue' },
    { label: 'Active Exams', value: '8', change: 'Live Now', color: 'green' },
    { label: 'Questions in Bank', value: '45,200', change: '+500 today', color: 'purple' },
    { label: 'System Status', value: 'Healthy', change: '99.9% Uptime', color: 'orange' },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                        <div className="mt-2 flex items-baseline">
                            <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                            <span className={`ml-2 text-sm font-medium text-${stat.color}-600 bg-${stat.color}-50 px-2 py-0.5 rounded-full`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    🔔
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
                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-xl text-left transition-colors">
                            📝 Create New Exam
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-xl text-left transition-colors">
                            📢 Post Announcement
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-xl text-left transition-colors">
                            👤 Add New User
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-xl text-left transition-colors">
                            ⚙️ System Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
