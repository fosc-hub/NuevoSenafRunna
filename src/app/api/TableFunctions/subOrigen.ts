import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TSubOrigen } from '../interfaces';

const endpoint = 'sub-origen-demanda';

export const getSubOrigens = (filters?: Record<string, any>) =>
    getAll<TSubOrigen>(endpoint, filters);
export const getSubOrigen = (id: number) => getOne<TSubOrigen>(endpoint, id);
