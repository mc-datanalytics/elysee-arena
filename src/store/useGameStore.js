import { create } from 'zustand';
import { ACTIONS_STRATEGIC } from '../data/actionsStrategic';

const REGION_NAMES = [
  'Île-de-France',
  'Hauts-de-France',
  'Grand Est',
  'Occitanie',
  'Provence-Alpes-Côte d’Azur',
  'Nouvelle-Aquitaine',
];

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const fmt = (value = 0) => `${value >= 0 ? '+' : ''}${value}`;
const randomDelta = (range = 0) => (range <= 0 ? 0 : Math.round((Math.random() * 2 - 1) * range));

const applyEffect = (state, effect) => {
  const next = { ...state };
  ['trust', 'order', 'budget', 'momentum'].forEach((key) => {
    if (effect[key]) {
      next[key] = clamp(next[key] + effect[key]);
    }
  });
  return next;
};

const computeStatus = ({ turn, maxTurns, trust, order, budget, momentum }) => {
  if (turn > maxTurns) return { over: true, victory: true, reason: 'Mandat terminé. Victoire stratégique.' };
  if (trust <= 0) return { over: true, victory: false, reason: 'Perte totale de confiance populaire.' };
  if (order <= 0) return { over: true, victory: false, reason: 'Désordre national incontrôlable.' };
  if (budget <= 0) return { over: true, victory: false, reason: 'Faillite politique et économique.' };
  if (momentum <= 0) return { over: true, victory: false, reason: 'Campagne éteinte, plus aucun levier.' };
  return { over: false, victory: false, reason: '' };
};

const mkEvent = (turn, regionName) => {
  const pool = [
    `Rumeur d’alliance locale à ${regionName}`,
    `Blocage logistique dans ${regionName}`,
    `Tension préfectorale détectée à ${regionName}`,
    `Micro-mobilisation citoyenne dans ${regionName}`,
  ];
  return {
    id: `${regionName}-${turn}-${Math.random().toString(36).slice(2, 7)}`,
    text: pool[Math.floor(Math.random() * pool.length)],
    turn,
    discoveredTurn: null,
  };
};

const createRegionalIntel = (trust, order, budget, momentum) =>
  REGION_NAMES.map((name, index) => ({
    id: `region-${index + 1}`,
    name,
    actualStats: {
      trust: clamp(trust + randomDelta(14)),
      order: clamp(order + randomDelta(14)),
      budget: clamp(budget + randomDelta(14)),
      momentum: clamp(momentum + randomDelta(14)),
    },
    intel: {
      knownStats: {},
      lastUpdatedTurn: 0,
      confidence: 0,
    },
    events: [],
  }));

const revealRegionalIntel = (region, turn, confidenceBoost, revealEvents = 1) => {
  const nextConfidence = clamp((region.intel.confidence ?? 0) + confidenceBoost);
  const knownStats = nextConfidence >= 70 ? { ...region.actualStats } : { ...region.intel.knownStats };
  const events = region.events.map((event, idx) => {
    if (event.discoveredTurn || idx >= revealEvents) return event;
    return { ...event, discoveredTurn: turn };
  });
  return {
    ...region,
    intel: {
      knownStats,
      lastUpdatedTurn: turn,
      confidence: nextConfidence,
    },
    events,
  };
};

const applyIntelToRegions = (regionalIntel, turn, intelAction) => {
  const sorted = [...regionalIntel].sort((a, b) => a.intel.lastUpdatedTurn - b.intel.lastUpdatedTurn);
  const selected = new Set(sorted.slice(0, intelAction.targetCount).map((region) => region.id));

  return regionalIntel.map((region) => {
    if (!selected.has(region.id)) return region;
    return revealRegionalIntel(region, turn, intelAction.confidenceBoost, intelAction.revealEvents);
  });
};

const evolveRegions = (regionalIntel, turn, maintainFullVision) =>
  regionalIntel.map((region) => {
    const actualStats = {
      trust: clamp(region.actualStats.trust + randomDelta(3)),
      order: clamp(region.actualStats.order + randomDelta(3)),
      budget: clamp(region.actualStats.budget + randomDelta(2)),
      momentum: clamp(region.actualStats.momentum + randomDelta(3)),
    };

    let events = region.events;
    if (Math.random() < 0.35) {
      events = [{ ...mkEvent(turn, region.name) }, ...events].slice(0, 4);
    }

    let nextRegion = { ...region, actualStats, events };

    if (maintainFullVision) {
      nextRegion = {
        ...nextRegion,
        intel: {
          knownStats: { ...actualStats },
          lastUpdatedTurn: turn,
          confidence: 100,
        },
        events: nextRegion.events.map((event) => ({
          ...event,
          discoveredTurn: event.discoveredTurn ?? turn,
        })),
      };
    } else {
      nextRegion = {
        ...nextRegion,
        intel: {
          ...nextRegion.intel,
          confidence: Math.max(0, nextRegion.intel.confidence - 8),
        },
      };
    }

    return nextRegion;
  });

