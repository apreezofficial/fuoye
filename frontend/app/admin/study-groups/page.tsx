'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Users, Trash2, Loader2, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminStudyGroupsPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const { data } = await api.get('/admin/study-groups.php');
            setGroups(data);
        } catch (error: any) {
            toast.error('Failed to load study groups', {
                description: error.response?.data?.message || 'Please try again'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this study group? All members will be removed.')) return;
        
        try {
            toast.loading('Deleting group...', { id: 'delete-group' });
            await api.delete(`/admin/study-groups.php?id=${id}`);
            toast.success('Study group deleted!', { id: 'delete-group' });
            fetchGroups();
        } catch (error: any) {
            toast.error('Failed to delete', {
                id: 'delete-group',
                description: error.response?.data?.message || 'Please try again'
            });
        }
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
                <p className="text-gray-500">Manage all study groups in the system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No study groups</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2">
                            No study groups have been created yet.
                        </p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-3">
                                        <Users className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{group.name}</h3>
                                    {group.course_code && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{group.course_code}</span>
                                        </div>
                                    )}
                                    {group.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2">{group.description}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(group.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{group.member_count} members</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    group.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {group.is_public ? 'Public' : 'Private'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}


