"use client";

import React, { useState } from "react";
import {
 format,
 addMonths,
 subMonths,
 startOfMonth,
 endOfMonth,
 startOfWeek,
 endOfWeek,
 isSameMonth,
 isSameDay,
 addDays,
 eachDayOfInterval
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CalendarioPage() {
 const [currentMonth, setCurrentMonth] = useState(new Date());
 const [selectedDate, setSelectedDate] = useState(new Date());

 const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
 const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

 const monthStart = startOfMonth(currentMonth);
 const monthEnd = endOfMonth(monthStart);
 const startDate = startOfWeek(monthStart);
 const endDate = endOfWeek(monthEnd);
 const days = eachDayOfInterval({start: startDate, end: endDate});

 return (
  <div className="space-y-6">
   <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
     <h1 className="text-2xl font-bold tracking-tight">Calendario de Actividades</h1>
     <p className="text-muted-foreground">Actividades programadas</p>
    </div>
    <Button className="w-fit">
     <Plus className="mr-2 h-4 w-4" /> Nueva Actividad
    </Button>
   </div>

   <Card className="shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
     <CardTitle className="text-xl capitalize">
      {format(currentMonth, "MMMM yyyy", {locale: es})}
     </CardTitle>
     <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={prevMonth}>
       <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={nextMonth}>
       <ChevronRight className="h-4 w-4" />
      </Button>
     </div>
    </CardHeader>
    <CardContent className="p-0">
     <div className="grid border-b bg-muted/50 text-center text-sm font-medium py-2" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
      {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
       <div key={day}>{day}</div>
      ))}
     </div>

     <div className="grid mt-2 text-sm" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
      {days.map((day, idx) => (
       <div key={day.toString()}
        onClick={() => setSelectedDate(day)}
        className={cn(
         "min-h-[120px] border-b border-r p-2 transition-colors hover:bg-muted/50 cursor-pointer flex flex-col",
         !isSameMonth(day, monthStart) && "bg-muted/20 text-muted-foreground",
         isSameDay(day, new Date()) && "bg-blue-50/50",
         idx % 7 === 6 && "border-r-0"
        )}
       >
        <span className={cn(
         "inline-flex h-7 w-7 items-center justify-center rounded-full font-semibold",
         isSameDay(day, new Date()) && "bg-primary text-primary-foreground"
        )}>
         {format(day, "d")}
        </span>
        <div className="flex-1 mt-2 space-y-1">
         {isSameDay(day, new Date()) && (
          <div className="truncate rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
           Reunión DAP
          </div>
         )}
        </div>
       </div>
      ))}
     </div>
    </CardContent>
   </Card>
  </div>
 );
}