'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

interface Settings {
    schoolName: string;
    tagline: string;
    primaryColor: string;
    logoUrl?: string;
    themeMode: 'light' | 'dark';
}

interface SettingsContextType {
    settings: Settings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
    schoolName: 'Federal University Oye-Ekiti',
    tagline: 'Innovation and Character',
    primaryColor: '#228B22',
    themeMode: 'light',
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    loading: true,
    refreshSettings: async () => { },
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            // Merge with defaults to ensure ease of use
            setSettings((prev) => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // Fallback to default is already set
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
