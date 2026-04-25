import { create } from 'zustand';
import { ACTIONS } from '../data/characters';

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const fmt = (value = 0) => `${value >= 0 ? '+' : ''}${value}`;
const randomDelta = (range = 0) => (range <= 0 ? 0 : Math.round((Math.random() * 2 - 1) * range));

export const MAP_FILTERS = {
  economy: { label: 'Économie', stat: 'economy' },
  security: { label: 'Sécurité', stat: 'security' },
  infrastructures: { label: 'Infrastructures', stat: 'infrastructure' },
  opinion: { label: 'Opinion publique', stat: 'opinion' },
};

export const GOVERNMENT_PRIORITIES = [
  {
    key: 'industrialPush',
    label: 'Plan industriel',
    description: 'Boost économie/infrastructures mais tension sociale.',
    buffs: { budget: 2, energy: 2 },
    nerfs: { cohesion: -2 },
  },
  {
    key: 'securityDoctrine',
    label: 'Doctrine de sécurité',
    description: 'Renforce ordre et contrôle, freine influence externe.',
    buffs: { order: 3, publicOrder: 3 },
    nerfs: { externalInfluence: -2 },
  },
  {
    key: 'socialPact',
    label: 'Pacte social',
    description: 'Remonte cohésion/opinion, coûte du budget.',
    buffs: { trust: 2, cohesion: 3 },
    nerfs: { budget: -3 },
  },
  {
    key: 'greenTransition',
    label: 'Transition verte',
    description: 'Améliore énergie durable, ralentit logistique court terme.',
    buffs: { energy: 3, momentum: 1 },
    nerfs: { order: -1, publicOrder: -1 },
  },
  {
    key: 'globalDiplomacy',
    label: 'Diplomatie globale',
    description: 'Augmente influence externe, réduit posture sécuritaire.',
    buffs: { externalInfluence: 3, momentum: 2 },
    nerfs: { order: -2 },
  },
];

const INITIAL_REGIONS = [
  {
    id: 'idf',
    name: 'Île-de-France',
    production: 'Services stratégiques',
    risks: 'Pression sociale urbaine',
    projects: ['Hub IA souverain', 'Modernisation des transports'],
    loyalty: 58,
    logistics: 72,
    economy: 70,
    security: 52,
    infrastructure: 78,
    opinion: 49,
  },
  {
    id: 'naq',
    name: 'Nouvelle-Aquitaine',
    production: 'Agri-tech & énergie',
    risks: 'Tensions hydriques',
    projects: ['Canaux agricoles', 'Parcs offshore'],
    loyalty: 55,
    logistics: 61,
    economy: 64,
    security: 57,
    infrastructure: 59,
    opinion: 53,
  },
  {
    id: 'ara',
    name: 'Auvergne-Rhône-Alpes',
    production: 'Industrie de pointe',
    risks: 'Saturation logistique',
    projects: ['Corridor fret alpin', 'Campus robotique'],
    loyalty: 62,
    logistics: 68,
    economy: 73,
    security: 63,
    infrastructure: 65,
    opinion: 56,
  },
  {
    id: 'hdf',
    name: 'Hauts-de-France',
    production: 'Logistique lourde',
    risks: 'Fragilité emploi local',
    projects: ['Relance sidérurgique', 'RER transfrontalier'],
    loyalty: 50,
    logistics: 66,
    economy: 59,
    security: 60,
    infrastructure: 62,
    opinion: 47,
  },
  {
    id: 'occ',
    name: 'Occitanie',
    production: 'Aérospatial',
    risks: 'Vulnérabilité cyber',
    projects: ['Bouclier cyber régional', 'Ligne hydrogène'],
    loyalty: 57,
    logistics: 58,
    economy: 67,
    security: 51,
    infrastructure: 55,
    opinion: 54,
  },
  {
    id: 'paca',
    name: 'PACA',
    production: 'Ports & tourisme',
    risks: 'Crime organisé',
    projects: ['Port autonome 2030', 'Plan anti-rackets'],
    loyalty: 46,
    logistics: 63,
    economy: 62,
    security: 44,
    infrastructure: 57,
    opinion: 45,
  },
];

