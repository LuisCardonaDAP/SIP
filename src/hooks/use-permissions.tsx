"use client";
import { useEffect, useState } from "react";

export function usePermissions() {
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
  setMounted(true);
 }, []);
  // Obtenemos el usuario del localStorage
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;

  const hasRole = (roleName: string) => {
    return user?.roles?.some((role: any) => role.name === roleName);
  };
  const hasPermission = (permissionName: string) => {
   const isAdmin = user?.roles?.some((r: any) => r.name === 'admin');
   if (isAdmin) return true;

   return user?.permissions?.includes(permissionName);
  };

  return { user, hasRole, hasPermission, mounted };
}