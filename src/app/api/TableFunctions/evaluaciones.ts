import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TEvaluaciones } from '../interfaces';

const endpoint = 'evaluaciones';
export const getTEvaluaciones = (filters?: Record<string, any>) =>
    getAll<TEvaluaciones>(endpoint, filters);
export const getTEvaluacion = (id: number) => getOne<TEvaluaciones>(endpoint, id);
export const createTEvaluacion = (data: Partial<TEvaluaciones>, showToast: boolean = false, toastMessage: string = '¡Registro creado con exito!') => create<TEvaluaciones>(endpoint, data, showToast, toastMessage);
export const updateTEvaluacion = (id: number, data: Partial<TEvaluaciones>, showToast: boolean = false, toastMessage: string = '¡Registro modificado con exito!') => update<TEvaluaciones>(endpoint, id, data, showToast, toastMessage);
export const deleteTEvaluacion = (id: number) => remove(endpoint, id);
