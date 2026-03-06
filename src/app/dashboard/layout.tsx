"use client";

import type { Metadata } from "next";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { FileText, ClipboardList, Calendar } from "lucide-react";
import { Header } from "@/components/header";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Can } from "@/components/auth/Can";

// export const metadata: Metadata = {
//   title: "Dashboard - Control Folios DAP",
//   description: "Panel de administración",
// };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  return (
    
    <SidebarProvider className="flex-1 min-h-0"
      style={{ 
        "--sidebar-width": "12.5rem", 
        "--sidebar-width-mobile": "12rem",
        "--sidebar-width-icon": "2.2rem",
      } as React.CSSProperties}
    >
        <div className="flex flex-col h-screen w-screen overflow-hidden">
          <div className="flex-none h-16  border-b bg-background z-50">
            <Header /> 
          </div>
      <div className="flex h-full w-full">
          <Sidebar
            collapsible="icon"
            className="h-full  border-r"
            >
            <SidebarContent>
              <SidebarMenu className="mt-16">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/calendario"} tooltip="Calendario de Actividades">
                  <Link href="/dashboard/calendario">
                    <Calendar  />
                    <span>Calendario de Actividades</span> 
                  </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Control de Folios">
                  <Link href="/dashboard">
                    <FileText  />
                    <span>Control de Oficios</span> 
                  </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <Can permission="crear minuta">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/minutas"} tooltip="Control de Minutas">
                    <Link href="/dashboard/minutas">
                      <ClipboardList />
                      <span>Control de Minutas</span> 
                    </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Can>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="flex flex-col flex-1 min-w-0 bg-slate-50/50 overflow-hidden">
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </SidebarInset>
      </div>
      </div>
    </SidebarProvider>
  );
}
