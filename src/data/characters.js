const PHOTO_FILES = [
  'BRUNO RETAILLEAU_france.jpeg',
  'EMMANUEL MACRON_france.jpeg',
  'ÉDOUARD PHILIPPE_france.jpeg',
  'sandrine_rousseau_france.jpeg',
  'OLIVIER FAURE_france.jpeg',
  'NICOLAS SARKOZY_france.jpeg',
  'MARINE TONDELIER_france.jpeg',
  'JORDAN BARDELLA_france.jpeg',
  'SARAH KNAFO_france.jpeg',
  'RAPHAËL GLUCKSMANN_france.jpeg',
  'FRANÇOIS RUFFIN_france.jpeg',
  'JEAN LASSALLE_france.jpeg',
  'GABRIEL ATTAL_france.jpeg',
  'JEAN-LUC MÉLENCHON_france.jpeg',
  'VALÉRIE PÉCRESSE_france.jpeg',
  'FRANÇOIS BAYROU_france.jpeg',
  'FRANÇOIS ASSELINEAU_france.jpeg',
  'MATHILDE PANOT_france.jpeg',
  'MARINE LE PEN_france.jpeg',
  'francois_hollande_france.jpeg',
  'SÉBASTIEN DELOGU_france.jpeg',
  'ERIC ZEMMOUR_france.jpeg',
];

const ARCHETYPES = [
  {
    name: 'Stratège d’Ombre',
    passive: '+2 Ordre sur actions de contrôle',
    actionBonus: { control: { order: 2 } },
    special: {
      name: 'Couvre-feu Narratif',
      effect: { order: 12, trust: -4, budget: -3, momentum: 4 },
      text: 'Rétablit l’ordre au prix de la confiance.',
    },
  },
  {
    name: 'Tribun Viral',
    passive: '+2 Momentum sur actions média',
    actionBonus: { media: { momentum: 2 } },
    special: {
      name: 'Discours Choc',
      effect: { trust: 10, momentum: 10, order: -4 },
      text: 'Mobilise les foules, polarise le pays.',
    },
  },
  {
    name: 'Technocrate Froid',
    passive: '+2 Budget sur actions réforme',
    actionBonus: { reform: { budget: 2 } },
    special: {
      name: 'Plan d’Austérité 2.0',
      effect: { budget: 14, trust: -6, order: 3 },
      text: 'Assainit les comptes, impopulaire sur le court terme.',
    },
  },
  {
    name: 'Populiste Électrique',
    passive: '+2 Trust sur actions sociale',
    actionBonus: { social: { trust: 2 } },
    special: {
      name: 'Référendum Flash',
      effect: { trust: 11, order: -5, momentum: 6 },
      text: 'Pic de popularité, stabilité en tension.',
    },
  },
];

const normalizeName = (file) =>
  file
    .replace('_france.jpeg', '')
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((token) => (token.includes('-') ? token : token.charAt(0) + token.slice(1).toLowerCase()))
    .join(' ');

const hash = (value) => [...value].reduce((acc, char) => acc + char.charCodeAt(0), 0);

const bounded = (value, min = 25, max = 95) => Math.max(min, Math.min(max, value));

export const characters = PHOTO_FILES.map((file, index) => {
  const name = normalizeName(file);
  const seed = hash(name);
  const archetype = ARCHETYPES[seed % ARCHETYPES.length];

  return {
    id: `char-${index + 1}`,
    name,
    portrait: `/characters/${file}`,
    archetype,
    lore: `Chef de faction en mode dark-politique. Objectif: tenir ${18 + (seed % 7)} mois sans implosion nationale.`,
    stats: {
      trust: bounded(40 + (seed % 45)),
      order: bounded(35 + ((seed * 3) % 50)),
      budget: bounded(30 + ((seed * 5) % 55)),
      momentum: bounded(25 + ((seed * 7) % 60)),
    },
  };
});
