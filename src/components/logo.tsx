import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}
export function Logo({ width = 120, height = 100, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* <FileText className="h-6 w-6 text-primary" />
      <span className="text-xl font-semibold text-primary font-headline">
        Control de Folios
      </span> */}
      <Image
        src="/logo_uaa.png"
        alt="UAA"
        width={width /* 200 */}
        height={height /* 40 */}
        priority
        className="object-contain"
      />
    </div>
  );
}
