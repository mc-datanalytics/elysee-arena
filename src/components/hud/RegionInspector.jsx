import { Panel } from '../ui/Panel';

export default function RegionInspector({ region }) {
  if (!region) {
    return (
      <Panel title="Inspecteur régional">
        <p className="panel-copy">Cliquez sur une tuile de la carte pour ouvrir les détails régionaux.</p>
      </Panel>
    );
  }

  return (
    <Panel title={`Inspecteur régional · ${region.name}`}>
      <div className="region-inspector-grid">
        <div>
          <span>Production</span>
          <strong>{region.production}</strong>
        </div>
        <div>
          <span>Risques</span>
          <strong>{region.risks}</strong>
        </div>
        <div>
          <span>Loyauté</span>
          <strong>{region.loyalty}%</strong>
        </div>
        <div>
          <span>Chaîne logistique</span>
          <strong>{region.logistics}%</strong>
        </div>
      </div>

      <section className="region-projects">
        <h3>Projets actifs</h3>
        <ul>
          {region.projects.map((project) => (
            <li key={project}>{project}</li>
          ))}
        </ul>
      </section>
    </Panel>
  );
}
