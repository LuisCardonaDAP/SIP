"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/lib/definitions";
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
import { Logo } from "@/components/logo";
import { LogIn } from "lucide-react";
import api from "@/lib/axios"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: LoginFormValues) => {
    // TODO: Implement actual authentication logic here
    //console.log("Login data:", data);
    try {
      const response = await api.post("/login", {
        email: data.email,
        password: data.password
      });

      const {token, user, permissions} = response.data;
      const userConPermisos = {...user, permissions};

      //Guardar token y usuario
      localStorage.setItem("token", token);
      // localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(userConPermisos));

      //Redirección
      toast.success("Credenciales correctas.");
      router.replace("/dashboard")
    } catch (error: any) {
      
      let mensaje = "Error al intentar ingresar";
      if(error.response){
        mensaje = error.response?.data.message || "Correo o contraseña incorrectos.";
      } else if (error.request) {
        mensaje = "No hay conexión con el servidor."
      }
      toast.error(mensaje);
      console.error("login error:", error);
    }
    // For now, just simulate a successful login and redirect
    //await new Promise((resolve) => setTimeout(resolve, 1000));
    //router.replace("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('${process.env.NODE_ENV === 'production' ? '/sistema-control-dap' : ''}/background_HD.jpg')`,
        }}
      >
        {/* <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div> */}
      </div>
      <Card className="relative z-10 w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-md border-none">
        <CardHeader className="items-center text-center">
          <Logo width={400} height={200} className="mb-1" />
          <CardTitle className="font-headline text-2xl text-primary">
            Sistema de Información
          </CardTitle>
          <CardDescription>
            Iniciar Sesión
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@edu.uaa.mx"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col pb-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2" />
                    Ingresar
                  </>
                )}
              </Button>
              <div className="pt-2 flex justify-center border-t border-slate-100">
                <img src="/logo_footer.svg" alt="" className="h-10 w-auto opacity-70 hover:grayscale-0 transition-all" />
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

// Minimal loader for when the form is submitting
function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
