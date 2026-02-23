import { useState } from "react";
import { useApp } from "../context/AppContext";
import TierBadge from "./TierBadge";

export default function Dashboard({ setView, setFilterTier }) {
  const {
    masterData,
    isCompleted,
    TIERS,
    getPoints,
    togglePin,
    pinnedIds,
    currentPoints,
    currentUser,
    plannerState,
    updatePlannerState,
  } = useApp();

  const [additional, setAdditional] = useState("");

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

  // Planner logic
  const { plan, excludedIds, pointsMode, priorityType, priorityValue } =
    plannerState;
  const userIsConnected = !!currentUser;

  // Get unique achievement types from masterData
  const achievementTypes = Array.from(
    new Set(Object.values(masterData).map((task) => task.Type))
  ).sort();

  // Get available tiers for prioritization
  const availableTiers = TIERS;

  const generatePlan = () => {
    const pointsNeeded = parseInt(additional);
    if (!pointsNeeded || pointsNeeded <= 0) return;

    let targetPoints;
    if (pointsMode === "total") {
      targetPoints = Math.max(0, pointsNeeded - currentPoints);
    } else {
      targetPoints = pointsNeeded;
    }

    // Get incomplete tasks
    let incomplete = Object.entries(masterData)
      .map(([id, task]) => ({ id: parseInt(id), ...task }))
      .filter((t) => !isCompleted(t.id) && !excludedIds.has(t.id));

    // Apply prioritization with multi-select support
    if (
      priorityType &&
      priorityType.length > 0 &&
      priorityValue &&
      priorityValue.length > 0
    ) {
      // Both type and tier prioritization active
      const priorityTasks = incomplete.filter(
        (t) => priorityType.includes(t.Type) && priorityValue.includes(t.Tier)
      );
      const typeOnlyTasks = incomplete.filter(
        (t) => priorityType.includes(t.Type) && !priorityValue.includes(t.Tier)
      );
      const tierOnlyTasks = incomplete.filter(
        (t) => !priorityType.includes(t.Type) && priorityValue.includes(t.Tier)
      );
      const otherTasks = incomplete.filter(
        (t) => !priorityType.includes(t.Type) && !priorityValue.includes(t.Tier)
      );

      const sortByTier = (tasks) =>
        tasks.sort((a, b) => {
          const tierDiff = TIERS.indexOf(a.Tier) - TIERS.indexOf(b.Tier);
          if (tierDiff !== 0) return tierDiff;
          return a.Monster.localeCompare(b.Monster);
        });

      const sortByMonster = (tasks) =>
        tasks.sort((a, b) => a.Monster.localeCompare(b.Monster));

      incomplete = [
        ...sortByMonster(priorityTasks),
        ...sortByTier(typeOnlyTasks),
        ...sortByMonster(tierOnlyTasks),
        ...sortByTier(otherTasks),
      ];
    } else if (priorityType && priorityType.length > 0) {
      // Only type prioritization
      const priorityTasks = incomplete.filter((t) =>
        priorityType.includes(t.Type)
      );
      const otherTasks = incomplete.filter(
        (t) => !priorityType.includes(t.Type)
      );

      const sortByTier = (tasks) =>
        tasks.sort((a, b) => {
          const tierDiff = TIERS.indexOf(a.Tier) - TIERS.indexOf(b.Tier);
          if (tierDiff !== 0) return tierDiff;
          return a.Monster.localeCompare(b.Monster);
        });

      incomplete = [...sortByTier(priorityTasks), ...sortByTier(otherTasks)];
    } else if (priorityValue && priorityValue.length > 0) {
      // Only tier prioritization
      const priorityTasks = incomplete.filter((t) =>
        priorityValue.includes(t.Tier)
      );
      const otherTasks = incomplete.filter(
        (t) => !priorityValue.includes(t.Tier)
      );

      const sortByMonster = (tasks) =>
        tasks.sort((a, b) => a.Monster.localeCompare(b.Monster));

      const sortByTierDesc = (tasks) =>
        tasks.sort((a, b) => {
          const tierDiff = TIERS.indexOf(b.Tier) - TIERS.indexOf(a.Tier);
          if (tierDiff !== 0) return tierDiff;
          return a.Monster.localeCompare(b.Monster);
        });

      incomplete = [
        ...sortByMonster(priorityTasks),
        ...sortByTierDesc(otherTasks),
      ];
    } else {
      // Default sort by tier, then monster
      incomplete.sort((a, b) => {
        const tierDiff = TIERS.indexOf(a.Tier) - TIERS.indexOf(b.Tier);
        if (tierDiff !== 0) return tierDiff;
        return a.Monster.localeCompare(b.Monster);
      });
    }

    const suggested = [];
    let accumulated = 0;

    for (const task of incomplete) {
      if (accumulated >= targetPoints) break;
      suggested.push(task);
      accumulated += getPoints(task.Tier);
    }

    updatePlannerState({
      plan: { suggested, accumulated, pointsNeeded: targetPoints },
    });
  };

  const excludeTask = (id) => {
    const newExcluded = new Set(excludedIds);
    const numericId = parseInt(id, 10);

    if (newExcluded.has(numericId)) {
      newExcluded.delete(numericId);
    } else {
      newExcluded.add(numericId);
    }

    updatePlannerState({ excludedIds: newExcluded });

    setTimeout(() => {
      generatePlanWithExclusions(newExcluded);
    }, 0);
  };

  const generatePlanWithExclusions = (excludedSet) => {
    const pointsNeeded = parseInt(additional);
    if (!pointsNeeded || pointsNeeded <= 0) return;

    let targetPoints;
    if (pointsMode === "total") {
      targetPoints = Math.max(0, pointsNeeded - currentPoints);
    } else {
      targetPoints = pointsNeeded;
    }

    // Get incomplete tasks
    let incomplete = Object.entries(masterData)
      .map(([id, task]) => ({ id: parseInt(id), ...task }))
      .filter((t) => !isCompleted(t.id) && !excludedSet.has(t.id));

    // Apply prioritization with multi-select support
    if (
      priorityType &&
      priorityType.length > 0 &&
      priorityValue &&
      priorityValue.length > 0
    ) {
      // Both type and tier prioritization active
      const priorityTasks = incomplete.filter(
        (t) => priorityType.includes(t.Type) && priorityValue.includes(t.Tier)
      );
      const typeOnlyTasks = incomplete.filter(
        (t) => priorityType.includes(t.Type) && !priorityValue.includes(t.Tier)
      );
      const tierOnlyTasks = incomplete.filter(
        (t) => !priorityType.includes(t.Type) && priorityValue.includes(t.Tier)
      );
      const otherTasks = incomplete.filter(
        (t) => !priorityType.includes(t.Type) && !priorityValue.includes(t.Tier)
      );

      const sortByTier = (tasks) =>
        tasks.sort((a, b) => {
          const tierDiff = TIERS.indexOf(a.Tier) - TIERS.indexOf(b.Tier);
          if (tierDiff !== 0) return tierDiff;
          return a.Monster.localeCompare(b.Monster);
        });

      const sortByMonster = (tasks) =>
        tasks.sort((a, b) => a.Monster.localeCompare(b.Monster));

      incomplete = [
        ...sortByMonster(priorityTasks),
        ...sortByTier(typeOnlyTasks),
        ...sortByMonster(tierOnlyTasks),
        ...sortByTier(otherTasks),
      ];
    } else if (priorityType && priorityType.length > 0) {
      // Only type prioritization
      const priorityTasks = incomplete.filter((t) =>
        priorityType.includes(t.Type)
      );
      const otherTasks = incomplete.filter(
        (t) => !priorityType.includes(t.Type)
      );

      const sortByTier = (tasks) =>
        tasks.sort((a, b) => {
          const tierDiff = TIERS.indexOf(a.Tier) - TIERS.indexOf(b.Tier);
          if (tierDiff !== 0) return tierDiff;
          return a.Monster.localeCompare(b.Monster);
        });

      incomplete = [...sortByTier(priorityTasks), ...sortByTier(otherTasks)];
    } else if (priorityValue && priorityValue.length > 0) {
      // Only tier prioritization
      const priorityTasks = incomplete.filter((t) =>
        priorityValue.includes(t.Tier)
      );
      const otherTasks = incomplete.filter(
        (t) => !priorityValue.includes(t.Tier)
      );

      const sortByMonster = (tasks) =>
        tasks.sort((a, b) => a.Monster.localeCompare(b.Monster));

      const sortByTierDesc = (tasks) =>
        tasks.sort((a, b) => {
          const tierDiff = TIERS.indexOf(b.Tier) - TIERS.indexOf(a.Tier);
          if (tierDiff !== 0) return tierDiff;
          return a.Monster.localeCompare(b.Monster);
        });

      incomplete = [
        ...sortByMonster(priorityTasks),
        ...sortByTierDesc(otherTasks),
      ];
    } else {
      // Default sort by tier, then monster
      incomplete.sort((a, b) => {
        const tierDiff = TIERS.indexOf(a.Tier) - TIERS.indexOf(b.Tier);
        if (tierDiff !== 0) return tierDiff;
        return a.Monster.localeCompare(b.Monster);
      });
    }

    const suggested = [];
    let accumulated = 0;

    for (const task of incomplete) {
      if (accumulated >= targetPoints) break;
      suggested.push(task);
      accumulated += getPoints(task.Tier);
    }

    updatePlannerState({
      plan: { suggested, accumulated, pointsNeeded: targetPoints },
    });
  };

  const pinAll = () => {
    if (!plan) return;
    plan.suggested.forEach((task) => {
      if (!pinnedIds.includes(task.id)) togglePin(task.id);
    });
  };

  const resetExclusions = () => {
    updatePlannerState({ excludedIds: new Set() });
    generatePlan();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Combat Overview</h1>
        <p className="page-subtitle">
          Click a tier card to view detailed tasks.
        </p>
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

      {userIsConnected && (
        <div className="border-t border-ui-border pt-8">
          <h2 className="page-title">Points Planner</h2>
          <p className="page-subtitle mb-6">
            Plan your achievement progress with custom point goals.
          </p>

          <div className="card mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-osrs-gold mb-1">
                Set Your Goal
              </h3>
              <p className="text-sm text-gray-400">
                Enter points needed and choose between total or additional
                points.
              </p>
            </div>

            <div className="space-y-4">
              {/* Points Mode and Input */}
              <div className="flex gap-4 items-end flex-wrap">
                <div className="flex items-end gap-2">
                  <input
                    type="number"
                    placeholder="0"
                    value={additional}
                    onChange={(e) => setAdditional(e.target.value)}
                    className="px-3 py-2 w-28 bg-osrs-card rounded-md text-sm"
                  />
                  <button
                    onClick={generatePlan}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Generate Plan
                  </button>
                </div>

                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="pointsMode"
                      value="additional"
                      checked={pointsMode === "additional"}
                      onChange={() =>
                        updatePlannerState({ pointsMode: "additional" })
                      }
                      className="w-4 h-4 cursor-pointer accent-osrs-gold"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-osrs-gold transition-colors">
                      Additional Points
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="pointsMode"
                      value="total"
                      checked={pointsMode === "total"}
                      onChange={() =>
                        updatePlannerState({ pointsMode: "total" })
                      }
                      className="w-4 h-4 cursor-pointer accent-osrs-gold"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-osrs-gold transition-colors">
                      Total Points
                    </span>
                  </label>
                </div>
              </div>

              {/* Prioritization Options */}
              <div className="border-t border-ui-border pt-4">
                <p className="text-sm font-semibold text-gray-400 mb-3">
                  Prioritize By:
                </p>
                <div className="space-y-3">
                  {/* Achievement Types */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      Achievement Types:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {achievementTypes.map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={
                              priorityType && priorityType.includes(type)
                            }
                            onChange={(e) => {
                              const newTypes = priorityType
                                ? [...priorityType]
                                : [];
                              if (e.target.checked) {
                                if (!newTypes.includes(type))
                                  newTypes.push(type);
                              } else {
                                newTypes.splice(newTypes.indexOf(type), 1);
                              }
                              updatePlannerState({
                                priorityType:
                                  newTypes.length > 0 ? newTypes : null,
                              });
                              setTimeout(() => generatePlan(), 0);
                            }}
                            className="w-4 h-4 cursor-pointer accent-osrs-gold"
                          />
                          <span className="text-sm text-gray-300 group-hover:text-osrs-gold transition-colors">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Tiers */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Tiers:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableTiers.map((tier) => (
                        <label
                          key={tier}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={
                              priorityValue && priorityValue.includes(tier)
                            }
                            onChange={(e) => {
                              const newTiers = priorityValue
                                ? [...priorityValue]
                                : [];
                              if (e.target.checked) {
                                if (!newTiers.includes(tier))
                                  newTiers.push(tier);
                              } else {
                                newTiers.splice(newTiers.indexOf(tier), 1);
                              }
                              updatePlannerState({
                                priorityValue:
                                  newTiers.length > 0 ? newTiers : null,
                              });
                              setTimeout(() => generatePlan(), 0);
                            }}
                            className="w-4 h-4 cursor-pointer accent-osrs-gold"
                          />
                          <span className="text-sm text-gray-300 group-hover:text-osrs-gold transition-colors">
                            {tier}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {plan && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card text-center">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
                    Current
                  </p>
                  <p className="text-3xl font-bold text-osrs-gold">
                    {currentPoints}
                  </p>
                </div>
                <div className="card text-center">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
                    {pointsMode === "additional" ? "Needed" : "Target"}
                  </p>
                  <p className="text-3xl font-bold text-osrs-gold">
                    {plan.pointsNeeded}
                  </p>
                </div>
                <div className="card text-center">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
                    Gain
                  </p>
                  <p className="text-3xl font-bold text-osrs-gold">
                    {plan.accumulated}
                  </p>
                </div>
                <div className="card text-center">
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
                    Tasks
                  </p>
                  <p className="text-3xl font-bold text-osrs-gold">
                    {plan.suggested.length}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button onClick={pinAll} className="btn-primary">
                  📌 Pin All Suggested
                </button>
                <button onClick={resetExclusions} className="btn-secondary">
                  ↻ Reset Exclusions
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tier</th>
                      <th>Points</th>
                      <th>Monster</th>
                      <th>Achievement</th>
                      <th>Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.suggested.map((task) => {
                      const tierClass = task.Tier.toLowerCase().replace(
                        /\s/g,
                        ""
                      );
                      const isPinned = pinnedIds.includes(task.id);

                      return (
                        <tr
                          key={task.id}
                          style={
                            isPinned
                              ? { backgroundColor: "rgba(74, 145, 92, 0.2)" }
                              : {}
                          }
                          onMouseEnter={(e) =>
                            isPinned &&
                            (e.currentTarget.style.backgroundColor =
                              "rgba(74, 145, 92, 0.3)")
                          }
                          onMouseLeave={(e) =>
                            isPinned &&
                            (e.currentTarget.style.backgroundColor =
                              "rgba(74, 145, 92, 0.2)")
                          }
                        >
                          <td>
                            <TierBadge tier={task.Tier} />
                          </td>
                          <td className="font-semibold text-osrs-gold">
                            +{getPoints(task.Tier)}
                          </td>
                          <td>
                            <span className={`monster-badge tier-${tierClass}`}>
                              {task.Monster}
                            </span>
                          </td>
                          <td>
                            <a
                              href={task.URL}
                              target="_blank"
                              rel="noreferrer"
                              className="text-osrs-gold hover:underline"
                            >
                              {task.Name}
                            </a>
                          </td>
                          <td className="text-xs text-gray-400">{task.Type}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className={`btn-secondary text-xs px-3 py-1 ${
                                  isPinned
                                    ? "bg-osrs-gold text-osrs-dark border-osrs-gold"
                                    : ""
                                }`}
                                onClick={() => togglePin(task.id)}
                              >
                                {isPinned ? "📌" : "📍"}
                              </button>
                              <button
                                className={`btn-secondary text-xs px-3 py-1 transition-colors ${
                                  excludedIds.has(task.id)
                                    ? "bg-red-500/20 border-red-500 text-red-400"
                                    : "hover:border-red-500 hover:text-red-400"
                                }`}
                                onClick={() => excludeTask(task.id)}
                                title={
                                  excludedIds.has(task.id)
                                    ? "Remove exclusion"
                                    : "Exclude from plan"
                                }
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
