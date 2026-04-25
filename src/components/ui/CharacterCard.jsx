import { Panel } from './Panel';
import { StatBar } from './StatBar';
import './CharacterCard.css';

export function CharacterCard({ name, subtitle, portrait, quote, stats, children }) {
  return (
    <Panel className="character-card">
      <div className="character-header">
        <div>
          <h1>{name}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <img className="character-portrait" src={portrait} alt={name} />

      {quote && <blockquote>{quote}</blockquote>}

      <div className="character-stats">
        {stats.map((stat) => (
          <StatBar key={stat.label} {...stat} />
        ))}
      </div>

      {children}
    </Panel>
  );
}
