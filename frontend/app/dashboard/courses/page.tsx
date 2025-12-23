'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { BookOpen, User, Download, Loader2, CheckCircle, ShieldCheck, Plus, Link2 } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

export default function StudentCoursesPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState<Record<number, any[]>>({});
    const [materialsLoading, setMaterialsLoading] = useState<Record<number, boolean>>({});
    const [materialsOpen, setMaterialsOpen] = useState<Record<number, boolean>>({});
    const [newMaterial, setNewMaterial] = useState<Record<number, { title: string; description: string; file_url: string }>>({});

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/student/courses.php');
                setData(data);
            } catch (error: any) {
                console.error("Failed to fetch courses", error);
                toast.error('Failed to load courses', {
                    description: error.response?.data?.message || 'Please try again later'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const toggleMaterials = async (courseId: number) => {
        setMaterialsOpen((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
        if (!materials[courseId]) {
            await fetchMaterials(courseId);
        }
    };

    const fetchMaterials = async (courseId: number) => {
        setMaterialsLoading((prev) => ({ ...prev, [courseId]: true }));
        try {
            const { data } = await api.get(`/student/materials.php?course_id=${courseId}`);
            setMaterials((prev) => ({ ...prev, [courseId]: data || [] }));
        } catch (error: any) {
            toast.error('Failed to load materials', {
                description: error.response?.data?.message || 'Please try again later',
            });
        } finally {
            setMaterialsLoading((prev) => ({ ...prev, [courseId]: false }));
        }
    };

    const updateNewMaterial = (courseId: number, partial: Partial<{ title: string; description: string; file_url: string }>) => {
        setNewMaterial((prev) => ({
            ...prev,
            [courseId]: {
                title: prev[courseId]?.title || '',
                description: prev[courseId]?.description || '',
                file_url: prev[courseId]?.file_url || '',
                ...partial,
            },
        }));
    };

    const uploadMaterial = async (courseId: number) => {
        const payload = newMaterial[courseId] || { title: '', description: '', file_url: '' };
        if (!payload.title.trim() || !payload.file_url.trim()) {
            toast.error('Please add a title and file URL');
            return;
        }
        try {
            toast.loading('Uploading material...', { id: `upload-${courseId}` });
            await api.post('/student/materials.php', {
                course_id: courseId,
                title: payload.title,
                description: payload.description,
                file_url: payload.file_url,
            });
            toast.success('Material uploaded! Pending admin verification.', { id: `upload-${courseId}` });
            await fetchMaterials(courseId);
            updateNewMaterial(courseId, { title: '', description: '', file_url: '' });
        } catch (error: any) {
            toast.error('Failed to upload', {
                id: `upload-${courseId}`,
                description: error.response?.data?.message || 'Please try again',
            });
        }
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;
    if (!data) return <div className="text-center py-20">Failed to load courses. Please login again.</div>;

    const { user, courses } = data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Courses ({user.level} Level)</h1>
                    <p className="text-gray-500">Registered courses for the current semester.</p>
                </div>
                <Link href="/dashboard/register-courses">
                    <Button className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Register Courses
                    </Button>
                </Link>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No courses registered</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-4">
                        You haven't registered for any courses yet. Click the button below to get started.
                    </p>
                    <Link href="/dashboard/register-courses">
                        <Button>Register Courses Now</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {courses.map((course: any, i: number) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all">
                            <div className="md:w-64 h-40 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl flex items-center justify-center relative overflow-hidden border border-gray-200">
                                <div className="text-green-700 font-bold text-2xl">{course.code}</div>
                                <div className="absolute top-2 right-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                <User className="w-4 h-4" /> {course.unit} Units • {course.dept_code || 'General'}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => toggleMaterials(course.id)}>
                                            <Download className="w-4 h-4 mr-2" /> Materials
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4 md:mt-0">
                                    <Button className="flex-1" onClick={() => toggleMaterials(course.id)}>View Materials</Button>
                                    <Button variant="secondary" className="flex-1 md:flex-none" onClick={() => toggleMaterials(course.id)}>Upload</Button>
                                </div>

                                {materialsOpen[course.id] && (
                                    <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Download className="w-4 h-4 text-gray-500" />
                                            <h4 className="font-semibold text-gray-900">Course Materials</h4>
                                            {materialsLoading[course.id] && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
                                        </div>

                                        {/* Upload form */}
                                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 space-y-3">
                                            <div className="grid md:grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="Title"
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    value={newMaterial[course.id]?.title || ''}
                                                    onChange={(e) => updateNewMaterial(course.id, { title: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="File URL (e.g. drive link)"
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    value={newMaterial[course.id]?.file_url || ''}
                                                    onChange={(e) => updateNewMaterial(course.id, { file_url: e.target.value })}
                                                />
                                            </div>
                                            <textarea
                                                placeholder="Description (optional)"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                rows={2}
                                                value={newMaterial[course.id]?.description || ''}
                                                onChange={(e) => updateNewMaterial(course.id, { description: e.target.value })}
                                            />
                                            <div className="flex justify-end">
                                                <Button size="sm" onClick={() => uploadMaterial(course.id)} className="flex items-center gap-2">
                                                    <Plus className="w-4 h-4" />
                                                    Upload
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Materials list */}
                                        {materials[course.id]?.length === 0 ? (
                                            <p className="text-sm text-gray-500">No materials yet.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {materials[course.id]?.map((mat) => (
                                                    <div key={mat.id} className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-gray-900">{mat.title}</span>
                                                                {mat.is_verified && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">
                                                                        <ShieldCheck className="w-3 h-3" />
                                                                        Verified
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 line-clamp-2">{mat.description}</p>
                                                            <p className="text-xs text-gray-500">By {mat.uploader_name}</p>
                                                        </div>
                                                        <a
                                                            href={mat.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-green-700 text-sm flex items-center gap-1 hover:underline"
                                                        >
                                                            <Link2 className="w-4 h-4" />
                                                            Open
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
