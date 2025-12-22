'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSettings } from '@/context/SettingsContext';
import { Settings, Palette, Globe, Shield, Save } from 'lucide-react';
import api from '@/lib/api';

export default function SettingsPage() {
    const { settings, refreshSettings } = useSettings();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        schoolName: '',
        primaryColor: '#228B22',
    });

    useEffect(() => {
        setFormData({
            schoolName: settings.schoolName,
            primaryColor: settings.primaryColor,
        });
    }, [settings]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.post('/settings', {
                school_name: formData.schoolName,
                primary_color: formData.primaryColor
            });
            await refreshSettings();
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings", error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-gray-400" />
                    Platform Settings
                </h1>
                <p className="text-gray-500">Customize the look and feel of the platform.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
                <div>
                    <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-400" />
                        General Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="School Name"
                            value={formData.schoolName}
                            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        />
                        <Input
                            label="Tagline"
                            placeholder="Innovation and Character"
                        />
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-gray-400" />
                        Appearance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Primary Brand Color"
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="h-11 p-1 w-24 cursor-pointer"
                        />
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center cursor-pointer space-x-2">
                                <input type="radio" name="theme" className="text-green-600 focus:ring-green-500" defaultChecked />
                                <span>Light Mode</span>
                            </label>
                            <label className="flex items-center cursor-pointer space-x-2">
                                <input type="radio" name="theme" className="text-green-600 focus:ring-green-500" />
                                <span>Dark Mode</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-gray-400" />
                        Security
                    </h2>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                            <p className="text-sm text-gray-500">Disable access for everyone except admins</p>
                        </div>
                        <Button variant="secondary" size="sm">Enable</Button>
                    </div>
                </div>

            </div>

            <div className="flex justify-end sticky bottom-6">
                <Button onClick={handleSave} isLoading={loading} size="lg" className="shadow-xl flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
