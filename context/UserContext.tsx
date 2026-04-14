"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getUserProfile } from "@/lib/user";
import { UserProfile } from "@/lib/types";

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getUserProfile();
      setUser(profile);
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if token exists
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
