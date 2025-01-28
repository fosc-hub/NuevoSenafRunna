import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TDemandaPersona } from '../interfaces';

const endpoint = 'demanda-persona';

export const getTDemandaPersonas = (filters?: Record<string, any>) =>
    getAll<TDemandaPersona>(endpoint, filters);
export const getTDemandaPersona = (id: number) => getOne<TDemandaPersona>(endpoint, id);
export const createTDemandaPersona = (data: Partial<TDemandaPersona>) => create<TDemandaPersona>(endpoint, data);
export const updateTDemandaPersona = (id: number, data: Partial<TDemandaPersona>) => update<TDemandaPersona>(endpoint, id, data);
export const deleteTDemandaPersona = (id: number) => remove(endpoint, id);