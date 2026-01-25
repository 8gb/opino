'use client';
import React, { Suspense } from 'react';
import Login from '@/views/login';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <Login />
    </Suspense>
  );
}
