'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, MoreVertical, GraduationCap, Users, Folder, Plus, Loader2, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', code: '', unit: 2, level: '100', department_id: '' });

    const fetchData = async () => {
        try {
            const [courseRes, deptRes] = await Promise.all([
                api.get('/admin/courses.php'),
                api.get('/departments.php')
            ]);
            setCourses(courseRes.data);
            setDepartments(deptRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async () => {
        try {
            await api.post('/admin/courses.php', formData);
            setShowModal(false);
            fetchData(); // Refresh list
            setFormData({ title: '', code: '', unit: 2, level: '100', department_id: '' });
        } catch (e) {
            alert('Failed to create course');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/admin/courses.php?id=${id}`);
            fetchData();
        } catch (e) {
            alert('Failed to delete');
        }
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
                    <p className="text-gray-500">Manage curriculum and assign to departments.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Add New Course</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200">
                                {course.code}
                            </span>
                            <button onClick={() => handleDelete(course.id)} className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[56px]">{course.title}</h3>

                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                            <div className="flex items-center gap-3">
                                <Folder className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{course.dept_name || 'General Course'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                <span>{course.level} Level • {course.unit} Units</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="text-xs text-center text-gray-400">Created via Admin Panel</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
                        <h2 className="text-xl font-bold">Add New Course</h2>
                        <Input label="Course Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Course Code" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                            <Input label="Units" type="number" value={formData.unit} onChange={e => setFormData({ ...formData, unit: parseInt(e.target.value) })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                                <select className="w-full border rounded-lg p-2 bg-white" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                                    <option value="100">100</option>
                                    <option value="200">200</option>
                                    <option value="300">300</option>
                                    <option value="400">400</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                                <select className="w-full border rounded-lg p-2 bg-white" value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })}>
                                    <option value="">General</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button variant="secondary" className="w-full" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button className="w-full" onClick={handleCreate}>Create Course</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
