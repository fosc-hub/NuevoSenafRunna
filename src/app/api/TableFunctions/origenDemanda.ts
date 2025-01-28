import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TOrigen } from '../interfaces';

const endpoint = 'origen-demanda';

export const getOrigens = (filters?: Record<string, any>) =>
    getAll<TOrigen>(endpoint, filters);
export const getOrigen = (id: number) => getOne<TOrigen>(endpoint, id);
