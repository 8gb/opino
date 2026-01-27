'use client';
import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '@/UserProvider';
import supabase from '@/services/supabase/client';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function DashboardContent() {
    const user = useContext(UserContext);
    const [stats, setStats] = useState({ sites: 0, comments: 0 });
    const [recentSites, setRecentSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user === 'loading') return;

        const fetchData = async () => {
            try {
                // Get current session for token
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                
                if (!token) return;

                const res = await fetch('/api/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error('Failed to fetch stats');

                const data = await res.json();

                setStats({
                    sites: data.stats.sites || 0,
                    comments: data.stats.comments || 0,
                });
                setRecentSites(data.recentSites || []);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error fetching dashboard data:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
    }

    return (
        <>
            <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
                {/* Page Heading & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h2>
                        <p className="text-slate-500 dark:text-[#92a4c9] mt-1">Welcome back, check your systems status.</p>
                    </div>
                    {/* Placeholder for Add Site - functionality can be linked to /sites or a modal */}
                    <Link href="/sites" className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>Add New Site</span>
                    </Link>
                </div>

                {/* Metrics Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Stat Card 1 */}
                    <div className="flex flex-col p-6 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">Total Sites</p>
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">language</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.sites}</h3>
                            <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded-md">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                <span>Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="flex flex-col p-6 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">Total Comments</p>
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">comment</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.comments}</h3>
                            <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded-md">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                <span>Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="flex flex-col p-6 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">System Status</p>
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">dns</span>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Operational</h3>
                        </div>
                        <p className="text-slate-400 text-xs mt-2">All systems normal</p>
                    </div>
                </div>

                {/* Recent Activity / Sites List */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Sites</h3>
                        <Link className="text-sm font-medium text-primary hover:text-blue-400 transition-colors" href="/sites">View all</Link>
                    </div>
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-[#1f293a] text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Site Name</th>
                                        <th className="px-6 py-4">Site ID</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date Added</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                    {recentSites.length > 0 ? (
                                        recentSites.map((site) => (
                                            <tr key={site.id} className="group hover:bg-slate-50 dark:hover:bg-[#1f293a]/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                                            P
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white">{site.domain || 'Untitled Site'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-[#92a4c9] font-mono text-xs">{site.id}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20">
                                                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-[#92a4c9]">{dayjs(site.created_at).fromNow()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/site/${site.id}`} className="text-slate-400 hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500 group">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                                        <span className="material-symbols-outlined text-slate-400 text-3xl">add_link</span>
                                                    </div>
                                                    <h3 className="text-slate-900 dark:text-white font-medium mb-1">No sites connected yet</h3>
                                                    <p className="text-slate-500 text-sm mb-4">Connect your first static site to start collecting comments.</p>
                                                    <Link href="/sites" className="text-primary text-sm font-bold hover:underline">Connect Site</Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Quick Links */}
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-6 text-sm text-slate-500 dark:text-[#92a4c9]">
                    <a className="hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Documentation</a>
                    <a className="hover:text-slate-900 dark:hover:text-white transition-colors" href="#">API Reference</a>
                    <a className="hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Support</a>
                    <span className="ml-auto opacity-50">v0.1.0</span>
                </div>
            </div>
        </>
    );
}

export default function DashboardPage() {
    return (
        <AuthGuard>
            <DashboardContent />
        </AuthGuard>
    );
}
