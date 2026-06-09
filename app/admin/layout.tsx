"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";

interface UserProfileData {
  authenticated: boolean;
  authUserId: string;
  email: string;
  fullName: string;
  role: string;
  profileId: string;
}

interface AdminContextType {
  profile: UserProfileData | null;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType>({
  profile: null,
  refreshProfile: async () => {},
  loading: true
});

export const useAdmin = () => useContext(AdminContext);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/role");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.role === "admin") {
          setProfile(data);
        } else {
          router.push(data.role === "contestant" ? "/portal" : "/login");
        }
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Error fetching profile in admin layout:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProfile]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary mb-4" />
        <p className="text-sm font-semibold text-dark-5">Loading Admin Control Panel...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <AdminContext.Provider value={{ profile, refreshProfile: fetchProfile, loading }}>
      <DashboardShell
        section="admin"
        user={{
          name: profile.fullName,
          email: profile.email,
        }}
        onSignOut={handleSignOut}
      >
        {children}
      </DashboardShell>
    </AdminContext.Provider>
  );
}
