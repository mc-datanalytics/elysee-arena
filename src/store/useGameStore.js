import { create } from 'zustand';
import { ACTIONS } from '../data/characters';

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
    const afterTurn = {
      ...afterAction,
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
