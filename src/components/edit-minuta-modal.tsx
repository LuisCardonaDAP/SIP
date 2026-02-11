import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "@/components/ui/input";
import { FileUp, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { getAcuerdosMinuta, updateEstadoAcuerdo, uploadMinutaFile } from "@/lib/data";
import { Acuerdo, Minuta } from "@/lib/definitions";
import { toast } from "sonner";
import { formatFriendlyDate } from "@/lib/utils";

interface EditMinutaModalProps {
 minuta: Minuta |null;
 isOpen: boolean;
 onClose: () => void;
 defaultTab: string;
}

export function EditMinutaModal({ minuta, isOpen, onClose, defaultTab}: EditMinutaModalProps) {

 const [acuerdos, setAcuerdos] = useState<Acuerdo[]>([]);
 const [isUploading, setIsUploading] = useState(false);

 useEffect(() => {
  if(isOpen && minuta) {
   fetchAcuerdos();
  }
 }, [isOpen, minuta]);

 const fetchAcuerdos = async () => {
  const token = localStorage.getItem('token');
    if(!token || !minuta) return;
    const data = await getAcuerdosMinuta(token, minuta.id);
    setAcuerdos(data)
    console.log(`:::::: Acuerdos de minuta ${minuta.folio}:`);
    console.log(data);
 }

 const handleAddAcuerdo = async () => {
  await fetchAcuerdos();
 }

 const handleUpdateEstado = async (acuerdoId: number, nuevoEstado: string) => {
  const token = localStorage.getItem('token');
    if(!token || !minuta) return;

   try {
     await updateEstadoAcuerdo(token, acuerdoId, nuevoEstado);
     fetchAcuerdos();
   } catch (error) {
    toast.error("Error al actualizar estado");
   }
 };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if(!file || !minuta) return
  const token = localStorage.getItem('token');
  setIsUploading(true);
  const formData = new FormData();
  formData.append('evidencia', file);
  await uploadMinutaFile(minuta.id, formData, token);
  setIsUploading(false);
  toast.success("Archivo subido correctamente");
 }

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-2xl overflow-y-auto max-h-[90hv]">
    <DialogHeader>
     <DialogTitle>Gestionar Minuta: {minuta?.folio}</DialogTitle>
    </DialogHeader>

    <Tabs key={defaultTab} defaultValue={defaultTab} className="w-full">
     <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="acuerdos">Acuerdos ({acuerdos.length})</TabsTrigger>
      <TabsTrigger value="pdf">Evidencia</TabsTrigger>
     </TabsList>

     <TabsContent value="acuerdos" className="space-y-6 pt-4">
      {/* Agrergar acuerdo */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
       <h4 className="text-sm font-bold mb-3">Agregar nuevo acuerdo</h4>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input placeholder="Descripción del acuerdo" className="md:col-span-2" />
        <Input placeholder="Responsable" />
        <Input type="date" title="Fecha Compromiso" />
       </div>
       <Button size="sm" className="mt-3" onClick={handleAddAcuerdo}>
        <Plus className="h-4 w-4 mr-2" /> Añadir acuerdo
       </Button>
      </div>
      {/* Lista de acuerdos */}
      <div className="grid gap-4">
       <div className="space-y-3">
        <h4 className="text-sm font-bold">Acuerdos registrados</h4>
        {acuerdos.map((acuerdo) => (
         
         <div key={acuerdo.id} className="flex items-start justify-between p-3 border rounded-md bg-white shadow-sm">
          <div className="space-y-1">
           <p className="text-sm font-media">{acuerdo.description}</p>
           <div className="flex gap-3 text-ts text-muted-foreground">
            <span>👤 {acuerdo.responsable}</span>
            <span>📅 {formatFriendlyDate(acuerdo.fecha_compromiso)}</span>
           </div>
          </div>
          <select
           className="text-xs border rounded p-1"
           defaultValue={acuerdo.estado}
           onChange={(e) => handleUpdateEstado(acuerdo.id, e.target.value)}
          >
           <option value="pendiente">Pendiente</option>
           <option value="en_proceso">En Proceso</option>
           <option value="cumplido">Cumplido</option>
           <option value="no_cumplido">No Cumplido</option>
          </select>
         </div>
        ))}
       </div>
      </div>
      <Button onClick={() => {}} className="w-full">Actualizar Acuerdos</Button>
     </TabsContent>
     <TabsContent value="pdf" className="space-y-4 pt-4">
      <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
       <FileUp className="mx-auto h-12 w-12 text-slate-400 mb-4" />
       <Label htmlFor="pdf-upload" className="cursor-pointer text-blue-600 hover:underline">
        {isUploading ? "Subiendo..." : "Subir archivo evidencia"}
       </Label>
       <Input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
       <p className="text-xs text-slate-500 mt-2 italic">Tamaño máximo 10MB.</p>
      </div>
      {minuta?.evidencia && (
       <div className="text-sm bg-green-50 p-2 rounded border border-green-100 flex justify-between items-center">
        <span className="text-green-700">Archivo cargado</span>
        <a href={minuta.evidencia} target="_blank" className="text-blue-600 underline text-xs">Ver evidencia</a>
       </div>
      )}
     </TabsContent>
    </Tabs>
   </DialogContent>
  </Dialog>
 ) 
}