"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Loader2 } from "lucide-react";

interface Props {
 children: React.ReactNode;
 permission?: string;
}

export default function ProtectedRoute({children, permission} : Props ) {
 const router = useRouter();
 const { hasPermission } = usePermissions();
 const [isChecking, setIsChecking] = useState(true);

 useEffect(() => {
  const checkAccess = () => {
   if (!isAuthenticated()) {
    router.replace("/login");
    return
   }
   if (permission && !hasPermission(permission)) {
    router.replace("/dashboard");
    return
   }
   setIsChecking(false);
  };

  checkAccess();
 }, [router, permission, hasPermission]);

 if (isChecking) {
  return (
   <div className="h-screen w-full flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
   </div>
  );
 }

 return <>{children}</>
}