const withLegacyLinks = (effect) => {
  const linked = { ...effect };

  if (linked.trust != null && linked.cohesion == null) linked.cohesion = linked.trust;
  if (linked.order != null && linked.publicOrder == null) linked.publicOrder = linked.order;
  if (linked.momentum != null && linked.externalInfluence == null) linked.externalInfluence = Math.round(linked.momentum * 0.5);

  return linked;
};

const applyPriorities = (effect, selectedPriorities) => {
  const next = { ...effect };
  selectedPriorities
    .map((priorityKey) => GOVERNMENT_PRIORITIES.find((item) => item.key === priorityKey))
    .filter(Boolean)
    .forEach((priority) => {
      Object.entries(priority.buffs).forEach(([key, value]) => {
        next[key] = (next[key] ?? 0) + value;
      });

      Object.entries(priority.nerfs).forEach(([key, value]) => {
        next[key] = (next[key] ?? 0) + value;
      });
    });

  return next;
};

const applyEffect = (state, effect) => {
  const next = { ...state };
  ['trust', 'order', 'budget', 'momentum', 'energy', 'cohesion', 'publicOrder', 'externalInfluence'].forEach((key) => {
    if (effect[key] != null) {
      next[key] = clamp(next[key] + effect[key]);
    }
  });
  return next;
};

const evolveRegions = (regions, effect) =>
  regions.map((region) => ({
    ...region,
    loyalty: clamp(region.loyalty + (effect.trust ?? 0) * 0.25 + randomDelta(2)),
    logistics: clamp(region.logistics + (effect.budget ?? 0) * 0.2 + (effect.energy ?? 0) * 0.3 + randomDelta(2)),
    economy: clamp(region.economy + (effect.budget ?? 0) * 0.5 + randomDelta(3)),
    security: clamp(region.security + (effect.order ?? 0) * 0.45 + randomDelta(3)),
    infrastructure: clamp(region.infrastructure + (effect.energy ?? 0) * 0.4 + randomDelta(3)),
    opinion: clamp(region.opinion + (effect.trust ?? 0) * 0.45 + randomDelta(3)),
  }));

const buildAlerts = (state) => {
  const alerts = [];
  const thresholds = [
    ['budget', 'Budget sous stress critique'],
    ['energy', 'Tension énergétique nationale'],
    ['cohesion', 'Cohésion nationale en baisse'],
    ['publicOrder', 'Ordre public fragilisé'],
    ['externalInfluence', 'Décrochage diplomatique'],
  ];

  thresholds.forEach(([key, title], index) => {
    if (state[key] < 35) {
      alerts.push({
        id: `${key}-${state.turn}`,
        title,
        message: `Niveau actuel: ${state[key]}%. Réponse gouvernementale urgente requise.`,
        urgency: 100 - state[key] - index,
      });
    }
  });

  state.regions.forEach((region) => {
    const localRisk = 100 - (region.security + region.opinion) / 2;
    if (localRisk > 42) {
      alerts.push({
        id: `${region.id}-${state.turn}`,
        title: `Alerte régionale · ${region.name}`,
        message: `${region.risks} · loyauté ${region.loyalty}% · logistique ${region.logistics}%.`,
        urgency: Math.round(localRisk),
      });
    }
  });

  return alerts.sort((a, b) => b.urgency - a.urgency).slice(0, 5);
};

const computeStatus = ({ turn, maxTurns, trust, order, budget, momentum }) => {
  if (turn > maxTurns) return { over: true, victory: true, reason: 'Mandat terminé. Victoire stratégique.' };
  if (trust <= 0) return { over: true, victory: false, reason: 'Perte totale de confiance populaire.' };
  if (order <= 0) return { over: true, victory: false, reason: 'Désordre national incontrôlable.' };
  if (budget <= 0) return { over: true, victory: false, reason: 'Faillite politique et économique.' };
  if (momentum <= 0) return { over: true, victory: false, reason: 'Campagne éteinte, plus aucun levier.' };
  return { over: false, victory: false, reason: '' };
};

const initialState = {
  phase: 'menu',
  selectedCharacter: null,
  turn: 1,
  maxTurns: 24,
  trust: 50,
  order: 50,
  budget: 50,
  momentum: 50,
  energy: 50,
  cohesion: 50,
  publicOrder: 50,
  externalInfluence: 50,
  activeMapFilter: 'economy',
  selectedRegionId: null,
  governmentPriorities: [],
  regions: INITIAL_REGIONS,
  alerts: [],
  specialCharge: 0,
  logs: [],
  gameOver: false,
  victory: false,
  endReason: '',
};

