export const VICTORY_CONDITIONS = [
  {
    key: 'economic-victory',
    label: 'Victoire économique',
    description: 'Atteindre une base budgétaire dominante sans effondrement politique.',
    requirements: {
      budget: 78,
      trust: 45,
      order: 45,
      minimumTurn: 16,
    },
  },
  {
    key: 'durable-national-stability',
    label: 'Stabilité nationale durable',
    description: 'Maintenir l’ordre et la confiance durablement en milieu hostile.',
    requirements: {
      trust: 65,
      order: 70,
      momentum: 40,
      minimumTurn: 18,
    },
  },
  {
    key: 'diplomatic-leadership',
    label: 'Leadership diplomatique',
    description: 'Combiner légitimité interne et capacité de projection externe.',
    requirements: {
      trust: 58,
      momentum: 68,
      order: 52,
      minimumTurn: 17,
    },
  },
  {
    key: 'technological-supremacy',
    label: 'Suprématie technologique',
    description: 'Construire une avance d’innovation avec ressources soutenues.',
    requirements: {
      budget: 72,
      momentum: 70,
      trust: 42,
      minimumTurn: 15,
    },
  },
];

export const resolveVictoryPath = (state) =>
  VICTORY_CONDITIONS.find(({ requirements }) =>
    Object.entries(requirements).every(([key, value]) => (state[key] ?? 0) >= value),
  ) ?? null;
