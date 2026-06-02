"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth/client";
import {
  LayoutDashboard,
  FileText,
  Users,
  Image as ImageIcon,
  Calendar,
  Bell,
  Sliders,
  History,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Loader2
} from "lucide-react";

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
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/role");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.role === "admin") {
          setProfile(data);
        } else {
          // Redirect if not admin (middleware should handle this, but double check)
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
        <Loader2 className="animate-spin h-10 w-10 text-[#0B2D6B] mb-4" />
        <p className="text-sm font-semibold text-[#071E4A]/70">Loading Admin Control Panel...</p>
      </div>
    );
  }

  if (!profile) return null;

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Applications", href: "/admin/applications", icon: FileText },
    { name: "Contestants", href: "/admin/contestants", icon: Users },
    { name: "Media Gallery", href: "/admin/media", icon: ImageIcon },
    { name: "Events Calendar", href: "/admin/events", icon: Calendar },
    { name: "Broadcast Hub", href: "/admin/notifications", icon: Bell },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: History },
    { name: "System Settings", href: "/admin/settings", icon: Sliders }
  ];

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { name: name === "Admin" ? "Control Panel" : name, href };
    });
  };

  return (
    <AdminContext.Provider value={{ profile, refreshProfile: fetchProfile, loading }}>
      <div className="min-h-screen bg-white flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#0B2D6B] border-r border-[#0B2D6B]/15">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Brand Logo Header */}
            <div className="flex items-center h-16 flex-shrink-0 px-6 bg-[#071E4A] border-b border-white/5">
              <div className="relative w-36 h-8">
                <Image
                  src="/logo.png"
                  alt="Miss Somali Admin"
                  fill
                  style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
                  priority
                />
              </div>
            </div>
            
            {/* Navigation links */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                // Highlight item if current route starts with item's href
                // (this keeps the item selected when visiting nested routes like /admin/applications/[id])
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#E8C97A] text-[#071E4A] shadow-md shadow-[#E8C97A]/10"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                        isActive ? "text-[#071E4A]" : "text-white/60 group-hover:text-white"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Sidebar Bottom */}
            <div className="flex-shrink-0 p-4 border-t border-white/5">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-sm font-semibold text-white/75 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors duration-200"
              >
                <LogOut className="mr-3 h-5 w-5 text-white/50 hover:text-red-400" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 flex z-40 md:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0B2D6B] transition-transform duration-300">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center h-16 flex-shrink-0 px-6 bg-[#071E4A] border-b border-white/5">
                <div className="relative w-36 h-8">
                  <Image
                    src="/logo.png"
                    alt="Miss Somali Admin"
                    fill
                    style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
                  />
                </div>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-[#E8C97A] text-[#071E4A] shadow-md"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive ? "text-[#071E4A]" : "text-white/60 group-hover:text-white"
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex-shrink-0 p-4 border-t border-white/5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-3 text-sm font-semibold text-white/75 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors duration-200"
                >
                  <LogOut className="mr-3 h-5 w-5 text-white/50 hover:text-red-400" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:pl-64 min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-[#E8E8E8] shadow-sm">
            <button
              type="button"
              className="px-4 border-r border-[#E8E8E8] text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0B2D6B] md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6 text-[#071E4A]" aria-hidden="true" />
            </button>

            <div className="flex-1 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              {/* Breadcrumbs */}
              <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-[#071E4A]/60">
                <span className="hover:text-[#0B2D6B]">Control Panel</span>
                {getBreadcrumbs().map((bc, idx) => (
                  <span key={bc.href} className="flex items-center space-x-2">
                    <span className="text-gray-300">/</span>
                    <Link
                      href={bc.href}
                      className={idx === getBreadcrumbs().length - 1 ? "text-[#0B2D6B] font-bold" : "hover:text-[#0B2D6B]"}
                    >
                      {bc.name}
                    </Link>
                  </span>
                ))}
              </div>

              {/* User Dropdown with Admin badge */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] px-3 py-1.5 border border-[#E8E8E8] hover:bg-gray-50 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-[#0B2D6B] flex items-center justify-center mr-2 text-white font-bold text-xs shadow-sm">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-flex items-center">
                    <span className="text-xs font-bold text-[#071E4A] mr-2">
                      {profile.fullName}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 mr-2">
                      Admin
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#071E4A]/60" />
                </button>

                {userDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-xl bg-white ring-1 ring-black/5 py-1 focus:outline-none border border-[#E8E8E8]">
                    <div className="px-4 py-2 border-b border-[#E8E8E8] text-left">
                      <p className="text-xs text-gray-500">Logged in as</p>
                      <p className="text-xs font-bold text-[#071E4A] truncate">{profile.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left block px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
