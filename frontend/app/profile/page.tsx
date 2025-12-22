'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Book, Award, Camera, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/student/profile.php');
                setProfile(data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
    if (!profile) return <div className="text-center py-20">Failed to load profile.</div>;

    const initials = profile.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'U';

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
                <p className="text-gray-500">Manage your personal information and academic details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
                        <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center text-4xl font-bold text-green-700 mb-4 border-4 border-white shadow-lg relative">
                            {initials}
                            <button className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors shadow-sm">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
                        <p className="text-gray-500">{profile.department} • {profile.level}L</p>
                        <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{profile.stats.cgpa}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">CGPA</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{profile.stats.courses}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Courses</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <Award className="w-6 h-6" />
                            <h3 className="font-bold text-lg">Achievements</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-900 font-bold text-xs">🥇</div>
                                <div>
                                    <p className="font-medium text-sm">Top Performer</p>
                                    <p className="text-xs text-indigo-200">High CGPA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Full Name" value={profile.full_name} disabled />
                            <Input label="Email Address" value={profile.email} icon={<Mail className="w-4 h-4" />} disabled />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2 flex items-center gap-2">
                            <Book className="w-5 h-5 text-gray-400" />
                            Academic Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Department" value={profile.department} disabled />
                            <Input label="Matric Number" value={profile.matric_number || 'N/A'} disabled />
                            <Input label="Level" value={profile.level} disabled />
                            <Input label="Role" value={profile.role} disabled />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline">Cancel</Button>
                        <Button>Save Changes</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
