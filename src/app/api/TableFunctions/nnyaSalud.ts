import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TNNyASalud } from '../interfaces';

const endpoint = 'nnya-salud';

export const getTNNyASaluds = (filters?: Record<string, any>) =>
    getAll<TNNyASalud>(endpoint, filters);
export const getTNNyASalud = (id: number) => getOne<TNNyASalud>(endpoint, id);
export const createTNNyASalud = (data: Partial<TNNyASalud>) => create<TNNyASalud>(endpoint, data);
export const updateTNNyASalud = (id: number, data: Partial<TNNyASalud>) => update<TNNyASalud>(endpoint, id, data);
export const deleteTNNyASalud = (id: number) => remove(endpoint, id);
