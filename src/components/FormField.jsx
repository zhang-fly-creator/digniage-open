function FormField({ label, hint, error, children }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-app-ink">{label}</span>
        {hint ? <span className="text-xs text-app-muted">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="mt-2 text-sm font-bold leading-6 text-app-orange">{error}</p>
      ) : null}
    </label>
  );
}

export default FormField;
