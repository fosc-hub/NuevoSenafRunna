import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TGravedadVulneracion } from '../interfaces';

const endpoint = 'gravedad-vulneracion';

export const getTGravedadVulneracions = () => getAll<TGravedadVulneracion>(endpoint);
export const getTGravedadVulneracion = (id: number) => getOne<TGravedadVulneracion>(endpoint, id);
export const createTGravedadVulneracion = (data: Partial<TGravedadVulneracion>) => create<TGravedadVulneracion>(endpoint, data);
export const updateTGravedadVulneracion = (id: number, data: Partial<TGravedadVulneracion>) => update<TGravedadVulneracion>(endpoint, id, data);
export const deleteTGravedadVulneracion = (id: number) => remove(endpoint, id);
