import { createContext, useContext } from "react";
import { useAuthSession } from "./useAuthSession";

type AuthContextValue = ReturnType<typeof useAuthSession>;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthSession();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return auth;
}
