import { getAll, getOne, create, update, remove } from '../services/apiService';
import { TInstitucionRespuesta } from '../interfaces';

const endpoint = 'institucion-respuesta';

export const getTInstitucionRespuestas = () => getAll<TInstitucionRespuesta>(endpoint);
export const getTInstitucionRespuesta = (id: number) => getOne<TInstitucionRespuesta>(endpoint, id);
export const createTInstitucionRespuesta = (data: Partial<TInstitucionRespuesta>) => create<TInstitucionRespuesta>(endpoint, data);
export const updateTInstitucionRespuesta = (id: number, data: Partial<TInstitucionRespuesta>) => update<TInstitucionRespuesta>(endpoint, id, data);
export const deleteTInstitucionRespuesta = (id: number) => remove(endpoint, id);