export const useGameStore = create((set, get) => ({
  ...initialState,

  startRun: (character) => {
    const seededRegions = INITIAL_REGIONS.map((region) => ({
      ...region,
      loyalty: clamp(region.loyalty + randomDelta(5)),
      opinion: clamp(region.opinion + randomDelta(5)),
    }));

    const seededState = {
      ...initialState,
      phase: 'game',
      selectedCharacter: character,
      trust: character.stats.trust,
      order: character.stats.order,
      budget: character.stats.budget,
      momentum: character.stats.momentum,
      energy: clamp(character.stats.momentum + randomDelta(8)),
      cohesion: clamp(character.stats.trust + randomDelta(8)),
      publicOrder: clamp(character.stats.order + randomDelta(6)),
      externalInfluence: clamp(character.stats.momentum + randomDelta(10)),
      regions: seededRegions,
      logs: [{ turn: 1, text: `${character.name} entre dans l'arène sombre.` }],
    };

    set({ ...seededState, alerts: buildAlerts(seededState) });
  },

  backToMenu: () => set({ ...initialState }),

  setActiveMapFilter: (filterKey) => {
    if (!MAP_FILTERS[filterKey]) return;
    set({ activeMapFilter: filterKey });
  },

  selectRegion: (regionId) => set({ selectedRegionId: regionId }),

  toggleGovernmentPriority: (priorityKey) => {
    set((state) => {
      const exists = state.governmentPriorities.includes(priorityKey);
      if (exists) {
        return { governmentPriorities: state.governmentPriorities.filter((key) => key !== priorityKey) };
      }

      if (state.governmentPriorities.length >= 3) return state;

      return { governmentPriorities: [...state.governmentPriorities, priorityKey] };
    });
  },

  playAction: (actionKey) => {
    const state = get();
    if (state.gameOver || state.phase !== 'game') return;

    const action = ACTIONS.find((item) => item.key === actionKey);
    if (!action) return;

    const bonus = state.selectedCharacter.archetype.actionBonus[actionKey] ?? {};
    let effect = { ...action.effect };

    Object.entries(action.variance ?? {}).forEach(([stat, range]) => {
      effect[stat] = (effect[stat] ?? 0) + randomDelta(range);
    });

    Object.entries(bonus).forEach(([stat, value]) => {
      effect[stat] = (effect[stat] ?? 0) + value;
    });

    effect = withLegacyLinks(applyPriorities(effect, state.governmentPriorities));

    const afterAction = applyEffect(state, effect);
    const regions = evolveRegions(state.regions, effect);
    const afterTurn = {
      ...afterAction,
      regions,
      turn: state.turn + 1,
      specialCharge: Math.min(100, state.specialCharge + 25),
      logs: [
        {
          turn: state.turn,
          text: `${action.label}: T${fmt(effect.trust ?? 0)}, O${fmt(effect.order ?? 0)}, B${fmt(effect.budget ?? 0)}, M${fmt(effect.momentum ?? 0)}`,
        },
        ...state.logs,
      ].slice(0, 8),
    };

    const status = computeStatus(afterTurn);
    set({
      ...afterTurn,
      alerts: buildAlerts(afterTurn),
      gameOver: status.over,
      victory: status.victory,
      endReason: status.reason,
    });
  },

  useSpecial: () => {
    const state = get();
    if (state.gameOver || state.specialCharge < 100 || state.phase !== 'game') return;

    const special = state.selectedCharacter.archetype.special;
    const specialEffect = withLegacyLinks(special.effect);
    const applied = applyEffect(state, specialEffect);
    const regions = evolveRegions(state.regions, specialEffect);
    const afterSpecial = {
      ...applied,
      regions,
      specialCharge: 0,
      logs: [{ turn: state.turn, text: `ULTIME — ${special.name}: ${special.text}` }, ...state.logs].slice(0, 8),
    };

    const status = computeStatus(afterSpecial);
    set({
      ...afterSpecial,
      alerts: buildAlerts(afterSpecial),
      gameOver: status.over,
      victory: status.victory,
      endReason: status.reason,
    });
  },
}));
