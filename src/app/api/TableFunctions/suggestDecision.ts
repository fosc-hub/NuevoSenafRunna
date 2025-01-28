import { getWithCustomParams } from '../services/apiService';
import { TsuggestDecision } from '../interfaces';

const endpoint = 'suggest-decision';

export const getTSuggestDecisions = (demanda_id: number, nnya_id: number) =>
    getWithCustomParams<TsuggestDecision>(
        endpoint, 
        { nnya_id, demanda_id }, 
        true // Esto indica que los parámetros deben ir como segmentos de la ruta
    );
