import React from "react";
import Sidebar from "./Sidebar.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Layout({ title, action, children }) {
  const { dark, toggle } = useTheme();

  const bg   = dark ? "#0F1117" : "#F4F5F7";
  const text = dark ? "#E8EAED" : "#111318";
  const sub  = dark ? "#8B90A7" : "#6B7280";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, transition: "background 0.2s" }}>
      <Sidebar />
      <main style={{ marginLeft: "240px", flex: 1, padding: "28px 32px" }}>

        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "22px", fontWeight: 700,
            letterSpacing: "-0.4px",
            color: text, margin: 0,
          }}>
            {title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={toggle}
              title="Tema"
              className="theme-btn"
            >
              {dark ? "☾" : "☀"}
            </button>
            {action}
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}