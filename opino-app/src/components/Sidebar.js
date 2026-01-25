'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useContext } from 'react';
import { UserContext } from '../UserProvider';
import { useTheme } from './ThemeProvider';
import supabase from '../services/supabase/client';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const user = useContext(UserContext);
    const { theme, toggleTheme } = useTheme();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

    // Style helpers
    const linkClass = (path) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(path)
        ? 'bg-slate-100 dark:bg-[#232f48] text-primary dark:text-white'
        : 'text-slate-600 dark:text-[#92a4c9] hover:bg-slate-50 dark:hover:bg-white/5'
        }`;

    const iconClass = (path) => `material-symbols-outlined ${isActive(path) ? '' : 'group-hover:text-primary'
        }`;

    return (
        <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722] transition-colors duration-200 hidden md:flex h-full">
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-primary/10 flex items-center justify-center rounded-lg size-10 text-primary">
                        <span className="material-symbols-outlined text-2xl">grid_view</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-none tracking-tight dark:text-white">Opino</h1>
                        <p className="text-slate-500 dark:text-[#92a4c9] text-xs font-medium mt-1">Admin Console</p>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <Link href="/dashboard" className={linkClass('/dashboard')}>
                        <span className={iconClass('/dashboard')}>dashboard</span>
                        <p className="text-sm font-medium">Dashboard</p>
                    </Link>
                    <Link href="/sites" className={linkClass('/sites')}>
                        <span className={iconClass('/sites')}>language</span>
                        <p className="text-sm font-medium">Sites</p>
                    </Link>
                    <Link href="/comments" className={linkClass('/comments')}>
                        <span className={iconClass('/comments')}>chat_bubble</span>
                        <p className="text-sm font-medium">Comments</p>
                        {/* <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">5</span> */}
                    </Link>

                    <Link href="/settings" className={linkClass('/settings')}>
                        <span className={iconClass('/settings')}>settings</span>
                        <p className="text-sm font-medium">Settings</p>
                    </Link>
                </div>
            </div>
            <div className="mt-auto p-6 border-t border-slate-200 dark:border-border-dark flex flex-col gap-2">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg text-slate-600 dark:text-[#92a4c9] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors w-full text-left"
                >
                    <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                    <p className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</p>
                </button>

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-500">{user?.email?.[0]?.toUpperCase() || 'U'}</div>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.email?.split('@')[0] || 'User'}</p>
                        <p className="text-xs text-slate-500 dark:text-[#92a4c9] truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Logout"
                    >
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
