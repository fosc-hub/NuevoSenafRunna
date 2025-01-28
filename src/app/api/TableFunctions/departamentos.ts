import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TDepartamento } from '../interfaces';

const endpoint = 'tdepartamento';

export const getTDepartamentos = () => getAll<TDepartamento>(endpoint);
export const getTDepartamento = (id: number) => getOne<TDepartamento>(endpoint, id);
export const createTDepartamento = (data: Partial<TDepartamento>) => create<TDepartamento>(endpoint, data);
export const updateTDepartamento = (id: number, data: Partial<TDepartamento>) => update<TDepartamento>(endpoint, id, data);
export const deleteTDepartamento = (id: number) => remove(endpoint, id);
