"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { generateFolioContent } from "@/ai/flows/generate-folio-content-from-summary";
import { useToast } from "@/hooks/use-toast";
import type { Folio, FolioFormValues } from "@/lib/definitions";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { FolioForm } from "@/components/folio-form";
import { FolioTable } from "@/components/folio-table";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, List } from "lucide-react";

const initialFolios: Folio[] = [
  {
    id: "DGIP-DAP-Tecnología-0001",
    section: "Tecnología",
    addressee: "Departamento de Infraestructura",
    subject: "Actualización de Servidores",
    responsible: "Ana Pérez",
    responsibleAvatarUrl: PlaceHolderImages[0]?.imageUrl,
    createdAt: new Date("2023-10-26T10:00:00Z"),
    content: "Por medio del presente, se solicita la actualización de los servidores del área de desarrollo.",
  },
  {
    id: "DGIP-DAP-Finanzas-0001",
    section: "Finanzas",
    addressee: "Contraloría",
    subject: "Reporte de Gastos Q3",
    responsible: "Juan Rodríguez",
    responsibleAvatarUrl: "https://picsum.photos/seed/2/40/40",
    createdAt: new Date("2023-10-25T15:30:00Z"),
    content: "Se adjunta el reporte de gastos correspondiente al tercer trimestre del año en curso para su revisión.",
  },
];

export default function Home() {
  const [folios, setFolios] = useState<Folio[]>(initialFolios);
  const [serialNumbers, setSerialNumbers] = useState<Record<string, number>>({
    Tecnología: 1,
    Finanzas: 1,
  });
  const { toast } = useToast();

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
            <FolioTable columns={columns} data={folios} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
