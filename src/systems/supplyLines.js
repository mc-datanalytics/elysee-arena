const clamp01 = (value) => Math.max(0, Math.min(1, value));
const round = (value, precision = 2) => Number(value.toFixed(precision));

// Corridors simplifiés: les hubs/ports alimentent des régions dépendantes.
export const SUPPLY_CORRIDORS = [
  { source: 'ile_de_france', targets: ['grand_est', 'hauts_de_france'], type: 'rail-hub' },
  { source: 'paca', targets: ['occitanie'], type: 'port' },
  { source: 'nouvelle_aquitaine', targets: ['occitanie'], type: 'road-hub' },
];

const sourceReliability = (region) => {
  if (!region) return 0;

  const control = region.control / 100;
  const infrastructure = region.infrastructure / 100;
  const unrestPenalty = 1 - region.unrest / 100;

  return clamp01(control * 0.45 + infrastructure * 0.4 + unrestPenalty * 0.15);
};

export const applySupplyLines = (territories) => {
  const supplyByRegion = Object.fromEntries(Object.keys(territories).map((key) => [key, 1]));

  SUPPLY_CORRIDORS.forEach((corridor) => {
    const reliability = sourceReliability(territories[corridor.source]);
    corridor.targets.forEach((target) => {
      if (!(target in supplyByRegion)) return;
      supplyByRegion[target] = Math.min(supplyByRegion[target], reliability);
    });
  });

  return Object.fromEntries(
    Object.entries(supplyByRegion).map(([regionId, value]) => [regionId, round(value)]),
  );
};
