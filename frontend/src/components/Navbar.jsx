import { NavLink, useNavigate } from "react-router-dom";
import { useAuth, useTheme } from "../App";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const { theme, toggleTheme }  = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  const linkStyle = ({ isActive }) => ({
    fontSize: 13, fontWeight: 500,
    color: isActive ? "var(--text)" : "var(--text-muted)",
    padding: "5px 10px", borderRadius: 8,
    background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
    transition: "all 0.18s", display: "inline-block",
  });

  return (
    <>
      <style>{`
        .navbar {
          position:sticky; top:0; z-index:50;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 24px; height:56px;
          background:rgba(8,7,14,0.92);
          border-bottom:1px solid var(--border);
          backdrop-filter:blur(20px);
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .nav-logo {
          display:flex; align-items:center; gap:8px;
          font-size:15px; font-weight:700; letter-spacing:-0.02em;
          cursor:pointer; user-select:none;
        }
        .nav-logo-icon {
          width:28px; height:28px; border-radius:8px;
          background:linear-gradient(135deg,rgba(244,194,106,0.25),rgba(244,116,106,0.15));
          border:1px solid rgba(244,194,106,0.2);
          display:flex; align-items:center; justify-content:center; font-size:14px;
        }
        .nav-links { display:flex; align-items:center; gap:2px; }
        .nav-links a:hover { color:var(--text) !important; background:rgba(255,255,255,0.055) !important; }
        .nav-sep { width:1px; height:18px; background:var(--border); margin:0 4px; }
        .nav-actions { display:flex; align-items:center; gap:8px; }
        .nav-avatar {
          width:30px; height:30px; border-radius:50%;
          background:linear-gradient(135deg,var(--accent),#B06EF4);
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:700; color:#fff;
          border:1px solid rgba(124,58,237,0.3);
        }
        .theme-btn {
          width:34px; height:34px; border-radius:10px;
          border:1px solid var(--border); background:var(--bg-card);
          cursor:pointer; display:flex; align-items:center;
          justify-content:center; font-size:15px;
          transition:all 0.2s; flex-shrink:0;
        }
        .theme-btn:hover {
          background:var(--bg-hover); border-color:var(--border-hi);
          transform:scale(1.08);
        }
        @media(max-width:600px){ .nav-links{ display:none; } }
      `}</style>

      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate("/")}>
          <div className="nav-logo-icon">🔥</div>
          Streak Engine
        </div>

        <div className="nav-links">
          <NavLink to="/"        style={linkStyle} end>Home</NavLink>
          <NavLink to="/about"   style={linkStyle}>About</NavLink>
          <NavLink to="/contact" style={linkStyle}>Contact</NavLink>
          {token && <>
            <div className="nav-sep" />
            <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
            <NavLink to="/ai"        style={linkStyle}>AI Coach</NavLink>
          </>}
        </div>

        <div className="nav-actions">

          {/* ── Theme Toggle ── */}
          <button className="theme-btn" onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {token ? (
            <>
              <div className="nav-avatar" title={user?.email}>
                {(user?.email?.[0] || "U").toUpperCase()}
              </div>
              <button className="btn btn-ghost"
                style={{padding:"5px 12px", fontSize:12}}
                onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost"
                style={{padding:"5px 12px", fontSize:12}}
                onClick={() => navigate("/login")}>
                Sign in
              </button>
              <button className="btn btn-primary"
                style={{padding:"5px 14px", fontSize:12}}
                onClick={() => navigate("/register")}>
                Get started →
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}