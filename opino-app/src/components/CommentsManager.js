'use client';
import React, { useState, useEffect, useContext } from 'react';
import supabase from '@/services/supabase/client';
import { UserContext } from '@/UserProvider';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function CommentsManager({ initialSiteId }) {
    const user = useContext(UserContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [siteFilter, setSiteFilter] = useState(initialSiteId || 'all');
    const [sites, setSites] = useState([]);
    const [selectedComments, setSelectedComments] = useState([]);

    // Fetch Sites for Filter
    useEffect(() => {
        if (!user || user === 'loading') return;
        const fetchSites = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                
                if (!token) return;

                const res = await fetch('/api/sites', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) throw new Error('Failed to fetch sites');

                const sites = await res.json();
                setSites(sites || []);
            } catch (error) {
                console.error('Fetch sites error:', error);
            }
        };
        fetchSites();
    }, [user]);

    // Fetch Comments
    const fetchComments = async () => {
        if (!user || user === 'loading') return;
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error('No auth token');

            const params = new URLSearchParams();
            if (siteFilter && siteFilter !== 'all') {
                params.append('siteId', siteFilter);
            }

            const res = await fetch(`/api/comments?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch comments');

            const comments = await res.json();
            setData(comments || []);
        } catch (error) {
            console.error('Failed to fetch comments:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [user, siteFilter]);

    // Update siteFilter if initialSiteId changes
    useEffect(() => {
        if (initialSiteId) {
            setSiteFilter(initialSiteId);
        }
    }, [initialSiteId]);

    // Delete Comment
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error('No auth token');

            const res = await fetch(`/api/comments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete comment');
            fetchComments(); // Refresh
        } catch (error) {
            console.error('Error deleting comment:', error.message);
        }
    };

    const toggleSelect = (id) => {
        setSelectedComments(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedComments.length === filteredData.length) {
            setSelectedComments([]);
        } else {
            setSelectedComments(filteredData.map(d => d.id));
        }
    };

    const filteredData = data.filter(item =>
        (item.message || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.author || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.pathname || '').toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-6">
            {/* Page Heading */}
            <div className="flex flex-col gap-2">
                <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                    {initialSiteId ? 'Site Comments' : 'Comments Inbox'}
                </h1>
                <p className="text-slate-500 dark:text-text-secondary text-base font-normal max-w-2xl">
                    Manage and moderate comments across your connected sites. Review pending messages, mark spam, or approve content.
                </p>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between bg-white dark:bg-surface-dark/50 p-4 rounded-xl border border-slate-200 dark:border-border-dark/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                    {/* Search */}
                    <div className="flex w-full md:max-w-md items-center rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-dark focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                        <input
                            className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-text-secondary h-10 px-3 text-sm focus:ring-0"
                            placeholder="Search by author, content, or path..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <div className="text-slate-400 dark:text-text-secondary px-3 flex items-center">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                    </div>
                    {/* Site Filter (only if not on specific site page) */}
                    {!initialSiteId && (
                        <div className="relative min-w-[200px]">
                            <select
                                className="w-full appearance-none rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white h-10 pl-3 pr-10 text-sm focus:border-primary focus:ring-0 cursor-pointer"
                                value={siteFilter || 'all'}
                                onChange={(e) => setSiteFilter(e.target.value)}
                            >
                                <option value="all">All Sites</option>
                                {sites.map(site => (
                                    <option key={site.id} value={site.id}>{site.domain || site.id}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-text-secondary flex items-center">
                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                            </div>
                        </div>
                    )}
                </div>
                {/* Bulk Actions Placeholder */}
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-slate-700 dark:text-white text-sm hover:bg-slate-50 dark:hover:bg-border-dark transition-colors">
                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                        <span>More Filters</span>
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-dark/80">
                                <th className="p-4 w-12 text-center">
                                    <input
                                        className="h-4 w-4 rounded border-slate-300 dark:border-border-dark bg-white dark:bg-background-dark text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                        type="checkbox"
                                        onChange={toggleSelectAll}
                                        checked={selectedComments.length > 0 && selectedComments.length === filteredData.length}
                                    />
                                </th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-text-secondary">Author</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-text-secondary w-1/3">Message</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-text-secondary">Context</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-text-secondary">Date</th>
                                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">Loading comments...</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">No comments found.</td>
                                </tr>
                            ) : (
                                filteredData.map(comment => (
                                    <tr key={comment.id} className="group hover:bg-slate-50 dark:hover:bg-background-dark/50 transition-colors">
                                        <td className="p-4 text-center">
                                            <input
                                                className="h-4 w-4 rounded border-slate-300 dark:border-border-dark bg-white dark:bg-background-dark text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                                type="checkbox"
                                                checked={selectedComments.includes(comment.id)}
                                                onChange={() => toggleSelect(comment.id)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center rounded-full h-9 w-9 border border-slate-200 dark:border-border-dark bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold text-xs">
                                                    {comment.author ? comment.author[0].toUpperCase() : '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{comment.author || 'Anonymous'}</span>
                                                    <span className="text-xs text-slate-500 dark:text-text-secondary">{comment.email || 'No email'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-slate-700 dark:text-white/90 line-clamp-2 leading-relaxed">
                                                {comment.message}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col items-start gap-1">
                                                {/* Site Label */}
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-xs text-slate-500 dark:text-text-secondary">
                                                    <span className="material-symbols-outlined text-[14px]">public</span>
                                                    <span>
                                                        {sites.find(s => s.id === comment.sitename)?.domain || comment.sitename}
                                                    </span>
                                                </div>
                                                {/* Page Path */}
                                                <code className="text-xs text-primary font-mono px-1">{comment.pathname}</code>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500 dark:text-text-secondary whitespace-nowrap">
                                            {dayjs(comment.timestamp).fromNow()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 rounded-md hover:bg-primary hover:text-white text-slate-400 hover:text-white transition-colors" title="Approve">
                                                    <span className="material-symbols-outlined text-[20px]">check</span>
                                                </button>
                                                <button
                                                    className="p-1.5 rounded-md hover:bg-red-500 hover:text-white text-slate-400 hover:text-white transition-colors"
                                                    title="Delete"
                                                    onClick={() => handleDelete(comment.id)}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                                <button className="p-1.5 rounded-md hover:bg-orange-500 hover:text-white text-slate-400 hover:text-white transition-colors" title="Mark Spam">
                                                    <span className="material-symbols-outlined text-[20px]">block</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Footer */}
                <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-surface-dark/80">
                    <span className="text-sm text-slate-500 dark:text-text-secondary">Showing {filteredData.length} records</span>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded border border-slate-200 dark:border-border-dark text-sm text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-border-dark transition-colors disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1.5 rounded border border-slate-200 dark:border-border-dark text-sm text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-border-dark transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
