export type ScoreRules = {
  exactScore: number;
  outcome: number;
};

export const DEFAULT_RULES: ScoreRules = {
  exactScore: 5,
  outcome: 3
};

const outcome = (home: number, away: number): 'home' | 'away' | 'draw' => {
  if (home === away) return 'draw';
  return home > away ? 'home' : 'away';
};

export const calculatePredictionPoints = (
  prediction: { homeScore: number; awayScore: number },
  official: { homeScore: number; awayScore: number },
  rules: ScoreRules = DEFAULT_RULES
): number => {
  if (prediction.homeScore === official.homeScore && prediction.awayScore === official.awayScore) {
    return rules.exactScore;
  }

  if (outcome(prediction.homeScore, prediction.awayScore) === outcome(official.homeScore, official.awayScore)) {
    return rules.outcome;
  }

  return 0;
};
