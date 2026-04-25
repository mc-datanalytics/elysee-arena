const STATE_CLASS = {
  idle: 'is-idle',
  hover: 'is-hover',
  selected: 'is-selected',
  critical: 'is-critical',
};

export default function RegionTile({
  name,
  capital,
  x,
  y,
  width,
  height,
  state = 'idle',
  badges = [],
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  return (
    <button
      type="button"
      className={`region-tile ${STATE_CLASS[state] ?? STATE_CLASS.idle}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={`${name}, capitale ${capital}`}
    >
      <span className="region-outline" aria-hidden="true" />
      <span className="region-core" aria-hidden="true" />

      <span className="region-name">{name}</span>

      <span className="region-badges" aria-hidden="true">
        {badges.map((badge) => (
          <span key={`${name}-${badge.icon}-${badge.label}`} className="region-badge" title={badge.label}>
            {badge.icon}
          </span>
        ))}
      </span>
    </button>
  );
}
