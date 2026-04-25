import { ACTIONS } from '../data/characters';
import { GOVERNMENT_PRIORITIES, MAP_FILTERS, useGameStore } from '../store/useGameStore';
import NationalHUD from './hud/NationalHUD';
import RegionInspector from './hud/RegionInspector';
import { Button } from './ui/Button';
import { CharacterCard } from './ui/CharacterCard';
import { Panel } from './ui/Panel';
import { SkillCard } from './ui/SkillCard';

const toCardStats = (trust, order, budget, momentum) => [
  { icon: '♛', label: 'Confiance', value: trust },
  { icon: '🛡', label: 'Ordre', value: order },
  { icon: '◈', label: 'Budget', value: budget },
  { icon: '⚡', label: 'Momentum', value: momentum },
];

export default function GameBoard() {
  const {
    selectedCharacter,
    turn,
    maxTurns,
    trust,
    order,
    budget,
    momentum,
    energy,
    cohesion,
    publicOrder,
    externalInfluence,
    alerts,
    regions,
    activeMapFilter,
    selectedRegionId,
    governmentPriorities,
    specialCharge,
    logs,
    gameOver,
    victory,
    endReason,
    playAction,
    useSpecial: triggerSpecial,
    setActiveMapFilter,
    selectRegion,
    toggleGovernmentPriority,
    backToMenu,
  } = useGameStore();

  const selectedRegion = regions.find((region) => region.id === selectedRegionId) ?? null;
  const filterStat = MAP_FILTERS[activeMapFilter].stat;

  return (
    <main className="screen-root" style={{ backgroundImage: `url('${selectedCharacter.portrait}')` }}>
      <div className="screen-backdrop" />

      <div className="game-layout">
        <CharacterCard
          name={selectedCharacter.name}
          subtitle={`${selectedCharacter.archetype.name} · Tour ${turn}/${maxTurns}`}
          portrait={selectedCharacter.portrait}
          quote={selectedCharacter.archetype.special.text}
          stats={toCardStats(trust, order, budget, momentum)}
        >
          <Button
            variant="success"
            onClick={triggerSpecial}
            disabled={specialCharge < 100 || gameOver}
            className="full-width"
          >
            Ultime — {selectedCharacter.archetype.special.name} ({specialCharge}%)
          </Button>
        </CharacterCard>

        <div className="center-column">
          <Panel title="Carte stratégique">
            <div className="map-filter-row">
              {Object.entries(MAP_FILTERS).map(([key, filter]) => (
                <button
                  key={key}
                  className={`map-filter-chip ${activeMapFilter === key ? 'active' : ''}`}
                  onClick={() => setActiveMapFilter(key)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="region-map-grid">
              {regions.map((region) => (
                <button
                  key={region.id}
                  className={`region-tile ${selectedRegionId === region.id ? 'active' : ''}`}
                  type="button"
                  onClick={() => selectRegion(region.id)}
                >
                  <h4>{region.name}</h4>
                  <p>{MAP_FILTERS[activeMapFilter].label}</p>
                  <strong>{region[filterStat]}%</strong>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title={`Priorités gouvernementales (${governmentPriorities.length}/3)`}>
            <div className="priorities-grid">
              {GOVERNMENT_PRIORITIES.map((priority) => {
                const active = governmentPriorities.includes(priority.key);
                return (
                  <button
                    key={priority.key}
                    type="button"
                    className={`priority-card ${active ? 'active' : ''}`}
                    onClick={() => toggleGovernmentPriority(priority.key)}
                    disabled={!active && governmentPriorities.length >= 3}
                  >
                    <strong>{priority.label}</strong>
                    <p>{priority.description}</p>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Compétences d’action">
            <div className="skills-stack">
              {ACTIONS.map((action, index) => (
                <SkillCard
                  key={action.key}
                  image={selectedCharacter.portrait}
                  title={`[${index + 1}] ${action.label}`}
                  description={action.description}
                  onClick={() => playAction(action.key)}
                  disabled={gameOver}
                />
              ))}
            </div>
          </Panel>
        </div>

        <div className="right-column">
          <NationalHUD
            stats={{ budget, energy, cohesion, publicOrder, externalInfluence }}
            alerts={alerts}
          />

          <RegionInspector region={selectedRegion} />

          <Panel title="Journal">
            <div className="log-list">
              {logs.map((entry, index) => (
                <p key={`${entry.turn}-${index}`}>[{entry.turn}] {entry.text}</p>
              ))}
            </div>
            <Button variant="primary" onClick={backToMenu} className="full-width">
              Retour menu
            </Button>
          </Panel>
        </div>
      </div>

      {gameOver && (
        <div className="overlay-end">
          <Panel className="overlay-card" title={victory ? 'Victoire stratégique' : 'Campagne brisée'}>
            <p className="panel-copy">{endReason}</p>
            <Button variant="primary" onClick={backToMenu}>Revenir au menu</Button>
          </Panel>
        </div>
      )}
    </main>
  );
}
