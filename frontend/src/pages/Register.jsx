import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { register }            = useAuth();
  const { dark, toggle }        = useTheme();
  const navigate                = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(fullName, email, password, phone);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  const bg   = dark ? "#0F1117" : "#F4F5F7";
  const text = dark ? "#E8EAED" : "#111318";
  const sub  = dark ? "#8B90A7" : "#6B7280";

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", position: "relative", transition: "background 0.2s" }}>

      {/* Tema toggle */}
      <button onClick={toggle} className="theme-btn" style={{ position: "absolute", top: "20px", right: "20px" }}>
        {dark ? "☾" : "☀"}
      </button>

      <div style={{ width: "100%", maxWidth: "360px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#5B6AF0", display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "18px", fontWeight: 700, color: text, letterSpacing: "-0.3px" }}>
            Repetitor CRM
          </span>
        </div>

        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "26px", fontWeight: 700, color: text, letterSpacing: "-0.5px", margin: "0 0 6px" }}>
          Hisob yaratish
        </h2>
        <p style={{ fontSize: "14px", color: sub, margin: "0 0 28px" }}>
          Bepul ro'yxatdan o'ting
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="auth-label">Ism familiya</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Abdullayev Jasur"
              className="crm-input"
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="crm-input"
            />
          </div>

          <div className="form-group">
            <label className="auth-label">
              Telefon{" "}
              <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(ixtiyoriy)</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="crm-input"
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Parol</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="crm-input"
            />
          </div>

          {error && (
            <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "11px 16px", fontSize: "14px" }}
          >
            {loading ? "Yaratilmoqda..." : "Hisob yaratish"}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "13px", textAlign: "center", color: sub }}>
          Hisobingiz bormi?{" "}
          <Link to="/login" style={{ color: "#5B6AF0", fontWeight: 600, textDecoration: "none" }}>
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}