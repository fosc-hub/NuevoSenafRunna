import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TCategoriaSubmotivo } from '../interfaces';

const endpoint = 'categoria-submotivo';

export const getTCategoriaSubmotivos = () => getAll<TCategoriaSubmotivo>(endpoint);
export const getTCategoriaSubmotivo = (id: number) => getOne<TCategoriaSubmotivo>(endpoint, id);
export const createTCategoriaSubmotivo = (data: Partial<TCategoriaSubmotivo>) => create<TCategoriaSubmotivo>(endpoint, data);
export const updateTCategoriaSubmotivo = (id: number, data: Partial<TCategoriaSubmotivo>) => update<TCategoriaSubmotivo>(endpoint, id, data);
export const deleteTCategoriaSubmotivo = (id: number) => remove(endpoint, id);
