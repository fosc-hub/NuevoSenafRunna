import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TDemandaAsignado } from '../interfaces';

const endpoint = 'demanda-asignado';

export const getTDemandaAsignados = (filters?: Record<string, any>) =>
    getAll<TDemandaAsignado>(endpoint, filters);
export const getTDemandaAsignado = (id: number) => getOne<TDemandaAsignado>(endpoint, id);
export const createTDemandaAsignado = (data: Partial<TDemandaAsignado>, showToast: boolean = false, toastMessage: string = '¡Registro modificado con exito!' ) => create<TDemandaAsignado>(endpoint, data, showToast, toastMessage);
export const updateTDemandaAsignado = (id: number, data: Partial<TDemandaAsignado>) => update<TDemandaAsignado>(endpoint, id, data);
export const deleteTDemandaAsignado = (id: number) => remove(endpoint, id);
