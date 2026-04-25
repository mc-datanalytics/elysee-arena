import { ACTIONS } from '../data/characters';
import { useGameStore } from '../store/useGameStore';
import { Button } from './ui/Button';
import { CharacterCard } from './ui/CharacterCard';
import { Panel } from './ui/Panel';
import { ResourceItem } from './ui/ResourceItem';
import { SkillCard } from './ui/SkillCard';
import FranceMapScene from './map/FranceMapScene';

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
    specialCharge,
    logs,
    gameOver,
    victory,
    endReason,
    playAction,
    useSpecial: triggerSpecial,
    backToMenu,
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

        <div className="center-column">
          <Panel title="Carte opérationnelle">
            <FranceMapScene />
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
          <Panel title="Ressources nationales">
            <ResourceItem icon="♛" label="Confiance" value={`${trust}%`} />
            <ResourceItem icon="🛡" label="Ordre" value={`${order}%`} />
            <ResourceItem icon="◈" label="Budget" value={`${budget}%`} />
            <ResourceItem icon="⚡" label="Momentum" value={`${momentum}%`} />
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
