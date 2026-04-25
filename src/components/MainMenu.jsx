import { useMemo, useState } from 'react';
import { characters } from '../data/characters';
import { useGameStore } from '../store/useGameStore';
import { Button } from './ui/Button';
import { CharacterCard } from './ui/CharacterCard';
import { Panel } from './ui/Panel';

const toCardStats = (stats) => [
  { icon: '♛', label: 'Confiance', value: stats.trust },
  { icon: '🛡', label: 'Ordre', value: stats.order },
  { icon: '◈', label: 'Budget', value: stats.budget },
  { icon: '⚡', label: 'Momentum', value: stats.momentum },
];

export default function MainMenu() {
  const startRun = useGameStore((state) => state.startRun);
  const [cursor, setCursor] = useState(0);

  const selected = useMemo(() => characters[cursor] ?? characters[0], [cursor]);

  return (
    <main className="screen-root" style={{ backgroundImage: `url('${selected.portrait}')` }}>
      <div className="screen-backdrop" />

      <div className="game-layout menu-layout">
        <CharacterCard
          name={selected.name}
          subtitle={selected.archetype.name}
          portrait={selected.portrait}
          quote={selected.lore}
          stats={toCardStats(selected.stats)}
        >
          <div className="menu-actions">
            <Button variant="primary" onClick={() => startRun(selected)}>Lancer la campagne</Button>
          </div>
        </CharacterCard>

        <Panel title="Galerie des personnages">
          <div className="character-grid">
            {characters.map((character, index) => (
              <button
                key={character.id}
                className={`character-picker ${index === cursor ? 'active' : ''}`}
                onClick={() => setCursor(index)}
              >
                <img src={character.portrait} alt={character.name} loading="lazy" decoding="async" />
                <span>{character.name}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Briefing">
          <p className="panel-copy">Direction artistique: noir & or, tons dark fantasy politiques, portraits au centre.</p>
          <p className="panel-copy">Objectif: survivre jusqu’au terme du mandat sans effondrer Confiance, Ordre, Budget, ni Momentum.</p>
          <div className="menu-nav-row">
            <Button variant="danger" onClick={() => setCursor((v) => (v - 1 + characters.length) % characters.length)}>
              Précédent
            </Button>
            <Button variant="success" onClick={() => setCursor((v) => (v + 1) % characters.length)}>
              Suivant
            </Button>
          </div>
        </Panel>
      </div>
    </main>
  );
}
