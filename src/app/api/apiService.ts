import { toast } from 'react-toastify'; // Importar Toastify
import { handleApiError } from './utils/errorHandler';
import axiosInstance from './utils/axiosInstance';
import { useQuery } from "@tanstack/react-query";

/**
 * Generic function to fetch all resources from an API endpoint.
 * @param endpoint API endpoint to fetch data from.
 * @param filters Optional filters for query parameters.
 * @returns Array of resources of type T or single resource if endpoint returns a single object.
 */
export const get = async <T>(
  endpoint: string,
  filters?: Record<string, any>
): Promise<T> => {
  const queryString = filters
    ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
    : '';
  const response = await axiosInstance.get<T>(`${endpoint}${queryString}`);
  return response.data;
};

export const getWithCustomParams = async <T>(
  endpoint: string,
  filters?: Record<string, any>, // Parámetros de filtro opcionales
  usePathParams: boolean = false // Si es true, usará los parámetros como segmentos de la ruta
): Promise<T[]> => {
  try {
    let url = endpoint;

    if (usePathParams && filters) {
      // Limpia el endpoint y une los valores de los filtros
      const pathParams = Object.values(filters)
        .map(param => encodeURIComponent(String(param))) // Codificar los parámetros
        .join('/'); // Unir con "/"

      // Asegura que el endpoint no termina con un "/"
      url = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;

      // Forma la URL final
      url = `${url}/${pathParams}`;
    } else if (filters) {
      // Si no se usan parámetros en la ruta, se construyen como query string
      const queryString = `?${new URLSearchParams(filters as Record<string, string>).toString()}`;
      url = `${endpoint}${queryString}`;
    }

    // Realiza la llamada HTTP directamente
    const response = await axiosInstance.get<T[]>(url);

    return response.data;
  } catch (error) {
    handleApiError(error, endpoint);
    throw new Error(`Failed to fetch data from ${endpoint}.`);
  }
};


/**
 * Generic function to create a new resource.
 * @param endpoint API endpoint to send data to.
 * @param data Data to create a new resource.
 * @returns Newly created resource of type T.
 */
export const create = async <T>(endpoint: string, data: Partial<T>, showToast: boolean = false, toastMessage: string = '¡Registro asignado con exito!')
  : Promise<T> => {
  const response = await axiosInstance.post<T>(`${endpoint}/`, data)

  if (showToast) {
    toast.success(toastMessage)
  }

  return response.data;
}
/**
 * Generic function to update an existing resource.
 * @param endpoint API endpoint to send data to.
 * @param id Resource ID.
 * @param data Data to update the resource.
 * @returns Updated resource of type T.
 */
export const update = async <T>(endpoint: string, id: number, data: Partial<T>, showToast: boolean = false, toastMessage: string = '¡Registro modificado con exito!'): Promise<T> => {
  const response = await axiosInstance.patch<T>(`${endpoint}/${id}/`, data);
  if (response.status === 200 && showToast) {
    // success toast
    toast.success(toastMessage, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
  }
  return response.data;
};

/**
 * Generic function to partially update a resource.
 * @param endpoint API endpoint to send data to.
 * @param id Resource ID.
 * @param data Partial data to update the resource.
 * @returns Updated resource of type T.
 */
export const patch = async <T>(endpoint: string, id: number, data: Partial<T>): Promise<T> => {
  const response = await axiosInstance.patch<T>(`${endpoint}/${id}/`, data);
  return response.data;
};


/**
 * Generic function to send a PUT request to an API endpoint.
 * @param endpoint API endpoint to send data to.
 * @param id Resource ID.
 * @param data Data to update the resource.
 * @param showToast Whether to show a toast notification on success.
 * @param toastMessage Custom toast message.
 * @returns Updated resource of type T.
 */
export const put = async <T>(
  endpoint: string,
  id: number,
  data?: Partial<T>,
  showToast: boolean = false,
  toastMessage: string = '¡Operación completada con éxito!'
)
  : Promise<T> => {
  try {
    const response = await axiosInstance.put<T>(`${endpoint}/${id}/`, data)

    if (response.status >= 200 && response.status < 300 && showToast) {
      toast.success(toastMessage, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      })
    }

    return response.data;
  } catch (error: any) {
    // Check if it's a 404 error
    if (error.response && error.response.status === 404) {
      toast.warning(`El recurso no fue encontrado (404). Endpoint: ${endpoint}/${id}/`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      })
    } else {
      handleApiError(error, endpoint)
    }
    throw error
  }
}

/**
 * Generic function to delete a resource by ID.
 * @param endpoint API endpoint to send delete request to.
 * @param id Resource ID.
 * @returns void.
 */
export const remove = async (endpoint: string, id: number): Promise<void> => {
  await axiosInstance.delete(`${endpoint}/${id}/`);
};
