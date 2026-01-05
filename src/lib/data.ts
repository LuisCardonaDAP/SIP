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
