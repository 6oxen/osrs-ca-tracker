import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import TierBadge from "./TierBadge";

export default function TodoList() {
  const {
    pinnedIds,
    masterData,
    togglePin,
    isCompleted,
    clearPins,
    fetchUserData,
    currentUser,
  } = useApp();

  const [viewMode, setViewMode] = useState("list");
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [removingCompleted, setRemovingCompleted] = useState(false);
  const [removalMessage, setRemovalMessage] = useState(null);
  const [sortBy, setSortBy] = useState("tier"); // "tier", "monster", "name"

  const groupedTasks = useMemo(() => {
    const groups = {};
    pinnedIds.forEach((id) => {
      // masterData keys are strings; ensure we check both numeric and string keys
      const task = masterData[id] || masterData[String(id)];
      if (task) {
        if (!groups[task.Monster]) {
          groups[task.Monster] = [];
        }
        groups[task.Monster].push({ id, ...task });
      }
    });
    const sorted = {};
    Object.keys(groups)
      .sort()
      .forEach((key) => {
        sorted[key] = groups[key];
      });
    return sorted;
  }, [pinnedIds, masterData]);

  const removeCompletedTasks = async () => {
    if (!currentUser) {
      setRemovalMessage({
        type: "error",
        text: "No user loaded. Search for a player first!",
      });
      setTimeout(() => setRemovalMessage(null), 3000);
      return;
    }

    setRemovingCompleted(true);
    setRemovalMessage(null);

    try {
      // Refresh user data from API
      await new Promise((resolve) => {
        const originalFetch = fetchUserData;
        fetchUserData(currentUser);
        setTimeout(resolve, 500);
      });

      // Find completed tasks to remove
      const completedToRemove = pinnedIds.filter((id) => isCompleted(id));
      const removedCount = completedToRemove.length;

      if (removedCount === 0) {
        setRemovalMessage({
          type: "info",
          text: "No newly completed achievements detected!",
        });
      } else {
        completedToRemove.forEach((id) => {
          togglePin(id);
        });
        setRemovalMessage({
          type: "success",
          text: `Removed ${removedCount} completed ${
            removedCount === 1 ? "achievement" : "achievements"
          }!`,
        });
      }

      setTimeout(() => setRemovalMessage(null), 4000);
    } catch (error) {
      console.error("Error removing completed tasks:", error);
      setRemovalMessage({
        type: "error",
        text: "Failed to check for completed achievements.",
      });
      setTimeout(() => setRemovalMessage(null), 3000);
    } finally {
      setRemovingCompleted(false);
    }
  };

  const allTasksCompleted =
    pinnedIds.length > 0 && pinnedIds.every((id) => isCompleted(id));

  const TaskCard = ({ id, task, done }) => {
    const tierClass = (task.Tier || "").toLowerCase().replace(/\s+/g, "");

    return (
      <div
        className={`card group relative p-3 ${
          done
            ? "border-green-500/50 opacity-75 hover:opacity-85"
            : "hover:border-osrs-gold/50"
        }`}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors text-sm"
          onClick={() => togglePin(id)}
          title="Remove from pinned"
        >
          ✕
        </button>
        <div className="pr-6">
          <h4 className="font-semibold text-sm text-gray-100 mb-2 line-clamp-2">
            {task.Name}
          </h4>
          <div className="flex gap-1 mb-2 flex-wrap items-center">
            <TierBadge tier={task.Tier} />
            <span className={`monster-badge tier-${tierClass} text-xs`}>
              {task.Monster}
            </span>
          </div>
          <div className="flex gap-1 mb-2 flex-wrap items-center">
            <p className="text-gray-400 max-w-xs text-sm">{task.Description}</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {task.URL && (
              <a
                href={task.URL}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-2 py-1 bg-osrs-gold/10 border border-osrs-gold/30 text-osrs-gold/50 hover:bg-osrs-gold/20 hover:text-osrs-gold/70 rounded transition-colors"
              >
                Wiki
              </a>
            )}
            {done && (
              <p className="text-xs font-semibold text-green-400">✓ Done</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getSortedPinnedIds = () => {
    const sortedIds = [...pinnedIds];

    if (sortBy === "tier") {
      sortedIds.sort((a, b) => {
        const TIERS = [
          "Easy",
          "Medium",
          "Hard",
          "Elite",
          "Master",
          "Grandmaster",
        ];
        const taskA = masterData[a] || masterData[String(a)] || {};
        const taskB = masterData[b] || masterData[String(b)] || {};
        const tierDiff = TIERS.indexOf(taskA.Tier) - TIERS.indexOf(taskB.Tier);
        if (tierDiff !== 0) return tierDiff;
        return (taskA.Monster || "").localeCompare(taskB.Monster || "");
      });
    } else if (sortBy === "monster") {
      sortedIds.sort((a, b) => {
        const taskA = masterData[a] || masterData[String(a)] || {};
        const taskB = masterData[b] || masterData[String(b)] || {};
        return (taskA.Monster || "").localeCompare(taskB.Monster || "");
      });
    } else if (sortBy === "name") {
      sortedIds.sort((a, b) => {
        const taskA = masterData[a] || masterData[String(a)] || {};
        const taskB = masterData[b] || masterData[String(b)] || {};
        return (taskA.Name || "").localeCompare(taskB.Name || "");
      });
    }

    return sortedIds;
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
        <h1 className="page-title">My Pinned Tasks</h1>
        <div className="flex gap-2 flex-wrap">
          {pinnedIds.length > 0 && (
            <>
              <button
                onClick={() =>
                  setViewMode(viewMode === "list" ? "grouped" : "list")
                }
                className="btn-secondary flex items-center gap-2"
                title={
                  viewMode === "list"
                    ? "Switch to grouped view"
                    : "Switch to list view"
                }
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current"
                >
                  {viewMode === "list" ? (
                    <>
                      <rect
                        x="3"
                        y="3"
                        width="8"
                        height="8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect
                        x="13"
                        y="3"
                        width="8"
                        height="8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect
                        x="3"
                        y="13"
                        width="8"
                        height="8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect
                        x="13"
                        y="13"
                        width="8"
                        height="8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  ) : (
                    <>
                      <line
                        x1="4"
                        y1="6"
                        x2="20"
                        y2="6"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="4"
                        y1="12"
                        x2="20"
                        y2="12"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="4"
                        y1="18"
                        x2="20"
                        y2="18"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>
                {viewMode === "list" ? "Organize" : "List"}
              </button>
              <button
                onClick={removeCompletedTasks}
                disabled={removingCompleted || allTasksCompleted}
                className="btn-secondary flex items-center gap-2"
                title={
                  allTasksCompleted
                    ? "All tasks already completed"
                    : "Check API for newly completed achievements"
                }
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current"
                >
                  <path
                    d="M3 6h18M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2m3 0v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6h16z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {removingCompleted ? "Checking..." : "Sync & Remove"}
              </button>
            </>
          )}
          <button onClick={clearPins} className="btn-secondary">
            Clear All
          </button>
        </div>
      </div>

      {removalMessage && (
        <div
          className={`mb-4 p-3 rounded-lg border flex items-center gap-2 animate-slide-in ${
            removalMessage.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-400"
              : removalMessage.type === "error"
              ? "bg-red-500/10 border-red-500 text-red-400"
              : "bg-blue-500/10 border-blue-500 text-blue-400"
          }`}
        >
          <span className="text-lg">
            {removalMessage.type === "success"
              ? "✓"
              : removalMessage.type === "error"
              ? "⚠"
              : "ℹ"}
          </span>
          {removalMessage.text}
        </div>
      )}

      {pinnedIds.length === 0 ? (
        <div className="empty-state">
          <p className="text-lg">No tasks pinned yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Go to the browser to add some!
          </p>
        </div>
      ) : viewMode === "list" ? (
        <>
          <div className="mb-4 flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-gray-400">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm bg-osrs-card rounded-md text-gray-300 cursor-pointer border border-osrs-border/50 hover:border-osrs-gold/50 transition-colors"
            >
              <option value="tier">Tier</option>
              <option value="monster">Monster</option>
              <option value="name">Achievement Name</option>
            </select>
          </div>
          <div className="todo-grid">
            {getSortedPinnedIds().map((id) => {
              const task = masterData[id] || masterData[String(id)] || {};
              const done = isCompleted(id);
              return <TaskCard key={id} id={id} task={task} done={done} />;
            })}
          </div>
        </>
      ) : (
        <div className="animate-slide-in">
          {expandedGroup ? (
            <div>
              <button
                onClick={() => setExpandedGroup(null)}
                className="btn-secondary mb-6 flex items-center gap-2"
              >
                ← Back to Groups
              </button>
              <h2 className="font-cinzel font-bold text-2xl text-osrs-gold mb-6">
                {expandedGroup}
              </h2>
              <div className="todo-grid">
                {groupedTasks[expandedGroup].map((task) => {
                  const done = isCompleted(task.id);
                  return (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      task={task}
                      done={done}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="groups-grid">
              {Object.entries(groupedTasks).map(([monster, tasks]) => {
                const completedCount = tasks.filter((t) =>
                  isCompleted(t.id)
                ).length;
                const totalCount = tasks.length;
                const percent = Math.round((completedCount / totalCount) * 100);

                return (
                  <div
                    key={monster}
                    className="card-interactive"
                    onClick={() => setExpandedGroup(monster)}
                  >
                    <h3 className="font-cinzel font-bold text-lg text-osrs-gold mb-3">
                      {monster}
                    </h3>
                    <div className="space-y-2 mb-4 text-sm">
                      <p className="text-gray-400">
                        {totalCount} tasks
                        <span className="ml-3 text-osrs-gold font-semibold">
                          {completedCount}/{totalCount} ✓
                        </span>
                      </p>
                    </div>
                    <div className="w-full bg-osrs-border/50 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-osrs-gold to-osrs-gold/60 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
