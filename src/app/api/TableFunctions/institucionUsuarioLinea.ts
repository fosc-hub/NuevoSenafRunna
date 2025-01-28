import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TInstitucionUsuarioLinea } from '../interfaces';

const endpoint = 'tinstitucionusuariolinea';

export const getTInstitucionUsuarioLineas = () => getAll<TInstitucionUsuarioLinea>(endpoint);
export const getTInstitucionUsuarioLinea = (id: number) => getOne<TInstitucionUsuarioLinea>(endpoint, id);
export const createTInstitucionUsuarioLinea = (data: Partial<TInstitucionUsuarioLinea>) => create<TInstitucionUsuarioLinea>(endpoint, data);
export const updateTInstitucionUsuarioLinea = (id: number, data: Partial<TInstitucionUsuarioLinea>) => update<TInstitucionUsuarioLinea>(endpoint, id, data);
export const deleteTInstitucionUsuarioLinea = (id: number) => remove(endpoint, id);
