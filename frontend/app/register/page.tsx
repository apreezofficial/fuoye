'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User, Loader2, BookOpen, ArrowRight, GraduationCap, Building } from 'lucide-react';
import api from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [faculties, setFaculties] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [filteredDepts, setFilteredDepts] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'Student',
        matric_number: '',
        faculty_id: '',
        department_id: '',
        level: '100'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch faculties and departments
        const fetchData = async () => {
            try {
                const { data } = await api.get('/departments.php');
                // Group by faculty
                const uniqueFaculties: any[] = [];
                const facultyMap = new Map();

                data.forEach((dept: any) => {
                    if (dept.faculty_id && !facultyMap.has(dept.faculty_id)) {
                        facultyMap.set(dept.faculty_id, true);
                        uniqueFaculties.push({ id: dept.faculty_id, name: `Faculty ${dept.faculty_id}` });
                    }
                });

                setFaculties(uniqueFaculties);
                setDepartments(data);
            } catch (error) {
                console.error("Failed to fetch faculties/departments", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        // Filter departments when faculty changes
        if (formData.faculty_id) {
            const filtered = departments.filter(d => d.faculty_id == formData.faculty_id);
            setFilteredDepts(filtered);
        } else {
            setFilteredDepts([]);
        }
    }, [formData.faculty_id, departments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register.php', formData);
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
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
                        <span className="text-xl font-bold text-gray-900">fuoye smart</span>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                        <p className="text-gray-500 mt-2">Join the academic community today.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                            <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Full Name"
                            placeholder="e.g. Sola Adebayo"
                            icon={<User className="w-4 h-4" />}
                            required
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />

                        <Input
                            label="School Email"
                            type="email"
                            placeholder="name@fuoye.edu.ng"
                            icon={<Mail className="w-4 h-4" />}
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <Input
                            label="Matric Number"
                            placeholder="e.g. FUO/21/CSC/042"
                            icon={<GraduationCap className="w-4 h-4" />}
                            required
                            value={formData.matric_number}
                            onChange={(e) => setFormData({ ...formData, matric_number: e.target.value })}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                                <select
                                    className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    value={formData.faculty_id}
                                    onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value, department_id: '' })}
                                    required
                                >
                                    <option value="">Select Faculty</option>
                                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <select
                                    className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    value={formData.department_id}
                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                    required
                                    disabled={!formData.faculty_id}
                                >
                                    <option value="">Select Department</option>
                                    {filteredDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Level</label>
                            <select
                                className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                required
                            >
                                <option value="100">100 Level</option>
                                <option value="200">200 Level</option>
                                <option value="300">300 Level</option>
                                <option value="400">400 Level</option>
                            </select>
                        </div>

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Create a strong password"
                            icon={<Lock className="w-4 h-4" />}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />

                        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-500 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <span className="relative bg-white px-2">Already have an account?</span>
                    </div>

                    <Link href="/login">
                        <Button variant="outline" className="w-full h-12">
                            Log In <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Right Side - Image/Visual */}
            <div className="hidden lg:block relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-black/80 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="relative z-20 flex flex-col justify-end h-full p-20 text-white">
                    <h2 className="text-4xl font-bold mb-6 italic">"Excellence is not an act, but a habit."</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-green-900 bg-gray-200"></div>)}
                        </div>
                        <p className="text-green-100 ml-24">Join the academic revolution</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
