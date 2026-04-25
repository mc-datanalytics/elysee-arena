import './ResourceItem.css';

export function ResourceItem({ icon, label, value }) {
  return (
    <div className="resource-item">
      <span className="resource-icon">{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
