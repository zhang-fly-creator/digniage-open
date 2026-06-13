function EmptyState({ title, note }) {
  return (
    <div className="rounded-[24px] border border-dashed border-app-line bg-app-white/80 px-5 py-8 text-center">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-app-muted">{note}</p>
    </div>
  );
}

export default EmptyState;
