import './StatBar.css';

export function StatBar({ icon, label, value, max = 100 }) {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div className="stat-bar">
      <div className="stat-header">
        <span className="stat-label">
          {icon && <span className="stat-icon">{icon}</span>}
          {label}
        </span>
        <span className="stat-value">{value}</span>
      </div>

      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
