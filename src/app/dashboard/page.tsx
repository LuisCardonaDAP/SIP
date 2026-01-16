"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { generateFolioContent } from "@/ai/flows/generate-folio-content-from-summary";
import { useToast } from "@/hooks/use-toast";
import type { Folio, FolioFormValues, Section, Users } from "@/lib/definitions";
import { createFolio, getFolios, getFolioSections, getUsers, updatePassword, uploadFolioFile } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { FolioForm } from "@/components/folio-form";
import { FolioTable } from "@/components/folio-table";
import { SectionsTable } from "@/components/sections-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, List, Library, Loader2, FileText, ExternalLink, Upload, CheckCircle2, Copy, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function DashboardPage() {
  const [folios, setFolios] = useState<Folio[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [users, setUsers] = useState<Users[]>([]);
  const [serialNumbers, setSerialNumbers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const [isSuccessModalOpen, setIsSuccesModalOpen] = useState(false);
  const [lastCreatedFolio, setLastCreatedFolio] = useState<Folio | null>(null);
  const [filterSection, SetFilterSection] = useState<string>("all");
  const [filterResponsable, SetFilterResponsable] = useState<string>("all");
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.replace('api', 'storage') || `http://localhost:8000/storage`; // para actualizar solo la fila cuando se sube un archivo y no toda la pagina 

  useEffect(() => {
    async function loadInitialData() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        //Verificar que el usuario no tenga contraseña default
        const userData = localStorage.getItem('user');
        if(userData) {
          const user = JSON.parse(userData);
          if (user.password_default) {
            setShowPasswordChangeModal(true);
          }
        }

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
      setLastCreatedFolio(resultado.folio);
      setIsSuccesModalOpen(true);
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

  const handlePasswordChange = async () => {
    setIsUpdating(true);
    const token = localStorage.getItem('token');

    try {
      await updatePassword(currentPassword, newPassword, confirmPassword, token);
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.password_default = false;
        localStorage.setItem("user", JSON.stringify(user));
      }
      toast({
        title: '¡Éxito!',
        description: 'Contraseña actualizada correctamente.',
      });

      setShowPasswordChangeModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "La contraseña actual es incorrecta.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

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
      accessorKey: "nombre_responsable",
      header: "Responsable",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.responsibleAvatarUrl} alt={row.original.nombre_responsable} data-ai-hint="person portrait" />
            <AvatarFallback>{row.original.nombre_responsable.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{row.original.nombre_responsable}</span>
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
          timeZone: 'UTC'
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
  const filteredFolios = folios.filter((folio) => {
    const matchSection = filterSection === "all" || folio.seccion === filterSection;
    const matchResponsable = filterResponsable === "all" || folio.nombre_responsable === filterResponsable;
    return matchSection && matchResponsable;
  });

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
            <div className="space-y-4">

              <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-lg border">
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Filtrar por sección</label>
                  <select 
                    value={filterSection}
                    onChange={(e) => SetFilterSection(e.target.value)}
                    className="w-full p-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="all">Todas las secciones</option>
                    {sections.map(s => <option key={s.id_seccion} value={s.nombre}>{s.nombre}</option> )}
                  </select>
                </div>
  
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Filtrar por responsable</label>
                  <select 
                    value={filterResponsable}
                    onChange={(e) => SetFilterResponsable(e.target.value)}
                    className="w-full p-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="all">Todos los responsables</option>
                    {users.map(s => <option key={s.id_uaa} value={s.name}>{s.name}</option> )}
                  </select>
                </div>
  
                <Button
                  variant="outline"
                  className="self-end"
                  onClick={() => { SetFilterSection("all"); SetFilterResponsable("all");}}
                >
                  Limpiar Filtros
                </Button>
              </div>
              <FolioTable columns={folioColumns} data={filteredFolios} />
            </div>
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
            onClick={() => {
              navigator.clipboard.writeText(lastCreatedFolio?.folio || "");
              toast({ description: "Copiado al portapapeles"});
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
    <Dialog open={showPasswordChangeModal} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldAlert className="h-6 w-6 text-decoration" />
            Actualización de Seguridad
          </DialogTitle>
          <DialogDescription>
            Tienes una contraseña predeterminada. Por favor, crea una nueva contraseña. (Min. 8 caracteres)
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contraseña Actual (Temporal)</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Ingresa la contraseña actual"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nueva Contraseña</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmar Contraseña</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {newPassword !== confirmPassword && confirmPassword !== "" && (
            <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
          )}
        </div>

        <DialogFooter>
          <Button
          disabled={newPassword.length < 8 || newPassword !== confirmPassword || isUpdating}
          onClick={handlePasswordChange}
          >
            {isUpdating ? "Cambiando..." : "Guardar y Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </ProtectedRoute>
  );
}