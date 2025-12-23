'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, BookOpen, Clock, Settings, LogOut, Home, GraduationCap, FileText, Bell, MessageSquare, Users as UsersIcon, PenTool } from 'lucide-react';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const menuItems = [
        { label: 'Overview', href: '/dashboard', icon: Home },
        { label: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
        { label: 'Exams & CBT', href: '/dashboard/exams', icon: Clock },
        { label: 'Assignments', href: '/dashboard/assignments', icon: PenTool },
        { label: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
        { label: 'Study Groups', href: '/dashboard/study-groups', icon: UsersIcon },
        { label: 'Results', href: '/dashboard/results', icon: GraduationCap },
        { label: 'Profile', href: '/dashboard/profile', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Compact and Modern */}
            <aside className="w-20 lg:w-64 bg-white border-r border-gray-200 fixed h-full z-10 flex flex-col transition-all duration-300">
                <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        F
                    </div>
                    <span className="hidden lg:block ml-3 text-lg font-bold text-gray-900">fuoye smart</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center lg:space-x-3 px-3 lg:px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? 'text-green-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                <span className="hidden lg:block font-medium">{item.label}</span>
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-green-600 rounded-r-full"></div>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <Link href="/login" className="flex items-center lg:space-x-3 text-red-600 hover:bg-red-50 w-full px-3 lg:px-4 py-3 rounded-xl transition-colors justify-center lg:justify-start">
                        <LogOut className="w-6 h-6" />
                        <span className="hidden lg:block font-medium">Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-20 lg:ml-64 min-h-screen pb-20">
                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 px-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Good Morning, AP ☀️</h2>
                        <p className="text-xs text-gray-500">Computer Science • 100 Level</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm cursor-pointer hover:shadow-md transition-all">
                            AP
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
