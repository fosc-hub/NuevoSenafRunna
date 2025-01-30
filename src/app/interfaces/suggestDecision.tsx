export interface TsuggestDecision {
    decision: string;
    reason: string;
    "Demanda Scores": TScores;
    "NNyA Scores": TScores;
}

export interface TScores {
    score: number;
    score_condiciones_vulnerabilidad: number;
    score_vulneracion: number;
    score_motivos_intervencion: number;
    score_indicadores_valoracion?: number; // Opcional porque no aparece en "NNyA Scores"
}
