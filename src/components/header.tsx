"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { SidebarTrigger } from "./ui/sidebar";

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // En una aplicación real, aquí también limpiarías el estado de autenticación.
    router.replace("/login");
  };

  return (
    <header className="border-b bg-card sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
           <SidebarTrigger className="md:hidden"/>
           <div className="md:hidden">
            <Logo />
           </div>
           <h1 className="text-lg font-semibold hidden md:block">Panel de Administración</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-primary hover:text-primary-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );