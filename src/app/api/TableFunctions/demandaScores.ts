import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TDemandaScore } from '../interfaces';

const endpoint = 'demanda-score';

export const getTDemandaScores = (filters?: Record<string, any>) =>
    getAll<TDemandaScore>(endpoint, filters);
export const getTDemandaScore = (id: number) => getOne<TDemandaScore>(endpoint, id);
export const createTDemandaScore = (data: Partial<TDemandaScore>) => create<TDemandaScore>(endpoint, data);
export const updateTDemandaScore = (id: number, data: Partial<TDemandaScore>) => update<TDemandaScore>(endpoint, id, data);
export const deleteTDemandaScore = (id: number) => remove(endpoint, id);
