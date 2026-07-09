import React, { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Layout({ title, action, children }) {
  const { dark, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bg   = dark ? "#0F1117" : "#F4F5F7";
  const text = dark ? "#E8EAED" : "#111318";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, transition: "background 0.2s" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content">
        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Burger menu — faqat mobilda ko'rinadi */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="burger-btn"
              title="Menu"
            >
              <span style={{ display: "block", width: "18px", height: "2px", background: text, borderRadius: "2px", marginBottom: "4px", transition: "background 0.2s" }} />
              <span style={{ display: "block", width: "18px", height: "2px", background: text, borderRadius: "2px", marginBottom: "4px", transition: "background 0.2s" }} />
              <span style={{ display: "block", width: "18px", height: "2px", background: text, borderRadius: "2px", transition: "background 0.2s" }} />
            </button>

            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "20px", fontWeight: 700,
              letterSpacing: "-0.4px",
              color: text, margin: 0,
            }}>
              {title}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={toggle} title="Tema" className="theme-btn">
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