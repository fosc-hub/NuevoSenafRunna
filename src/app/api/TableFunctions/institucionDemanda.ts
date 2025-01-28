import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TInstitucionDemanda } from '../interfaces';

const endpoint = 'institucion-demanda';

export const getTInstitucionDemands = (filters?: Record<string, any>) =>
    getAll<TInstitucionDemanda>(endpoint, filters);
export const getTInstitucionDemand = (id: number) => getOne<TInstitucionDemanda>(endpoint, id);
