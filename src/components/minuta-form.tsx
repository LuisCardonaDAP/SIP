"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader2 } from "lucide-react";
import { MinutaFormValues } from "@/lib/definitions";

export function MinutaForm({ onSubmit }: { onSubmit: (data: MinutaFormValues, reset: () => void) => void }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<MinutaFormValues>();

  const internalSubmit = (data: MinutaFormValues) => {
    onSubmit(data, reset);
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Motivo de la reunión</label>
          <Input {...register("motivo", { required: true })} placeholder="Ej. Seguimiento de proyectos" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha de la reunión</label>
          <Input type="date" {...register("fecha_reunion", { required: true })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">¿Quién convoca?</label>
          <Input {...register("convoca", { required: true })} placeholder="Persona o Departamento" />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Generar Folio de Minuta
      </Button>
    </form>
  );
}