"use client";

import React from "react";
import { usePermissions } from "@/hooks/use-permissions";

interface CanProps {
 permission: string;
 role?: string;
 children: React.ReactNode;
 fallback?: React.ReactNode;
}

export function Can({ permission, role, children, fallback = null}: CanProps) {
 const { hasPermission, hasRole, mounted } = usePermissions();

 if(!mounted) return null;

 let allowed = false;

 if(permission) {
  allowed = hasPermission(permission);
 } else if (role){
  allowed = hasRole(role);
 }

 if(!allowed) {
  return <>{fallback}</>
 }

 return <>{children}</>
}