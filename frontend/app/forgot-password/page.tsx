'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Form (Exact consistency with Login) */}
            <div className="flex flex-col justify-center px-8 lg:px-20 bg-white">
                <div className="w-full max-w-md mx-auto space-y-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                        <span className="text-xl font-bold text-gray-900">fuoye smart</span>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
                        <p className="text-gray-500 mt-2">Enter your email to receive recovery instructions.</p>
                    </div>

                    {isSubmitted ? (
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
                            <p className="text-sm text-gray-600 mt-2">
                                We sent a link to <b>{email}</b>. Please check your inbox and spam folder.
                            </p>
                            <Link href="/login" className="block mt-6">
                                <Button variant="outline" className="w-full">Return to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="matric@fuoye.edu.ng"
                                icon={<Mail className="w-4 h-4" />}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                            </Button>
                        </form>
                    )}

                    {!isSubmitted && (
                        <div className="text-center">
                            <Link href="/login" className="font-medium text-sm text-gray-500 hover:text-green-600 flex items-center justify-center gap-2 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Image/Visual (Same as Login) */}
            <div className="hidden lg:block relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-black/80 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="relative z-20 flex flex-col justify-end h-full p-20 text-white">
                    <h2 className="text-4xl font-bold mb-6 italic">"Secure access, limitless potential."</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-full h-1 bg-green-500/30 rounded-full">
                            <div className="w-1/3 h-full bg-green-400 rounded-full"></div>
                        </div>
                        <p className="text-green-100 whitespace-nowrap">Security First</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
