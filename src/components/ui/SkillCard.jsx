import './SkillCard.css';

export function SkillCard({ image, title, description, onClick, disabled = false, rightSlot }) {
  if (onClick) {
    return (
      <button className="skill-card" onClick={onClick} disabled={disabled}>
        {image && <img src={image} alt="" className="skill-image" />}
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {rightSlot}
      </button>
    );
  }

  return (
    <article className="skill-card">
      {image && <img src={image} alt="" className="skill-image" />}
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {rightSlot}
    </article>
  );
}
