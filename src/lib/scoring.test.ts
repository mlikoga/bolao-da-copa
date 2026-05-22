import { describe, expect, it } from 'vitest';
import { calculatePredictionPoints, DEFAULT_RULES } from './scoring';

describe('calculatePredictionPoints', () => {
  it('deve retornar pontuação máxima para placar exato', () => {
    const result = calculatePredictionPoints({ homeScore: 2, awayScore: 1 }, { homeScore: 2, awayScore: 1 });
    expect(result).toBe(DEFAULT_RULES.exactScore);
  });

  it('deve retornar pontuação de resultado correto', () => {
    const result = calculatePredictionPoints({ homeScore: 1, awayScore: 0 }, { homeScore: 3, awayScore: 2 });
    expect(result).toBe(DEFAULT_RULES.outcome);
  });

  it('deve retornar zero em caso de erro', () => {
    const result = calculatePredictionPoints({ homeScore: 0, awayScore: 2 }, { homeScore: 2, awayScore: 1 });
    expect(result).toBe(0);
  });
});
