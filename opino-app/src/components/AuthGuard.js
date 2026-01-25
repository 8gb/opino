'use client';
import { useContext } from "react";
import { UserContext } from "../UserProvider";
import Login from "../views/login";
import VerifyEmail from "./VerifyEmail";

export default function AuthGuard({ children }) {
  const user = useContext(UserContext);

  if (user === 'loading') {
     return <div className="flex h-screen items-center justify-center"><img src="/loading.gif" alt="loading" /></div>;
  }

  if (!user) {
    return <Login />;
  }

  if (!user.emailVerified) {
    return <VerifyEmail />;
  }

  return children;
}
