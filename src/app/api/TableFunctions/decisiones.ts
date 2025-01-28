import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TDecision } from '../interfaces';

const endpoint = 'decision';
export const getTDecisiones = (filters?: Record<string, any>) =>
    getAll<TDecision>(endpoint, filters);
export const getTDecision = (id: number) => getOne<TDecision>(endpoint, id);
export const createTDecision = (data: Partial<TDecision>, showToast: boolean = false, toastMessage: string = '¡Registro creado con exito!') => create<TDecision>(endpoint, data, showToast, toastMessage);
export const updateTDecision = (id: number, data: Partial<TDecision>, showToast: boolean = false, toastMessage: string = '¡Registro modificado con exito!') => update<TDecision>(endpoint, id, data, showToast, toastMessage);
export const deleteTDecision = (id: number) => remove(endpoint, id);
