'use client';
import CommentsManager from '@/components/CommentsManager';
import AuthGuard from '@/components/AuthGuard';

export default function CommentsPage() {
    return (
        <AuthGuard>
            <CommentsManager />
        </AuthGuard>
    );
}
