'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

type SettingsType = {
    // A. General
    school_name: string;
    platform_name: string;
    tagline: string;
    footer_text: string;
    // B. Theme
    primary_color: string;
    default_theme: 'light' | 'dark';
    allow_theme_switch: boolean;
    // C. Auth
    matric_regex: string;
    enable_registration: boolean;
    // D. Academic
    current_session: string;
    current_semester: string;
    // E. Features
    feature_cbt: boolean;
    feature_ai_tutor: boolean;
    feature_games: boolean;
    feature_events: boolean;
    // F. System
    maintenance_mode: boolean;
    maintenance_message: string;
};

const defaultSettings: SettingsType = {
    school_name: 'FUOYE',
    platform_name: 'Nexus',
    tagline: 'Innovation and Character',
    footer_text: '© 2025 FUOYE',
    primary_color: '#228B22',
    default_theme: 'light',
    allow_theme_switch: true,
    matric_regex: '^FUO\/[0-9]{2}\/[A-Z]{3}\/[0-9]{3}$',
    enable_registration: true,
    current_session: '2024/2025',
    current_semester: 'Harmattan',
    feature_cbt: true,
    feature_ai_tutor: true,
    feature_games: false,
    feature_events: true,
    maintenance_mode: false,
    maintenance_message: 'Maintenance in progress.'
};

const SettingsContext = createContext<{
    settings: SettingsType;
    refreshSettings: () => Promise<void>;
}>({
    settings: defaultSettings,
    refreshSettings: async () => { },
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<SettingsType>(defaultSettings);

    const refreshSettings = async () => {
        try {
            const { data } = await api.get('/settings.php');
            // Normalize booleans (PHP might return "1" or "0")
            const normalizedData = { ...data };
            ['allow_theme_switch', 'enable_registration', 'feature_cbt', 'feature_ai_tutor', 'feature_games', 'feature_events', 'maintenance_mode'].forEach(key => {
                if (normalizedData[key] !== undefined) {
                    normalizedData[key] = normalizedData[key] == 1 || normalizedData[key] === true || normalizedData[key] === "true";
                }
            });
            setSettings(prev => ({ ...prev, ...normalizedData }));
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    // Apply Global Theme Variables
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--primary', settings.primary_color);
            // We could add more dynamic CSS vars here
        }
    }, [settings.primary_color]);

    return (
        <SettingsContext.Provider value={{ settings, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
