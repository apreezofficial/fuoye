'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: Integrate with backend
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating request
        setLoading(false);
        console.log('Login with:', formData);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-md p-6 relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Welcome back
                        </h1>
                        <p className="text-gray-500">
                            Sign in to your FUOYE Smart Campus account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                type="email"
                                placeholder="student@fuoye.edu.ng"
                                label="Email Address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                label="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-600 cursor-pointer">
                                <input type="checkbox" className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                Remember me
                            </label>
                            <Link href="/forgot-password" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" isLoading={loading}>
                            Sign In
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">New to Smart Campus?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/register" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                            Create an account
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} Federal University Oye-Ekiti. All rights reserved.
                </p>
            </div>
        </div>
    );
}
