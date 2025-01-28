import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TCategoriaMotivo } from '../interfaces';

const endpoint = 'categoria-motivo';

export const getTCategoriaMotivos = () => getAll<TCategoriaMotivo>(endpoint);
export const getTCategoriaMotivo = (id: number) => getOne<TCategoriaMotivo>(endpoint, id);
export const createTCategoriaMotivo = (data: Partial<TCategoriaMotivo>) => create<TCategoriaMotivo>(endpoint, data);
export const updateTCategoriaMotivo = (id: number, data: Partial<TCategoriaMotivo>) => update<TCategoriaMotivo>(endpoint, id, data);
export const deleteTCategoriaMotivo = (id: number) => remove(endpoint, id);
