import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TInstitucionEducativa } from '../interfaces';

const endpoint = 'institucion-educativa';


export const getTInstitucionEducativas = (filters?: Record<string, any>) =>
    getAll<TInstitucionEducativa>(endpoint, filters);
export const getTInstitucionEducativa = (id: number) => getOne<TInstitucionEducativa>(endpoint, id);
export const createTInstitucionEducativa = (data: Partial<TInstitucionEducativa>) => create<TInstitucionEducativa>(endpoint, data);
export const updateTInstitucionEducativa = (id: number, data: Partial<TInstitucionEducativa>) => update<TInstitucionEducativa>(endpoint, id, data);
export const deleteTInstitucionEducativa = (id: number) => remove(endpoint, id);
