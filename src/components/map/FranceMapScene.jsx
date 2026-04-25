import { useMemo, useState } from 'react';
import RegionTile from './RegionTile';
import '../../styles/map.css';

const REGIONS = [
  {
    id: 'idf',
    name: 'Île-de-France',
    capital: 'Paris',
    x: 43,
    y: 31,
    width: 13,
    height: 10,
    tension: 84,
    influence: 62,
    routes: ['hauts', 'centre'],
    badges: [{ icon: '⚖', label: 'Gouvernance' }, { icon: '⚡', label: 'Pression sociale' }],
  },
  {
    id: 'hauts',
    name: 'Hauts-de-France',
    capital: 'Lille',
    x: 41,
    y: 15,
    width: 16,
    height: 11,
    tension: 46,
    influence: 35,
    routes: ['idf'],
    badges: [{ icon: '⚓', label: 'Ports du nord' }],
  },
  {
    id: 'grandest',
    name: 'Grand Est',
    capital: 'Strasbourg',
    x: 56,
    y: 24,
    width: 17,
    height: 16,
    tension: 58,
    influence: 45,
    routes: ['idf', 'aura'],
    badges: [{ icon: '🛡', label: 'Frontière sensible' }],
  },
  {
    id: 'bretagne',
    name: 'Bretagne',
    capital: 'Rennes',
    x: 20,
    y: 30,
    width: 15,
    height: 12,
    tension: 31,
    influence: 51,
    routes: ['pdl'],
    badges: [{ icon: '🌊', label: 'Façade atlantique' }],
  },
  {
    id: 'na',
    name: 'Nouvelle-Aquitaine',
    capital: 'Bordeaux',
    x: 28,
    y: 49,
    width: 24,
    height: 19,
    tension: 42,
    influence: 56,
    routes: ['occitanie', 'centre'],
    badges: [{ icon: '🌾', label: 'Approvisionnement' }],
  },
  {
    id: 'aura',
    name: 'Auvergne-Rhône-Alpes',
    capital: 'Lyon',
    x: 55,
    y: 47,
    width: 20,
    height: 18,
    tension: 67,
    influence: 59,
    routes: ['paca', 'occitanie'],
    badges: [{ icon: '⛰', label: 'Arc alpin' }],
  },
  {
    id: 'paca',
    name: 'Provence-Alpes-Côte d’Azur',
    capital: 'Marseille',
    x: 61,
    y: 68,
    width: 20,
    height: 12,
    tension: 73,
    influence: 39,
    routes: ['occitanie'],
    badges: [{ icon: '☀', label: 'Littoral stratégique' }],
  },
  {
    id: 'occitanie',
    name: 'Occitanie',
    capital: 'Toulouse',
    x: 43,
    y: 67,
    width: 20,
    height: 12,
    tension: 55,
    influence: 49,
    routes: [],
    badges: [{ icon: '🛰', label: 'Hub spatial' }],
  },
  {
    id: 'centre',
    name: 'Centre-Val de Loire',
    capital: 'Orléans',
    x: 41,
    y: 43,
    width: 14,
    height: 11,
    tension: 37,
    influence: 47,
    routes: [],
    badges: [{ icon: '🏛', label: 'Couloir institutionnel' }],
  },
  {
    id: 'pdl',
    name: 'Pays de la Loire',
    capital: 'Nantes',
    x: 31,
    y: 40,
    width: 13,
    height: 11,
    tension: 28,
    influence: 33,
    routes: [],
    badges: [{ icon: '⚙', label: 'Industrie navale' }],
  },
];

const EVENTS = [
  { id: 'ev-1', label: 'Blocage logistique', x: 49, y: 54, severity: 'medium' },
  { id: 'ev-2', label: 'Manifestations', x: 47, y: 35, severity: 'high' },
  { id: 'ev-3', label: 'Accord diplomatique', x: 66, y: 72, severity: 'low' },
];

