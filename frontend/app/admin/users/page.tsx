'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, UserPlus, Search, MoreVertical, Trash2, Shield, GraduationCap, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: 'password123', // Default initial password
        role: 'Student',
        matric_number: '',
        level: '100'
    });

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users.php');
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async () => {
        try {
            toast.loading('Creating user...', { id: 'create-user' });
            await api.post('/admin/users.php', formData);
            toast.success('User created successfully!', { id: 'create-user' });
            setShowModal(false);
            fetchUsers();
            setFormData({ full_name: '', email: '', password: 'password123', role: 'Student', matric_number: '', level: '100' });
        } catch (e: any) {
            toast.error('Failed to create user', {
                id: 'create-user',
                description: e.response?.data?.message || e.message
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            toast.loading('Deleting user...', { id: 'delete-user' });
            await api.delete(`/admin/users.php?id=${id}`);
            toast.success('User deleted successfully!', { id: 'delete-user' });
            setUsers(users.filter(u => u.id !== id));
        } catch (e: any) {
            toast.error('Failed to delete user', {
                id: 'delete-user',
                description: e.response?.data?.message || 'Please try again'
            });
        }
    };

    const startCreate = () => {
        setShowModal(true);
    };

    // Filter users
    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.matric_number && user.matric_number.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage students, lecturers, and administrators.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={startCreate} className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Add User
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Info</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                                {user.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.full_name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                ${user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                user.role === 'Lecturer' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    'bg-green-50 text-green-700 border-green-100'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {user.role === 'Student' && (
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="w-3 h-3 text-gray-400" />
                                                <span>{user.level} Lvl • {user.matric_number || 'No Matric'}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-sm text-gray-600">Active</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No users found matching your search.
                        </div>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
                        <h3 className="text-lg font-bold">Add New User</h3>
                        <Input label="Full Name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                        <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                                <select className="w-full border rounded-lg p-2 bg-white" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="Student">Student</option>
                                    <option value="Lecturer">Lecturer</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            {formData.role === 'Student' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                                    <select className="w-full border rounded-lg p-2 bg-white" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                                        <option value="100">100</option>
                                        <option value="200">200</option>
                                        <option value="300">300</option>
                                        <option value="400">400</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        {formData.role === 'Student' && (
                            <Input label="Matric Number" value={formData.matric_number} onChange={e => setFormData({ ...formData, matric_number: e.target.value })} />
                        )}
                        <div className="flex gap-3 justify-end mt-4">
                            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create User</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
