"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Lifecycle",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

const sectionData = {
  admin: {
    ...data,
    navMain: [
      { ...data.navMain[0], url: "/admin/dashboard" },
      { ...data.navMain[1], url: "/admin/applications" },
      { ...data.navMain[2], url: "/admin/contestants" },
      { ...data.navMain[3], url: "/admin/events" },
      { ...data.navMain[4], url: "/admin/settings" },
    ],
    documents: [
      { ...data.documents[0], url: "/admin/media" },
      { ...data.documents[1], url: "/admin/audit-logs" },
      { ...data.documents[2], url: "/admin/notifications" },
    ],
    navSecondary: [
      { ...data.navSecondary[0], url: "/admin/settings" },
      { ...data.navSecondary[1], url: "/admin/dashboard" },
      { ...data.navSecondary[2], url: "/admin/applications" },
    ],
  },
  portal: {
    ...data,
    navMain: [
      { ...data.navMain[0], url: "/portal" },
      { ...data.navMain[1], url: "/portal/application" },
      { ...data.navMain[2], url: "/portal/status" },
      { ...data.navMain[3], url: "/portal/events" },
      { ...data.navMain[4], url: "/portal/profile" },
    ],
    documents: [
      { ...data.documents[0], url: "/portal/media" },
      { ...data.documents[1], url: "/portal/notifications" },
      { ...data.documents[2], url: "/portal/application" },
    ],
    navSecondary: [
      { ...data.navSecondary[0], url: "/portal/profile" },
      { ...data.navSecondary[1], url: "/portal" },
      { ...data.navSecondary[2], url: "/portal/status" },
    ],
  },
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  section?: "admin" | "portal";
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut?: () => void;
};

export function AppSidebar({
  section = "admin",
  user,
  onSignOut,
  ...props
}: AppSidebarProps) {
  const sidebarData = sectionData[section];
  const sidebarUser = {
    ...sidebarData.user,
    ...user,
    avatar: user?.avatar || sidebarData.user.avatar,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Orcish Dashboard
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        <NavDocuments items={sidebarData.documents} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} onSignOut={onSignOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
