'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FileText, Clock, CheckCircle, XCircle, Brain, Loader2, Send, Calendar, Plus } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [submission, setSubmission] = useState('');
    const [aiSolution, setAiSolution] = useState('');
    const [loadingSolution, setLoadingSolution] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [creating, setCreating] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        course_id: '',
        title: '',
        description: '',
        instructions: '',
        due_date: '',
        max_score: 100,
    });

    useEffect(() => {
        fetchAssignments();
        fetchCourses();
    }, []);

    const fetchAssignments = async () => {
        try {
            const { data } = await api.get('/student/assignments.php');
            setAssignments(data);
        } catch (error: any) {
            console.error("Failed to fetch assignments", error);
            toast.error('Failed to load assignments', {
                description: error.response?.data?.message || 'Please try again later'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/student/courses.php');
            setCourses(data.courses || []);
        } catch (error) {
            console.error('Failed to load courses for assignments', error);
        }
    };

    const createAssignment = async () => {
        if (!newAssignment.course_id || !newAssignment.title.trim()) {
            toast.error('Please select a course and enter a title');
            return;
        }
        setCreating(true);
        try {
            toast.loading('Creating assignment...', { id: 'create-assignment' });
            await api.post('/student/assignments.php', {
                action: 'create',
                ...newAssignment,
            });
            toast.success('Assignment created', { id: 'create-assignment' });
            setShowCreateModal(false);
            setNewAssignment({
                course_id: '',
                title: '',
                description: '',
                instructions: '',
                due_date: '',
                max_score: 100,
            });
            fetchAssignments();
        } catch (error: any) {
            toast.error('Failed to create assignment', {
                id: 'create-assignment',
                description: error.response?.data?.message || 'Please try again',
            });
        } finally {
            setCreating(false);
        }
    };

    const loadAssignmentDetails = async (assignmentId: number) => {
        try {
            const { data } = await api.get(`/student/assignments.php?id=${assignmentId}`);
            setSelectedAssignment(data.assignment);
            setSubmission(data.submission?.content || '');
            setAiSolution(data.submission?.ai_solution || '');
        } catch (error: any) {
            toast.error('Failed to load assignment details', {
                description: error.response?.data?.message || 'Please try again'
            });
        }
    };

    const getAiSolution = async () => {
        if (!selectedAssignment) return;
        
        setLoadingSolution(true);
        try {
            toast.loading('Generating AI solution...', { id: 'ai-solution' });
            const { data } = await api.post('/student/assignments.php', {
                assignment_id: selectedAssignment.id,
                get_ai_solution: true
            });
            
            setAiSolution(data.ai_solution);
            toast.success('AI solution generated!', { id: 'ai-solution' });
        } catch (error: any) {
            toast.error('Failed to generate AI solution', {
                id: 'ai-solution',
                description: error.response?.data?.message || 'Please try again'
            });
        } finally {
            setLoadingSolution(false);
        }
    };

    const submitAssignment = async () => {
        if (!selectedAssignment || !submission.trim()) {
            toast.error('Please enter your submission');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/student/assignments.php', {
                assignment_id: selectedAssignment.id,
                content: submission
            });
            
            toast.success('Assignment submitted successfully!');
            setSelectedAssignment(null);
            fetchAssignments();
        } catch (error: any) {
            toast.error('Failed to submit assignment', {
                description: error.response?.data?.message || 'Please try again'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-500">View, create, and submit course assignments.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    Create Assignment
                </Button>
            </div>

            {selectedAssignment ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAssignment.title}</h2>
                            <p className="text-gray-600">{selectedAssignment.course_code} - {selectedAssignment.course_title}</p>
                        </div>
                        <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                            Back
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {selectedAssignment.description && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedAssignment.description}</p>
                            </div>
                        )}

                        {selectedAssignment.instructions && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Instructions</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                            </div>
                        )}

                        {selectedAssignment.due_date && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-600" />
                                <span className={`font-medium ${isOverdue(selectedAssignment.due_date) ? 'text-red-600' : 'text-gray-700'}`}>
                                    Due: {formatDate(selectedAssignment.due_date)}
                                    {isOverdue(selectedAssignment.due_date) && ' (Overdue)'}
                                </span>
                            </div>
                        )}

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">Your Submission</h3>
                                <Button
                                    variant="outline"
                                    onClick={getAiSolution}
                                    disabled={loadingSolution}
                                    className="flex items-center gap-2"
                                >
                                    <Brain className="w-4 h-4" />
                                    {loadingSolution ? 'Generating...' : 'Get AI Solution'}
                                </Button>
                            </div>
                            
                            <textarea
                                value={submission}
                                onChange={(e) => setSubmission(e.target.value)}
                                placeholder="Write your submission here..."
                                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {aiSolution && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-bold text-blue-900">AI Solution</h4>
                                </div>
                                <p className="text-blue-800 whitespace-pre-wrap text-sm">{aiSolution}</p>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button
                                onClick={submitAssignment}
                                disabled={submitting || !submission.trim()}
                                className="flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {submitting ? 'Submitting...' : 'Submit Assignment'}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {assignments.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No assignments</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2">
                                There are no assignments for your courses at the moment.
                            </p>
                        </div>
                    ) : (
                        assignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => loadAssignmentDetails(assignment.id)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                                            {assignment.has_submitted > 0 ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {assignment.course_code} - {assignment.course_title}
                                        </p>
                                        {assignment.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2">{assignment.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4 text-gray-600">
                                        {assignment.due_date && (
                                            <div className={`flex items-center gap-1 ${isOverdue(assignment.due_date) ? 'text-red-600' : ''}`}>
                                                <Clock className="w-4 h-4" />
                                                <span>Due: {formatDate(assignment.due_date)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <FileText className="w-4 h-4" />
                                            <span>Max Score: {assignment.max_score}</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        {assignment.has_submitted > 0 ? 'View Submission' : 'Start Assignment'}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            {/* Create Assignment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Create Assignment
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course *
                                </label>
                                <select
                                    value={newAssignment.course_id}
                                    onChange={(e) =>
                                        setNewAssignment((prev) => ({
                                            ...prev,
                                            course_id: e.target.value,
                                        }))
                                    }
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newAssignment.title}
                                    onChange={(e) =>
                                        setNewAssignment((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Assignment title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newAssignment.description}
                                    onChange={(e) =>
                                        setNewAssignment((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Brief description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instructions
                                </label>
                                <textarea
                                    value={newAssignment.instructions}
                                    onChange={(e) =>
                                        setNewAssignment((prev) => ({
                                            ...prev,
                                            instructions: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={4}
                                    placeholder="Detailed instructions"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Due Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={newAssignment.due_date}
                                        onChange={(e) =>
                                            setNewAssignment((prev) => ({
                                                ...prev,
                                                due_date: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Score
                                    </label>
                                    <input
                                        type="number"
                                        value={newAssignment.max_score}
                                        min={1}
                                        max={1000}
                                        onChange={(e) =>
                                            setNewAssignment((prev) => ({
                                                ...prev,
                                                max_score: parseInt(e.target.value) || 100,
                                            }))
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewAssignment({
                                        course_id: '',
                                        title: '',
                                        description: '',
                                        instructions: '',
                                        due_date: '',
                                        max_score: 100,
                                    });
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={createAssignment}
                                disabled={creating}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {creating ? 'Creating...' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


