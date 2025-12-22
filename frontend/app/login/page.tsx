'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login.php', formData);
            const { token, user } = response.data;

            // Store auth data
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect based on role
            if (user.role === 'Admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex flex-col justify-center px-8 lg:px-20 bg-white">
                <div className="w-full max-w-md mx-auto space-y-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                        <span className="text-xl font-bold text-gray-900">Fuoye smart</span>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                        <p className="text-gray-500 mt-2">Enter your credentials to access your account.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="matric@fuoye.edu.ng"
                            icon={<Mail className="w-4 h-4" />}
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock className="w-4 h-4" />}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <div className="flex justify-end">
                                <Link href="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-700">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-500 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <span className="relative bg-white px-2">Don't have an account?</span>
                    </div>

                    <Link href="/register">
                        <Button variant="outline" className="w-full h-12">
                            Create Student Account <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Right Side - Image/Visual */}
            <div className="hidden lg:block relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-black/80 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="relative z-20 flex flex-col justify-end h-full p-20 text-white">
                    <h2 className="text-4xl font-bold mb-6 italic">"Education is the passport to the future."</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-green-900 bg-gray-200"></div>)}
                        </div>
                        <p className="text-green-100">Join 12,000+ students online</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
