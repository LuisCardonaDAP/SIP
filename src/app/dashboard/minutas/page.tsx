"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Minuta } from "@/lib/definitions";
import type { MinutaFormValues } from "@/lib/definitions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, PlusCircle, Loader2, CheckCircle2, Copy, Pencil, FileUp, FileText, ExternalLink } from "lucide-react";
import { FolioForm } from "@/components/folio-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MinutaForm } from "@/components/minuta-form";
import { createMinuta, getMinutas } from "@/lib/data";
import { MinutaTable } from "@/components/minuta-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { EditMinutaModal } from "@/components/edit-minuta-modal";

export default function MinutasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSuccessModalOpen, setIsSuccesModalOpen] = useState(false);
  const [lastCreatedFolio, setLastCreatedFolio] = useState<Minuta | null>(null);
  const [minutas, setMinutas] = useState<Minuta[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMinuta, setSelectedMinuta] = useState<Minuta | null>(null);
  const [activeTab, setActiveTab] = useState("acuerdos");

  const fetchMinutas = async () => {
    const token = localStorage.getItem('token');
    if(!token) return;

    setLoading(true);
    try {
      const data = await getMinutas(token);
      setMinutas(data);
      console.log("MINUTAS:::::::", data);
    } catch (error) {
      toast.error("Error al cargar registros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMinutas();
  }, []);

  const handleCreateFolio = async (data: MinutaFormValues, reset: () => void ) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast("Sesión expirada",{
          description: "Por favor, vuelve a iniciar sesión",
        });
        router.push('/login');
        return;
      }

      const nuevaMinuta = {
        motivo: data.motivo,
        convoca: data.convoca,
        fecha_reunion: data.fecha_reunion
      }

      const resultado = await createMinuta(nuevaMinuta, token);
      reset();
      setLastCreatedFolio(resultado.folio);
      setIsSuccesModalOpen(true);

      fetchMinutas();

      toast.success("Folio creado",{
        description: `El folio de minuta ha sido registrado exitosamente`,
      });
    } catch (error) {
      console.error("Error creating folio minuta:", error);
      toast.error("Error",{
        description:
          "No se pudo generar el folio de la minuta. Por favor, intente de nuevo.",
      });
    }
    
  }

  function handleOpenEditModal(minuta: Minuta, type: string) {
    // console.log("Seleccionado edición de minuta para:", minuta, type);
    setSelectedMinuta(minuta);
    setActiveTab(type);
    setIsEditModalOpen(true);

  }

  const minutaColums: ColumnDef<Minuta>[] = [
    {
      accessorKey: "folio",
      header: "Folio",
    },
    {
      accessorKey: "motivo",
      header: "Motivo",
    },
    {
      accessorKey: "convoca",
      header: "Convoca",
    },
    {
      accessorKey: "fecha_reunion",
      header: "Fecha de Reunión",
      cell: ({ row }) => {
        const fechaRaw = row.original.fecha_reunion;
        if(!fechaRaw) return "Sin fecha";
        const fecha = new Date(fechaRaw);
        return fecha.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric', 
          timeZone: 'UTC'
        });
      },
    },
    {
      accessorKey: "acuerdos",
      header: "Acuerdos",
    },
    {
      accessorKey: "responsable_acuerdo",
      header: "Responsable",
    },
    {
      accessorKey: "cumplimiento",
      header: "Cumplimiento",
      cell: ({ row }) => {
        const valor = row.original.cumplimiento;
        return (
          <span className={valor ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
            {valor ? "Cumplido" : "Pendiente"}
          </span>
        );
      }
    },
    {
      accessorKey: "observaciones",
      header: "Observaciones",
    },
    {
      accessorKey: "evidencia",
      header: "Archivo",
      cell: ({ row }) => {
        const url = row.original.evidencia;

        if(!url || url=="") {
          return <span className="text-muted-foreground text-xs italic">Sin archivos</span>;
        }

        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 flex items-center gap-2 text-primary hover:text-primary-foreground hover:bg-primary"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            >
              <FileText className="h-4 w-4" />
              Ver Documento
              <ExternalLink className="h-3 w-3 opacity-50" />
            </Button>
        )

      }
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const minuta = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEditModal(minuta, 'acuerdos')}
              title="Gestionar Acuerdos"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => handleOpenEditModal(minuta, 'pdf')}
              title="Subir Evidencia"
            >
              <FileUp className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    },
  ];
  return (
    <ProtectedRoute>
      <main className="flex-1">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-semibold font-headline">Control de Minutas</h1>
        </div>
        <Tabs defaultValue="create" className="w-full">
          <TabsList>
            <TabsTrigger value="create">
              <PlusCircle className="mr-2"/>
              Crear Folio Minuta
            </TabsTrigger>
            <TabsTrigger value="records">
              <List className="mr-2" />
              Registros
            </TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="pt-6">
            <MinutaForm onSubmit={handleCreateFolio} />
          </TabsContent>
          <TabsContent value="records" className="pt-6">
            { loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <span>Cargando registros...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* <div className="bg-white p-8 rounded-lg border border-dashed border-slate-300 text-center text-muted-foreground">
                  <p>Próximamente: Tabla de minutas de reuniones.</p>
                </div> */}
                <MinutaTable columns={minutaColums} data={minutas}/>
              </div>
            )}
            
          </TabsContent>
        </Tabs>
        {/* <div className="bg-white p-8 rounded-lg border border-dashed border-slate-300 text-center text-muted-foreground">
          <p>Próximamente: Módulo de gestión y redacción de minutas de reuniones.</p>
        </div> */}
        <EditMinutaModal 
          minuta={selectedMinuta}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          defaultTab={activeTab}
        />
      </main>
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccesModalOpen}>
            <DialogContent className="sm:max-w-md text-center">
              <DialogHeader>
                <div className="mx-auto my-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <DialogTitle className="text-2xl text-center">¡Folio Generado!</DialogTitle>
                <DialogDescription className="text-center">
                  Este es el número de folio que te corresponde. Puedes volver a consultarlo en la tabla de folios.
                </DialogDescription>
              </DialogHeader>
      
              <div className="bg-slate-50 p-6 rounded-lg border-2 border-dashed border-slate-200 my-4">
                <span className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">Número de Folio</span>
                <div className="text-4xl font-bold text-primary mt-1">
                  {lastCreatedFolio?.folio}
                </div>
              </div>
      
              <DialogFooter className="sm:justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      if(lastCreatedFolio?.folio){
                        await navigator.clipboard.writeText(lastCreatedFolio?.folio);
                        toast.success("¡Copiado!" ,{ 
                          description: "Folio copiado al portapapeles",
                        });
                      }
                    } catch (err) {
                      toast.error("No se pudo copiar el folio.");
                      console.error("Error al copiar:", err);
                    }
                    
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar Folio
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsSuccesModalOpen(false)}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
    </ProtectedRoute>
  );
}