import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import Layout from "../components/Layout.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_UZ    = { Sunday:"Yak", Monday:"Dush", Tuesday:"Sesh", Wednesday:"Chor", Thursday:"Pay", Friday:"Juma", Saturday:"Shan" };
const MONTHS_UZ = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];

function pad(n) { return String(n).padStart(2, "0"); }
function fmtDate(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function monthKey(y, m)   { return `${y}-${pad(m + 1)}`; }

/* ---- DAVOMAT MODALI ---- */
function AttendanceModal({ date, groupId, dark, onClose }) {
  const [list, setList] = useState([]);

  async function load() {
    const { data } = await api.get(`/attendance/group/${groupId}`, { params: { date } });
    setList(data);
  }
  useEffect(() => { load(); }, [date]);

  async function toggle(studentId) {
    await api.patch(`/attendance/student/${studentId}/toggle`, { groupId, date });
    load();
  }

  const bg     = dark ? "#1A1D27" : "#ffffff";
  const border = dark ? "#2A2D3E" : "#E5E7EB";
  const text   = dark ? "#E8EAED" : "#111318";
  const sub    = dark ? "#8B90A7" : "#6B7280";

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", zIndex:100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background:bg, border:`1px solid ${border}`, borderRadius:"16px", padding:"24px", width:"100%", maxWidth:"360px", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"17px", fontWeight:700, color:text, margin:"0 0 4px" }}>Davomat</p>
        <p style={{ fontSize:"13px", color:sub, margin:"0 0 20px" }}>{date}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px", maxHeight:"280px", overflowY:"auto" }}>
          {list.map((item) => (
            <button key={item.studentId} onClick={() => toggle(item.studentId)}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:"10px", border:`1px solid ${border}`, background:"transparent", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"border-color 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#5B6AF0"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = border}
            >
              <span style={{ fontSize:"13.5px", fontWeight:500, color:text }}>{item.fullName}</span>
              <span className={`s-pill ${item.status === "present" ? "pill-green" : item.status === "absent" ? "pill-red" : "pill-gray"}`}>
                {item.status === "present" ? "Keldi" : item.status === "absent" ? "Kelmadi" : "Belgilanmagan"}
              </span>
            </button>
          ))}
          {list.length === 0 && <p style={{ fontSize:"13px", color:"#9CA3AF", textAlign:"center", padding:"16px 0" }}>O'quvchi yo'q</p>}
        </div>
        <button onClick={onClose} style={{ marginTop:"16px", fontSize:"13px", color:sub, background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>Yopish</button>
      </div>
    </div>
  );
}

/* ---- TO'LOV MODALI ---- */
function PaymentModal({ student, month, dark, onClose, onToggle }) {
  const isPaid = !student.isDebtor;
  const bg     = dark ? "#1A1D27" : "#ffffff";
  const border = dark ? "#2A2D3E" : "#E5E7EB";
  const text   = dark ? "#E8EAED" : "#111318";
  const sub    = dark ? "#8B90A7" : "#6B7280";

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", zIndex:100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background:bg, border:`1px solid ${border}`, borderRadius:"16px", padding:"24px", width:"100%", maxWidth:"360px", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
        <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"17px", fontWeight:700, color:text, margin:"0 0 4px" }}>{student.fullName}</p>
        <p style={{ fontSize:"13px", color:sub, margin:"0 0 20px" }}>{month} · To'lov holati</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px", borderRadius:"10px", marginBottom:"20px", background: isPaid ? "#DCFCE7" : "#FEE2E2" }}>
          <span style={{ fontSize:"13.5px", fontWeight:500, color:"#111318" }}>{month}</span>
          <span className={`s-pill ${isPaid ? "pill-green" : "pill-red"}`}>{isPaid ? "To'lagan" : "Qarzdor"}</span>
        </div>
        <button onClick={onToggle}
          style={{ width:"100%", padding:"11px", borderRadius:"10px", border:"none", cursor:"pointer", fontSize:"13.5px", fontWeight:600, color:"white", fontFamily:"'Inter',sans-serif", background: isPaid ? "#EF4444" : "#22C55E" }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          {isPaid ? "To'lamagan deb belgilash" : "To'ladi deb belgilash"}
        </button>
        <button onClick={onClose} style={{ width:"100%", marginTop:"10px", padding:"8px", fontSize:"13px", color:sub, background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>Yopish</button>
      </div>
    </div>
  );
}

/* ---- ASOSIY KOMPONENT ---- */
export default function GroupDetail() {
  const { id: groupId } = useParams();
  const { dark } = useTheme();

  const [group, setGroup]       = useState(null);
  const [students, setStudents] = useState([]);
  const [summary, setSummary]   = useState(null);

  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [showAdd, setShowAdd]     = useState(false);
  const [stuName, setStuName]     = useState("");
  const [stuPhone, setStuPhone]   = useState("");
  const [attDate, setAttDate]     = useState(null);
  const [payStudent, setPayStudent] = useState(null);

  const mKey = monthKey(viewYear, viewMonth);

  const cardBg  = dark ? "#1A1D27" : "#ffffff";
  const border  = dark ? "#2A2D3E" : "#E5E7EB";
  const divider = dark ? "#2A2D3E" : "#F3F4F6";
  const text    = dark ? "#E8EAED" : "#111318";
  const sub     = dark ? "#8B90A7" : "#6B7280";
  const formBg  = dark ? "#111318" : "#F9FAFB";

  async function loadAll() {
    const [gRes, sRes] = await Promise.all([
      api.get(`/groups/${groupId}`),
      api.get(`/students/group/${groupId}`),
    ]);
    setGroup(gRes.data);
    setStudents(sRes.data);
  }

  async function loadSummary() {
    try {
      const { data } = await api.get(`/payments/group/${groupId}/summary`, { params: { month: mKey } });
      setSummary(data);
    } catch {}
  }

  useEffect(() => { loadAll(); }, [groupId]);
  useEffect(() => { if (group) loadSummary(); }, [group, mKey]);

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

  async function handleAddStudent(e) {
    e.preventDefault();
    await api.post(`/students/group/${groupId}`, { fullName: stuName, phone: stuPhone });
    setStuName(""); setStuPhone(""); setShowAdd(false);
    loadAll(); loadSummary();
  }

  async function handleTogglePayment() {
    await api.patch(`/payments/student/${payStudent.id}/toggle`, { month: mKey });
    await loadSummary();
    setPayStudent(null);
  }

  if (!group) return <Layout title="Yuklanmoqda..."><p style={{ color: sub, fontSize:"14px" }}>Yuklanmoqda...</p></Layout>;

  const debtorIds = new Set(summary?.debtors?.map((d) => d.id) || []);
  const dayLabels = group.scheduleDays?.map((k) => DAY_UZ[k] || k).join(", ");

  const stats = [
    { label: "Kutilayotgan", val: `${Number(summary?.expectedTotal  || 0).toLocaleString()} so'm`, color: text },
    { label: "Yig'ilgan",    val: `${Number(summary?.collectedTotal || 0).toLocaleString()} so'm`, color: "#22C55E" },
    { label: "Qarzdorlar",   val: `${summary?.debtorsCount || 0} ta`,                              color: "#EF4444" },
  ];

  return (
    <Layout
      title={group.name}
      action={<Link to="/dashboard" style={{ fontSize:"13px", color:sub, textDecoration:"none" }}>← Guruhlar</Link>}
    >
      <p style={{ fontSize:"13px", color:sub, marginTop:"-16px", marginBottom:"20px", wordBreak:"break-word" }}>
        {group.lessonTime} · {dayLabels} · {Number(group.monthlyPrice).toLocaleString()} so'm/oy
      </p>

      {/* Statistika — responsive */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:"12px", padding:"16px 18px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize:"12px", color:sub, fontWeight:500, margin:"0 0 6px" }}>{s.label}</p>
            <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"20px", fontWeight:700, color:s.color, margin:0, letterSpacing:"-0.4px" }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Asosiy grid — responsive */}
      <div className="detail-grid">

        {/* O'quvchilar */}
        <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:"12px", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:`1px solid ${divider}` }}>
            <span style={{ fontSize:"13px", fontWeight:600, color:text }}>O'quvchilar · {students.length} ta</span>
            <button onClick={() => setShowAdd(!showAdd)} className="btn-primary" style={{ padding:"6px 12px", fontSize:"12px" }}>
              + Qo'shish
            </button>
          </div>

          {showAdd && (
            <form onSubmit={handleAddStudent} style={{ padding:"14px 20px", borderBottom:`1px solid ${divider}`, background:formBg, display:"flex", flexDirection:"column", gap:"10px" }}>
              <input required placeholder="Ism familiya" value={stuName} onChange={(e) => setStuName(e.target.value)} className="crm-input" />
              <input placeholder="Telefon (ixtiyoriy)" value={stuPhone} onChange={(e) => setStuPhone(e.target.value)} className="crm-input" />
              <div style={{ display:"flex", gap:"8px" }}>
                <button type="submit" className="btn-primary" style={{ padding:"6px 12px", fontSize:"12px" }}>Saqlash</button>
                <button type="button" onClick={() => setShowAdd(false)} style={{ fontSize:"12px", color:sub, background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>Bekor</button>
              </div>
            </form>
          )}

          <div>
            {students.map((s, i) => (
              <button key={s.id}
                onClick={() => setPayStudent({ ...s, isDebtor: debtorIds.has(s.id) })}
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", background:"transparent", border:"none", cursor:"pointer", borderBottom: i < students.length - 1 ? `1px solid ${divider}` : "none", fontFamily:"'Inter',sans-serif", transition:"background 0.1s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = dark ? "rgba(91,106,240,0.08)" : "#EEF0FE"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:28, height:28, borderRadius:"7px", background: dark ? "rgba(91,106,240,0.2)" : "#EEF0FE", color:"#5B6AF0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, flexShrink:0 }}>
                    {s.fullName.split(" ").map((w) => w[0]).slice(0,2).join("").toUpperCase()}
                  </div>
                  <span style={{ fontSize:"13.5px", fontWeight:500, color:text }}>{s.fullName}</span>
                </div>
                <span className={`s-pill ${debtorIds.has(s.id) ? "pill-red" : "pill-green"}`}>
                  {debtorIds.has(s.id) ? "Qarzdor" : "To'lagan"}
                </span>
              </button>
            ))}
            {students.length === 0 && (
              <p style={{ padding:"24px 20px", textAlign:"center", fontSize:"13px", color:sub }}>Hali o'quvchi yo'q. + Qo'shish tugmasini bosing.</p>
            )}
          </div>
        </div>

        {/* Kalendar */}
        <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:"12px", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:`1px solid ${divider}` }}>
            <button onClick={prevMonth} style={{ fontSize:"18px", color:sub, background:"none", border:"none", cursor:"pointer", lineHeight:1, padding:"0 4px" }}>‹</button>
            <span style={{ fontSize:"13px", fontWeight:600, color:text }}>{MONTHS_UZ[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ fontSize:"18px", color:sub, background:"none", border:"none", cursor:"pointer", lineHeight:1, padding:"0 4px" }}>›</button>
          </div>
          <div style={{ padding:"16px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px", marginBottom:"8px" }}>
              {["Ya","Du","Se","Ch","Pa","Ju","Sh"].map((d) => (
                <div key={d} style={{ fontSize:"10.5px", fontWeight:600, color:"#9CA3AF", textAlign:"center" }}>{d}</div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px" }}>
              {cells.map((cell, i) => cell ? (
                <button key={i} disabled={!cell.isLesson}
                  onClick={() => cell.isLesson && setAttDate(cell.dateStr)}
                  style={{
                    aspectRatio:"1", borderRadius:"8px", fontSize:"12px",
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
            <p style={{ marginTop:"14px", fontSize:"11px", color:"#9CA3AF", textAlign:"center" }}>
              Dars kunlariga bosing → davomat belgilang
            </p>
          </div>
        </div>
      </div>

      {attDate    && <AttendanceModal date={attDate} groupId={groupId} dark={dark} onClose={() => setAttDate(null)} />}
      {payStudent && <PaymentModal student={payStudent} month={mKey} dark={dark} onClose={() => setPayStudent(null)} onToggle={handleTogglePayment} />}
    </Layout>
  );
}