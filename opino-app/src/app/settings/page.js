'use client';
import React, { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';

function Toggle({ label, description, checked, onChange, disabled }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
            <div className="flex flex-col pr-4">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{label}</span>
                <span className="text-sm text-slate-500 dark:text-[#92a4c9]">{description}</span>
            </div>
            <button
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}

function SettingsContent() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [developerMode, setDeveloperMode] = useState(false);

    // Derived state for save imitation
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            alert('Settings saved successfully');
        }, 800);
    };

    return (
        <>
            <div className="p-6 lg:p-10 max-w-3xl mx-auto w-full flex flex-col gap-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h2>
                    <p className="text-slate-500 dark:text-[#92a4c9] mt-1">Manage your application preferences.</p>
                </div>

                <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">General Preferences</h3>

                        <div className="flex flex-col">
                            <Toggle
                                label="Email Notifications"
                                description="Receive email updates about new comments."
                                checked={emailNotifications}
                                onChange={setEmailNotifications}
                            />

                            <Toggle
                                label="Developer Mode"
                                description="Show advanced debugging information and experimental features."
                                checked={developerMode}
                                onChange={setDeveloperMode}
                            />
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-[#1f293a]/50 border-t border-slate-200 dark:border-border-dark flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary hover:bg-blue-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving && <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>}
                            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function SettingsPage() {
    return (
        <AuthGuard>
            <SettingsContent />
        </AuthGuard>
    );
}
