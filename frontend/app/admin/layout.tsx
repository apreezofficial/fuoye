'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const menuItems = [
        { label: 'Dashboard', href: '/admin', icon: '📊' },
        { label: 'Users', href: '/admin/users', icon: '👥' },
        { label: 'Courses', href: '/admin/courses', icon: '📚' },
        { label: 'Exams & CBT', href: '/admin/exams', icon: '📝' },
        { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-xl font-bold text-green-700">FUOYE Smart</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-green-50 text-green-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button className="flex items-center space-x-3 text-red-600 hover:bg-red-50 w-full px-4 py-2.5 rounded-xl transition-colors">
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen">
                <header className="h-16 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 px-8 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Admin Portal
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                            A
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
