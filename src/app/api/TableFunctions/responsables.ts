import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TResponsable } from '../interfaces';

const endpoint = 'responsable';

export const getTResponsables = () => getAll<TResponsable>(endpoint);
export const getTResponsable = (id: number) => getOne<TResponsable>(endpoint, id);
export const createTResponsable = (data: Partial<TResponsable>) => create<TResponsable>(endpoint, data);
export const updateTResponsable = (id: number, data: Partial<TResponsable>) => update<TResponsable>(endpoint, id, data);
export const deleteTResponsable = (id: number) => remove(endpoint, id);
