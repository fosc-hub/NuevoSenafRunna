import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TLegajoAsignado } from '../interfaces';

const endpoint = 'tlegajoasignado';

export const getTLegajoAsignados = () => getAll<TLegajoAsignado>(endpoint);
export const getTLegajoAsignado = (id: number) => getOne<TLegajoAsignado>(endpoint, id);
export const createTLegajoAsignado = (data: Partial<TLegajoAsignado>) => create<TLegajoAsignado>(endpoint, data);
export const updateTLegajoAsignado = (id: number, data: Partial<TLegajoAsignado>) => update<TLegajoAsignado>(endpoint, id, data);
export const deleteTLegajoAsignado = (id: number) => remove(endpoint, id);
