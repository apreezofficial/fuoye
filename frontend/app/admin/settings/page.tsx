'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        schoolName: 'Federal University Oye-Ekiti',
        primaryColor: '#228B22',
    });

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        alert('Settings saved!');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                <p className="text-gray-500">Customize the look and feel of the platform.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <h2 className="text-lg font-semibold border-b border-gray-100 pb-2">General</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="School Name"
                        value={settings.schoolName}
                        onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                    />
                    <Input
                        label="Primary Brand Color"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="h-11 p-1"
                    />
                </div>

                <div className="flex items-center justify-between pt-4">
                    <div>
                        <h3 className="font-medium">Maintenance Mode</h3>
                        <p className="text-sm text-gray-500">Disable access for everyone except admins</p>
                    </div>
                    <Button variant="secondary" size="sm">Enable</Button>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} isLoading={loading}>
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
