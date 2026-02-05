"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFolioFormSchema } from "@/lib/definitions";
import type { FolioFormValues } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, PlusCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FolioFormProps {
  onSubmit: (data: FolioFormValues) => Promise<void>;
  sectionNames: any[];
  users: any[];
}

export function FolioForm({ onSubmit, sectionNames = [], users = [] }: FolioFormProps) {
  const form = useForm<FolioFormValues>({
    resolver: zodResolver(createFolioFormSchema(sectionNames)),
    defaultValues: {
      section: "",
      addressee: "",
      subjectType: "Solicitar",
      subject: "",
      responsible: "",
      summary: "",
    },
  });

  const { isSubmitting } = form.formState;

  const handleFormSubmit = async (data: FolioFormValues) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <PlusCircle className="text-primary"/>
          Crear Nuevo Folio
          </CardTitle>
        <CardDescription>
          Complete el formulario para generar un nuevo folio.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sección</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""} disabled={sectionNames.length === 0}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una sección" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sectionNames.map((section) => (
                          <SelectItem key={section} value={section}>
                            {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona Responsable</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un responsable" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id_uaa} value={user.id_uaa.toString()}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="addressee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirigido a</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Departamento de Finanzas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjectType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Asunto</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-6"
                    >
                      <FormItem className="flex item-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Solicitar" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Solicitar
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Informar" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Informar
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asunto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Solicitud de presupuesto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/*<FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resumen para IA</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Proporcione un resumen breve para que la IA genere el contenido del folio."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />*/}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto ml-auto"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Crear y Generar Folio
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
