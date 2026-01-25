'use client';
import AuthGuard from '@/components/AuthGuard';
import Dashboard from '@/views/dashboard';
export default function SettingsPage() {
  return <AuthGuard><Dashboard /></AuthGuard>;
}
