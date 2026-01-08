import type { Metadata } from "next";
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { FileText } from "lucide-react";
import { Header } from "@/components/header";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Dashboard - FolioFlow",
  description: "Panel de administración",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/dashboard" isActive={true} tooltip="Control de Folios">
                  <FileText />
                  Control de Folios
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="flex flex-col flex-1">
            <Header />
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
