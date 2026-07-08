import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_TOP = [
  { to: "/dashboard", label: "Dashboard", icon: "⊞" },
  { to: "/groups",    label: "Guruhlar",  icon: "◫" },
];
const NAV_BOTTOM = [
  { to: "/payments",   label: "To'lovlar", icon: "◈" },
  { to: "/attendance", label: "Davomat",   icon: "◷" },
];

const SECTION_LABEL = {
  fontSize: "10px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#4B5568",
  padding: "0 12px 6px",
};

export default function Sidebar() {
  const { teacher, logout } = useAuth();
  const navigate = useNavigate();

  const initials = teacher?.fullName
    ? teacher.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside style={{
      position: "fixed",
      left: 0, top: 0, bottom: 0,
      width: "240px",
      backgroundColor: "#111318",
      display: "flex",
      flexDirection: "column",
      padding: "20px 12px",
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "0 12px 20px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: "17px", fontWeight: 700,
        color: "#E8EAED", letterSpacing: "-0.3px",
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#5B6AF0", flexShrink: 0, display: "inline-block" }} />
        Repetitor CRM
      </div>

      {/* Asosiy */}
      <p style={SECTION_LABEL}>Asosiy</p>
      {NAV_TOP.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
        >
          <span style={{ fontSize: "14px", opacity: 0.7 }}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      {/* Kuzatuv */}
      <p style={{ ...SECTION_LABEL, paddingTop: "16px" }}>Kuzatuv</p>
      {NAV_BOTTOM.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
        >
          <span style={{ fontSize: "14px", opacity: 0.7 }}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      {/* O'qituvchi info */}
      <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "8px", cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          {/* Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: "8px",
            background: "linear-gradient(135deg, #5B6AF0, #818CF8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "12px", fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>

          {/* Ism */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#E8EAED", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {teacher?.fullName || "O'qituvchi"}
            </p>
            <p style={{ fontSize: "11px", color: "#6B7A8D", margin: 0 }}>Repetitor</p>
          </div>

          {/* Chiqish tugmasi */}
          <button
            onClick={handleLogout}
            title="Chiqish"
            style={{ fontSize: "12px", color: "#6B7A8D", background: "none", border: "none", cursor: "pointer", padding: "0 4px", fontFamily: "'Inter',sans-serif", transition: "color 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#EF4444"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#6B7A8D"}
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}