import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import Layout from "../components/Layout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function StatusPill({ state }) {
  const map = {
    paid:    { label: "To'lagan",     className: "pill-green" },
    partial: { label: "Qarzdor",      className: "pill-yellow" },
    unpaid:  { label: "To'lanmagan",  className: "pill-red" },
  };
  const { label, className } = map[state] || map.unpaid;
  return <span className={`s-pill ${className}`}>{label}</span>;
}

function Row({ row, dark, onSave }) {
  const [value, setValue] = useState(row.amount || "");
  const [saving, setSaving] = useState(false);
  const border = dark ? "#2A2D3E" : "#E5E7EB";
  const text   = dark ? "#E8EAED" : "#111318";
  const sub    = dark ? "#8B90A7" : "#6B7280";

  useEffect(() => { setValue(row.amount || ""); }, [row.amount]);

  const dirty = Number(value || 0) !== Number(row.amount || 0);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(row.studentId, value);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1.2fr 1fr 1fr 1fr auto",
        alignItems: "center",
        gap: "10px",
        padding: "12px 20px",
        borderBottom: `1px solid ${border}`,
      }}
      className="payments-row"
    >
      <div>
        <p style={{ fontSize: "13.5px", fontWeight: 500, color: text, margin: 0 }}>{row.fullName}</p>
        <p style={{ fontSize: "11.5px", color: sub, margin: "2px 0 0" }}>{row.phone || "—"}</p>
      </div>
      <p style={{ fontSize: "12.5px", color: sub, margin: 0 }}>{row.groupName}</p>
      <p style={{ fontSize: "12.5px", color: text, margin: 0 }}>{Number(row.monthlyPrice).toLocaleString()} so'm</p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="0"
        className="crm-input"
        style={{ padding: "6px 10px", fontSize: "12.5px" }}
      />
      <StatusPill state={row.state} />
      <button
        onClick={handleSave}
        disabled={!dirty || saving}
        className="btn-primary"
        style={{ padding: "6px 12px", fontSize: "12px", opacity: !dirty || saving ? 0.5 : 1, cursor: !dirty || saving ? "default" : "pointer" }}
      >
        {saving ? "..." : "Saqlash"}
      </button>
    </div>
  );
}

export default function Payments() {
  const { dark } = useTheme();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState(currentMonth());

  const cardBg  = dark ? "#1A1D27" : "#ffffff";
  const border  = dark ? "#2A2D3E" : "#E5E7EB";
  const text    = dark ? "#E8EAED" : "#111318";
  const subtext = dark ? "#8B90A7" : "#6B7280";

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/payments", { params: { month } });
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [month]);

  async function handleSave(studentId, amount) {
    await api.patch(`/payments/student/${studentId}/amount`, { month, amount: Number(amount) || 0 });
    await load();
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? rows.filter((r) =>
        r.fullName?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.groupName?.toLowerCase().includes(q) ||
        String(r.monthlyPrice || "").includes(q)
      )
    : rows;

  const totalExpected  = rows.reduce((s, r) => s + Number(r.monthlyPrice || 0), 0);
  const totalCollected = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalDebtors   = rows.filter((r) => r.state !== "paid").length;

  const stats = [
    { label: "Kutilayotgan", value: `${totalExpected.toLocaleString()} so'm`,  color: text },
    { label: "Yig'ilgan",    value: `${totalCollected.toLocaleString()} so'm`, color: "#22C55E" },
    { label: "Qarzdorlar",   value: `${totalDebtors} ta`,                       color: "#EF4444" },
  ];

  return (
    <Layout title="To'lovlar">
      {/* Statistika */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "12px", color: subtext, fontWeight: 500, margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "20px", fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.4px" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Oy tanlash + qidiruv */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px", marginTop: "20px" }}>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="crm-input"
          style={{ maxWidth: "180px" }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Qidirish: ism, telefon, guruh yoki narx..."
          className="crm-input"
          style={{ flex: 1, minWidth: "220px", maxWidth: "420px" }}
        />
      </div>

      {/* Ro'yxat */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1.2fr 1fr 1fr 1fr auto",
            gap: "10px",
            padding: "10px 20px",
            borderBottom: `1px solid ${border}`,
            background: dark ? "#111318" : "#F9FAFB",
          }}
        >
          {["O'quvchi", "Guruh", "Oylik narx", "To'langan summa", "Holat", ""].map((h) => (
            <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: subtext, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</span>
          ))}
        </div>

        {loading && <p style={{ padding: "24px 20px", textAlign: "center", fontSize: "13px", color: subtext }}>Yuklanmoqda...</p>}

        {!loading && filtered.map((row) => (
          <Row key={row.studentId} row={row} dark={dark} onSave={handleSave} />
        ))}

        {!loading && filtered.length === 0 && (
          <p style={{ padding: "24px 20px", textAlign: "center", fontSize: "13px", color: subtext }}>
            {rows.length === 0 ? "Hali o'quvchi yo'q" : "Hech narsa topilmadi"}
          </p>
        )}
      </div>
    </Layout>
  );
}