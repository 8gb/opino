'use client';
import AuthGuard from '@/components/AuthGuard';
import AdminSettings from '@/views/AdminSettings';
export default function AdminSettingsPage() {
  return <AuthGuard><AdminSettings /></AuthGuard>;
}
