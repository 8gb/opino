'use client';
import AuthGuard from '@/components/AuthGuard';
import Comments from '@/views/comments';

export default function HomePage() {
  return (
    <AuthGuard>
      <Comments />
    </AuthGuard>
  );
}
