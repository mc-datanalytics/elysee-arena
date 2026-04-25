import './Panel.css';

export function Panel({ title, children, className = '' }) {
  return (
    <section className={`ui-panel ${className}`}>
      {title && <h2 className="ui-panel-title">{title}</h2>}
      {children}
    </section>
  );
}
