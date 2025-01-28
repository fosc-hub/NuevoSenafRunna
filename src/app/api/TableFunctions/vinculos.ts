import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TVinculo } from '../interfaces';

const endpoint = 'vinculo-persona';
export const getTVinculos = (filters?: Record<string, any>) =>
    getAll<TVinculo>(endpoint, filters);
export const getTVinculo = (id: number) => getOne<TVinculo>(endpoint, id);
export const createTVinculo = (data: Partial<TVinculo>) => create<TVinculo>(endpoint, data);
export const updateTVinculo = (id: number, data: Partial<TVinculo>) => update<TVinculo>(endpoint, id, data);
export const deleteTVinculo = (id: number) => remove(endpoint, id);
