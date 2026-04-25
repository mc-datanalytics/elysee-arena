export const DOCTRINE_BRANCHES = {
  economy: {
    label: 'Économie',
    nodes: ['orthodoxie-budgetaire', 'etat-investisseur', 'bloc-export'],
  },
  security: {
    label: 'Sécurité',
    nodes: ['etat-preventif', 'doctrine-renseignement', 'coordination-territoriale'],
  },
  social: {
    label: 'Social',
    nodes: ['pacte-civique', 'priorite-services-publics', 'mobilite-solidaire'],
  },
  industry: {
    label: 'Industrie',
    nodes: ['souverainete-energetique', 'reindustrialisation-rapide', 'complexe-tech-defense'],
  },
};

export const DOCTRINES = [
  {
    key: 'orthodoxie-budgetaire',
    branch: 'economy',
    label: 'Orthodoxie budgétaire',
    effect: { budget: 8, trust: -2, momentum: -1 },
    excludes: ['etat-investisseur'],
  },
  {
    key: 'etat-investisseur',
    branch: 'economy',
    label: 'État investisseur',
    effect: { budget: -3, trust: 3, momentum: 4 },
    excludes: ['orthodoxie-budgetaire', 'bloc-export'],
  },
  {
    key: 'bloc-export',
    branch: 'economy',
    label: 'Bloc export',
    effect: { budget: 5, momentum: 3, order: -1 },
    excludes: ['etat-investisseur'],
  },
  {
    key: 'etat-preventif',
    branch: 'security',
    label: 'État préventif',
    effect: { order: 7, trust: -3 },
    excludes: ['pacte-civique'],
  },
  {
    key: 'doctrine-renseignement',
    branch: 'security',
    label: 'Doctrine renseignement',
    effect: { order: 5, budget: -2, momentum: 1 },
    excludes: ['mobilite-solidaire'],
  },
  {
    key: 'coordination-territoriale',
    branch: 'security',
    label: 'Coordination territoriale',
    effect: { order: 4, trust: 2 },
    excludes: ['etat-preventif'],
  },
  {
    key: 'pacte-civique',
    branch: 'social',
    label: 'Pacte civique',
    effect: { trust: 6, order: 2, budget: -2 },
    excludes: ['etat-preventif', 'complexe-tech-defense'],
  },
  {
    key: 'priorite-services-publics',
    branch: 'social',
    label: 'Priorité services publics',
    effect: { trust: 4, budget: -4, momentum: 2 },
    excludes: ['orthodoxie-budgetaire'],
  },
  {
    key: 'mobilite-solidaire',
    branch: 'social',
    label: 'Mobilité solidaire',
    effect: { trust: 3, momentum: 4, budget: -3 },
    excludes: ['doctrine-renseignement'],
  },
  {
    key: 'souverainete-energetique',
    branch: 'industry',
    label: 'Souveraineté énergétique',
    effect: { budget: 4, order: 2, momentum: 1 },
    excludes: ['etat-investisseur'],
  },
  {
    key: 'reindustrialisation-rapide',
    branch: 'industry',
    label: 'Réindustrialisation rapide',
    effect: { budget: 3, momentum: 5, trust: -1 },
    excludes: ['orthodoxie-budgetaire', 'priorite-services-publics'],
  },
  {
    key: 'complexe-tech-defense',
    branch: 'industry',
    label: 'Complexe tech-défense',
    effect: { order: 4, momentum: 4, trust: -2 },
    excludes: ['pacte-civique'],
  },
];

export const canUnlockDoctrine = (selectedKeys, doctrineKey) => {
  const doctrine = DOCTRINES.find((node) => node.key === doctrineKey);
  if (!doctrine) return false;

  return !selectedKeys.some((selected) => doctrine.excludes.includes(selected));
};
