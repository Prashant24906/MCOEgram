import { NavLink, useNavigate } from "react-router-dom";
import socket from "../sockets";

// ─── Icons (inline SVG — no extra dep needed) ────────────────────────────────
const Icons = {
  Logo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  Articles: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),
  Moments: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Chat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Profile: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --mcoe-navy:       #0f1b35;
    --mcoe-navy-mid:   #162040;
    --mcoe-navy-light: #1e2d54;
    --mcoe-border:     rgba(255,255,255,0.07);
    --mcoe-gold:       #f5c842;
    --mcoe-gold-dim:   rgba(245,200,66,0.12);
    --mcoe-text:       #e8eaf2;
    --mcoe-muted:      #7a86a8;
    --mcoe-danger:     #ff5c6e;
    --sidebar-w:       72px;
    --sidebar-w-open:  220px;
    --transition:      all 0.28s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Sidebar shell ── */
  .nb-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: var(--sidebar-w);
    background: var(--mcoe-navy-mid);
    border-right: 1px solid var(--mcoe-border);
    display: flex;
    flex-direction: column;
    z-index: 1000;
    overflow: hidden;
    transition: var(--transition);
  }

  /* Expand on hover */
  .nb-sidebar:hover {
    width: 18rem;
    box-shadow: 4px 0 32px rgba(0,0,0,0.4);
  }

  /* ── Push page content right ── */
  .nb-page-offset {
    margin-left: var(--sidebar-w);
    transition: var(--transition);
  }

  /* ── Logo area ── */
  .nb-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 22px 20px 18px;
    text-decoration: none;
    min-height: 72px;
    border-bottom: 1px solid var(--mcoe-border);
    overflow: hidden;
    white-space: nowrap;
  }

  .nb-logo-icon {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    color: var(--mcoe-gold);
  }

  .nb-logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: var(--mcoe-gold);
    opacity: 0;
    transform: translateX(-8px);
    transition: opacity 0.2s ease 0.05s, transform 0.25s ease 0.05s;
  }

  .nb-sidebar:hover .nb-logo-text {
    opacity: 1;
    transform: translateX(0);
  }

  /* ── Nav items ── */
  .nb-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 10px;
    list-style: none;
    margin: 0;
    overflow: hidden;
  }

  .nb-nav-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 10px;
    border-radius: 12px;
    text-decoration: none;
    color: var(--mcoe-muted);
    white-space: nowrap;
    transition: var(--transition);
    position: relative;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    font-family: 'DM Sans', sans-serif;
  }

  .nb-nav-item:hover {
    background: var(--mcoe-navy-light);
    color: var(--mcoe-text);
  }

  /* Active state */
  .nb-nav-item.active {
    color: var(--mcoe-gold);
    background: var(--mcoe-gold-dim);
  }

  .nb-nav-item.active .nb-icon {
    color: var(--mcoe-gold);
  }

  /* Active left indicator bar */
  .nb-nav-item.active::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: var(--mcoe-gold);
    border-radius: 0 3px 3px 0;
  }

  /* ── Icon wrapper ── */
  .nb-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    transition: var(--transition);
  }

  .nb-nav-item:hover .nb-icon {
    transform: scale(1.1);
  }

  /* ── Label ── */
  .nb-label {
    font-size: 14px;
    font-weight: 500;
    opacity: 0;
    transform: translateX(-6px);
    transition: opacity 0.18s ease 0.06s, transform 0.22s ease 0.06s;
    pointer-events: none;
  }

  .nb-sidebar:hover .nb-label {
    opacity: 1;
    transform: translateX(0);
  }

  /* ── Divider ── */
  .nb-divider {
    height: 1px;
    background: var(--mcoe-border);
    margin: 8px 14px;
    flex-shrink: 0;
  }

  /* ── Bottom section (logout) ── */
  .nb-bottom {
    padding: 12px 10px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* ── Logout button specifically ── */
  .nb-nav-item.nb-logout:hover {
    background: rgba(255,92,110,0.1);
    color: var(--mcoe-danger);
  }

  .nb-nav-item.nb-logout:hover .nb-icon {
    color: var(--mcoe-danger);
  }

  /* ── Tooltip (shown when sidebar is NOT hovered, acts as label fallback) ── */
  .nb-nav-item::after {
    content: attr(data-tooltip);
    position: absolute;
    left: calc(var(--sidebar-w) - 4px);
    top: 50%;
    transform: translateY(-50%);
    background: var(--mcoe-navy-light);
    border: 1px solid var(--mcoe-border);
    color: var(--mcoe-text);
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    z-index: 1100;
  }

  /* Show tooltip only when sidebar is collapsed (not hovered) */
  .nb-sidebar:not(:hover) .nb-nav-item:hover::after {
    opacity: 1;
  }

  /* ── Mobile bottom bar ── */
  @media (max-width: 768px) {
    .nb-sidebar {
      top: auto;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 60px;
      flex-direction: row;
      border-right: none;
      border-top: 1px solid var(--mcoe-border);
    }

    .nb-sidebar:hover {
      width: 100%;
      height: 60px;
      box-shadow: none;
    }

    .nb-logo { display: none; }
    .nb-divider { display: none; }

    .nb-nav {
      flex-direction: row;
      padding: 0;
      gap: 0;
      justify-content: space-around;
      align-items: center;
      flex: 1;
    }

    .nb-bottom {
      flex-direction: row;
      padding: 0 8px;
      align-items: center;
    }

    .nb-nav-item {
      flex-direction: column;
      gap: 2px;
      padding: 8px 12px;
      border-radius: 8px;
    }

    .nb-nav-item::before { display: none; }
    .nb-nav-item::after  { display: none; }

    .nb-label {
      font-size: 9px;
      opacity: 1;
      transform: none;
    }

    .nb-sidebar:hover .nb-label { opacity: 1; transform: none; }

    .nb-icon { width: 20px; height: 20px; }

    /* Push content UP on mobile */
    .nb-page-offset {
      margin-left: 0;
      margin-bottom: 60px;
    }
  }
`;

function injectStyles(id, css) {
  if (document.getElementById(id)) return;
  const tag = document.createElement("style");
  tag.id = id;
  tag.textContent = css;
  document.head.appendChild(tag);
}

// ─── Component ────────────────────────────────────────────────────────────────

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  injectStyles("mcoe-navbar-styles", STYLES);

  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    navigate("/login");
  };

  const dest = (path) => (token ? path : "/login");

  const navItems = [
    { to: dest("/ArticlesPage"), icon: <Icons.Articles />, label: "Articles",  tip: "Articles" },
    { to: dest("/MomentsPage"),    icon: <Icons.Moments />,    label: "Moments",     tip: "Moments"    },
    { to: dest("/chats"),        icon: <Icons.Chat />,     label: "Chat",      tip: "Chat"     },
    { to: dest("/me"),           icon: <Icons.Profile />,  label: "Profile",   tip: "Profile"  },
  ];

  return (
    <nav className="nb-sidebar">
      {/* ── Logo ── */}
      <NavLink className="nb-logo" to={dest("/ArticlesPage")}>
        <span className="nb-icon nb-logo-icon"><Icons.Logo /></span>
        <span className="nb-logo-text">MCOEGRAM</span>
      </NavLink>

      {/* ── Main nav links ── */}
      <ul className="nb-nav">
        {navItems.map(({ to, icon, label, tip }) => (
          <li key={label} style={{ listStyle: "none" }}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `nb-nav-item${isActive ? " active" : ""}`
              }
              data-tooltip={tip}
            >
              <span className="nb-icon">{icon}</span>
              <span className="nb-label">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="nb-divider" />

      {/* ── Bottom: logout ── */}
      <div className="nb-bottom">
        {!token ? (
          <NavLink
            to="/login"
            className="nb-nav-item"
            data-tooltip="Login"
          >
            <span className="nb-icon"><Icons.Profile /></span>
            <span className="nb-label">Login</span>
          </NavLink>
        ) : (
          <button
            className="nb-nav-item nb-logout"
            onClick={handleLogout}
            data-tooltip="Logout"
          >
            <span className="nb-icon"><Icons.Logout /></span>
            <span className="nb-label">Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;