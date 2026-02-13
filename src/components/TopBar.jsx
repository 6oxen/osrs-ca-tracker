import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function TopBar() {
  const [input, setInput] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const {
    fetchUserData,
    currentPoints,
    loading,
    error,
    currentUser,
    userCompletedIds,
    masterData,
  } = useApp();

  const handleSearch = () => {
    if (input) fetchUserData(input);
  };

  // Calculate stats for profile
  const totalAchievements = Object.keys(masterData).length;
  const completionPercentage =
    totalAchievements > 0
      ? Math.round((userCompletedIds.length / totalAchievements) * 100)
      : 0;

  const tierCompletions = {};
  Object.entries(masterData).forEach(([id, task]) => {
    if (!tierCompletions[task.Tier]) {
      tierCompletions[task.Tier] = { total: 0, completed: 0 };
    }
    tierCompletions[task.Tier].total++;
    if (userCompletedIds.includes(parseInt(id))) {
      tierCompletions[task.Tier].completed++;
    }
  });

  return (
    <>
      <header className="top-bar">
        <div className="search-container">
          <div className="flex items-center bg-osrs-card border border-osrs-border rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Enter OSRS Username..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="px-4 py-2 w-72 bg-transparent text-gray-100 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary rounded-none rounded-r-md"
            >
              {loading ? "Looking up..." : "Look Up"}
            </button>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="current-points">
            <span className="text-sm text-gray-400">Current Points</span>
            <div className="inline-block ml-3 bg-[#111] border border-osrs-border px-3 py-1 rounded-md">
              <span className="current-points-value">{currentPoints}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loading && <div className="spinner" />}
            <button
              onClick={() => setShowProfileModal(!showProfileModal)}
              className="flex items-center gap-2 bg-osrs-card border border-osrs-border px-3 py-1 rounded-md hover:border-blue-400 transition-colors cursor-pointer"
              title="View profile"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
                  stroke="#dca350"
                  strokeWidth="1.2"
                />
                <path
                  d="M4 20c0-3.31 2.69-6 6-6h4c3.31 0 6 2.69 6 6"
                  stroke="#dca350"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-300">Profile</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="absolute bottom-2 right-2 bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
      </header>

      {/* Profile Modal rendered outside header to ensure fixed positioning works */}
      {showProfileModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="bg-card-bg border border-ui-border rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-osrs-gold">Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {currentUser ? (
              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-[rgba(255,255,255,0.02)] border border-ui-border rounded-lg p-4">
                  <p className="text-gray-400 text-xs uppercase font-semibold mb-2">
                    Current User
                  </p>
                  <p className="text-xl font-bold text-gray-100">
                    {currentUser}
                  </p>
                </div>

                {/* Overall Stats */}
                <div className="bg-[rgba(255,255,255,0.02)] border border-ui-border rounded-lg p-4">
                  <p className="text-gray-400 text-xs uppercase font-semibold mb-4">
                    Overall Stats
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Points</span>
                      <span className="text-lg font-bold text-osrs-gold">
                        {currentPoints}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">
                        Achievements Completed
                      </span>
                      <span className="text-lg font-bold text-blue-400">
                        {userCompletedIds.length}/{totalAchievements}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Completion Rate</span>
                      <span className="text-lg font-bold text-green-400">
                        {completionPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-osrs-border/50 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tier Breakdown */}
                <div className="bg-[rgba(255,255,255,0.02)] border border-ui-border rounded-lg p-4">
                  <p className="text-gray-400 text-xs uppercase font-semibold mb-4">
                    Tier Breakdown
                  </p>
                  <div className="space-y-2">
                    {[
                      "Easy",
                      "Medium",
                      "Hard",
                      "Elite",
                      "Master",
                      "Grandmaster",
                    ].map((tier) => {
                      const tierData = tierCompletions[tier] || {
                        total: 0,
                        completed: 0,
                      };
                      const tierPercent =
                        tierData.total > 0
                          ? Math.round(
                              (tierData.completed / tierData.total) * 100
                            )
                          : 0;
                      const tierClass = tier.toLowerCase().replace(/\s+/g, "");

                      return (
                        <div
                          key={tier}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className={`tier-badge tier-${tierClass}`}>
                            {tier}
                          </span>
                          <span className="text-gray-400">
                            {tierData.completed}/{tierData.total}
                          </span>
                          <div className="w-20 bg-osrs-border/30 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 tier-${tierClass}`}
                              style={{
                                width: `${tierPercent}%`,
                                backgroundColor:
                                  tierClass === "easy"
                                    ? "#81c784"
                                    : tierClass === "medium"
                                    ? "#aed581"
                                    : tierClass === "hard"
                                    ? "#ef5350"
                                    : tierClass === "elite"
                                    ? "#64b5f6"
                                    : tierClass === "master"
                                    ? "#ba68c8"
                                    : "#ab47bc",
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[rgba(255,255,255,0.02)] border border-ui-border rounded-lg p-4 text-center">
                <p className="text-gray-400">No user loaded yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Search for a player above to view their profile!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
