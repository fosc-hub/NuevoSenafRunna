import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TPersona } from '../interfaces';

const endpoint = 'persona';

export const getTPersonas = (filters?: Record<string, any>) =>
    getAll<TPersona>(endpoint, filters);
export const getTPersona = (id: number) => getOne<TPersona>(endpoint, id);
export const createTPersona = (data: Partial<TPersona>) => create<TPersona>(endpoint, data);
export const updateTPersona = (id: number, data: Partial<TPersona>) => update<TPersona>(endpoint, id, data);
export const deleteTPersona = (id: number) => remove(endpoint, id);
