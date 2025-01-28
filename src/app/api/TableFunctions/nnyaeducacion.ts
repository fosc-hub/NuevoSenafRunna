import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TNNyAEducacion } from '../interfaces';

const endpoint = 'nnya-educacion';

export const getTNNyAEducacions = (filters?: Record<string, any>) =>
    getAll<TNNyAEducacion>(endpoint, filters);
export const getTNNyAEducacion = (id: number) => getOne<TNNyAEducacion>(endpoint, id);
export const createTNNyAEducacion = (data: Partial<TNNyAEducacion>) => create<TNNyAEducacion>(endpoint, data);
export const updateTNNyAEducacion = (id: number, data: Partial<TNNyAEducacion>) => update<TNNyAEducacion>(endpoint, id, data);
export const deleteTNNyAEducacion = (id: number) => remove(endpoint, id);
