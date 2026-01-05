'use server';

import type { Folio, Section } from './definitions';
import { PlaceHolderImages } from './placeholder-images';

// This is a placeholder for your database fetching logic.
// In a real application, you would connect to your database here.
const initialFolios: Folio[] = [
  {
    id: 'DGIP-DAP-TEC-0001',
    section: 'Tecnología',
    addressee: 'Departamento de Infraestructura',
    subject: 'Actualización de Servidores',
    responsible: 'Ana Pérez',
    responsibleAvatarUrl: PlaceHolderImages[0]?.imageUrl,
    createdAt: new Date('2023-10-26T10:00:00Z'),
    content: 'Por medio del presente, se solicita la actualización de los servidores del área de desarrollo.',
  },
  {
    id: 'DGIP-DAP-FIN-0001',
    section: 'Finanzas',
    addressee: 'Contraloría',
    subject: 'Reporte de Gastos Q3',
    responsible: 'Juan Rodríguez',
    responsibleAvatarUrl: 'https://picsum.photos/seed/2/40/40',
    createdAt: new Date('2023-10-25T15:30:00Z'),
    content: 'Se adjunta el reporte de gastos correspondiente al tercer trimestre del año en curso para su revisión.',
  },
];


const folioSections: Section[] = [
    { id: 1, name: "Finanzas", code: "FIN" },
    { id: 2, name: "Recursos Humanos", code: "RRHH" },
    { id: 3, name: "Tecnología", code: "TEC" },
    { id: 4, name: "Operaciones", code: "OPE" },
    { id: 5, name: "Legal", code: "LEG" },
  ];

/**
 * Fetches all folios from the data source.
 * @returns A promise that resolves to an array of Folio objects.
 */
export async function getFolios(): Promise<Folio[]> {
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real-world scenario, you would replace this with your database query.
  // For example:
  // const db = connectToYourDB();
  // const folios = await db.query('SELECT * FROM folios ORDER BY createdAt DESC');
  // return folios.rows;

  return initialFolios;
}

/**
 * Fetches all available sections.
 * @returns A promise that resolves to an array of Section objects.
 */
export async function getFolioSections(): Promise<Section[]> {
    // Simulate a network delay for fetching sections
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real-world scenario, you would replace this with your API call.
    // For example:
    // const response = await fetch('https://your-api.com/sections');
    // const sections = await response.json();
    // return sections;
  
    return folioSections;
}


/**
 * Calculates the initial serial numbers based on existing folios.
 * In a real-world scenario, you might get this from a separate sequence table in your DB.
 * @param folios The array of existing folios.
 * @returns A record of the highest serial number for each section.
 */
export async function getInitialSerialNumbers(folios: Folio[]): Promise<Record<string, number>> {
    const serials: Record<string, number> = {};
    for (const folio of folios) {
      const parts = folio.id.split('-');
      const sectionName = folio.section;
      const number = parseInt(parts[parts.length - 1], 10);
      if (!serials[sectionName] || number > serials[sectionName]) {
        serials[sectionName] = number;
      }
    }
    return serials;
}
