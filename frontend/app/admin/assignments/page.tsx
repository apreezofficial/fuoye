'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PenTool, Plus, Trash2, Edit2, Loader2, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminAssignmentsPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<any>(null);
    const [formData, setFormData] = useState({
        course_id: '',
        title: '',
        description: '',
        instructions: '',
        due_date: '',
        max_score: 100
    });

    useEffect(() => {
        fetchAssignments();
        fetchCourses();
    }, []);

    const fetchAssignments = async () => {
        try {
            const { data } = await api.get('/admin/assignments.php');
            setAssignments(data);
        } catch (error: any) {
            toast.error('Failed to load assignments', {
                description: error.response?.data?.message || 'Please try again'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/admin/courses.php');
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.course_id || !formData.title.trim()) {
            toast.error('Course and title are required');
            return;
        }

        try {
            if (editingAssignment) {
                toast.loading('Updating assignment...', { id: 'assignment' });
                await api.put('/admin/assignments.php', {
                    id: editingAssignment.id,
                    ...formData
                });
                toast.success('Assignment updated!', { id: 'assignment' });
            } else {
                toast.loading('Creating assignment...', { id: 'assignment' });
                await api.post('/admin/assignments.php', formData);
                toast.success('Assignment created!', { id: 'assignment' });
            }
            
            setShowModal(false);
            setEditingAssignment(null);
            setFormData({
                course_id: '',
                title: '',
                description: '',
                instructions: '',
                due_date: '',
                max_score: 100
            });
            fetchAssignments();
        } catch (error: any) {
            toast.error('Operation failed', {
                id: 'assignment',
                description: error.response?.data?.message || 'Please try again'
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this assignment?')) return;
        
        try {
            toast.loading('Deleting assignment...', { id: 'delete' });
            await api.delete(`/admin/assignments.php?id=${id}`);
            toast.success('Assignment deleted!', { id: 'delete' });
            fetchAssignments();
        } catch (error: any) {
            toast.error('Failed to delete', {
                id: 'delete',
                description: error.response?.data?.message || 'Please try again'
            });
        }
    };

    const startEdit = (assignment: any) => {
        setEditingAssignment(assignment);
        setFormData({
            course_id: assignment.course_id.toString(),
            title: assignment.title,
            description: assignment.description || '',
            instructions: assignment.instructions || '',
            due_date: assignment.due_date ? assignment.due_date.split(' ')[0] : '',
            max_score: assignment.max_score || 100
        });
        setShowModal(true);
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-500">Manage course assignments.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Assignment
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {assignments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <PenTool className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No assignments</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-4">
                            Create your first assignment to get started.
                        </p>
                        <Button onClick={() => setShowModal(true)}>Create Assignment</Button>
                    </div>
                ) : (
                    assignments.map((assignment) => (
                        <div key={assignment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{assignment.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {assignment.course_code} - {assignment.course_title}
                                    </p>
                                    {assignment.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2">{assignment.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEdit(assignment)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(assignment.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                {assignment.due_date && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <span>Max Score: {assignment.max_score}</span>
                                <span>Submissions: {assignment.submission_count}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                                <select
                                    value={formData.course_id}
                                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select a course</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.code} - {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Assignment title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Assignment description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                                <textarea
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={4}
                                    placeholder="Assignment instructions"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Score</label>
                                    <input
                                        type="number"
                                        value={formData.max_score}
                                        onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) || 100 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="1"
                                        max="1000"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingAssignment(null);
                                    setFormData({
                                        course_id: '',
                                        title: '',
                                        description: '',
                                        instructions: '',
                                        due_date: '',
                                        max_score: 100
                                    });
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700">
                                {editingAssignment ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


