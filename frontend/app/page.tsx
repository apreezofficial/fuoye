'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
              FUOYE Smart
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">BETA</span>
          </div>
          <div className="flex items-center space-x-4">
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
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[80%] bg-purple-200/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] bg-green-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            The Future of Learning <br />
            <span className="text-green-600">is Here.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            A next-generation super-app for Federal University Oye-Ekiti.
            Seamlessly integrate exams, AI tutoring, and collaboration in one ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="px-8 h-14 text-lg">Start Learning Now</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 h-14 text-lg">Student Login</Button>
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-2 border border-gray-800">
              <div className="bg-gray-800 rounded-xl overflow-hidden aspect-[16/9] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-4xl mb-4">🖥️</p>
                  <p>Dashboard Preview</p>
                </div>
              </div>
            </div>
            {/* Floating Elements */}
            <div className="absolute -right-10 top-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-bounce">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">✓</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Exam Submitted</p>
                  <p className="text-xs text-gray-500">CSC 201 • 98% Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to excel</h2>
            <p className="text-gray-500 mt-2">Built for students, lecturers, and admins.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🤖', title: 'AI Assistant', desc: 'Get instant help with course materials and revision using our trained AI.' },
              { icon: '📝', title: 'Smart CBT', desc: 'Take exams with AI proctoring, instant grading, and detailed analytics.' },
              { icon: '☁️', title: 'Course Cloud', desc: 'Access lecture notes, slides, and past questions anytime, anywhere.' },
              { icon: '🏆', title: 'Gamification', desc: 'Compete on leaderboards and earn badges for academic excellence.' },
              { icon: '📅', title: 'Events', desc: 'Never miss a class or exam with smart scheduling and notifications.' },
              { icon: '💬', title: 'Community', desc: 'Collaborate with peers and lecturers in real-time groups.' },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-gray-100 group">
                <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>© 2025 Federal University Oye-Ekiti. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
