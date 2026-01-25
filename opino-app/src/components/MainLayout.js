'use client';
import React, { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { UserContext } from '../UserProvider';
import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const user = useContext(UserContext);

  // If user is loading or not logged in, or on login page, render simple layout or redirect
  const isLoginPage = pathname === '/login' || pathname === '/login/';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        {children}
      </div>
    );
  }

  if (user === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    // If not logged in, just render children (which might handle redirect or show login)
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-y-auto scroll-smooth">
        {/* We omitted the Header here because it might be page specific, 
            but in the design it's part of the main container. 
            We can leave it to the individual pages to include the Header 
            or include a default one here if we could pass the title. 
            For now, we'll let children render their own header or content. 
            However, to stick to the design where the header is 'sticky top-0', 
            it's best if the pages include it as their first element.
        */}
        {children}
      </main>
    </div>
  );
}
