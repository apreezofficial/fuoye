'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';

// Mock data
const mockUsers = [
    { id: 1, name: 'Sola Adebayo', email: 'sola@fuoye.edu.ng', role: 'Student', matric: 'FUO/21/CSC/042' },
    { id: 2, name: 'Dr. Johnson', email: 'johnson@fuoye.edu.ng', role: 'Lecturer', matric: '-' },
    { id: 3, name: 'Admin One', email: 'admin@fuoye.edu.ng', role: 'Admin', matric: '-' },
];

export default function UsersPage() {
    const [users] = useState(mockUsers);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage students, lecturers, and admins.</p>
                </div>
                <Button className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Add New User</span>
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex-1 max-w-md">
                    <Input placeholder="Search by name, email or matric..." icon={<Search className="w-4 h-4" />} className="h-10" />
                </div>
                <select className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm px-4 focus:ring-green-500 focus:border-green-500">
                    <option>All Roles</option>
                    <option>Student</option>
                    <option>Lecturer</option>
                    <option>Admin</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matric / Staff ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'Lecturer' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.matric}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button className="text-gray-400 hover:text-green-600 p-1">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="text-gray-400 hover:text-red-600 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