export default function FranceMapScene() {
  const [selectedRegionId, setSelectedRegionId] = useState('idf');
  const [hoveredRegionId, setHoveredRegionId] = useState('');
  const [zoom, setZoom] = useState(1);

  const regionsById = useMemo(() => Object.fromEntries(REGIONS.map((region) => [region.id, region])), []);

  const selectedRegion = regionsById[selectedRegionId] ?? REGIONS[0];

  const routes = useMemo(() => {
    const edges = [];

    REGIONS.forEach((region) => {
      region.routes.forEach((targetId) => {
        const target = regionsById[targetId];
        if (!target) {
          return;
        }

        const edgeKey = [region.id, target.id].sort().join('-');
        if (edges.some((edge) => edge.key === edgeKey)) {
          return;
        }

        edges.push({
          key: edgeKey,
          x1: region.x + region.width / 2,
          y1: region.y + region.height / 2,
          x2: target.x + target.width / 2,
          y2: target.y + target.height / 2,
        });
      });
    });

    return edges;
  }, [regionsById]);

  const theaters = useMemo(
    () => REGIONS.filter((region) => region.tension >= 60 || region.influence >= 60 || region.id === selectedRegionId),
    [selectedRegionId],
  );

  return (
    <section className="france-map-shell" aria-label="Carte stratégique de la France">
      <header className="france-map-toolbar">
        <strong>Situation nationale</strong>
        <div className="zoom-controls">
          <button type="button" onClick={() => setZoom((value) => Math.max(0.75, Number((value - 0.1).toFixed(2))))}>−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((value) => Math.min(1.35, Number((value + 0.1).toFixed(2))))}>+</button>
        </div>
      </header>

      <div className="france-map-stage">
        <div className="france-map-board" style={{ transform: `scale(${zoom})` }}>
          <div className="map-layer map-layer-paper" aria-hidden="true" />
          <div className="map-layer map-layer-noir" aria-hidden="true" />

          <svg className="overlay overlay-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {routes.map((route) => (
              <line key={route.key} x1={route.x1} y1={route.y1} x2={route.x2} y2={route.y2} />
            ))}
          </svg>

          <div className="overlay overlay-influence" aria-hidden="true">
            {REGIONS.map((region) => (
              <span
                key={`influence-${region.id}`}
                className="influence-dot"
                style={{
                  left: `${region.x + region.width / 2}%`,
                  top: `${region.y + region.height / 2}%`,
                  opacity: Math.min(0.8, 0.2 + region.influence / 100),
                }}
              />
            ))}
          </div>

          <div className="overlay overlay-tension" aria-hidden="true">
            {REGIONS.filter((region) => region.tension >= 50).map((region) => (
              <span
                key={`tension-${region.id}`}
                className={`tension-ring ${region.tension >= 70 ? 'is-hot' : ''}`}
                style={{ left: `${region.x + region.width / 2}%`, top: `${region.y + region.height / 2}%` }}
              />
            ))}
          </div>

          <div className="overlay overlay-events" aria-hidden="true">
            {EVENTS.map((event) => (
              <span
                key={event.id}
                className={`event-marker severity-${event.severity}`}
                style={{ left: `${event.x}%`, top: `${event.y}%` }}
                title={event.label}
              />
            ))}
          </div>

          <div className="regions-layer">
            {REGIONS.map((region) => {
              const state =
                region.id === selectedRegionId
                  ? 'selected'
                  : region.tension >= 70
                    ? 'critical'
                    : region.id === hoveredRegionId
                      ? 'hover'
                      : 'idle';

              return (
                <RegionTile
                  key={region.id}
                  {...region}
                  state={state}
                  onClick={() => setSelectedRegionId(region.id)}
                  onMouseEnter={() => setHoveredRegionId(region.id)}
                  onMouseLeave={() => setHoveredRegionId('')}
                />
              );
            })}
          </div>

          <div className="capital-labels" style={{ fontSize: `${Math.max(10, 12 / zoom)}px` }}>
            {REGIONS.map((region) => (
              <span
                key={`capital-${region.id}`}
                className={`capital-label ${region.id === selectedRegionId ? 'is-selected' : ''}`}
                style={{ left: `${region.x + region.width / 2}%`, top: `${region.y + region.height / 2}%` }}
              >
                {region.capital}
              </span>
            ))}
          </div>
        </div>

        <aside className="theater-minimap" aria-label="Théâtres actifs">
          <h4>Théâtres actifs</h4>
          <div className="theater-minimap-grid" role="list">
            {theaters.map((region) => (
              <button
                key={`mini-${region.id}`}
                type="button"
                className={`theater-chip ${region.id === selectedRegionId ? 'is-selected' : ''}`}
                onClick={() => setSelectedRegionId(region.id)}
                role="listitem"
              >
                <span>{region.name}</span>
                <small>{region.capital}</small>
              </button>
            ))}
          </div>
          <p className="theater-minimap-meta">
            Tension: <strong>{selectedRegion.tension}%</strong> · Influence: <strong>{selectedRegion.influence}%</strong>
          </p>
        </aside>
      </div>
    </section>
  );
}
