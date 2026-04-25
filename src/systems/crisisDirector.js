import { getCurrentEra } from '../data/erasFrance';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const statKeys = ['trust', 'order', 'budget', 'momentum'];

const weightedPower = ({ trust, order, budget, momentum }) =>
  Math.round(trust * 0.25 + order * 0.3 + budget * 0.25 + momentum * 0.2);

const dominantStat = (state) =>
  statKeys.reduce((best, key) => (state[key] > state[best] ? key : best), 'trust');

const buildPressure = (state, pressureMagnitude) => {
  const pressureTarget = dominantStat(state);
  const spread = {
    trust: -Math.round(pressureMagnitude * 0.5),
    order: -Math.round(pressureMagnitude * 0.5),
    budget: -Math.round(pressureMagnitude * 0.4),
    momentum: -Math.round(pressureMagnitude * 0.4),
  };

  spread[pressureTarget] -= Math.round(pressureMagnitude * 0.6);

  return {
    key: `pressure-${pressureTarget}`,
    label: `Crise ciblée sur ${pressureTarget}`,
    effect: spread,
  };
};

const buildOpportunity = (state, opportunityMagnitude) => {
  const weakest = statKeys.reduce((worst, key) => (state[key] < state[worst] ? key : worst), 'trust');

  const boost = {
    trust: Math.round(opportunityMagnitude * 0.45),
    order: Math.round(opportunityMagnitude * 0.45),
    budget: Math.round(opportunityMagnitude * 0.35),
    momentum: Math.round(opportunityMagnitude * 0.35),
  };

  boost[weakest] += Math.round(opportunityMagnitude * 0.65);

  return {
    key: `opportunity-${weakest}`,
    label: `Fenêtre stratégique sur ${weakest}`,
    effect: boost,
  };
};

const sumEffects = (effects) =>
  effects.reduce(
    (acc, effect) => ({
      trust: acc.trust + (effect.trust ?? 0),
      order: acc.order + (effect.order ?? 0),
      budget: acc.budget + (effect.budget ?? 0),
      momentum: acc.momentum + (effect.momentum ?? 0),
    }),
    { trust: 0, order: 0, budget: 0, momentum: 0 },
  );

export const crisisDirector = (state) => {
  const era = getCurrentEra(state.turn);
  const power = weightedPower(state);
  const powerDelta = power - 50;

  const basePressure = clamp(Math.round(6 + Math.max(0, powerDelta) * 0.2), 2, 20);
  const baseOpportunity = clamp(Math.round(6 + Math.max(0, -powerDelta) * 0.2), 2, 20);

  const pressureMagnitude = Math.round(basePressure * era.pressure * (0.85 + Math.random() * 0.3));
  const opportunityMagnitude = Math.round(baseOpportunity * era.opportunity * (0.85 + Math.random() * 0.3));

  const pressure = buildPressure(state, pressureMagnitude);
  const opportunity = buildOpportunity(state, opportunityMagnitude);

  const netEffect = sumEffects([pressure.effect, opportunity.effect]);

  return {
    era,
    power,
    pressure,
    opportunity,
    effect: netEffect,
    intensity: {
      pressure: pressureMagnitude,
      opportunity: opportunityMagnitude,
    },
  };
};
