import { useApp } from "../context/AppContext";
import TierBadge from "./TierBadge";

export default function Dashboard({ setView, setFilterTier }) {
  const { masterData, isCompleted, TIERS } = useApp();

  // Calculate stats
  const stats = {};
  TIERS.forEach((tier) => (stats[tier] = { total: 0, completed: 0 }));

  Object.entries(masterData).forEach(([id, task]) => {
    if (stats[task.Tier]) {
      stats[task.Tier].total++;
      if (isCompleted(id)) stats[task.Tier].completed++;
    }
  });

  const tierColors = {
    Easy: "from-osrs-easy to-osrs-easy/70",
    Medium: "from-osrs-medium to-osrs-medium/70",
    Hard: "from-osrs-hard to-osrs-hard/70",
    Elite: "from-osrs-elite to-osrs-elite/70",
    Master: "from-osrs-master to-osrs-master/70",
    Grandmaster: "from-osrs-grandmaster to-osrs-grandmaster/70",
  };

  const Icon = ({ tier }) => {
    // simple tier glyphs
    return (
      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-black/30 border border-osrs-border">
        <svg
          className="w-6 h-6 text-osrs-gold"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3l2.5 5.5L20 10l-4 3 1 6-5-3-5 3 1-6L4 10l5.5-1.5L12 3z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  return (
    <div>
      <h1 className="page-title">Combat Overview</h1>
      <p className="page-subtitle">Click a tier card to view detailed tasks.</p>
      <div className="stats-grid">
        {TIERS.map((tier) => {
          const { total, completed } = stats[tier];
          const percent =
            total === 0 ? 0 : Math.round((completed / total) * 100);

          return (
            <div
              key={tier}
              className={`card-interactive group relative overflow-hidden flex flex-col justify-between p-5`}
              onClick={() => {
                setFilterTier(tier);
                setView("browser");
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Icon tier={tier} />
                  <div>
                    <div>
                      <TierBadge tier={tier} className="text-sm" />
                    </div>
                    <div className="text-sm text-gray-400">
                      {completed}/{total} completed
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-osrs-gold">
                    {percent}%
                  </div>
                  <div className="text-xs text-gray-400">Progress</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-osrs-border/50 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${tierColors[tier]} transition-all duration-1000`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
