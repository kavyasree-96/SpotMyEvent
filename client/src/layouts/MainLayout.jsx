import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", fontFamily: "'Outfit', sans-serif" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 999, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 32px", height: "70px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span onClick={() => navigate("/")} style={{ fontSize: "1.4rem", fontWeight: 900, color: "#F8CB2E", cursor: "pointer" }}>SpotMyEvent</span>
        <div style={{ display: "flex", gap: "32px" }}>
          <NavLink to="/" end style={({ isActive }) => ({ color: isActive ? "#fff" : "#777", textDecoration: "none" })}>Home</NavLink>
          <NavLink to="/trending" style={({ isActive }) => ({ color: isActive ? "#fff" : "#777", textDecoration: "none" })}>Trending Events</NavLink>
          <NavLink to="/calendar" style={({ isActive }) => ({ color: isActive ? "#fff" : "#777", textDecoration: "none" })}>Calendar Sync</NavLink>
          <NavLink to="/history" style={({ isActive }) => ({ color: isActive ? "#fff" : "#777", textDecoration: "none" })}>
  My History
</NavLink>
        </div>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "#fff" }}>👋 {user.name}</span>
            <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #EE5007", color: "#EE5007", padding: "6px 16px", borderRadius: "100px", cursor: "pointer" }}>Logout</button>
          </div>
        ) : (
          <button onClick={() => navigate("/login")} style={{ background: "#EE5007", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "100px", fontWeight: 700, cursor: "pointer" }}>Sign In</button>
        )}
      </nav>
      <main style={{ flex: 1, width: "100%", display: "flex", justifyContent: "center", padding: "40px 0" }}>
        <div style={{ width: "100%", maxWidth: "1400px", padding: "0 32px" }}>
          <Outlet />
        </div>
      </main>
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 32px", display: "flex", justifyContent: "space-between", color: "#666" }}>
        <span>© {new Date().getFullYear()} SpotMyEvent</span>
        <span style={{ color: "#F8CB2E", fontWeight: 700 }}>Live Events Near You</span>
      </footer>
    </div>
  );
}