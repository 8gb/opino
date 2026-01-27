'use client';
import React, { createContext, useState, useEffect } from "react";
import authService from "./services/auth";

export const UserContext = createContext({ user: null });

export default function UserProvider({ children }) {
  const [user, setUser] = useState('loading');

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(userAuth => {
      setUser(userAuth);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}
