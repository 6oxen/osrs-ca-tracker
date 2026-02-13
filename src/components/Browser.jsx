import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import TierBadge from "./TierBadge";

export default function Browser({ initialTier = "All" }) {
  const { masterData, isCompleted, togglePin, pinnedIds, TIERS } = useApp();

  // Filters State
  const [filterTier, setFilterTier] = useState(initialTier);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMonster, setFilterMonster] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "tier",
    direction: "asc",
  });

  // Get unique monsters for dropdown
  const monsters = useMemo(() => {
    const m = new Set(Object.values(masterData).map((t) => t.Monster));
    return ["All", ...Array.from(m).sort()];
  }, [masterData]);

  // Filter & Sort Data
  const filteredTasks = useMemo(() => {
    let tasks = Object.entries(masterData).map(([id, task]) => ({
      id: parseInt(id, 10),
      ...task,
      completed: isCompleted(id),
    }));

    return tasks
      .filter((task) => {
        const matchTier = filterTier === "All" || task.Tier === filterTier;
        const matchStatus =
          filterStatus === "All" ||
          (filterStatus === "Completed" && task.completed) ||
          (filterStatus === "Incomplete" && !task.completed);
        const matchMonster =
          filterMonster === "All" || task.Monster === filterMonster;
        const matchSearch = task.Name.toLowerCase().includes(
          searchTerm.toLowerCase()
        );

        return matchTier && matchStatus && matchMonster && matchSearch;
      })
      .sort((a, b) => {
        let valA = a[sortConfig.key] || "";
        let valB = b[sortConfig.key] || "";

        if (sortConfig.key === "tier") {
          valA = TIERS.indexOf(a.Tier);
          valB = TIERS.indexOf(b.Tier);
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [
    masterData,
    filterTier,
    filterStatus,
    filterMonster,
    searchTerm,
    sortConfig,
    isCompleted,
    TIERS,
  ]);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortArrow = (key) =>
    sortConfig.key === key
      ? sortConfig.direction === "asc"
        ? " ▲"
        : " ▼"
      : "";

  return (
    <div>
      <h1 className="page-title">Achievement Browser</h1>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase text-gray-500 font-semibold">
              Tier
            </label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-3 py-2 bg-osrs-card"
            >
              <option value="All">All Tiers</option>
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase text-gray-500 font-semibold">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-osrs-card"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Incomplete">Incomplete</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase text-gray-500 font-semibold">
              Monster
            </label>
            <select
              value={filterMonster}
              onChange={(e) => setFilterMonster(e.target.value)}
              className="px-3 py-2 bg-osrs-card"
            >
              {monsters.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <label className="text-xs uppercase text-gray-500 font-semibold">
              Search
            </label>
            <input
              type="text"
              placeholder="Search achievement name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 bg-osrs-card rounded-md"
            />
          </div>
        </div>

        <div className="text-sm text-gray-400">
          Showing {filteredTasks.length} achievements
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort("tier")} className="cursor-pointer">
                Tier {sortArrow("tier")}
              </th>
              <th
                onClick={() => handleSort("Monster")}
                className="cursor-pointer"
              >
                Monster {sortArrow("Monster")}
              </th>
              <th onClick={() => handleSort("Name")} className="cursor-pointer">
                Achievement {sortArrow("Name")}
              </th>
              <th>Description</th>
              <th>Type</th>
              <th
                onClick={() => handleSort("completed")}
                className="cursor-pointer"
              >
                Status {sortArrow("completed")}
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
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
                <td className="text-gray-400 max-w-xs text-sm">
                  {task.Description}
                </td>
                <td className="text-gray-400 text-sm">{task.Type}</td>
                <td>
                  <span
                    className={`text-sm font-semibold ${
                      task.completed ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {task.completed ? "✓ Completed" : "Incomplete"}
                  </span>
                </td>
                <td>
                  {!task.completed && (
                    <button
                      className={`btn-secondary text-xs px-3 py-1 ${
                        pinnedIds.includes(task.id)
                          ? "bg-osrs-gold text-osrs-dark border-osrs-gold"
                          : ""
                      }`}
                      onClick={() => togglePin(task.id)}
                    >
                      {pinnedIds.includes(task.id) ? "Unpin" : "Pin"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
