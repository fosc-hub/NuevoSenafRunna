import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TNNyAScore } from '../interfaces';

const endpoint = 'tnnyascore';

export const getTNNyAScores = () => getAll<TNNyAScore>(endpoint);
export const getTNNyAScore = (id: number) => getOne<TNNyAScore>(endpoint, id);
export const createTNNyAScore = (data: Partial<TNNyAScore>) => create<TNNyAScore>(endpoint, data);
export const updateTNNyAScore = (id: number, data: Partial<TNNyAScore>) => update<TNNyAScore>(endpoint, id, data);
export const deleteTNNyAScore = (id: number) => remove(endpoint, id);
