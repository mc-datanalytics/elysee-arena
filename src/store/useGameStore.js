import { create } from 'zustand';

export const useGameStore = create((set) => ({
  mode: null, // 'normal' | 'realistic'
  selectedPolitician: null,
  currentTurn: 1,
  maxTurns: 60, // 5 years = 60 months
  
  // Gauges (0-100)
  popularity: 50,
  budget: 50,
  order: 50,
  support: 50,
  
  government: [], // list of appointed ministers
  eventLog: [],
  ultimateCooldown: 0,
  
  setMode: (mode) => set({ mode }),
  selectPolitician: (politician) => set({ selectedPolitician: politician }),
  
  // Game Actions
  nextTurn: () => set((state) => ({ 
    currentTurn: state.currentTurn + 1,
    ultimateCooldown: Math.max(0, state.ultimateCooldown - 1)
  })),
  updateGauge: (gauge, amount) => set((state) => ({
    [gauge]: Math.max(0, Math.min(100, state[gauge] + amount))
  })),
  
  addEventLog: (message) => set((state) => ({
    eventLog: [{ turn: state.currentTurn, message }, ...state.eventLog]
  })),

  useSkill: (skill) => set((state) => {
    // Basic implementation: logs the skill use
    return {
      eventLog: [{ turn: state.currentTurn, message: `A utilisé la compétence : ${skill.name}` }, ...state.eventLog],
      popularity: Math.min(100, state.popularity + 2) // Example slight bump
    };
  }),

  useUltimate: (ultimate) => set((state) => {
    if (state.ultimateCooldown > 0) return state; // Prevent if on cooldown
    return {
      ultimateCooldown: 12, // 12 turns cooldown
      eventLog: [{ turn: state.currentTurn, message: `🔥 CAPACITÉ ULTIME DÉCLENCHÉE : ${ultimate.name} 🔥` }, ...state.eventLog],
      order: Math.max(0, state.order - 20) // Dramatic effect
    };
  }),
  
  resetGame: () => set({
    mode: null,
    selectedPolitician: null,
    currentTurn: 1,
    popularity: 50,
    budget: 50,
    order: 50,
    support: 50,
    government: [],
    eventLog: [],
    ultimateCooldown: 0
  })
}));
