'use client';
import AuthGuard from '@/components/AuthGuard';
import Comments from '@/views/comments';

export default function SitePage() {
  return <AuthGuard><Comments /></AuthGuard>;
}
