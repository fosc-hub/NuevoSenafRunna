import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TUsuarioLinea } from '../interfaces';

const endpoint = 'tusuariolinea';

export const getTUsuarioLineas = () => getAll<TUsuarioLinea>(endpoint);
export const getTUsuarioLinea = (id: number) => getOne<TUsuarioLinea>(endpoint, id);
export const createTUsuarioLinea = (data: Partial<TUsuarioLinea>) => create<TUsuarioLinea>(endpoint, data);
export const updateTUsuarioLinea = (id: number, data: Partial<TUsuarioLinea>) => update<TUsuarioLinea>(endpoint, id, data);
export const deleteTUsuarioLinea = (id: number) => remove(endpoint, id);
