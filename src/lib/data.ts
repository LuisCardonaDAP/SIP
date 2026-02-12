'use server';

import type { Folio, Minuta, Section, Acuerdo } from './definitions';
import { PlaceHolderImages } from './placeholder-images';

const publicUrl = process.env.NEXT_PUBLIC_API_URL?.replace('api', 'storage') || `http://localhost:8000/storage`;
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Fetches all folios from the data source.
 * @returns A promise that resolves to an array of Folio objects.
 */
export async function getFolios(token: string ): Promise<Folio[]> {
  try {
    const response = await fetch(`${baseUrl}/obtenerfolios`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if(!response.ok) {
      throw new Error('Error al obtener folios');
    }

    const data = await response.json();

    return data.map((item: any) => ({
      ...item,
      fecha: new Date(item.fecha),
      archivo: item.archivo 
        ? `${publicUrl}/${item.archivo}`
        : "",
    }));
  } catch (error) {
    console.error("Fetch error:", error);
    return[];
  }

}
export async function getMinutas(token: string ): Promise<Minuta[]> {
  try {
    const response = await fetch(`${baseUrl}/obtenerminutas`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if(!response.ok) {
      throw new Error('Error al obtener minutas');
    }

    const data = await response.json();

    return data.data.map((item: any) => ({ //Por el momento se trae de data.data ya que así lo manda el back, quiza esto cambie al traer todos los datos junto con los acuerdos
      ...item,
      fecha: new Date(item.fecha_reunion),
      evidencia: item.evidencia 
        ? `${publicUrl}/${item.evidencia}`
        : "",
    }));
  } catch (error) {
    console.error("Fetch error:", error);
    return[];
  }

}

export async function getAcuerdosMinuta(token: string, minuta_id: number): Promise<Acuerdo[]> {
  try {
    const response = await fetch(`${baseUrl}/minutas/${minuta_id}/acuerdos`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if(!response.ok) {
      throw new Error('Error al obtener acuerdos');
    }

    const data = await response.json();

    return data.acuerdos.map((item: any) => ({
      ...item,
      fecha_compromiso: new Date (item.fecha_compromiso),
      fecha_cumplimiento: new Date (item.fecha_cumplimiento),
    }));
  } catch (error) {
    console.error("Fetch error:", error);
    return[];
  }
}


/**
 * Fetches all available sections from an API.
 * @returns A promise that resolves to an array of Section objects.
 */
export async function getFolioSections(): Promise<Section[]> { //Obtener secciones
    try {
        const response = await fetch(`${baseUrl}/secciones`, {
            cache: 'no-store', 
        });

        if (!response.ok) {
            throw new Error(`Error fetching sections: ${response.statusText}`);
        }

        const sections: Section[] = await response.json();
        return sections;
    } catch (error) {
        console.error('API Error fetching sections:', error);
        // If the API fails, return an empty array to prevent the app from crashing
        // and avoid showing stale static data. The UI will show "No hay secciones".
        return [];
    }
}

// Create a new Folio
export async function createFolio(folioData: any, token: string) {
  const response = await fetch(`${baseUrl}/creafolios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(folioData),
  });

  if(!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear el folio');
  }

  return await response.json();
}
// Create a new Folio de  minuta
export async function createMinuta(minutaData: any, token: string) {
  const response = await fetch(`${baseUrl}/creaminuta`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(minutaData),
  });

  if(!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear minuta');
  }

  return await response.json();
}
// Create a new acuerdo de minuta
export async function createAcuerdo(acuerdoData: any, minuta_id: number, token: string) {
  const response = await fetch(`${baseUrl}/minutas/${minuta_id}/creaAcuerdo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(acuerdoData),
  });

  if(!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear acuerdo');
  }

  return await response.json();
}

// Uploar file to folio
export async function uploadFolioFile(id: number, formData: FormData, token: string | null) {
  const response = await fetch(`${baseUrl}/folios/${id}/archivo`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al subir archivo');
  }

  return await response.json();
}
// Uploar file to folio
export async function uploadMinutaFile(id: number, formData: FormData, token: string | null) {
  const response = await fetch(`${baseUrl}/minutas/${id}/evidencia`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al subir archivo');
  }

  return await response.json();
}

export async function updateEstadoAcuerdo(token: string | null, acuerdoId: number, nuevoEstado: string) {
  // console.log("Por ahora solo imprimimos jaja vamos por partes xd");
  const response = await fetch(`${baseUrl}/acuerdos/${acuerdoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      "estado": nuevoEstado, 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar estado');
  }

  return await response.json();

}

//Get users
export async function getUsers(token: string | null): Promise<any[]> {
  if (!token) return [];
  try {
    const response = await fetch(`${baseUrl}/obtenerUsuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return Array.isArray(data) ? data : data.users || [];
  } catch (error) {
    console.error("Error obteniendo usuarios: ", error);
    return [];
  }
}

//Change Password
export async function updatePassword(currentPassword:string, newPassword: string, confirmPassword: string, token: string | null) {
  const response = await fetch(`${baseUrl}/cambiaPassword`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      'current_password': currentPassword,
      'new_password': newPassword,
      'new_password_confirmation': confirmPassword,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar contraseña');
  }

  return await response.json();
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
      const parts = folio.folio.split('-');
      const sectionName = folio.seccion;
      const number = parseInt(parts[parts.length - 1], 10);
      if (!serials[sectionName] || number > serials[sectionName]) {
        serials[sectionName] = number;
      }
    }
    return serials;
}
