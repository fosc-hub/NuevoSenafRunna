import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TPrecalificacionDemanda } from '../interfaces';

const endpoint = 'precalificacion-demanda';
export const getTPrecalificacionDemandas = (filters?: Record<string, any>) =>
    getAll<TPrecalificacionDemanda>(endpoint, filters);
export const getTPrecalificacionDemanda = (id: number) => getOne<TPrecalificacionDemanda>(endpoint, id);
export const createTPrecalificacionDemanda = (data: Partial<TPrecalificacionDemanda>, showToast: boolean = false, toastMessage: string = '¡Registro modificado con exito!') => create<TPrecalificacionDemanda>(endpoint, data, showToast, toastMessage);
export const updateTPrecalificacionDemanda = (id: number, data: Partial<TPrecalificacionDemanda>, showToast: boolean = false, toastMessage: string = '¡Registro modificado con exito!') => update<TPrecalificacionDemanda>(endpoint, id, data, showToast, toastMessage);
export const deleteTPrecalificacionDemanda = (id: number) => remove(endpoint, id);
