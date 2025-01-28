import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TRespuesta } from '../interfaces';

const endpoint = 'respuesta';

export const getTRespuestas = () => getAll<TRespuesta>(endpoint);
export const getTRespuesta = (id: number) => getOne<TRespuesta>(endpoint, id);
export const createTRespuesta = (data: Partial<TRespuesta>, showToast: boolean = false, toastMessage: string = '¡Registro modificado con exito!') => create<TRespuesta>(endpoint, data, showToast, toastMessage);
export const updateTRespuesta = (id: number, data: Partial<TRespuesta>, showToast: boolean = false, toastMessage: string = '¡Registro modificado con exito!') => update<TRespuesta>(endpoint, id, data, showToast, toastMessage);
export const deleteTRespuesta = (id: number) => remove(endpoint, id);
