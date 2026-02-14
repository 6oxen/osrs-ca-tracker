import { useApp } from "../context/AppContext";

export default function Sidebar({ currentView, setView }) {
  const { currentUser, pinnedIds } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        {/* stylized OSRS-like crest + text */}
        <div className="flex items-center justify-center gap-3">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="#2b2b2b"
              stroke="#dca350"
              strokeWidth="1.6"
            />
            <path
              d="M12 6v6l4 2"
              stroke="#dca350"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>OSRS Tracker</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavButton
          label="Dashboard"
          id="dashboard"
          active={currentView}
          setView={setView}
        />
        <NavButton
          label="All Achievements"
          id="browser"
          active={currentView}
          setView={setView}
        />
        <NavButton
          label="Team CAs"
          id="teamcas"
          active={currentView}
          setView={setView}
        />
        <NavButton
          label="To-Do List"
          id="todo"
          active={currentView}
          setView={setView}
          badge={pinnedIds.length}
        />
      </nav>
      <div className="sidebar-footer">
        <div
          className={`status-indicator ${currentUser ? "connected" : ""}`}
        ></div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            {currentUser || "No User"}
          </span>
          <span className="text-xs text-gray-500">
            {currentUser ? "Connected" : "Offline"}
          </span>
        </div>
      </div>
    </aside>
  );
}

function NavButton({ label, id, active, setView, badge }) {
  const Icon = ({ name }) => {
    // small inline icons, kept simple and lightweight
    if (name === "dashboard")
      return (
        <svg
          className="w-5 h-5 text-osrs-gold"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="3"
            width="8"
            height="8"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="13"
            y="3"
            width="8"
            height="8"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="3"
            y="13"
            width="8"
            height="8"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      );
    if (name === "browser")
      return (
        <svg
          className="w-5 h-5 text-osrs-gold"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 21l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle
            cx="11"
            cy="11"
            r="6"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      );
    if (name === "planner")
      return (
        <svg
          className="w-5 h-5 text-osrs-gold"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 7h18"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M6 11h12"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M9 15h6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    if (name === "teamcas")
      return (
        <svg
          className="w-5 h-5 text-osrs-gold"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
          <circle
            cx="16"
            cy="8"
            r="3"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M5 14c0-1.5 1.5-3 3-3h8c1.5 0 3 1.5 3 3v3H5v-3z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      );
    if (name === "todo")
      return (
        <svg
          className="w-5 h-5 text-osrs-gold"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12l4 4L19 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    return null;
  };

  return (
    <button
      className={`nav-btn ${active === id ? "active" : ""}`}
      onClick={() => setView(id)}
    >
      <div className="flex items-center gap-3">
        <Icon name={id} />
        <span>{label}</span>
      </div>
      {badge !== undefined && <span className="badge">{badge}</span>}
    </button>
  );
}
