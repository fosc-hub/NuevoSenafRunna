import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TUser } from '../interfaces';

const endpoint = 'user/me';

export const getUsers = () => getAll<TUser>(endpoint);
// export const getDemand = (id: number) => getOne<TDemanda>(endpoint, id);
// export const createDemand = (data: Partial<TDemanda>) => create<TDemanda>(endpoint, data);
// export const updateDemand = (id: number, data: Partial<TDemanda>) => update<TDemanda>(endpoint, id, data);
// export const deleteDemand = (id: number) => remove(endpoint, id);
