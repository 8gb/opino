'use client';
import React, { useState, useEffect, useContext } from 'react';
import supabase from '@/services/supabase/client';
import { UserContext } from '@/UserProvider';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function SitesContent() {
    const user = useContext(UserContext);
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newSiteDomain, setNewSiteDomain] = useState('');
    const [editingKey, setEditingKey] = useState('');
    const [editValue, setEditValue] = useState('');

    // Fetch Sites
    const fetchSites = async () => {
        // AuthGuard ensures user is loaded and present, but we double check
        if (!user || user === 'loading' || !user.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) throw new Error('No auth token');

            const res = await fetch('/api/sites', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch sites');
            
            const sites = await res.json();
            setData(sites || []);
        } catch (error) {
            console.error('Failed to fetch sites:', error.message);
            // message.error('Failed to load sites'); // Removed ant design message dependency
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSites();
    }, [user]);

    // Add Site
    const handleAddSite = async () => {
        if (!newSiteDomain) {
            alert('Please enter a domain name');
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) throw new Error('No auth token');

            const res = await fetch('/api/sites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ domain: newSiteDomain })
            });

            if (!res.ok) throw new Error('Failed to add site');

            setIsModalVisible(false);
            setNewSiteDomain('');
            fetchSites();
        } catch (error) {
            console.error('Error adding site:', error.message);
        }
    };

    // Delete Site
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this site?')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) throw new Error('No auth token');

            const res = await fetch(`/api/sites/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete site');
            fetchSites();
        } catch (error) {
            console.error('Error deleting site:', error.message);
        }
    };

    const startEditing = (record) => {
        setEditingKey(record.id);
        setEditValue(record.domain);
    };

    const cancelEditing = () => {
        setEditingKey('');
        setEditValue('');
    };

    // Update Domain
    const handleUpdateDomain = async (id) => {
        try {
            const { error } = await supabase
                .from('sites')
                .update({ domain: editValue })
                .eq('id', id);
            if (error) throw error;
            setEditingKey('');
            fetchSites();
        } catch (error) {
            console.error('Error updating domain:', error.message);
        }
    }

    const filteredData = data.filter(item =>
        (item.domain || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.id || '').toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <>
            <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sites Management</h2>
                        <p className="text-slate-500 dark:text-[#92a4c9] mt-1">Manage your connected static sites.</p>
                    </div>
                    <button
                        onClick={() => setIsModalVisible(true)}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>Add New Site</span>
                    </button>
                </div>

                {/* Filter */}
                <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                    <div className="flex w-full items-center rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-dark focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                        <input
                            className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-text-secondary h-10 px-3 text-sm focus:ring-0"
                            placeholder="Search by domain or ID..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                        <div className="text-slate-400 dark:text-text-secondary px-3 flex items-center">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-[#1f293a] text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Domain</th>
                                    <th className="px-6 py-4">Site ID</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Comments</th>
                                    <th className="px-6 py-4">Date Added</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading sites...</td></tr>
                                ) : filteredData.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No sites found.</td></tr>
                                ) : (
                                    filteredData.map((site) => (
                                        <tr key={site.id} className="group hover:bg-slate-50 dark:hover:bg-[#1f293a]/50 transition-colors">
                                            <td className="px-6 py-4">
                                                {editingKey === site.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            className="bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-border-dark rounded px-2 py-1 text-sm text-slate-900 dark:text-white"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <button onClick={() => handleUpdateDomain(site.id)} className="text-emerald-500 hover:text-emerald-600"><span className="material-symbols-outlined text-lg">check</span></button>
                                                        <button onClick={cancelEditing} className="text-red-500 hover:text-red-600"><span className="material-symbols-outlined text-lg">close</span></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs">P</div>
                                                        <span className="font-medium text-slate-900 dark:text-white">{site.domain || 'Unnamed Site'}</span>
                                                        <button onClick={() => startEditing(site)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-all"><span className="material-symbols-outlined text-sm">edit</span></button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-1 rounded select-all cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition" title="Click to copy">{site.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20">
                                                    <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-[#92a4c9]">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[16px]">comment</span>
                                                    <span className="font-medium">{site.comments?.[0]?.count || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-[#92a4c9]">{dayjs(site.created_at).fromNow()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => router.push(`/site/${site.id}`)} className="text-sm font-medium text-primary hover:underline">Manage Comments</button>
                                                    <button onClick={() => handleDelete(site.id)} className="text-slate-400 hover:text-red-500 transition-colors ml-2"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Overlay */}
                {isModalVisible && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-border-dark animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-slate-200 dark:border-border-dark">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Site</h3>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Domain Name</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-surface-dark border border-slate-300 dark:border-border-dark rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400"
                                    placeholder="e.g., mysite.com"
                                    value={newSiteDomain}
                                    onChange={e => setNewSiteDomain(e.target.value)}
                                    autoFocus
                                />
                                <p className="text-xs text-slate-500 dark:text-text-secondary mt-2">
                                    Enter the domain where Opino will be installed. You will use the Site ID to configure the widget.
                                </p>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-surface-dark border-t border-slate-200 dark:border-border-dark flex justify-end gap-3">
                                <button onClick={() => setIsModalVisible(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
                                <button onClick={handleAddSite} className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 transition-all">Add Site</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function SitesPage() {
    return (
        <AuthGuard>
            <SitesContent />
        </AuthGuard>
    );
}
