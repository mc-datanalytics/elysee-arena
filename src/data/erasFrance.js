export const ERAS_FRANCE = [
  {
    key: 'redressement',
    title: 'Redressement',
    turns: [1, 6],
    focus: ['ordre intérieur', 'réparation budgétaire', 'restauration de confiance'],
    pressure: 0.8,
    opportunity: 1.1,
    description: 'Phase de stabilisation initiale: la marge d’erreur est faible mais les gains de crédibilité sont rapides.',
  },
  {
    key: 'consolidation',
    title: 'Consolidation',
    turns: [7, 12],
    focus: ['institutionnalisation', 'pacte social', 'discipline administrative'],
    pressure: 1,
    opportunity: 1,
    description: 'Le régime entre en vitesse de croisière; les arbitrages deviennent structurels.',
  },
  {
    key: 'rayonnement',
    title: 'Rayonnement',
    turns: [13, 18],
    focus: ['diplomatie active', 'influence culturelle', 'croissance stratégique'],
    pressure: 1.15,
    opportunity: 0.95,
    description: 'Projection extérieure et compétition d’image: chaque succès attire des contre-feux.',
  },
  {
    key: 'hegemonie-europeenne',
    title: 'Hégémonie européenne',
    turns: [19, 24],
    focus: ['leadership continental', 'capacité industrielle', 'supériorité d’anticipation'],
    pressure: 1.25,
    opportunity: 0.85,
    description: 'Phase finale à haute tension: conserver l’avance coûte cher politiquement.',
  },
];

export const getCurrentEra = (turn) =>
  ERAS_FRANCE.find((era) => turn >= era.turns[0] && turn <= era.turns[1]) ?? ERAS_FRANCE[ERAS_FRANCE.length - 1];
