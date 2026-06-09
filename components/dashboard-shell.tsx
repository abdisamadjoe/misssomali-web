"use client";

import { ActiveThemeProvider, useThemeConfig } from "@/components/active-theme";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  section: "admin" | "portal";
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut: () => void;
};

export function DashboardShell({
  children,
  section,
  user,
  onSignOut,
}: DashboardShellProps) {
  return (
    <ActiveThemeProvider>
      <DashboardShellContent section={section} user={user} onSignOut={onSignOut}>
        {children}
      </DashboardShellContent>
    </ActiveThemeProvider>
  );
}

function DashboardShellContent({
  children,
  section,
  user,
  onSignOut,
}: DashboardShellProps) {
  const { activeTheme } = useThemeConfig();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className={cn(
        "dashboard-template bg-background text-foreground font-sans antialiased",
        `theme-${activeTheme}`,
        activeTheme.endsWith("-scaled") && "theme-scaled"
      )}
    >
      <AppSidebar
        variant="inset"
        section={section}
        user={user}
        onSignOut={onSignOut}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
