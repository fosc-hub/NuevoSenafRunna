import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TVulneracion } from '../interfaces';

const endpoint = 'vulneracion';
export const getTVulneracions = (filters?: Record<string, any>) =>
    getAll<TVulneracion>(endpoint, filters);
export const getTVulneracion = (id: number) => getOne<TVulneracion>(endpoint, id);
export const createTVulneracion = (data: Partial<TVulneracion>) => create<TVulneracion>(endpoint, data);
export const updateTVulneracion = (id: number, data: Partial<TVulneracion>) => update<TVulneracion>(endpoint, id, data);
export const deleteTVulneracion = (id: number) => remove(endpoint, id);
