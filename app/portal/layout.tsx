"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/Layouts/DashboardShell";

interface UserProfileData {
  authenticated: boolean;
  authUserId: string;
  email: string;
  fullName: string;
  role: string;
  profileId: string;
  profilePhotoUrl?: string;
}

interface PortalContextType {
  profile: UserProfileData | null;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const PortalContext = createContext<PortalContextType>({
  profile: null,
  refreshProfile: async () => {},
  loading: true
});

export const usePortal = () => useContext(PortalContext);

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/role", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.role === "contestant") {
          setProfile(data);
        } else {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Error fetching profile in portal layout:", err);
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
      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      // Even if signOut API fails, force redirect to login
      router.replace("/login");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-2 dark:bg-[#020d1a]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <PortalContext.Provider value={{ profile, refreshProfile: fetchProfile, loading }}>
      <DashboardShell
        routePrefix="/portal"
        user={{
          name: profile.fullName,
          email: profile.email,
          image: profile.profilePhotoUrl,
        }}
        profileUrl="/portal/profile"
        onSignOut={handleSignOut}
      >
        {children}
      </DashboardShell>
    </PortalContext.Provider>
  );
}
