'use client';
import AuthGuard from '@/components/AuthGuard';
import ChangePW from '@/views/changepw';
export default function AccountPage() {
  return <AuthGuard><ChangePW /></AuthGuard>;
}
