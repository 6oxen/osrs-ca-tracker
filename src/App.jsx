import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./components/Dashboard";
import Browser from "./components/Browser";
import Planner from "./components/Planner";
import TodoList from "./components/TodoList";

function MainLayout() {
  // Navigation State
  const [currentView, setView] = useState("dashboard");

  // Lifted state for filtering browser from dashboard clicks
  const [browserFilterTier, setBrowserFilterTier] = useState("All");

  const handleSetView = (view) => {
    setView(view);
    // Reset browser filter if navigating away, optional
    if (view !== "browser") setBrowserFilterTier("All");
  };

  return (
    <div className="app-layout">
      <Sidebar currentView={currentView} setView={handleSetView} />

      <main className="main-content">
        <TopBar />

        <div className="content-wrapper">
          {currentView === "dashboard" && (
            <Dashboard
              setView={handleSetView}
              setFilterTier={(tier) => {
                setBrowserFilterTier(tier);
                // Dashboard component logic handles the view switch via prop,
                // but we updated the state needed for Browser here
              }}
            />
          )}

          {currentView === "browser" && (
            <Browser initialTier={browserFilterTier} />
          )}
          {currentView === "planner" && <Planner />}
          {currentView === "todo" && <TodoList />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
