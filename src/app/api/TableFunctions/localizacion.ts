import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TLocalizacion } from '../interfaces';

const endpoint = 'localizacion';

export const getLocalizacions = (filters?: Record<string, any>) =>
    getAll<TLocalizacion>(endpoint, filters);
export const getLocalizacion = (id: any) => getOne<TLocalizacion>(endpoint, id);
export const createLocalizacion = async (data: Partial<TLocalizacion>): Promise<TLocalizacion> => {
    const response = await create<TLocalizacion>(endpoint, data);
    console.log('Create localizacion response:', response);
    return response;
  };export const updateLocalizacion = (id: number, data: Partial<TLocalizacion>) => update<TLocalizacion>(endpoint, id, data);
export const deleteLocalizacion = (id: number) => remove(endpoint, id);
