"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Logo, LogoDash } from "./logo";
import { SidebarTrigger } from "./ui/sidebar";

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // En una aplicación real, aquí también limpiarías el estado de autenticación.
    router.replace("/login");
  };

  return (
    <header className="border-b bg-card sticky top-0 z-20 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 py-2">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 border-r pr-4">
            <LogoDash />
            <SidebarTrigger className="hover:bg-accent transition-colors" />
          </div>
            <nav className="hidden md:flex items-center gap-4">
              <h1 className="text-lg font-semibold hidden md:block">Panel de Administración</h1>
            </nav>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-primary hover:text-primary-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}