const initialState = {
  phase: 'menu',
  selectedCharacter: null,
  turn: 1,
  maxTurns: 24,
  trust: 50,
  order: 50,
  budget: 50,
  momentum: 50,
  specialCharge: 0,
  logs: [],
  gameOver: false,
  victory: false,
  endReason: '',
  regionalIntel: [],
  maintainFullVision: false,
};

export const useGameStore = create((set, get) => ({
  ...initialState,

  startRun: (character) => {
    set({
      ...initialState,
      phase: 'game',
      selectedCharacter: character,
      trust: character.stats.trust,
      order: character.stats.order,
      budget: character.stats.budget,
      momentum: character.stats.momentum,
      regionalIntel: createRegionalIntel(
        character.stats.trust,
        character.stats.order,
        character.stats.budget,
        character.stats.momentum,
      ),
      logs: [{ turn: 1, text: `${character.name} entre dans l'arène sombre.` }],
    });
  },

  backToMenu: () => set({ ...initialState }),

  toggleNationalVision: () => {
    const state = get();
    if (state.phase !== 'game' || state.gameOver) return;
    const next = !state.maintainFullVision;
    set({
      maintainFullVision: next,
      logs: [{ turn: state.turn, text: next ? 'Vision nationale complète activée.' : 'Vision nationale complète désactivée.' }, ...state.logs].slice(0, 8),
    });
  },

  playAction: (actionKey) => {
    const state = get();
    if (state.gameOver || state.phase !== 'game') return;

    const action = ACTIONS_STRATEGIC.find((item) => item.key === actionKey);
    if (!action) return;

    const bonus = state.selectedCharacter.archetype.actionBonus[actionKey] ?? {};
    const effect = { ...action.effect };

    Object.entries(action.variance ?? {}).forEach(([stat, range]) => {
      effect[stat] = (effect[stat] ?? 0) + randomDelta(range);
    });

    Object.entries(bonus).forEach(([stat, value]) => {
      effect[stat] = (effect[stat] ?? 0) + value;
    });

    if (state.maintainFullVision) {
      effect.budget = (effect.budget ?? 0) - 3;
      effect.momentum = (effect.momentum ?? 0) - 2;
    }

    const afterAction = applyEffect(state, effect);

    let regionalIntel = evolveRegions(state.regionalIntel, state.turn, state.maintainFullVision);
    if (action.intel) {
      regionalIntel = applyIntelToRegions(regionalIntel, state.turn, action.intel);
    }

    const afterTurn = {
      ...afterAction,
      regionalIntel,
      turn: state.turn + 1,
      specialCharge: Math.min(100, state.specialCharge + 25),
      logs: [
        {
          turn: state.turn,
          text: `${action.label}: T${fmt(effect.trust ?? 0)}, O${fmt(effect.order ?? 0)}, B${fmt(effect.budget ?? 0)}, M${fmt(effect.momentum ?? 0)}${state.maintainFullVision ? ' · coût vision nationale' : ''}`,
        },
        ...state.logs,
      ].slice(0, 8),
    };

    const status = computeStatus(afterTurn);
    set({ ...afterTurn, gameOver: status.over, victory: status.victory, endReason: status.reason });
  },

  useSpecial: () => {
    const state = get();
    if (state.gameOver || state.specialCharge < 100 || state.phase !== 'game') return;

    const special = state.selectedCharacter.archetype.special;
    const applied = applyEffect(state, special.effect);
    const afterSpecial = {
      ...applied,
      specialCharge: 0,
      logs: [{ turn: state.turn, text: `ULTIME — ${special.name}: ${special.text}` }, ...state.logs].slice(0, 8),
    };

    const status = computeStatus(afterSpecial);
    set({ ...afterSpecial, gameOver: status.over, victory: status.victory, endReason: status.reason });
  },
}));
