import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TUser } from '../interfaces';

const endpoint = 'users';

export const getUsers = () => getAll<TUser>(endpoint);
export const getDemand = (id: number) => getOne<TUser>(endpoint, id);
// export const createDemand = (data: Partial<TDemanda>) => create<TDemanda>(endpoint, data);
// export const updateDemand = (id: number, data: Partial<TDemanda>) => update<TDemanda>(endpoint, id, data);
// export const deleteDemand = (id: number) => remove(endpoint, id);
