import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TUrgenciaVulneracion } from '../interfaces';

const endpoint = 'urgencia-vulneracion';

export const getTUrgenciaVulneracions = () => getAll<TUrgenciaVulneracion>(endpoint);
export const getTUrgenciaVulneracion = (id: number) => getOne<TUrgenciaVulneracion>(endpoint, id);
export const createTUrgenciaVulneracion = (data: Partial<TUrgenciaVulneracion>) => create<TUrgenciaVulneracion>(endpoint, data);
export const updateTUrgenciaVulneracion = (id: number, data: Partial<TUrgenciaVulneracion>) => update<TUrgenciaVulneracion>(endpoint, id, data);
export const deleteTUrgenciaVulneracion = (id: number) => remove(endpoint, id);
