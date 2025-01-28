import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TCargo } from '../interfaces';

const endpoint = 'tcargo';

export const getTCargos = () => getAll<TCargo>(endpoint);
export const getTCargo = (id: number) => getOne<TCargo>(endpoint, id);
export const createTCargo = (data: Partial<TCargo>) => create<TCargo>(endpoint, data);
export const updateTCargo = (id: number, data: Partial<TCargo>) => update<TCargo>(endpoint, id, data);
export const deleteTCargo = (id: number) => remove(endpoint, id);
