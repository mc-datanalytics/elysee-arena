import { Panel } from '../ui/Panel';

const METRIC_LABELS = {
  budget: { icon: '◈', label: 'Budget' },
  energy: { icon: '⚡', label: 'Énergie' },
  cohesion: { icon: '🤝', label: 'Cohésion' },
  publicOrder: { icon: '🛡', label: 'Ordre public' },
  externalInfluence: { icon: '🌐', label: 'Influence externe' },
};

export default function NationalHUD({ stats, alerts }) {
  const sortedAlerts = [...alerts].sort((a, b) => b.urgency - a.urgency);

  return (
    <Panel title="HUD national" className="national-hud">
      <div className="hud-metrics-grid">
        {Object.entries(METRIC_LABELS).map(([key, config]) => (
          <article className="hud-metric" key={key}>
            <p>
              <span>{config.icon}</span> {config.label}
            </p>
            <strong>{stats[key]}%</strong>
          </article>
        ))}
      </div>

      <div className="hud-alerts">
        <h3>Alertes prioritaires</h3>
        {sortedAlerts.length === 0 ? (
          <p className="hud-empty">Aucune alerte critique.</p>
        ) : (
          <ul>
            {sortedAlerts.map((alert) => (
              <li key={alert.id}>
                <div>
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                </div>
                <span className="urgency-pill">Urgence {alert.urgency}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}
