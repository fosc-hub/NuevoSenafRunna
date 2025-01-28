import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TActividad } from '../interfaces';

const endpoint = 'actividad';

export const getTActividades = (filters?: Record<string, any>) =>
    getAll<TActividad>(endpoint, filters);
export const getTActividad = (id: number) => getOne<TActividad>(endpoint, id);
export const createTActividad = (data: Partial<TActividad>, showToast: boolean = false, toastMessage: string = '¡Registro modificado con exito!') => create<TActividad>(endpoint, data, showToast, toastMessage);
export const updateTActividad = (id: number, data: Partial<TActividad>, showToast: boolean = false, toastMessage: string = '¡Registro modificado con exito!') => update<TActividad>(endpoint, id, data, showToast, toastMessage);
export const deleteTActividad = (id: number) => remove(endpoint, id);
