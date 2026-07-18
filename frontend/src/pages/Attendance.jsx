import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import Layout from "../components/Layout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS_UZ = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];

function pad(n) { return String(n).padStart(2, "0"); }
function fmtDate(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

/* ---- DAVOMAT MODALI ---- */
function AttendanceModal({ date, groupId, dark, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasonFor, setReasonFor] = useState(null); // studentId whose reason input is open
  const [reasonText, setReasonText] = useState("");

  const bg     = dark ? "#1A1D27" : "#ffffff";
  const border = dark ? "#2A2D3E" : "#E5E7EB";
  const text   = dark ? "#E8EAED" : "#111318";
  const sub    = dark ? "#8B90A7" : "#6B7280";

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/attendance/group/${groupId}`, { params: { date } });
      setList(data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [date]);

  async function setStatus(studentId, status, reason) {
    await api.patch(`/attendance/student/${studentId}/status`, { groupId, date, status, reason });
    setReasonFor(null);
    setReasonText("");
    load();
  }

  function handleExcusedClick(studentId, existingReason) {
    setReasonFor(studentId);
    setReasonText(existingReason || "");
  }

  function statusBtnStyle(active, color) {
    return {
      flex: 1,
      padding: "6px 8px",
      fontSize: "11.5px",
      fontWeight: 600,
      borderRadius: "8px",
      border: `1px solid ${active ? color : border}`,
      background: active ? color : "transparent",
      color: active ? "white" : sub,
      cursor: "pointer",
      fontFamily: "'Inter',sans-serif",
      transition: "all 0.15s",
    };
  }

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", zIndex:100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background:bg, border:`1px solid ${border}`, borderRadius:"16px", padding:"24px", width:"100%", maxWidth:"420px", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"17px", fontWeight:700, color:text, margin:"0 0 4px" }}>Davomat</p>
        <p style={{ fontSize:"13px", color:sub, margin:"0 0 20px" }}>{date}</p>

        {loading && <p style={{ fontSize:"13px", color:sub, textAlign:"center", padding:"16px 0" }}>Yuklanmoqda...</p>}

        <div style={{ display:"flex", flexDirection:"column", gap:"10px", maxHeight:"400px", overflowY:"auto" }}>
          {!loading && list.map((item) => (
            <div key={item.studentId} style={{ padding:"10px 12px", borderRadius:"10px", border:`1px solid ${border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
                <span style={{ fontSize:"13.5px", fontWeight:500, color:text }}>{item.fullName}</span>
                {item.status === "excused" && item.reason && (
                  <span style={{ fontSize:"11px", color:sub, fontStyle:"italic", maxWidth:"140px", textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={item.reason}>
                    {item.reason}
                  </span>
                )}
              </div>
              <div style={{ display:"flex", gap:"6px" }}>
                <button style={statusBtnStyle(item.status === "present", "#22C55E")} onClick={() => setStatus(item.studentId, "present")}>Keldi</button>
                <button style={statusBtnStyle(item.status === "absent", "#EF4444")} onClick={() => setStatus(item.studentId, "absent")}>Kelmadi</button>
                <button style={statusBtnStyle(item.status === "excused", "#F59E0B")} onClick={() => handleExcusedClick(item.studentId, item.reason)}>Sababli</button>
              </div>

              {reasonFor === item.studentId && (
                <div style={{ display:"flex", gap:"6px", marginTop:"8px" }}>
                  <input
                    autoFocus
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    placeholder="Sababini yozing..."
                    className="crm-input"
                    style={{ flex:1, padding:"6px 10px", fontSize:"12px" }}
                    onKeyDown={(e) => { if (e.key === "Enter") setStatus(item.studentId, "excused", reasonText); }}
                  />
                  <button
                    onClick={() => setStatus(item.studentId, "excused", reasonText)}
                    className="btn-primary"
                    style={{ padding:"6px 12px", fontSize:"12px" }}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          ))}
          {!loading && list.length === 0 && <p style={{ fontSize:"13px", color:"#9CA3AF", textAlign:"center", padding:"16px 0" }}>O'quvchi yo'q</p>}
        </div>

        <button onClick={onClose} style={{ marginTop:"16px", fontSize:"13px", color:sub, background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>Yopish</button>
      </div>
    </div>
  );
}

/* ---- ASOSIY KOMPONENT ---- */
export default function Attendance() {
  const { dark } = useTheme();
  const [groups, setGroups]     = useState([]);
  const [groupId, setGroupId]   = useState("");
  const [group, setGroup]       = useState(null);
  const [attDate, setAttDate]   = useState(null);

  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const cardBg  = dark ? "#1A1D27" : "#ffffff";
  const border  = dark ? "#2A2D3E" : "#E5E7EB";
  const text    = dark ? "#E8EAED" : "#111318";
  const sub     = dark ? "#8B90A7" : "#6B7280";

  async function loadGroups() {
    const { data } = await api.get("/groups");
    setGroups(data);
    if (data.length > 0) setGroupId(data[0].id);
  }
  useEffect(() => { loadGroups(); }, []);

  async function loadGroup(id) {
    if (!id) return;
    const { data } = await api.get(`/groups/${id}`);
    setGroup(data);
  }
  useEffect(() => { loadGroup(groupId); }, [groupId]);

  const cells = useMemo(() => {
    if (!group) return [];
    const first       = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < first; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dayName  = DAY_NAMES[new Date(viewYear, viewMonth, d).getDay()];
      const isLesson = group.scheduleDays?.includes(dayName);
      const isToday  = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
      arr.push({ d, isLesson, isToday, dateStr: fmtDate(viewYear, viewMonth, d) });
    }
    return arr;
  }, [group, viewYear, viewMonth]);

  function prevMonth() { viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y-1)) : setViewMonth(m => m-1); }
  function nextMonth() { viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y+1)) : setViewMonth(m => m+1); }

  return (
    <Layout title="Davomat">
      {/* Guruh tanlash */}
      <div style={{ marginBottom: "20px", maxWidth: "320px" }}>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="crm-input"
          style={{ width: "100%" }}
        >
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
          {groups.length === 0 && <option value="">Guruh yo'q</option>}
        </select>
      </div>

      {!group && groups.length > 0 && (
        <p style={{ color: sub, fontSize: "14px" }}>Yuklanmoqda...</p>
      )}

      {groups.length === 0 && (
        <p style={{ color: sub, fontSize: "14px" }}>Avval guruh yarating.</p>
      )}

      {group && (
        <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:"12px", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", maxWidth:"760px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 28px", borderBottom:`1px solid ${border}` }}>
            <button onClick={prevMonth} style={{ fontSize:"26px", color:sub, background:"none", border:"none", cursor:"pointer", lineHeight:1, padding:"0 8px" }}>‹</button>
            <span style={{ fontSize:"18px", fontWeight:600, color:text }}>{MONTHS_UZ[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ fontSize:"26px", color:sub, background:"none", border:"none", cursor:"pointer", lineHeight:1, padding:"0 8px" }}>›</button>
          </div>
          <div style={{ padding:"28px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"10px", marginBottom:"14px" }}>
              {["Ya","Du","Se","Ch","Pa","Ju","Sh"].map((d) => (
                <div key={d} style={{ fontSize:"14px", fontWeight:600, color:"#9CA3AF", textAlign:"center" }}>{d}</div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"10px" }}>
              {cells.map((cell, i) => cell ? (
                <button key={i} disabled={!cell.isLesson}
                  onClick={() => cell.isLesson && setAttDate(cell.dateStr)}
                  style={{
                    aspectRatio:"1", borderRadius:"12px", fontSize:"18px",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    border: cell.isToday ? "2px solid #5B6AF0" : "2px solid transparent",
                    background: cell.isLesson ? (dark ? "rgba(91,106,240,0.2)" : "#EEF0FE") : "transparent",
                    color: cell.isLesson ? "#5B6AF0" : (dark ? "#374151" : "#D1D5DB"),
                    fontWeight: cell.isLesson ? 600 : 400,
                    cursor: cell.isLesson ? "pointer" : "default",
                    transition:"background 0.1s, color 0.1s",
                    fontFamily:"'Inter',sans-serif",
                  }}
                  onMouseEnter={(e) => { if (cell.isLesson) { e.currentTarget.style.background="#5B6AF0"; e.currentTarget.style.color="white"; }}}
                  onMouseLeave={(e) => { if (cell.isLesson) { e.currentTarget.style.background=dark?"rgba(91,106,240,0.2)":"#EEF0FE"; e.currentTarget.style.color="#5B6AF0"; }}}
                >
                  {cell.d}
                </button>
              ) : <span key={i} />)}
            </div>
            <p style={{ marginTop:"20px", fontSize:"14px", color:"#9CA3AF", textAlign:"center" }}>
              Dars kunlariga bosing → davomat belgilang
            </p>
          </div>
        </div>
      )}

      {attDate && group && (
        <AttendanceModal date={attDate} groupId={groupId} dark={dark} onClose={() => setAttDate(null)} />
      )}
    </Layout>
  );
}