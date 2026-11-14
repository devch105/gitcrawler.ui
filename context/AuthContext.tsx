
"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import type { User } from "@/types/User";
import { ENDPOINTS } from "@/utilities/endpoints";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const res = await fetch(ENDPOINTS.ME, {
                credentials: "include",
            });

            if (res.status === 401) {
                setUser(null);
            } else if (res.ok) {
                setUser((await res.json()) as User);
            } else {
                console.error("Auth check failed:", res.status);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const logout = useCallback(async () => {
        try {
            const res = await fetch(ENDPOINTS.LOGOUT, {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Unable to logout. Please try again.");
            }

            setUser(null);

            sileo.success({
                title: "Logged out successfully",
                description: "See you again soon!",
            });

            router.replace("/auth/login");
        } catch (error) {
            sileo.error({
                title: "Logout failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong. Please try again.",
            });
        }
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                refreshUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return ctx;
};
