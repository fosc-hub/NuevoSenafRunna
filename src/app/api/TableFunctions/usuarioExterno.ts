import { getAll, getOne, create, update } from '../services/apiService';
import { TUsuarioExterno } from '../interfaces';

const endpoint = 'informante';
export const getTUsuariosExternos = (filters?: Record<string, any>) =>
    getAll<TUsuarioExterno>(endpoint, filters);
export const getTUsuarioExterno = (id: number) => getOne<TUsuarioExterno>(endpoint, id);
export const createTUsuarioExterno = (data: Partial<TUsuarioExterno>) => create<TUsuarioExterno>(endpoint, data);
export const updateTUsuarioExterno = (id: number, data: Partial<TUsuarioExterno>) => update<TUsuarioExterno>(endpoint, id, data);
