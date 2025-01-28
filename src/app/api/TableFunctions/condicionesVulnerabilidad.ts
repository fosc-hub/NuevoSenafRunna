import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TCondicionesVulnerabilidad } from '../interfaces';

const endpoint = 'condiciones-vulnerabilidad';

export const getTCondicionesVulnerabilidads = (filters?: Record<string, any>) =>
    getAll<TCondicionesVulnerabilidad>(endpoint, filters);
export const getTCondicionesVulnerabilidad = (id: number) => getOne<TCondicionesVulnerabilidad>(endpoint, id);
export const createTCondicionesVulnerabilidad = (data: Partial<TCondicionesVulnerabilidad>) => create<TCondicionesVulnerabilidad>(endpoint, data);
export const updateTCondicionesVulnerabilidad = (id: number, data: Partial<TCondicionesVulnerabilidad>) => update<TCondicionesVulnerabilidad>(endpoint, id, data);
export const deleteTCondicionesVulnerabilidad = (id: number) => remove(endpoint, id);
