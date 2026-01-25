'use client';

import UserProvider from '../UserProvider';

export function Providers({ children }) {
  return <UserProvider>{children}</UserProvider>;
}
