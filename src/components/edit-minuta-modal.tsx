import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "@/components/ui/input";
import { FileUp, Plus, CheckCircle2, Clock, AlertCircle, Loader2, MessageSquareText, NotebookPen } from "lucide-react";
import { createAcuerdo, createAcuerdoExt, getAcuerdosMinuta, getAcuerdosMinutaExt, updateEstadoAcuerdo, updateEstadoAcuerdoExt, updateObservacionesAcuerdo, updateObservacionesAcuerdoExt, uploadMinutaFile, uploadMinutaFileExt } from "@/lib/data";
import { Acuerdo, Minuta } from "@/lib/definitions";
import { toast } from "sonner";
import { formatFriendlyDate } from "@/lib/utils";
import { Can } from "./auth/Can";
import api from "@/lib/axios";

type Minutacontext = "interna" | "externa";

interface EditMinutaModalProps {
 minuta: Minuta |null;
 tipo: Minutacontext;
 isOpen: boolean;
 onClose: () => void;
 defaultTab: string;
 onUpdate: () => void;
}

const apiMapper = {
  interna: {
    get: getAcuerdosMinuta,
    create: createAcuerdo,
    updateEstado: updateEstadoAcuerdo,
    updateObs: updateObservacionesAcuerdo,
    upload: uploadMinutaFile,
    permission: "editar minutas",
    acuerdoCreatePermission: "crear acuerdos",
    acuerdoPermission: "editar acuerdos"
  },
  externa: {
    get: getAcuerdosMinutaExt,
    create: createAcuerdoExt,
    updateEstado: updateEstadoAcuerdoExt,
    updateObs: updateObservacionesAcuerdoExt,
    upload: uploadMinutaFileExt,
    permission: "editar minutas externas",
    acuerdoCreatePermission: "crear acuerdos externos",
    acuerdoPermission: "editar acuerdos externos"
  }
}

