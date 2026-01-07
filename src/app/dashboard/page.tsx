"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { generateFolioContent } from "@/ai/flows/generate-folio-content-from-summary";
import { useToast } from "@/hooks/use-toast";
import type { Folio, FolioFormValues, Section } from "@/lib/definitions";
import { getFolios, getFolioSections } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { FolioForm } from "@/components/folio-form";
import { FolioTable } from "@/components/folio-table";
import { SectionsTable } from "@/components/sections-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, List, Library, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [folios, setFolios] = useState<Folio[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [serialNumbers, setSerialNumbers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [initialFolios, initialSections] = await Promise.all([
          getFolios(),
          getFolioSections(),
        ]);
        
        const initialSerials = initialFolios.reduce((acc: Record<string, number>, folio) => {
          const parts = folio.id.split('-');
          const sectionName = folio.section;
          const number = parseInt(parts[parts.length - 1], 10);
          if (!acc[sectionName] || number > acc[sectionName]) {
            acc[sectionName] = number;
          }
          return acc;
        }, {});
        
        setFolios(initialFolios);
        setSections(initialSections);
        setSerialNumbers(initialSerials);
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
      const aiContent = await generateFolioContent({ summary: data.summary });
      
      const sectionInfo = sections.find(s => s.name === data.section);
      if (!sectionInfo) {
        throw new Error("Sección no válida");
      }

      const currentSerial = serialNumbers[sectionInfo.name] || 0;
      const newSerial = currentSerial + 1;
      const newFolioId = `DGIP-DAP-${sectionInfo.code}-${String(
        newSerial
      ).padStart(4, "0")}`;

      const newFolio: Folio = {
        id: newFolioId,
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
      accessorKey: "id",
      header: "Folio",
    },
    {
      accessorKey: "section",
      header: "Sección",
      cell: ({ row }) => {
        const section = row.original.section;
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        if (section === 'Finanzas') variant = 'secondary';
        if (section === 'Tecnología') variant = 'default';

        return <Badge variant={variant} className="capitalize">{section}</Badge>;
      },
    },
    {
      accessorKey: "addressee",
      header: "Dirigido a",
    },
    {
      accessorKey: "subject",
      header: "Asunto",
    },
    {
      accessorKey: "responsible",
      header: "Responsable",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.responsibleAvatarUrl} alt={row.original.responsible} data-ai-hint="person portrait" />
            <AvatarFallback>{row.original.responsible.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{row.original.responsible}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Fecha de Creación",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  const sectionColumns: ColumnDef<Section>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Nombre de la Sección",
    },
    {
      accessorKey: "code",
      header: "Código de la Sección",
    },
  ];

  const sectionNames = sections.map(s => s.name) as [string, ...string[]];

  return (
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
          <FolioForm onSubmit={handleCreateFolio} sectionNames={sectionNames} />
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
  );
}
