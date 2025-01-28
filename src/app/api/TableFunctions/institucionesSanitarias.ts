import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TInstitucionSanitaria } from '../interfaces';

const endpoint = 'institucion-sanitaria';

export const getTInstitucionSanitarias = (filters?: Record<string, any>) =>
    getAll<TInstitucionSanitaria>(endpoint, filters);
export const getTInstitucionSanitaria = (id: number) => getOne<TInstitucionSanitaria>(endpoint, id);
export const createTInstitucionSanitaria = (data: Partial<TInstitucionSanitaria>) => create<TInstitucionSanitaria>(endpoint, data);
export const updateTInstitucionSanitaria = (id: number, data: Partial<TInstitucionSanitaria>) => update<TInstitucionSanitaria>(endpoint, id, data);
export const deleteTInstitucionSanitaria = (id: number) => remove(endpoint, id);
