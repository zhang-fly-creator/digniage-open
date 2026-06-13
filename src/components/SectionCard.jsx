function SectionCard({ title, note, action, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      {(title || note || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="section-title">{title}</h2> : null}
            {note ? <p className="section-note mt-1">{note}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export default SectionCard;
