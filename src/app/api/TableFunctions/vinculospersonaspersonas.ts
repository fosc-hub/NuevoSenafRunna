import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TVinculoPersonaPersona } from '../interfaces';

const endpoint = 'vinculo-persona-persona';
export const getTVinculoPersonaPersonas = (filters?: Record<string, any>) =>
    getAll<TVinculoPersonaPersona>(endpoint, filters);
export const getTVinculoPersonaPersona = (id: number) => getOne<TVinculoPersonaPersona>(endpoint, id);
export const createTVinculoPersonaPersona = (data: Partial<TVinculoPersonaPersona>) => create<TVinculoPersonaPersona>(endpoint, data);
export const updateTVinculoPersonaPersona = (id: number, data: Partial<TVinculoPersonaPersona>) => update<TVinculoPersonaPersona>(endpoint, id, data);
export const deleteTVinculoPersonaPersona = (id: number) => remove(endpoint, id);
