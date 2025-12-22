'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Globe, Palette, Lock, Book, Zap, Server, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const { settings, refreshSettings } = useSettings();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'auth' | 'academic' | 'features' | 'system'>('general');
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        // Verify admin access by attempting to fetch settings
        const verifyAccess = async () => {
            try {
                await api.get('/admin/stats.php'); // Quick auth check
            } catch (error: any) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    router.push('/dashboard');
                }
            }
        };
        verifyAccess();
    }, [router]);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.post('/settings.php', formData);
            await refreshSettings();
            alert('Settings saved successfully!');
        } catch (e) {
            alert('Failed to save settings.');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'theme', label: 'Theme & UI', icon: Palette },
        { id: 'auth', label: 'Auth & Security', icon: Lock },
        { id: 'academic', label: 'Academic', icon: Book },
        { id: 'features', label: 'Features', icon: Zap },
        { id: 'system', label: 'System', icon: Server },
    ];

    if (!formData.school_name) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                    <p className="text-gray-500">Configure global parameters and feature flags.</p>
                </div>
                <Button onClick={handleSave} disabled={loading} className="gap-2 shadow-lg">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === tab.id ? 'bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-4">General Branding</h3>
                            <Input label="School Name" value={formData.school_name} onChange={e => handleChange('school_name', e.target.value)} />
                            <Input label="Platform Name" value={formData.platform_name} onChange={e => handleChange('platform_name', e.target.value)} />
                            <Input label="Tagline" value={formData.tagline} onChange={e => handleChange('tagline', e.target.value)} />
                            <Input label="Footer Text" value={formData.footer_text} onChange={e => handleChange('footer_text', e.target.value)} />
                        </div>
                    )}

                    {activeTab === 'theme' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-4">Theme & UI</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.primary_color}
                                            onChange={e => handleChange('primary_color', e.target.value)}
                                            className="h-10 w-10 rounded border cursor-pointer"
                                        />
                                        <Input value={formData.primary_color} onChange={e => handleChange('primary_color', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Allow Theme Switch</label>
                                    <select
                                        className="w-full p-2 border rounded-xl"
                                        value={formData.allow_theme_switch ? 'true' : 'false'}
                                        onChange={e => handleChange('allow_theme_switch', e.target.value === 'true')}
                                    >
                                        <option value="true">Enabled</option>
                                        <option value="false">Disabled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'auth' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-4">Authentication</h3>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <h4 className="font-medium text-gray-900">Enable Registration</h4>
                                    <p className="text-xs text-gray-500">Allow new students to create accounts.</p>
                                </div>
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors"
                                    style={{ backgroundColor: formData.enable_registration ? '#16a34a' : '#e5e7eb' }}
                                    onClick={() => handleChange('enable_registration', !formData.enable_registration)}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.enable_registration ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                            </div>
                            <Input label="Matric Regex Pattern" value={formData.matric_regex} onChange={e => handleChange('matric_regex', e.target.value)} className="font-mono" />
                        </div>
                    )}

                    {activeTab === 'academic' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-4">Academic System</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Current Session" value={formData.current_session} onChange={e => handleChange('current_session', e.target.value)} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Semester</label>
                                    <select
                                        className="w-full p-2 border rounded-xl"
                                        value={formData.current_semester}
                                        onChange={e => handleChange('current_semester', e.target.value)}
                                    >
                                        <option value="Harmattan">Harmattan</option>
                                        <option value="Rain">Rain</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'features' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-4">Feature Toggles</h3>
                            {[
                                { key: 'feature_cbt', label: 'CBT System', desc: 'Computer Based Test module' },
                                { key: 'feature_ai_tutor', label: 'AI Tutor', desc: 'Enable "Esther" AI assistant' },
                                { key: 'feature_games', label: 'Games & Competitions', desc: 'Academic gaming hub' },
                                { key: 'feature_events', label: 'Events Module', desc: 'Campus news and events' },
                            ].map(feature => (
                                <div key={feature.key} className="flex items-center justify-between py-2">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{feature.label}</h4>
                                        <p className="text-xs text-gray-500">{feature.desc}</p>
                                    </div>
                                    <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors"
                                        style={{ backgroundColor: formData[feature.key] ? '#16a34a' : '#e5e7eb' }}
                                        onClick={() => handleChange(feature.key, !formData[feature.key])}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData[feature.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-4">System Control</h3>
                            <div className="p-4 border border-red-100 bg-red-50 rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-red-800 font-bold flex items-center gap-2">
                                        <Server className="w-4 h-4" /> Maintenance Mode
                                    </div>
                                    <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors"
                                        style={{ backgroundColor: formData.maintenance_mode ? '#dc2626' : '#e5e7eb' }}
                                        onClick={() => handleChange('maintenance_mode', !formData.maintenance_mode)}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.maintenance_mode ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </div>
                                </div>
                                <p className="text-xs text-red-600">
                                    When enabled, only Administrators can access the system.
                                </p>
                                <Input label="Maintenance Message" value={formData.maintenance_message} onChange={e => handleChange('maintenance_message', e.target.value)} />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
