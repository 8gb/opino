'use client';
import { useContext } from "react";
import { UserContext } from "../UserProvider";
import Login from "../views/login";
import Verify from "../views/verify";

export default function AuthGuard({ children }) {
  const user = useContext(UserContext);

  if (user === 'loading') {
     return <div className="center-star"><img src="/loading.gif" alt="loading" /></div>;
  }

  if (!user) {
    return <Login />;
  }

  if (!user.emailVerified) {
    return <Verify />;
  }

  return children;
}
