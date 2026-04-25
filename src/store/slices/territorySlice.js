import { applySupplyLines } from '../../systems/supplyLines';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

const makeRegion = (label, overrides = {}) => ({
  label,
  control: 60,
  stability: 60,
  prosperity: 55,
  infrastructure: 55,
  publicServices: 55,
  unrest: 35,
  stock: 40,
  ...overrides,
});

export const initialTerritories = {
  ile_de_france: makeRegion('Île-de-France', { control: 70, prosperity: 68, infrastructure: 72, publicServices: 66 }),
  hauts_de_france: makeRegion('Hauts-de-France', { prosperity: 52, infrastructure: 51, unrest: 40 }),
  grand_est: makeRegion('Grand Est', { stability: 63, infrastructure: 58 }),
  nouvelle_aquitaine: makeRegion('Nouvelle-Aquitaine', { prosperity: 59, infrastructure: 60, unrest: 30 }),
  occitanie: makeRegion('Occitanie', { control: 57, publicServices: 52, unrest: 42 }),
  paca: makeRegion('PACA', { prosperity: 63, infrastructure: 64, unrest: 38 }),
};

const chooseLocalEvent = (region) => {
  const roll = Math.random();

  if (roll < 0.12 + region.unrest / 500) {
    return {
      code: 'strike',
      text: `Grève à ${region.label}`,
      effect: { prosperity: -5, publicServices: -4, unrest: +7, stability: -3 },
    };
  }

  if (roll < 0.2 + (100 - region.infrastructure) / 450) {
    return {
      code: 'flood',
      text: `Crue soudaine en ${region.label}`,
      effect: { infrastructure: -6, prosperity: -3, publicServices: -2, unrest: +5 },
    };
  }

  if (roll < 0.3 + (100 - region.stock) / 500) {
    return {
      code: 'shortage',
      text: `Pénurie locale en ${region.label}`,
      effect: { prosperity: -4, publicServices: -5, stability: -3, unrest: +6 },
    };
  }

  if (roll > 0.88 && region.prosperity > 45) {
    return {
      code: 'innovation',
      text: `Innovation territoriale en ${region.label}`,
      effect: { prosperity: +6, infrastructure: +4, stability: +2, unrest: -4 },
    };
  }

  return null;
};

const applyRegionEffect = (region, effect) => {
  const next = { ...region };
  Object.entries(effect).forEach(([key, value]) => {
    next[key] = clamp((next[key] ?? 0) + value);
  });
  return next;
};

export const runTerritoryTurnTick = (territories) => {
  const supplyMap = applySupplyLines(territories);
  const nextTerritories = {};
  const events = [];

  let productionTotal = 0;
  let upkeepTotal = 0;
  let shortageCount = 0;

  Object.entries(territories).forEach(([regionId, region]) => {
    const supplyFactor = supplyMap[regionId] ?? 1;

    // Phase 1: production régionale
    const productionBase = (region.prosperity * 0.42 + region.infrastructure * 0.28 + region.control * 0.2 + region.stability * 0.1)
      * supplyFactor;
    const production = Math.max(0, Math.round(productionBase / 5));

    // Phase 2: consommation / entretien
    const upkeep = Math.max(5, Math.round((region.infrastructure * 0.4 + region.publicServices * 0.4 + region.unrest * 0.2) / 6));
    const net = production - upkeep;

    let updated = {
      ...region,
      stock: clamp(region.stock + net),
      prosperity: clamp(region.prosperity + Math.round(net / 4)),
      publicServices: clamp(region.publicServices + Math.round((net - 2) / 5)),
      unrest: clamp(region.unrest + (net < 0 ? 3 : -1)),
      stability: clamp(region.stability + (net < 0 ? -2 : 1)),
    };

    if (updated.stock < 18) {
      shortageCount += 1;
      updated = applyRegionEffect(updated, { prosperity: -3, publicServices: -3, unrest: +4 });
    }

    // Phase 3: événement local
    const event = chooseLocalEvent(updated);
    if (event) {
      updated = applyRegionEffect(updated, event.effect);
      events.push({ regionId, text: event.text, code: event.code });
    }

    nextTerritories[regionId] = updated;
    productionTotal += production;
    upkeepTotal += upkeep;
  });

  const regions = Object.values(nextTerritories);
  const avg = (key) => regions.reduce((acc, region) => acc + region[key], 0) / Math.max(1, regions.length);

  const summary = {
    budgetDelta: Math.round((productionTotal - upkeepTotal) / 2),
    resourceDelta: productionTotal - upkeepTotal,
    cohesionDelta: Math.round((avg('stability') - avg('unrest')) / 20),
    growthDelta: Math.round((avg('prosperity') + avg('infrastructure') - 100) / 20),
    legitimacyDelta: Math.round((avg('control') + avg('publicServices') - avg('unrest') - 50) / 25),
    shortageCount,
    supplyMap,
    events,
  };

  return { territories: nextTerritories, summary };
};
