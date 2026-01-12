"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { generateFolioContent } from "@/ai/flows/generate-folio-content-from-summary";
import { useToast } from "@/hooks/use-toast";
import type { Folio, FolioFormValues, Section, Users } from "@/lib/definitions";
import { createFolio, getFolios, getFolioSections, getUsers, uploadFolioFile } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { FolioForm } from "@/components/folio-form";
import { FolioTable } from "@/components/folio-table";
import { SectionsTable } from "@/components/sections-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, List, Library, Loader2, FileText, ExternalLink, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [folios, setFolios] = useState<Folio[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [users, setUsers] = useState<Users[]>([]);
  const [serialNumbers, setSerialNumbers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const publicUrl = `http://localhost:8000/storage`; // para actualizar solo la fila cuando se sube un archivo y no toda la pagina 

  useEffect(() => {
    async function loadInitialData() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const [initialFolios, initialSections, initialUsers] = await Promise.all([
          getFolios(token),
          getFolioSections(),
          getUsers(token),
        ]);
        
        const initialSerials = initialFolios.reduce((acc: Record<string, number>, folio) => {
          const parts = folio.folio.split('-');
          const sectionName = folio.seccion;
          const number = parseInt(parts[parts.length - 1], 10);
          if (!acc[sectionName] || number > acc[sectionName]) {
            acc[sectionName] = number;
          }
          return acc;
        }, {});
        
        setFolios(initialFolios);
        setSections(initialSections);
        setSerialNumbers(initialSerials);
        setUsers(initialUsers);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos iniciales.",
        });
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [toast]);

  const handleCreateFolio = async (data: FolioFormValues) => {
    try {
      //const aiContent = await generateFolioContent({ summary: data.summary });
      
      /* const sectionInfo = sections.find(s => s.nombre === data.section);
      if (!sectionInfo) {
        throw new Error("Sección no válida");
      }

      const currentSerial = serialNumbers[sectionInfo.nombre] || 0;
      const newSerial = currentSerial + 1;
      const newFolioId = `DGIP-DAP-${sectionInfo.codigo}-${String(
        newSerial
      ).padStart(4, "0")}`;

      const newFolio: Folio = {
        id: 0,
        folio: newFolioId,
        section: data.section,
        addressee: data.addressee,
        subject: data.subject,
        responsible: data.responsible,
        responsibleAvatarUrl: PlaceHolderImages[0]?.imageUrl,
        createdAt: new Date(),
        content: aiContent.folioContent,
      };

      setFolios((prev) => [newFolio, ...prev]);
      setSerialNumbers((prev) => ({ ...prev, [data.section]: newSerial }));

      toast({
        title: "Folio Creado",
        description: `El folio ${newFolioId} ha sido creado exitosamente.`,
      });*/
      const token = localStorage.getItem('token');

      if (!token) {
        toast({
          variant: "destructive",
          title: "Sesión expirada",
          description: "Por favor, vuelve a iniciar sesión",
        });
        router.push('/login');
        return;
      }

      const sectionInfo = sections.find(s => s.nombre === data.section);
      if (!sectionInfo) throw new Error("Sección no válida");

      const nuevoFolio = {
          id_seccion: sectionInfo.id_seccion,
          asunto: data.subject,
          dirigido: data.addressee,
          responsable: Number(data.responsible),
          //contenido: (await generateFolioContent({ summary: data.summary})).folioContent,
      }

      const resultado = await createFolio(nuevoFolio, token);

      setFolios((prev) => [resultado.folio, ...prev]); // Modificar esto para que mueste todos los folios
      toast({
        title: "Folio creado",
        description: `El folio ha sido registrado exitosamente`,
      });
      
    } catch (error) {
      console.error("Error creating folio:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "No se pudo generar el contenido del folio. Por favor, intente de nuevo.",
      });
    }
  };

  const folioColumns: ColumnDef<Folio>[] = [
    {
      accessorKey: "folio",
      header: "Folio",
    },
    {
      accessorKey: "seccion",
      header: "Sección",
      cell: ({ row }) => {
        const section = row.original.seccion;
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        if (section === 'Finanzas') variant = 'secondary';
        if (section === 'Tecnología') variant = 'default';

        return <Badge variant={variant} className="capitalize">{section}</Badge>;
      },
    },
    {
      accessorKey: "dirigido",
      header: "Dirigido a",
    },
    {
      accessorKey: "asunto",
      header: "Asunto",
    },
    {
      accessorKey: "responsable",
      header: "Responsable",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.responsibleAvatarUrl} alt={row.original.responsable} data-ai-hint="person portrait" />
            <AvatarFallback>{row.original.responsable.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{row.original.responsable}</span>
        </div>
      ),
    },
    {
      accessorKey: "fecha",
      header: "Fecha de Creación",
      cell: ({ row }) => {
        const fecha = new Date(row.original.fecha);
        if(isNaN(fecha.getTime())) return "Fecha inválida";

        return fecha.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric', 
        });
      },
    },
    {
      accessorKey: "archivo",
      header: "Archivo",
      cell: ({ row }) => {
        const url = row.original.archivo;

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
        const [isUploading, setIsUploading] = useState(false);
        const folioId = row.original.id;

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if(!file) return;

          setIsUploading(true);
          const token = localStorage.getItem('token');

          const formData = new FormData();
          formData.append('archivo', file);

          try {
            const response = await uploadFolioFile(folioId, formData, token);

            toast({
              title: "Éxito",
              description: "Archivo subido correctamente"
            });

            //window.location.reload();
            const fullUrl = `${publicUrl}/${response.archivo}`
            setFolios((prev) =>
              prev.map((f) =>
              f.id === row.original.id ? { ...f, archivo: fullUrl} : f
              )
            );
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "No se pudo subir el archivo"
            });
          } finally {
            setIsUploading(false);
          }
        };

        return (
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                disabled={isUploading}
              />
              <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-colors ${isUploading ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
                {isUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ): (
                  <Upload className="h-3 w-3" />
                )}
                {isUploading ? "Subiendo..." : "Subir Archivo"}
              </div>
            </label>
          </div>
        );
      }
    },
  ];

  const sectionColumns: ColumnDef<Section>[] = [
    {
      accessorKey: "id_seccion",
      header: "ID",
    },
    {
      accessorKey: "nombre",
      header: "Nombre de la Sección",
    },
    {
      accessorKey: "codigo",
      header: "Código de la Sección",
    },
  ];

  const sectionNames = sections.map(s => s.nombre) as [string, ...string[]];

  return (
    <ProtectedRoute>
    <main className="flex-1 p-4 md:p-6">
      <div className="flex items-center mb-6">
          <h1 className="text-2xl font-semibold font-headline">Control de Folios</h1>
      </div>
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="h-auto justify-start flex-wrap">
          <TabsTrigger value="create">
            <PlusCircle className="mr-2"/>
            Crear Folio
          </TabsTrigger>
          <TabsTrigger value="records">
            <List className="mr-2"/>
            Registros
          </TabsTrigger>
          <TabsTrigger value="sections">
            <Library className="mr-2"/>
            Secciones
          </TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="pt-6">
          <FolioForm onSubmit={handleCreateFolio} sectionNames={sectionNames} users={users} />
        </TabsContent>
        <TabsContent value="records" className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              <span>Cargando registros...</span>
            </div>
          ) : (
            <FolioTable columns={folioColumns} data={folios} />
          )}
        </TabsContent>
        <TabsContent value="sections" className="pt-6">
          {loading ? (
             <div className="flex items-center justify-center p-8">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              <span>Cargando secciones...</span>
            </div>
          ) : (
            <SectionsTable columns={sectionColumns} data={sections} />
          )}
        </TabsContent>
      </Tabs>
    </main>
    </ProtectedRoute>
  );
}