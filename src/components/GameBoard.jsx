import { ACTIONS } from '../data/characters';
import { useGameStore } from '../store/useGameStore';

const StatBar = ({ label, value }) => (
  <div className="stat-row">
    <div className="stat-head">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${value}%` }} />
    </div>
  </div>
);

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
    useSpecial,
    backToMenu,
  } = useGameStore();

  return (
    <main className="game-shell" style={{ backgroundImage: `url('${selectedCharacter.portrait}')` }}>
      <div className="game-overlay" />

      <header className="hud-top">
        <div>
          <p className="eyebrow">Tour {turn} / {maxTurns}</p>
          <h2>{selectedCharacter.name}</h2>
          <p className="muted">{selectedCharacter.archetype.name}</p>
        </div>
        <button className="ghost" onClick={backToMenu}>Quitter</button>
      </header>

      <section className="hud-stats">
        <StatBar label="Confiance" value={trust} />
        <StatBar label="Ordre" value={order} />
        <StatBar label="Budget" value={budget} />
        <StatBar label="Momentum" value={momentum} />
      </section>

      <section className="actions-wrap">
        <div className="actions-grid">
          {ACTIONS.map((action) => (
            <button
              key={action.key}
              className="action-btn"
              disabled={gameOver}
              onClick={() => playAction(action.key)}
            >
              <h3>{action.label}</h3>
              <p>{action.description}</p>
            </button>
          ))}
        </div>

        <button
          className={`special-btn ${specialCharge >= 100 ? 'ready' : ''}`}
          disabled={specialCharge < 100 || gameOver}
          onClick={useSpecial}
        >
          Ultime — {selectedCharacter.archetype.special.name} ({specialCharge}%)
        </button>
      </section>

      <aside className="log-panel" aria-live="polite">
        {logs.map((entry, index) => (
          <p key={`${entry.turn}-${index}`}>[{entry.turn}] {entry.text}</p>
        ))}
      </aside>

      {gameOver && (
        <div className="end-modal">
          <h3>{victory ? 'Victoire' : 'Défaite'}</h3>
          <p>{endReason}</p>
          <button className="cta" onClick={backToMenu}>Retour menu</button>
        </div>
      )}
    </main>
  );
}
