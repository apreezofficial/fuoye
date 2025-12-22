'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Trophy, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResultsPage() {
    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
                <p className="text-gray-500">Track your academic performance and exam history.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Average Score</p>
                            <p className="text-2xl font-bold text-gray-900">76%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Exams Passed</p>
                            <p className="text-2xl font-bold text-gray-900">12</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Study Time</p>
                            <p className="text-2xl font-bold text-gray-900">48h</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Title</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { course: 'CSC 201', title: 'Mid-Semester Test', date: 'Oct 24, 2024', score: 85, grade: 'A', passed: true },
                            { course: 'GST 101', title: 'Calculus Quiz', date: 'Oct 12, 2024', score: 92, grade: 'A', passed: true },
                            { course: 'MTH 101', title: 'General Mathematics', date: 'Sep 15, 2024', score: 65, grade: 'B', passed: true },
                            { course: 'PHY 101', title: 'Physics Practical', date: 'Sep 10, 2024', score: 45, grade: 'D', passed: false },
                        ].map((result, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{result.course}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{result.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{result.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-full bg-gray-100 rounded-full h-2 w-20">
                                            <div className={`h-2 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${result.score}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold">{result.score}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${result.grade === 'A' ? 'bg-green-100 text-green-700' :
                                            result.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                                result.grade === 'D' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {result.grade}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link href={`/results/${i}`} className="text-green-600 hover:text-green-700 inline-flex items-center text-sm font-medium transition-colors">
                                        View <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
