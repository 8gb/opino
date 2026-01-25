'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <AuthGuard>
       <div className="flex justify-center items-center h-full text-gray-500">Redirecting to Dashboard...</div>
    </AuthGuard>
  );
}
