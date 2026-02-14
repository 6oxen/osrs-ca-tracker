import { useState } from "react";
import { useApp } from "../context/AppContext";
import TierBadge from "./TierBadge";

export default function TeamCAs() {
  const { masterData, TIERS, getPoints } = useApp();

  const [usernames, setUsernames] = useState(["", ""]);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNoneCompleted, setShowNoneCompleted] = useState(true);
  const [showPartialCompletion, setShowPartialCompletion] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleUsernameChange = (index, value) => {
    const newUsernames = [...usernames];
    newUsernames[index] = value;
    setUsernames(newUsernames);
  };

  const addPlayer = () => {
    if (usernames.length < 4) {
      setUsernames([...usernames, ""]);
    }
  };

  const removePlayer = (index) => {
    const newUsernames = usernames.filter((_, i) => i !== index);
    setUsernames(newUsernames);
  };

  const fetchTeamData = async () => {
    setLoading(true);
    setError(null);

    const activeUsernames = usernames.filter((u) => u.trim());

    if (activeUsernames.length === 0) {
      setError("Please enter at least one username");
      setLoading(false);
      return;
    }

    try {
      const playerDataArray = [];

      for (const username of activeUsernames) {
        const formattedName = username.trim().replace(/ /g, "%20");
        const url = `https://sync.runescape.wiki/runelite/player/${formattedName}/STANDARD`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Player "${username}" not found`);
        const data = await res.json();

        playerDataArray.push({
          username: username.trim(),
          completedIds: data.combat_achievements || [],
        });
      }

      // Create sets for each player's completed achievements
      const allCompletedSets = playerDataArray.map(
        (p) => new Set(p.completedIds.map((id) => parseInt(id)))
      );

      // Categorize achievements
      const noneCompleted = [];
      const partialCompletion = [];

      Object.entries(masterData).forEach(([id, task]) => {
        const numId = parseInt(id);
        const completedBy = allCompletedSets.filter((set) =>
          set.has(numId)
        ).length;
        const totalPlayers = playerDataArray.length;

        if (completedBy === 0) {
          // None of the players have completed this
          noneCompleted.push({
            id: numId,
            ...task,
            completedBy,
            totalPlayers,
          });
        } else if (completedBy > 0 && completedBy < totalPlayers) {
          // Some but not all players have completed this
          partialCompletion.push({
            id: numId,
            ...task,
            completedBy,
            totalPlayers,
          });
        }
      });

      // Sort both arrays by tier difficulty and then by monster
      const sortAchievements = (achievements) => {
        return achievements.sort((a, b) => {
          const tierDiff = TIERS.indexOf(a.Tier) - TIERS.indexOf(b.Tier);
          if (tierDiff !== 0) return tierDiff;
          return a.Monster.localeCompare(b.Monster);
        });
      };

      setTeamData({
        players: playerDataArray,
        noneCompleted: sortAchievements(noneCompleted),
        partialCompletion: sortAchievements(partialCompletion),
      });

      // Reset sort when fetching new data
      setSortColumn(null);
      setSortDirection("asc");
    } catch (err) {
      setError(err.message);
      setTeamData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchTeamData();
    }
  };

  // Get achievements to display based on toggles
  const getDisplayedAchievements = () => {
    if (!teamData) return [];

    let achievements = [];

    if (showNoneCompleted) {
      achievements = achievements.concat(teamData.noneCompleted);
    }

    if (showPartialCompletion) {
      achievements = achievements.concat(teamData.partialCompletion);
    }

    // Remove duplicates and re-sort
    const uniqueAchievements = Array.from(
      new Map(achievements.map((a) => [a.id, a])).values()
    );

    // Apply sorting
    if (sortColumn) {
      uniqueAchievements.sort((a, b) => {
        let compareA, compareB;

        if (sortColumn === "tier") {
          compareA = TIERS.indexOf(a.Tier);
          compareB = TIERS.indexOf(b.Tier);
        } else if (sortColumn === "monster") {
          compareA = a.Monster.toLowerCase();
          compareB = b.Monster.toLowerCase();
        } else if (sortColumn === "points") {
          compareA = getPoints(a.Tier);
          compareB = getPoints(b.Tier);
        } else if (sortColumn === "completedby") {
          compareA = a.completedBy;
          compareB = b.completedBy;
        }

        if (compareA < compareB) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (compareA > compareB) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sort by tier, then monster
      uniqueAchievements.sort((a, b) => {
        const tierDiff = TIERS.indexOf(a.Tier) - TIERS.indexOf(b.Tier);
        if (tierDiff !== 0) return tierDiff;
        return a.Monster.localeCompare(b.Monster);
      });
    }

    return uniqueAchievements;
  };

  const handleColumnSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column clicked
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column clicked
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortableHeader = ({ column, label }) => {
    const isActive = sortColumn === column;
    const arrow =
      isActive && sortDirection === "asc"
        ? " ↑"
        : isActive && sortDirection === "desc"
          ? " ↓"
          : "";

    return (
      <th
        onClick={() => handleColumnSort(column)}
        className="cursor-pointer hover:text-osrs-gold transition-colors"
      >
        {label}
        {arrow}
      </th>
    );
  };

  const displayedAchievements = getDisplayedAchievements();

  return (
    <div>
      <h1 className="page-title">Team Combat Achievements</h1>
      <p className="page-subtitle">
        Find common achievements your team hasn't completed yet (up to 4 players).
      </p>

      <div className="card mb-6">
        <h3 className="text-lg font-bold text-osrs-gold mb-4">
          Enter Team Member Usernames
        </h3>
        <div className="space-y-3 mb-4">
          {usernames.map((username, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs uppercase text-gray-500 font-semibold mb-2 block">
                  Player {index + 1}
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => handleUsernameChange(index, e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2 bg-osrs-card rounded-md"
                />
              </div>
              {usernames.length > 2 && (
                <button
                  onClick={() => removePlayer(index)}
                  className="btn-secondary text-red-400 border-red-500 hover:border-red-400 px-3 py-2"
                  title="Remove player"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={fetchTeamData}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Loading..." : "Fetch Team Data"}
          </button>

          {usernames.length < 4 && (
            <button onClick={addPlayer} className="btn-secondary">
              + Add Player
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border bg-red-500/10 border-red-500 text-red-400">
          {error}
        </div>
      )}

      {teamData && (
        <div className="space-y-6">
          {/* Team Summary */}
          <div className="card">
            <h2 className="text-xl font-bold text-osrs-gold mb-4">
              Team Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
                  Active Players
                </p>
                <p className="text-3xl font-bold text-osrs-gold">
                  {teamData.players.length}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
                  Achievements to Display
                </p>
                <p className="text-3xl font-bold text-osrs-gold">
                  {displayedAchievements.length}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
                  Total Points Available
                </p>
                <p className="text-3xl font-bold text-osrs-gold">
                  {displayedAchievements.reduce(
                    (sum, task) => sum + getPoints(task.Tier),
                    0
                  )}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-ui-border">
              <p className="text-sm text-gray-400 mb-3">
                Team Members:
              </p>
              <div className="space-y-2">
                {teamData.players.map((player) => (
                  <div
                    key={player.username}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    {player.username}
                    <span className="text-gray-500">
                      ({player.completedIds.length} achievements)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Toggles */}
          <div className="card">
            <h3 className="text-lg font-bold text-osrs-gold mb-4">
              Filter Achievements
            </h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNoneCompleted}
                  onChange={(e) => setShowNoneCompleted(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-300">
                  None Completed
                  <span className="text-gray-500 ml-2">
                    ({teamData.noneCompleted.length})
                  </span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPartialCompletion}
                  onChange={(e) => setShowPartialCompletion(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-300">
                  Partial Completion
                  <span className="text-gray-500 ml-2">
                    ({teamData.partialCompletion.length})
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Common Incomplete Achievements */}
          <div>
            <h2 className="text-xl font-bold text-osrs-gold mb-4">
              Achievements
            </h2>

            {displayedAchievements.length === 0 ? (
              <div className="card text-center py-12 text-gray-400">
                <p className="text-lg">🎉 Amazing!</p>
                <p className="text-sm mt-2">
                  Your team has completed all selected achievements!
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <SortableHeader column="tier" label="Tier" />
                      <SortableHeader column="monster" label="Monster" />
                      <th>Achievement</th>
                      <SortableHeader column="points" label="Points" />
                      <SortableHeader column="completedby" label="Completed By" />
                    </tr>
                  </thead>
                  <tbody>
                    {displayedAchievements.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <TierBadge tier={task.Tier} />
                        </td>
                        <td className="text-gray-300">{task.Monster}</td>
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
                        <td className="font-semibold text-osrs-gold">
                          {getPoints(task.Tier)}
                        </td>
                        <td className="text-gray-400 text-sm">
                          {task.completedBy}/{task.totalPlayers}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
