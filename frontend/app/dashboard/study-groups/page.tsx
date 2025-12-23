'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Users, Plus, Search, Loader2, UserPlus, LogOut, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function StudyGroupsPage() {
    const [groups, setGroups] = useState<any>({ my_groups: [], available_groups: [] });
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'my_groups' | 'available'>('my_groups');
    const [searchQuery, setSearchQuery] = useState('');
    const [newGroup, setNewGroup] = useState({
        name: '',
        description: '',
        course_id: '',
        is_public: true,
        max_members: 50
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const { data } = await api.get('/student/study-groups.php?type=all');
            setGroups(data);
        } catch (error: any) {
            toast.error('Failed to load study groups', {
                description: error.response?.data?.message || 'Please try again'
            });
        } finally {
            setLoading(false);
        }
    };

    const createGroup = async () => {
        if (!newGroup.name.trim()) {
            toast.error('Group name is required');
            return;
        }

        try {
            await api.post('/student/study-groups.php', {
                ...newGroup,
                course_id: newGroup.course_id || null
            });
            
            toast.success('Study group created successfully!');
            setShowCreateModal(false);
            setNewGroup({
                name: '',
                description: '',
                course_id: '',
                is_public: true,
                max_members: 50
            });
            fetchGroups();
        } catch (error: any) {
            toast.error('Failed to create group', {
                description: error.response?.data?.message || 'Please try again'
            });
        }
    };

    const joinGroup = async (groupId: number) => {
        try {
            await api.post('/student/study-groups.php', {
                action: 'join',
                group_id: groupId
            });
            
            toast.success('Successfully joined group!');
            fetchGroups();
        } catch (error: any) {
            toast.error('Failed to join group', {
                description: error.response?.data?.message || 'Please try again'
            });
        }
    };

    const leaveGroup = async (groupId: number) => {
        if (!confirm('Are you sure you want to leave this group?')) return;

        try {
            await api.delete(`/student/study-groups.php?group_id=${groupId}`);
            toast.success('Left group successfully');
            fetchGroups();
        } catch (error: any) {
            toast.error('Failed to leave group', {
                description: error.response?.data?.message || 'Please try again'
            });
        }
    };

    const filteredMyGroups = groups.my_groups?.filter((group: any) =>
        group.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const filteredAvailableGroups = groups.available_groups?.filter((group: any) =>
        group.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
                    <p className="text-gray-500">Join or create study groups to collaborate with peers.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Group
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('my_groups')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'my_groups'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    My Groups ({groups.my_groups?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('available')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'available'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Available Groups ({groups.available_groups?.length || 0})
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
            </div>

            {/* Groups List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'my_groups' ? (
                    filteredMyGroups.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No groups yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-4">
                                Create a group or join available groups to get started.
                            </p>
                            <Button onClick={() => setShowCreateModal(true)}>Create Group</Button>
                        </div>
                    ) : (
                        filteredMyGroups.map((group: any) => (
                            <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
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
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{group.member_count} members</span>
                                    </div>
                                    {group.my_role === 'admin' && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            Admin
                                        </span>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => leaveGroup(group.id)}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Leave Group
                                </Button>
                            </div>
                        ))
                    )
                ) : (
                    filteredAvailableGroups.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No available groups</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2">
                                All groups are full or private. Create your own group!
                            </p>
                        </div>
                    ) : (
                        filteredAvailableGroups.map((group: any) => (
                            <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-3">
                                            <Users className="w-6 h-6 text-blue-600" />
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
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{group.member_count} / {group.max_members} members</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => joinGroup(group.id)}
                                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Join Group
                                </Button>
                            </div>
                        ))
                    )
                )}
            </div>

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Study Group</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Group Name *
                                </label>
                                <input
                                    type="text"
                                    value={newGroup.name}
                                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., CSC 201 Study Group"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newGroup.description}
                                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Describe your study group..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Members
                                </label>
                                <input
                                    type="number"
                                    value={newGroup.max_members}
                                    onChange={(e) => setNewGroup({ ...newGroup, max_members: parseInt(e.target.value) || 50 })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    min="2"
                                    max="100"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={newGroup.is_public}
                                    onChange={(e) => setNewGroup({ ...newGroup, is_public: e.target.checked })}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                <label className="text-sm text-gray-700">Public group (anyone can join)</label>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={createGroup}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


