import { useMemo, useState } from 'react';
import { characters } from '../data/characters';
import { useGameStore } from '../store/useGameStore';

export default function MainMenu() {
  const startRun = useGameStore((state) => state.startRun);
  const [selectedId, setSelectedId] = useState(characters[0]?.id);

  const selected = useMemo(
    () => characters.find((item) => item.id === selectedId) ?? characters[0],
    [selectedId],
  );

  return (
    <main className="menu-shell">
      <section className="menu-hero" style={{ backgroundImage: `url('${selected.portrait}')` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">ELYSÉE ARENA · DARK BUILD 2026</p>
          <h1>{selected.name}</h1>
          <p className="muted">{selected.lore}</p>
          <div className="chips">
            <span>{selected.archetype.name}</span>
            <span>{selected.archetype.passive}</span>
          </div>
          <button className="cta" onClick={() => startRun(selected)}>
            Entrer dans l&apos;arène
          </button>
        </div>
      </section>

      <section className="portrait-grid" aria-label="Sélection de personnage">
        {characters.map((character) => (
          <button
            key={character.id}
            className={`portrait-item ${character.id === selected.id ? 'active' : ''}`}
            onClick={() => setSelectedId(character.id)}
            title={character.name}
          >
            <img src={character.portrait} alt={character.name} loading="lazy" decoding="async" />
            <div className="portrait-label">{character.name}</div>
          </button>
        ))}
      </section>
    </main>
  );
}
