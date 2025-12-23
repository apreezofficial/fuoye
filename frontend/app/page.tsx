'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BookOpen, Brain, Trophy, Users, Sparkles, Shield, Zap, Clock, CheckCircle2, Star, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const features = [
        { icon: BookOpen, title: 'Course Management', desc: 'Register and manage your courses with ease. Track your academic progress seamlessly.', color: 'bg-blue-100 text-blue-600' },
        { icon: Brain, title: 'AI-Powered CBT', desc: 'Take intelligent computer-based tests with unique questions generated for each attempt.', color: 'bg-purple-100 text-purple-600' },
        { icon: Trophy, title: 'Track Progress', desc: 'Monitor your academic performance with detailed analytics and insights.', color: 'bg-amber-100 text-amber-600' },
        { icon: Users, title: 'Community', desc: 'Connect with peers and lecturers in a collaborative learning environment.', color: 'bg-green-100 text-green-600' },
        { icon: Shield, title: 'Secure Platform', desc: 'Your data is protected with enterprise-grade security measures.', color: 'bg-red-100 text-red-600' },
        { icon: Zap, title: 'Real-Time Updates', desc: 'Get instant notifications and real-time updates on all activities.', color: 'bg-yellow-100 text-yellow-600' },
    ];

    const stats = [
        { value: '10K+', label: 'Active Students' },
        { value: '500+', label: 'Courses' },
        { value: '50K+', label: 'Exams Taken' },
        { value: '98%', label: 'Satisfaction Rate' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
            {/* Navigation */}
            <nav className="border-b border-gray-100/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            F
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            FUOYE Smart
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="hover:bg-gray-100">Log In</Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative max-w-7xl mx-auto px-6 py-20 md:py-32 text-center overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}></div>
                    <div className={`absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}></div>
                    <div className={`absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}></div>
                </div>

                <div className={`relative z-10 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-700`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full text-sm font-medium mb-6 border border-green-100 shadow-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>Smart Campus Platform</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                        Your Academic Journey,<br />
                        <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Simplified & Enhanced
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Experience the future of education with AI-powered CBT tests, real-time progress tracking, and seamless course management.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/register">
                            <Button size="lg" className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg px-8 py-6">
                                Start Learning <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="border-2 hover:bg-gray-50 text-lg px-8 py-6">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div 
                            key={i} 
                            className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all transform hover:scale-105 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Powerful Features
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to excel in your academic journey
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div 
                            key={i} 
                            className={`bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all transform hover:scale-105 group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Get started in three simple steps
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Create Account', desc: 'Sign up with your matric number and get instant access to the platform.', icon: CheckCircle2 },
                            { step: '02', title: 'Register Courses', desc: 'Select and register your courses for the current semester.', icon: BookOpen },
                            { step: '03', title: 'Take Exams', desc: 'Attempt AI-generated CBT tests with unique questions every time.', icon: Brain },
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-lg">
                                    {item.step}
                                </div>
                                <item.icon className="w-8 h-8 mx-auto mb-4 text-green-600" />
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
                    <Star className="w-12 h-12 mx-auto mb-6 opacity-90" />
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Transform Your Learning?
                    </h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        Join thousands of students already using FUOYE Smart to excel in their academics.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg px-8 py-6">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                                <span className="text-lg font-bold text-gray-900">FUOYE Smart</span>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Empowering students with smart academic solutions.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/login" className="hover:text-green-600 transition-colors">Login</Link></li>
                                <li><Link href="/register" className="hover:text-green-600 transition-colors">Register</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Features</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>CBT Exams</li>
                                <li>Course Management</li>
                                <li>Progress Tracking</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>Help Center</li>
                                <li>Contact Us</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
                        © 2025 FUOYE Smart Campus. All rights reserved.
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}