export function EditMinutaModal({ minuta, tipo, isOpen, onClose, defaultTab, onUpdate}: EditMinutaModalProps) {

 const [acuerdos, setAcuerdos] = useState<Acuerdo[]>([]);
 const [isUploading, setIsUploading] = useState(false);
 const [nuevoAcuerdo, setNuevoAcuerdo] = useState({
  description: "",
  responsable: "",
  fecha_compromiso: ""
 });
 const [isSaving, setIsSaving] = useState(false);
 const [minutaActual, setMinutaActual] = useState(minuta);

 useEffect(() => {
  if(isOpen && minuta) {
   fetchAcuerdos();
   setMinutaActual(minuta);
  }
 }, [isOpen, minuta]);

 const fetchAcuerdos = async () => {
  const token = localStorage.getItem('token');
    if(!token || !minuta) return;
    const data = await apiMapper[tipo].get(token, minuta.id);
    setAcuerdos(data)
    console.log(`:::::: Acuerdos de minuta ${minuta.folio}:`);
    console.log(data);
 }

 const handleAddAcuerdo = async () => {
  if(!nuevoAcuerdo.description) {
    toast.error("La descripción del acuerdo es obligatoria");
    return;
  }

  const token = localStorage.getItem('token');
  if(!token || !minuta) return;

  setIsSaving(true);
  try {

    
    const response = await apiMapper[tipo].create(nuevoAcuerdo, minuta.id, token); 
    
    toast.success("Acuerdo agregado", { description : "El acuerdo ha sido asignado a la minuta correctamente"});

    setNuevoAcuerdo({
      description: "",
      responsable: "",
      fecha_compromiso: "",
    })
    onUpdate();
    fetchAcuerdos();

  } catch (error) {
    console.error(error);
    toast.error("No se pudo guardar el acuerdo");
  } finally {
    setIsSaving(false);
  }
 };

 const handleUpdateEstado = async (acuerdoId: number, nuevoEstado: string) => {
  const token = localStorage.getItem('token');
    if(!token || !minuta) return;

   try {
    console.log("::::Cambio de estado:", nuevoEstado);
    await apiMapper[tipo].updateEstado(token, acuerdoId, nuevoEstado);
    fetchAcuerdos();
    onUpdate();
    toast.success("Estado actualizado corectamente");
   } catch (error) {
    toast.error("Error al actualizar estado");
   }
 };

 const handleUpdateObservacionesAcuerdo = async (acuerdoId: number, observaciones: string) => {
  const acuerdoOriginal = acuerdos?.find(a => a.id === acuerdoId);
  if(acuerdoOriginal?.observaciones === observaciones) return

  try {
    const token = localStorage.getItem('token');
    await apiMapper[tipo].updateObs(token, acuerdoId, observaciones)
    setAcuerdos((prev) => 
      prev.map(a => a.id === acuerdoId ? {...a, observaciones: observaciones}: a)
    );
    toast.success("Nota agregada correctamente");
  } catch (error) {
    console.error(error);
    toast.error("No se pudo guardar la nota")
  }
 };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if(!file || !minuta) return
  const token = localStorage.getItem('token');
  setIsUploading(true);
  try {

    const formData = new FormData();
    formData.append('evidencia', file);
    await apiMapper[tipo].upload(minuta.id, formData, token);
    toast.success("Archivo subido correctamente");
    onUpdate();
    setMinutaActual(minuta);

  } catch (error) {
    console.error(error);
    toast.error("Error al subir archivo")
  } finally {
    setIsUploading(false);
  }
 }

 function AcuerdoItem({ acuerdo, onUpdateEstado, onUpdateObservaciones }: {
  acuerdo: Acuerdo,
  onUpdateEstado: (id: number, estado: string) => void,
  onUpdateObservaciones: (id: number, obs: string) => void
 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localObs, setLocalObs] = useState(acuerdo.observaciones || "");

  const handleToggle = () => {
    if(isEditing) {
      onUpdateObservaciones(acuerdo.id, localObs);
    }
    setIsEditing(!isEditing);
  }

  return (
    <div className="border rounded-md bg-white shadow-sm overflow-hidden">
      <div className="flex items-start justify-between p-3">
          <div className="space-y-1">
           <p className="text-base font-media text-slate-9000 leading-tight">{acuerdo.description}</p>
           {/* <div className="flex gap-3 text-ts text-muted-foreground"> */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-[12px] text-muted-foreground tracking-wider">
            <span>👤 {acuerdo.responsable}</span>
            <span>📅 Compromiso: {formatFriendlyDate(acuerdo.fecha_compromiso)}</span>
            {acuerdo.fecha_cumplimiento && acuerdo.estado === "cumplido" && (
              <span className="flex items-center text-green-600 sm:col-span-2">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Cumplido el: {formatFriendlyDate(acuerdo.fecha_cumplimiento)}
              </span>
            )}
            {acuerdo.fecha_cumplimiento && acuerdo.estado === "no_cumplido" && (
              <span className="flex items-center text-red-600 sm:col-span-2 mt-1 font-bold">
                <AlertCircle className="h-3 w-3 mr-1" />
                No se cumplió acuerdo: {formatFriendlyDate(acuerdo.fecha_cumplimiento)}
              </span>
            )}
           </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Can
              permission={apiMapper[tipo].acuerdoPermission}
              fallback={
                <span className="px-2 py-1 rounded-full text-[10px] bg-slate-100 text-slate-600 border uppercase font-bold">
                  {acuerdo.estado?.replace('_', ' ')}
                </span>
              }
            >
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
            </Can>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className={`h-7 text-[11px] ${acuerdo.observaciones ? 'border-blue-200 bg-blue-50 text-blue-700' : 'text-slate-500'} hover:bg-primary`}
            >
              {acuerdo.observaciones ? "Ver notas" : "Añadir nota"}
            </Button>

          </div>
         </div>

         {isEditing && (
          <div className="px-3 pb-3 bg-slate-50 border-t pt-2">
            <Can
              permission={apiMapper[tipo].acuerdoPermission}//"editar acuerdos externos"
              fallback={
                <div className="p-2 bg-white border rounded text-xs text-slate-400 italic">
                  {acuerdo.observaciones || "Sin observaciones registradas."}
                </div>
              }
            >
              <Textarea 
                placeholder="Escribe observaciones sobre el acuerdo..."
                value={localObs}
                className="min-h-[80px] text-xs bg-white resize-none focus-visible:ring-blue-400"
                onChange={(e) => setLocalObs(e.target.value)}
              />
              <p className="text-[10px] text-slate-400 mt-1 italic text-right">
                Se guardará al cerrar o salir del campo.
              </p>
            </Can>
          </div>
         )}
    </div>
  );
 }

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="sm:max-w-[800px] overflow-y-auto max-h-[90vh]">
    <DialogHeader>
     <DialogTitle>Gestionar Minuta: {minuta?.folio}</DialogTitle>
    </DialogHeader>

    <div className="grid w-full grid-cols-2">
      <div>
        <h5 className="text-base font-semibold">Motivo:</h5>
        <p className="text-ts text-muted-foreground">{minuta?.motivo}</p>
      </div>
      <div>
        <h5 className="text-base font-semibold">Convoca:</h5>
        <p className="text-ts text-muted-foreground">{minuta?.convoca}</p>
      </div>
    </div>

    <Tabs key={defaultTab} defaultValue={defaultTab} className="w-full">
     <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="acuerdos">Acuerdos ({acuerdos.length})</TabsTrigger>
      <TabsTrigger value="pdf">Evidencia</TabsTrigger>
     </TabsList>

     <TabsContent value="acuerdos" className="space-y-6 pt-4">
      {/* Agrergar acuerdo */}
      <Can permission={apiMapper[tipo].acuerdoCreatePermission}>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="text-sm font-bold mb-3">Agregar nuevo acuerdo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Descripción del acuerdo" className="md:col-span-2" value={nuevoAcuerdo.description} onChange={(e) => setNuevoAcuerdo({...nuevoAcuerdo, description: e.target.value})}/>
          <Input 
            placeholder="Responsable"
            value={nuevoAcuerdo.responsable}
            onChange={(e) => setNuevoAcuerdo({...nuevoAcuerdo, responsable: e.target.value})}
          />
          <Input 
            type="date" 
            title="Fecha Compromiso"
            value={nuevoAcuerdo.fecha_compromiso}
            onChange={(e) => setNuevoAcuerdo({...nuevoAcuerdo, fecha_compromiso: e.target.value})}
            />
        </div>
        <Button size="sm" className="mt-3" onClick={handleAddAcuerdo} disabled={isSaving}>
          {isSaving ? (
            <span className="flex items-center"><Loader2 className="animate-spin mr-2 h-4 w-4" /> Guardando...</span>
          ) : (
            <span className="flex items-center"><Plus className="h-4 w-4 mr-2" /> Añadir acuerdo</span>
          )}
        </Button>
        </div>
      </Can>
      {/* Lista de acuerdos */}
      <div className="grid gap-4">
       <div className="space-y-3">
        <h4 className="text-sm font-bold">Acuerdos registrados</h4>
        {acuerdos.map((acuerdo) => (

          <AcuerdoItem 
            key={acuerdo.id}
            acuerdo={acuerdo}
            onUpdateEstado={handleUpdateEstado}
            onUpdateObservaciones={handleUpdateObservacionesAcuerdo}
          />
         
        //  <div key={acuerdo.id} className="flex items-start justify-between p-3 border rounded-md bg-white shadow-sm">
        //   <div className="space-y-1">
        //    <p className="text-base font-media text-slate-9000 leading-tight">{acuerdo.description}</p>
        //    {/* <div className="flex gap-3 text-ts text-muted-foreground"> */}
        //    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-[12px] text-muted-foreground tracking-wider">
        //     <span>👤 {acuerdo.responsable}</span>
        //     <span>📅 Compromiso: {formatFriendlyDate(acuerdo.fecha_compromiso)}</span>
        //     {acuerdo.fecha_cumplimiento && acuerdo.estado === "cumplido" && (
        //       <span className="flex items-center text-green-600 sm:col-span-2">
        //         <CheckCircle2 className="h-3 w-3 mr-1" />
        //         Cumplido el: {formatFriendlyDate(acuerdo.fecha_cumplimiento)}
        //       </span>
        //     )}
        //     {acuerdo.fecha_cumplimiento && acuerdo.estado === "no_cumplido" && (
        //       <span className="flex items-center text-red-600 sm:col-span-2 mt-1 font-bold">
        //         <AlertCircle className="h-3 w-3 mr-1" />
        //         No se cumplió acuerdo: {formatFriendlyDate(acuerdo.fecha_cumplimiento)}
        //       </span>
        //     )}
        //    </div>
        //   </div>
        //   <div className="flex flex-col items-end gap-3">
        //     <select
        //     className="text-xs border rounded p-1"
        //     defaultValue={acuerdo.estado}
        //     onChange={(e) => handleUpdateEstado(acuerdo.id, e.target.value)}
        //     >
        //     <option value="pendiente">Pendiente</option>
        //     <option value="en_proceso">En Proceso</option>
        //     <option value="cumplido">Cumplido</option>
        //     <option value="no_cumplido">No Cumplido</option>
        //     </select>

        //     <Popover>
        //       <PopoverTrigger asChild>
        //         <Button
        //           variant="outline"
        //           size="sm"
        //           className={`h-8 text-[11px] flex gap-2 ${acuerdo.observaciones ? 'border-blue-200 bg-blue-50 text-blue-700' : 'text-slate-500'}`}
        //         >
        //           <MessageSquareText className="h-3.5 w-3.5" />
        //           {acuerdo.observaciones ? "Ver notas" : 'Agregar nota'}
        //         </Button>
        //       </PopoverTrigger>
        //       <PopoverContent className="w-80 shadow-2xl border-slate-200 z-[110]" 
        //         align="end" 
        //         onOpenAutoFocus={(e) => {
        //           const textarea = document.getElementById(`tarea-${acuerdo.id}`);
        //           textarea?.focus(); 
        //         }} 
        //         onPointerDownOutside={(e) => e.preventDefault()}
        //         onFocusOutside={(e) => e.preventDefault()}
        //         onInteractOutside={(e) => e.preventDefault()}
        //       >
        //         <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
        //           <div className="flex items-center gap-2">
        //             <div className="bg-blue-100 p-1.5 rounded-full">
        //               <NotebookPen className="h-4 w-4 text-blue-600" />
        //             </div>
        //             <h4 className="font-bold text-sm text-slate-800">Notas del acuerdo</h4>
        //           </div>
        //           <Textarea
        //             id={`tarea-${acuerdo.id}`}
        //             placeholder="Escribe observaciones sobre este acuerdo..."
        //             value={acuerdo.observaciones || ""}
        //             className="min-h-[100px] text-xs resize-none focus-visible:ring-blue-500 bg-white"
        //             onChange={(e) => {
        //               e.stopPropagation();
        //               const nuevoValor = e.target.value;
        //               setAcuerdos(prev => 
        //                 prev.map(a => a.id === acuerdo.id ? {...a, observaciones: nuevoValor} : a)
        //               );
        //             }}
        //             onKeyDown={(e) => {
        //               e.stopPropagation()
        //               if(e.key === 'Escape') {
                        
        //               }
        //             }}
        //             onBlur={(e) => handleUpdateObservacionesAcuerdo(acuerdo.id, e.target.value)}
        //           />
        //           <p className="text-[10px] text-slate-400 italic text-right">
        //             Se guarda automáticamente al salir del campo.
        //           </p>
        //         </div>
        //       </PopoverContent>
        //     </Popover>
        //   </div>
        //  </div>
        ))}
       </div>
      </div>
      {/* <Button onClick={() => {}} className="w-full">Actualizar Acuerdos</Button> */}
     </TabsContent>
     <TabsContent value="pdf" className="space-y-4 pt-4">
      <Can permission={apiMapper[tipo].permission} fallback={<p className="text-sm italic text-center text-ts text-muted-foreground">No tienes permisos para subir archivos</p>}>
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
      </Can>
     </TabsContent>
    </Tabs>
   </DialogContent>
  </Dialog>
 ) 
}