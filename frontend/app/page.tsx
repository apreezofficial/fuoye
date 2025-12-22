import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BookOpen, Brain, Trophy, Users } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                        <span className="text-xl font-bold text-gray-900">fuoye smart</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost">Log In</Button>
                        </Link>
                        <Link href="/register">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 text-center">
                <div className="inline-block px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-6">
                    🚀 Smart Campus Platform
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                    Your Academic Journey,<br />
                    <span className="text-green-600">Simplified</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                    Access courses, take exams, track progress, and connect with your academic community all in one place.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href="/register">
                        <Button size="lg" className="gap-2">
                            Start Learning <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button size="lg" variant="outline">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: BookOpen, title: 'Course Management', desc: 'Register and manage your courses easily' },
                        { icon: Brain, title: 'CBT Exams', desc: 'Take computer-based tests anytime' },
                        { icon: Trophy, title: 'Track Progress', desc: 'Monitor your academic performance' },
                        { icon: Users, title: 'Community', desc: 'Connect with peers and lecturers' },
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-500 text-sm">
                    © 2025 FUOYE Smart Campus. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
