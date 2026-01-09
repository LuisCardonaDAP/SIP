"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

interface Props {
 children: React.ReactNode;
}

export default function ProtectedRoute({children} : Props ) {
 const router = useRouter();

 useEffect(() => {
  if (!isAuthenticated()) {
   router.replace("/login");
  }
 }, [router]);

 return <>{children}</>
}