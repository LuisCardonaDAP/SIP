"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { generateFolioContent } from "@/ai/flows/generate-folio-content-from-summary";
import { useToast } from "@/hooks/use-toast";
import type { Folio, FolioFormValues } from "@/lib/definitions";
import { getFolios, getInitialSerialNumbers } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { FolioForm } from "@/components/folio-form";
import { FolioTable } from "@/components/folio-table";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, List, Loader2 } from "lucide-react";

export default function Home() {
  const [folios, setFolios] = useState<Folio[]>([]);
  const [serialNumbers, setSerialNumbers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadInitialData() {
      try {
        const initialFolios = await getFolios();
        const initialSerials = await getInitialSerialNumbers(initialFolios);
        setFolios(initialFolios);
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

      const currentSerial = serialNumbers[data.section] || 0;
      const newSerial = currentSerial + 1;
      const newFolioId = `DGIP-DAP-${data.section}-${String(
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

  const columns: ColumnDef<Folio>[] = [
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="create">
              <PlusCircle className="mr-2"/>
              Crear Folio
            </TabsTrigger>
            <TabsTrigger value="records">
              <List className="mr-2"/>
              Registros
            </TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="pt-6">
            <FolioForm onSubmit={handleCreateFolio} />
          </TabsContent>
          <TabsContent value="records" className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <span>Cargando registros...</span>
              </div>
            ) : (
              <FolioTable columns={columns} data={folios} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
