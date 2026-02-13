import { useState } from "react";
import { useApp } from "../context/AppContext";
import TierBadge from "./TierBadge";

export default function Planner() {
  const {
    masterData,
    isCompleted,
    getPoints,
    TIERS,
    togglePin,
    pinnedIds,
    currentPoints,
    plannerState,
    updatePlannerState,
  } = useApp();

  const [additional, setAdditional] = useState("");

  const { plan, excludedIds, pointsMode } = plannerState;

  const generatePlan = () => {
    const pointsNeeded = parseInt(additional);
    if (!pointsNeeded || pointsNeeded <= 0) return;

    let targetPoints;
    if (pointsMode === "total") {
      targetPoints = Math.max(0, pointsNeeded - currentPoints);
    } else {
      targetPoints = pointsNeeded;
    }

    const incomplete = Object.entries(masterData)
      .map(([id, task]) => ({ id: parseInt(id), ...task }))
      .filter((t) => !isCompleted(t.id) && !excludedIds.has(t.id))
      .sort((a, b) => {
        const diff = TIERS.indexOf(a.Tier) - TIERS.indexOf(b.Tier);
        if (diff !== 0) return diff;
        return a.Monster.localeCompare(b.Monster);
      });

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

    // Regenerate plan with new exclusions
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

    const incomplete = Object.entries(masterData)
      .map(([id, task]) => ({ id: parseInt(id), ...task }))
      .filter((t) => !isCompleted(t.id) && !excludedSet.has(t.id))
      .sort((a, b) => {
        const diff = TIERS.indexOf(a.Tier) - TIERS.indexOf(b.Tier);
        if (diff !== 0) return diff;
        return a.Monster.localeCompare(b.Monster);
      });

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

  const togglePointsMode = () => {
    const newMode = pointsMode === "additional" ? "total" : "additional";
    updatePlannerState({ pointsMode: newMode });
    setTimeout(() => {
      const pointsNeeded = parseInt(additional);
      if (!pointsNeeded || pointsNeeded <= 0) return;

      let targetPoints;
      if (newMode === "total") {
        targetPoints = Math.max(0, pointsNeeded - currentPoints);
      } else {
        targetPoints = pointsNeeded;
      }

      const incomplete = Object.entries(masterData)
        .map(([id, task]) => ({ id: parseInt(id), ...task }))
        .filter((t) => !isCompleted(t.id) && !excludedIds.has(t.id))
        .sort((a, b) => {
          const diff = TIERS.indexOf(a.Tier) - TIERS.indexOf(b.Tier);
          if (diff !== 0) return diff;
          return a.Monster.localeCompare(b.Monster);
        });

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
    }, 0);
  };

  return (
    <div>
      <h1 className="page-title">Points Planner</h1>

      <div className="card mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-osrs-gold mb-1">
            Set Your Goal
          </h3>
          <p className="text-sm text-gray-400">
            Enter points needed. Choose between Total Points (your goal) or
            Additional Points (points to gain).
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            placeholder="Points"
            value={additional}
            onChange={(e) => setAdditional(e.target.value)}
            className="px-4 py-2 flex-1 max-w-xs bg-osrs-card rounded-l-md"
          />
          <button onClick={generatePlan} className="btn-primary rounded-r-md">
            Generate Plan
          </button>
          <button
            className="btn-secondary"
            onClick={togglePointsMode}
            title={`Currently: ${
              pointsMode === "additional" ? "Additional Points" : "Total Points"
            }`}
          >
            {pointsMode === "additional" ? "Additional" : "Total"}
          </button>
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {plan.suggested.map((task) => {
                  const tierClass = task.Tier.toLowerCase().replace(/\s/g, "");

                  return (
                    <tr key={task.id}>
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
                      <td>
                        <div className="flex gap-2">
                          <button
                            className={`btn-secondary text-xs px-3 py-1 ${
                              pinnedIds.includes(task.id)
                                ? "bg-osrs-gold text-osrs-dark border-osrs-gold"
                                : ""
                            }`}
                            onClick={() => togglePin(task.id)}
                          >
                            {pinnedIds.includes(task.id) ? "📌" : "📍"}
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
  );
}
