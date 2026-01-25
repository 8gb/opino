'use client';
import { useParams } from 'next/navigation';
import CommentsManager from '@/components/CommentsManager';
import AuthGuard from '@/components/AuthGuard';

export default function SitePage() {
  const params = useParams();
  
  return (
    <AuthGuard>
      <CommentsManager initialSiteId={params?.id} />
    </AuthGuard>
  );
}
