import { createContext, useContext, useState, useEffect, useMemo } from "react";

const AppContext = createContext();

const TIERS = ["Easy", "Medium", "Hard", "Elite", "Master", "Grandmaster"];
const TIER_POINTS = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Elite: 4,
  Master: 5,
  Grandmaster: 6,
};

export function AppProvider({ children }) {
  // --- State ---
  const [masterData, setMasterData] = useState({});
  const [userCompletedIds, setUserCompletedIds] = useState([]);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Planner state (persisted)
  const [plannerState, setPlannerState] = useState({
    plan: null,
    excludedIds: new Set(),
    pointsMode: "additional", // "total" or "additional"
  });

  // --- Initial Load ---
  useEffect(() => {
    // Load local JSON
    fetch("/combat_achievements.json")
      .then((res) => res.json())
      .then((data) => {
        setMasterData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load achievement data.");
        setLoading(false);
      });

    // Load Pins from LocalStorage
    const savedPins = localStorage.getItem("osrs_ca_pinned");
    if (savedPins)
      setPinnedIds(JSON.parse(savedPins).map((v) => parseInt(v, 10)));

    // Load Planner state from LocalStorage
    const savedPlannerState = localStorage.getItem("osrs_ca_planner");
    if (savedPlannerState) {
      try {
        const parsed = JSON.parse(savedPlannerState);
        setPlannerState({
          ...parsed,
          // Ensure excludedIds contains numeric IDs (localStorage may store strings)
          excludedIds: new Set(
            (parsed.excludedIds || []).map((v) => parseInt(v, 10))
          ),
        });
      } catch (e) {
        console.error("Failed to load planner state:", e);
      }
    }
  }, []);

  // --- Actions ---
  const fetchUserData = async (username) => {
    setLoading(true);
    setError(null);
    const formattedName = username.trim().replace(/ /g, "%20");
    const url = `https://sync.runescape.wiki/runelite/player/${formattedName}/STANDARD`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Player not found or API error");
      const data = await res.json();

      if (data.combat_achievements) {
        setUserCompletedIds(data.combat_achievements);
        setCurrentUser(username);
      }
    } catch (err) {
      setError(err.message);
      setCurrentUser(null);
      setUserCompletedIds([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePin = (id) => {
    const numericId = parseInt(id, 10);
    setPinnedIds((prev) => {
      const newPins = prev.includes(numericId)
        ? prev.filter((p) => p !== numericId)
        : [...prev, numericId];
      localStorage.setItem("osrs_ca_pinned", JSON.stringify(newPins));
      return newPins;
    });
  };

  const clearPins = () => {
    setPinnedIds([]);
    localStorage.removeItem("osrs_ca_pinned");
  };

  const updatePlannerState = (updates) => {
    setPlannerState((prev) => {
      const newState = { ...prev, ...updates };
      // Persist to localStorage
      localStorage.setItem(
        "osrs_ca_planner",
        JSON.stringify({
          ...newState,
          excludedIds: Array.from(newState.excludedIds),
        })
      );
      return newState;
    });
  };

  // --- Derived State (Calculated automatically) ---
  const currentPoints = useMemo(() => {
    let points = 0;
    Object.entries(masterData).forEach(([id, task]) => {
      if (userCompletedIds.includes(parseInt(id))) {
        points += TIER_POINTS[task.Tier] || 0;
      }
    });
    return points;
  }, [masterData, userCompletedIds]);

  const isCompleted = (id) => userCompletedIds.includes(parseInt(id));
  const getPoints = (tier) => TIER_POINTS[tier] || 0;

  return (
    <AppContext.Provider
      value={{
        masterData,
        userCompletedIds,
        pinnedIds,
        currentUser,
        loading,
        error,
        currentPoints,
        TIERS,
        fetchUserData,
        togglePin,
        clearPins,
        isCompleted,
        getPoints,
        plannerState,
        updatePlannerState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
