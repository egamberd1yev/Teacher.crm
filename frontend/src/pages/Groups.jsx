import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import Layout from "../components/Layout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const DAYS = [
  { key: "Monday",    label: "Dush" },
  { key: "Tuesday",  label: "Sesh" },
  { key: "Wednesday",label: "Chor" },
  { key: "Thursday", label: "Pay"  },
  { key: "Friday",   label: "Juma" },
  { key: "Saturday", label: "Shan" },
  { key: "Sunday",   label: "Yak"  },
];

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function GroupCard({ group, summary, dark }) {
  const count     = group.students?.length || 0;
  const expected  = Number(summary?.expectedTotal  || 0);
  const collected = Number(summary?.collectedTotal || 0);
  const pct       = expected > 0 ? Math.round((collected / expected) * 100) : 0;

  const dayLabels = group.scheduleDays
    ?.map((k) => DAYS.find((d) => d.key === k)?.label || k)
    .join(", ");

  const dotColor    = pct === 100 ? "#22C55E" : pct > 0 ? "#F59E0B" : "#EF4444";
  const pctColor    = pct === 100 ? "#22C55E" : pct > 0 ? "#F59E0B" : "#EF4444";
  const barGradient = pct === 100
    ? "linear-gradient(90deg,#22C55E,#4ADE80)"
    : pct > 0
    ? "linear-gradient(90deg,#F59E0B,#FCD34D)"
    : "transparent";
  const cardBorder = dark ? "#2A2D3E" : "#E5E7EB";

  return (
    <Link
      to={`/groups/${group.id}`}
      style={{
        display: "block",
        background: dark ? "#1A1D27" : "#ffffff",
        border: `1px solid ${cardBorder}`,
        borderRadius: "12px",
        padding: "18px",
        textDecoration: "none",
        transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#5B6AF0";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = cardBorder;
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "15px", fontWeight: 600, color: dark ? "#E8EAED" : "#111318", margin: 0, paddingRight: "8px", lineHeight: 1.3 }}>
          {group.name}
        </h3>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0, marginTop: 5, display: "inline-block" }} />
      </div>

      <p style={{ fontSize: "11.5px", color: dark ? "#8B90A7" : "#6B7280", margin: "0 0 2px" }}>{dayLabels}</p>
      <p style={{ fontSize: "11.5px", color: dark ? "#8B90A7" : "#6B7280", margin: "0 0 14px" }}>{group.lessonTime}</p>

      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", fontWeight: 500, color: dark ? "#E8EAED" : "#111318" }}>
            {collected.toLocaleString()} / {expected.toLocaleString()} so'm
          </span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: pctColor }}>{pct}%</span>
        </div>
        <div style={{ height: "4px", borderRadius: "9999px", background: dark ? "#2A2D3E" : "#E5E7EB", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: "9999px", background: barGradient, transition: "width 0.5s" }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: dark ? "#8B90A7" : "#6B7280" }}>
          👤 {count} ta o'quvchi
        </span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#5B6AF0", background: dark ? "rgba(91,106,240,0.15)" : "#EEF0FE", padding: "2px 8px", borderRadius: "6px" }}>
          {Number(group.monthlyPrice).toLocaleString()} so'm
        </span>
      </div>
    </Link>
  );
}

export default function Groups() {
  const { dark } = useTheme();
  const [groups, setGroups]       = useState([]);
  const [summaries, setSummaries] = useState({});
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm] = useState({ name: "", lessonTime: "", monthlyPrice: "", scheduleDays: [] });
  const month = currentMonth();

  const text    = dark ? "#E8EAED" : "#111318";
  const subtext = dark ? "#8B90A7" : "#6B7280";
  const cardBg  = dark ? "#1A1D27" : "#ffffff";
  const border  = dark ? "#2A2D3E" : "#E5E7EB";

  async function loadGroups() {
    const { data } = await api.get("/groups");
    setGroups(data);
    data.forEach(async (g) => {
      try {
        const res = await api.get(`/payments/group/${g.id}/summary`, { params: { month } });
        setSummaries((prev) => ({ ...prev, [g.id]: res.data }));
      } catch {}
    });
  }

  useEffect(() => { loadGroups(); }, []);

  function toggleDay(key) {
    setForm((f) => ({
      ...f,
      scheduleDays: f.scheduleDays.includes(key)
        ? f.scheduleDays.filter((d) => d !== key)
        : [...f.scheduleDays, key],
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/groups", { ...form, monthlyPrice: Number(form.monthlyPrice) });
    setForm({ name: "", lessonTime: "", monthlyPrice: "", scheduleDays: [] });
    setShowForm(false);
    loadGroups();
  }

  return (
    <Layout
      title="Guruhlar"
      action={
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <span className="btn-text-full">+ Guruh yaratish</span>
          <span className="btn-text-short">+</span>
        </button>
      }
    >
      {/* Guruh yaratish forma */}
      {showForm && (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "15px", fontWeight: 600, color: text, margin: "0 0 16px" }}>Yangi guruh</p>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: text, marginBottom: "6px" }}>Guruh nomi</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ingliz tili — A1" className="crm-input" />
            </div>

            <div className="form-row">
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: text, marginBottom: "6px" }}>Dars vaqti</label>
                <input type="time" required value={form.lessonTime} onChange={(e) => setForm({ ...form, lessonTime: e.target.value })} className="crm-input" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: text, marginBottom: "6px" }}>Oylik narx (so'm)</label>
                <input type="number" required value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} placeholder="300000" className="crm-input" />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: text, marginBottom: "8px" }}>Dars kunlari</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {DAYS.map((day) => (
                  <button
                    type="button"
                    key={day.key}
                    onClick={() => toggleDay(day.key)}
                    style={{
                      padding: "6px 14px", borderRadius: "9999px", fontSize: "12.5px", fontWeight: 500,
                      border: `1px solid ${form.scheduleDays.includes(day.key) ? "#5B6AF0" : border}`,
                      background: form.scheduleDays.includes(day.key) ? "#5B6AF0" : "transparent",
                      color: form.scheduleDays.includes(day.key) ? "white" : subtext,
                      cursor: "pointer", transition: "all 0.15s", fontFamily: "'Inter',sans-serif",
                    }}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-primary">Guruh yaratish</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13.5px", fontWeight: 500, color: subtext, background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
                Bekor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Guruhlar ro'yxati */}
      <div className="groups-grid">
        {groups.map((g) => (
          <GroupCard key={g.id} group={g} summary={summaries[g.id]} dark={dark} />
        ))}
        {groups.length === 0 && !showForm && (
          <div style={{ gridColumn: "span 3", background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "40px", textAlign: "center" }}>
            <p style={{ color: subtext, fontSize: "14px", marginBottom: "12px" }}>Hali guruh yo'q</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">+ Birinchi guruhni yarating</button>
          </div>
        )}
      </div>
    </Layout>
  );
}