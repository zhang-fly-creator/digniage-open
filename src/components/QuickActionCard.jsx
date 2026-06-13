import { Link } from "react-router-dom";

function QuickActionCard({ to, title, note, tone }) {
  const toneClass = {
    orange: "bg-app-orangeSoft",
    green: "bg-app-green",
    blue: "bg-app-blue",
    cream: "bg-[#F4EBDD]",
  }[tone];

  return (
    <Link to={to} className={`rounded-[24px] ${toneClass} p-4 transition active:scale-[0.99]`}>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-app-ink/80">{note}</p>
    </Link>
  );
}

export default QuickActionCard;
