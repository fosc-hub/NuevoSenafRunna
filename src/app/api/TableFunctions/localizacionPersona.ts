import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TLocalizacionPersona } from '../interfaces';

const endpoint = 'localizacion-persona';


export const getLocalizacionPersonas = (filters?: Record<string, any>) =>
    getAll<TLocalizacionPersona>(endpoint, filters);
export const getLocalizacionPersona = (id: number) => getOne<TLocalizacionPersona>(endpoint, id);
export const createLocalizacionPersona = (data: Partial<TLocalizacionPersona>) => create<TLocalizacionPersona>(endpoint, data);
export const updateLocalizacionPersona = (id: number, data: Partial<TLocalizacionPersona>) => update<TLocalizacionPersona>(endpoint, id, data);
export const deleteLocalizacionPersona = (id: number) => remove(endpoint, id);
