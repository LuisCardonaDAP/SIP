import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFriendlyDate(fechaRaw: string | Date | undefined){
  if (!fechaRaw) return "Sin fecha";

  // Si es un string tipo "2023-10-25", reemplazamos los guiones por diagonales
  // Esto hace que JS lo trate como fecha local y no UTC
  const fechaStr = typeof fechaRaw === 'string' ? fechaRaw.replace(/-/g, '\/') : fechaRaw;
  
  const d = new Date(fechaStr);
  if (isNaN(d.getTime())) return "Fecha inválida";

  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  });
}