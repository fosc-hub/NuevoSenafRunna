import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TInstitucionActividad } from '../interfaces';

const endpoint = 'institucion-actividad';

export const getTInstitucionActividads = () => getAll<TInstitucionActividad>(endpoint);
export const getTInstitucionActividad = (id: number) => getOne<TInstitucionActividad>(endpoint, id);
export const createTInstitucionActividad = (data: Partial<TInstitucionActividad>) => create<TInstitucionActividad>(endpoint, data);
export const updateTInstitucionActividad = (id: number, data: Partial<TInstitucionActividad>) => update<TInstitucionActividad>(endpoint, id, data);
export const deleteTInstitucionActividad = (id: number) => remove(endpoint, id);
