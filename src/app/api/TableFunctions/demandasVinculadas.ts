import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TDemandaVinculada } from '../interfaces';

const endpoint = 'demanda-vinculada';
export const getTDemandaVinculadas = (filters?: Record<string, any>) =>
    getAll<TDemandaVinculada>(endpoint, filters);
export const getTDemandaVinculada = (id: number) => getOne<TDemandaVinculada>(endpoint, id);
export const createTDemandaVinculada = (data: Partial<TDemandaVinculada>) => create<TDemandaVinculada>(endpoint, data);
export const updateTDemandaVinculada = (id: number, data: Partial<TDemandaVinculada>) => update<TDemandaVinculada>(endpoint, id, data);
export const deleteTDemandaVinculada = (id: number) => remove(endpoint, id);
