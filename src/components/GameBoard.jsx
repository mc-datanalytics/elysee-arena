import { ACTIONS_STRATEGIC } from '../data/actionsStrategic';
import { useGameStore } from '../store/useGameStore';
import { Button } from './ui/Button';
import { CharacterCard } from './ui/CharacterCard';
import { Panel } from './ui/Panel';
import { ResourceItem } from './ui/ResourceItem';
import { SkillCard } from './ui/SkillCard';

const toCardStats = (trust, order, budget, momentum) => [
  { icon: '♛', label: 'Confiance', value: trust },
  { icon: '🛡', label: 'Ordre', value: order },
  { icon: '◈', label: 'Budget', value: budget },
  { icon: '⚡', label: 'Momentum', value: momentum },
];

const toRange = (value) => {
  const min = Math.max(0, value - 10);
  const max = Math.min(100, value + 10);
  return `${min}-${max}`;
};

export default function GameBoard() {
  const {
    selectedCharacter,
    turn,
    maxTurns,
    trust,
    order,
    budget,
    momentum,
    specialCharge,
    logs,
    gameOver,
    victory,
    endReason,
    regionalIntel,
    maintainFullVision,
    playAction,
    useSpecial: triggerSpecial,
    backToMenu,
    toggleNationalVision,
  } = useGameStore();

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

        <Panel title="Compétences d’action">
          <div className="skills-stack">
            {ACTIONS_STRATEGIC.map((action, index) => (
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

        <div className="right-column">
          <Panel title="Ressources nationales">
            <ResourceItem icon="♛" label="Confiance" value={`${trust}%`} />
            <ResourceItem icon="🛡" label="Ordre" value={`${order}%`} />
            <ResourceItem icon="◈" label="Budget" value={`${budget}%`} />
            <ResourceItem icon="⚡" label="Momentum" value={`${momentum}%`} />
            <Button variant={maintainFullVision ? 'danger' : 'success'} onClick={toggleNationalVision} className="full-width">
              {maintainFullVision ? 'Couper vision nationale' : 'Maintenir vision nationale'}
            </Button>
            <p className="intel-cost-note">Coût d’opportunité: -3 budget et -2 momentum par tour/action.</p>
          </Panel>

          <Panel title="Carte renseignement">
            <div className="intel-map-list">
              {regionalIntel.map((region) => {
                const isStrongIntel = region.intel.confidence >= 70;
                const trustLabel = isStrongIntel
                  ? `${region.intel.knownStats.trust ?? region.actualStats.trust}%`
                  : `${toRange(region.actualStats.trust)}%`;
                const orderLabel = isStrongIntel
                  ? `${region.intel.knownStats.order ?? region.actualStats.order}%`
                  : `${toRange(region.actualStats.order)}%`;

                return (
                  <div className="intel-region-card" key={region.id}>
                    <h4>{region.name}</h4>
                    <p>Confiance: {trustLabel}</p>
                    <p>Ordre: {orderLabel}</p>
                    <p>Fiabilité: {region.intel.confidence}% · MAJ T{region.intel.lastUpdatedTurn || '—'}</p>
                    <ul>
                      {region.events.length === 0 && <li>Aucun signal notable.</li>}
                      {region.events.map((event) => (
                        <li key={event.id}>
                          {event.discoveredTurn ? `${event.text} (découvert T${event.discoveredTurn})` : 'Événement masqué — renseignement insuffisant'}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Panel>

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
