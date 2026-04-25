import { create } from 'zustand';
import { ACTIONS } from '../data/characters';
import { initialTerritories, runTerritoryTurnTick } from './slices/territorySlice';

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const fmt = (value = 0) => `${value >= 0 ? '+' : ''}${value}`;
const randomDelta = (range = 0) => (range <= 0 ? 0 : Math.round((Math.random() * 2 - 1) * range));

const NATIONAL_STATS = ['trust', 'order', 'budget', 'momentum', 'cohesion', 'growth', 'legitimacy'];

const applyEffect = (state, effect) => {
  const next = { ...state };
  NATIONAL_STATS.forEach((key) => {
    if (effect[key]) {
      next[key] = clamp(next[key] + effect[key]);
    }
  });
  return next;
};

const computeStatus = ({ turn, maxTurns, trust, order, budget, momentum, cohesion, growth, legitimacy }) => {
  if (turn > maxTurns) return { over: true, victory: true, reason: 'Mandat terminé. Victoire stratégique.' };
  if (trust <= 0) return { over: true, victory: false, reason: 'Perte totale de confiance populaire.' };
  if (order <= 0) return { over: true, victory: false, reason: 'Désordre national incontrôlable.' };
  if (budget <= 0) return { over: true, victory: false, reason: 'Faillite politique et économique.' };
  if (momentum <= 0) return { over: true, victory: false, reason: 'Campagne éteinte, plus aucun levier.' };
  if (cohesion <= 0) return { over: true, victory: false, reason: 'Cohésion nationale effondrée.' };
  if (legitimacy <= 0) return { over: true, victory: false, reason: 'Légitimité politique anéantie.' };
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
  cohesion: 50,
  growth: 50,
  legitimacy: 50,
  territories: initialTerritories,
  lastTerritorySummary: null,
  specialCharge: 0,
  logs: [],
  gameOver: false,
  victory: false,
  endReason: '',
};


const mapNationalLegacyStats = (state) => ({
  trust: clamp((state.legitimacy * 0.55) + (state.cohesion * 0.45)),
  order: clamp((state.cohesion * 0.65) + (state.legitimacy * 0.35)),
  budget: clamp((state.growth * 0.6) + (state.cohesion * 0.4)),
  momentum: clamp((state.growth * 0.4) + (state.legitimacy * 0.6)),
});

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
      cohesion: clamp((character.stats.order * 0.7) + (character.stats.trust * 0.3)),
      growth: clamp((character.stats.budget * 0.6) + (character.stats.momentum * 0.4)),
      legitimacy: clamp((character.stats.trust * 0.7) + (character.stats.momentum * 0.3)),
      territories: initialTerritories,
      lastTerritorySummary: null,
      logs: [{ turn: 1, text: `${character.name} entre dans l'arène sombre.` }],
    });
  },

  backToMenu: () => set({ ...initialState }),

  playAction: (actionKey) => {
    const state = get();
    if (state.gameOver || state.phase !== 'game') return;

    const action = ACTIONS.find((item) => item.key === actionKey);
    if (!action) return;

    const bonus = state.selectedCharacter.archetype.actionBonus[actionKey] ?? {};
    const effect = { ...action.effect };

    Object.entries(action.variance ?? {}).forEach(([stat, range]) => {
      effect[stat] = (effect[stat] ?? 0) + randomDelta(range);
    });

    Object.entries(bonus).forEach(([stat, value]) => {
      effect[stat] = (effect[stat] ?? 0) + value;
    });

    const afterAction = applyEffect(state, effect);
    const territoryTick = runTerritoryTurnTick(afterAction.territories);
    const afterTerritories = applyEffect(afterAction, {
      budget: territoryTick.summary.budgetDelta,
      cohesion: territoryTick.summary.cohesionDelta,
      growth: territoryTick.summary.growthDelta,
      legitimacy: territoryTick.summary.legitimacyDelta,
    });
    const afterTurn = {
      ...afterTerritories,
      ...mapNationalLegacyStats(afterTerritories),
      territories: territoryTick.territories,
      lastTerritorySummary: territoryTick.summary,
      turn: state.turn + 1,
      specialCharge: Math.min(100, state.specialCharge + 25),
      logs: [
        {
          turn: state.turn,
          text: `${action.label}: T${fmt(effect.trust ?? 0)}, O${fmt(effect.order ?? 0)}, B${fmt(effect.budget ?? 0)}, M${fmt(effect.momentum ?? 0)}`,
        },
        {
          turn: state.turn,
          text: `Tick territoires: ressources ${fmt(territoryTick.summary.resourceDelta)}, cohésion ${fmt(territoryTick.summary.cohesionDelta)}, croissance ${fmt(territoryTick.summary.growthDelta)}, légitimité ${fmt(territoryTick.summary.legitimacyDelta)}${territoryTick.summary.shortageCount ? `, pénuries ${territoryTick.summary.shortageCount}` : ''}`,
        },
        ...territoryTick.summary.events.slice(0, 2).map((evt) => ({ turn: state.turn, text: `Événement local — ${evt.text}` })),
        ...state.logs,
      ].slice(0, 10),
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
      ...mapNationalLegacyStats(applied),
      specialCharge: 0,
      logs: [{ turn: state.turn, text: `ULTIME — ${special.name}: ${special.text}` }, ...state.logs].slice(0, 8),
    };

    const status = computeStatus(afterSpecial);
    set({ ...afterSpecial, gameOver: status.over, victory: status.victory, endReason: status.reason });
  },
}));
