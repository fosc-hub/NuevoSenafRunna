import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TDemanda } from '../interfaces';

const endpoint = 'demanda';

export const getDemands = (filters?: Record<string, any>) =>
    getAll<TDemanda>(endpoint, filters);
export const getDemand = (id: number) => getOne<TDemanda>(endpoint, id);
export const createDemand = (data: Partial<TDemanda>, showToast: boolean = false, toastMessage: string = '¡Registro creado con exito!') => create<TDemanda>(endpoint, data, showToast, toastMessage);
export const updateDemand = (id: number, data: Partial<TDemanda>, showToast: boolean = false, toastMessage: string = '¡Registro modificado con exito!' ) => update<TDemanda>(endpoint, id, data, showToast, toastMessage);
export const deleteDemand = (id: number) => remove(endpoint, id);
