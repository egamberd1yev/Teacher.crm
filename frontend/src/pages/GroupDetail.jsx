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
  const [reasonFor, setReasonFor] = useState(null);
  const [reasonText, setReasonText] = useState("");
  const [lateFor, setLateFor] = useState(null);
  const [lateText, setLateText] = useState("");
  const [commentFor, setCommentFor] = useState(null);
  const [commentText, setCommentText] = useState("");

  async function load() {
    const { data } = await api.get(`/attendance/group/${groupId}`, { params: { date } });
    setList(data);
  }
  useEffect(() => { load(); }, [date]);

  async function setStatus(studentId, status, reason) {
    await api.patch(`/attendance/student/${studentId}/status`, { groupId, date, status, reason });
    setReasonFor(null);
    setReasonText("");
    load();
  }

  async function setLate(studentId, lateMinutes) {
    await api.patch(`/attendance/student/${studentId}/late`, { groupId, date, lateMinutes: Number(lateMinutes) });
    setLateFor(null);
    setLateText("");
    load();
  }

  async function setComment(studentId, comment) {
    await api.patch(`/attendance/student/${studentId}/comment`, { groupId, date, comment });
    setCommentFor(null);
    setCommentText("");
    load();
  }

  function handleExcusedClick(studentId, existingReason) {
    setReasonFor(studentId);
    setReasonText(existingReason || "");
    setLateFor(null);
    setCommentFor(null);
  }

  function handleLateClick(studentId, existingLate) {
    setLateFor(studentId);
    setLateText(existingLate ? String(existingLate) : "");
    setReasonFor(null);
    setCommentFor(null);
  }

  function handleCommentClick(studentId, existingComment) {
    setCommentFor(studentId);
    setCommentText(existingComment || "");
    setReasonFor(null);
    setLateFor(null);
  }

  const bg     = dark ? "#1A1D27" : "#ffffff";
  const border = dark ? "#2A2D3E" : "#E5E7EB";
  const text   = dark ? "#E8EAED" : "#111318";
  const sub    = dark ? "#8B90A7" : "#6B7280";

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

  function miniBtnStyle(active, color) {
    return {
      flex: 1,
      padding: "5px 8px",
      fontSize: "11px",
      fontWeight: 600,
      borderRadius: "8px",
      border: `1px solid ${active ? color : border}`,
      background: active ? (dark ? `${color}22` : `${color}15`) : "transparent",
      color: active ? color : sub,
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
        <div style={{ display:"flex", flexDirection:"column", gap:"10px", maxHeight:"440px", overflowY:"auto" }}>
          {list.map((item) => (
            <div key={item.studentId} style={{ padding:"10px 12px", borderRadius:"10px", border:`1px solid ${border}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
                <span style={{ fontSize:"13.5px", fontWeight:500, color:text }}>{item.fullName}</span>
                {item.status === "excused" && item.reason && (
                  <span style={{ fontSize:"11px", color:sub, fontStyle:"italic", maxWidth:"140px", textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={item.reason}>
                    {item.reason}
                  </span>
                )}
              </div>

              {/* Asosiy davomat holati */}
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
                  <button onClick={() => setStatus(item.studentId, "excused", reasonText)} className="btn-primary" style={{ padding:"6px 12px", fontSize:"12px" }}>OK</button>
                </div>
              )}

              {/* Kech qoldi / Izoh — ixtiyoriy, bot orqali ota-onaga xabar ketadi */}
              <div style={{ display:"flex", gap:"6px", marginTop:"8px" }}>
                <button
                  style={miniBtnStyle(!!item.lateMinutes, "#F59E0B")}
                  onClick={() => handleLateClick(item.studentId, item.lateMinutes)}
                >
                  ⏰ {item.lateMinutes ? `${item.lateMinutes} daq kech` : "Kech qoldi"}
                </button>
                <button
                  style={miniBtnStyle(!!item.comment, "#5B6AF0")}
                  onClick={() => handleCommentClick(item.studentId, item.comment)}
                >
                  💬 {item.comment ? "Izoh bor" : "Izoh"}
                </button>
              </div>

              {lateFor === item.studentId && (
                <div style={{ display:"flex", gap:"6px", marginTop:"8px" }}>
                  <input
                    autoFocus
                    type="number"
                    min="1"
                    value={lateText}
                    onChange={(e) => setLateText(e.target.value)}
                    placeholder="Necha daqiqa? (masalan 15)"
                    className="crm-input"
                    style={{ flex:1, padding:"6px 10px", fontSize:"12px" }}
                    onKeyDown={(e) => { if (e.key === "Enter" && lateText) setLate(item.studentId, lateText); }}
                  />
                  <button
                    onClick={() => lateText && setLate(item.studentId, lateText)}
                    className="btn-primary"
                    style={{ padding:"6px 12px", fontSize:"12px" }}
                  >
                    OK
                  </button>
                </div>
              )}

              {commentFor === item.studentId && (
                <div style={{ display:"flex", flexDirection:"column", gap:"6px", marginTop:"8px" }}>
                  <textarea
                    autoFocus
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ota-onaga boradigan izoh..."
                    className="crm-input"
                    rows={2}
                    style={{ padding:"6px 10px", fontSize:"12px", resize:"none" }}
                  />
                  <div style={{ display:"flex", gap:"6px" }}>
                    <button onClick={() => setComment(item.studentId, commentText)} className="btn-primary" style={{ padding:"6px 12px", fontSize:"12px" }}>
                      Yuborish
                    </button>
                    <button
                      onClick={() => { setCommentFor(null); setCommentText(""); }}
                      style={{ fontSize:"12px", color:sub, background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}
                    >
                      Bekor
                    </button>
                  </div>
                </div>
              )}
            </div>
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
  const [copiedId, setCopiedId] = useState(null);

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

  function handleCopyCode(e, studentId, code) {
    e.stopPropagation(); // pastdagi qatorni bosilishini (to'lov modalini ochishni) to'xtatadi
    navigator.clipboard.writeText(code);
    setCopiedId(studentId);
    setTimeout(() => setCopiedId((cur) => (cur === studentId ? null : cur)), 1500);
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
              <div key={s.id}
                onClick={() => setPayStudent({ ...s, isDebtor: debtorIds.has(s.id) })}
                role="button"
                tabIndex={0}
                style={{ width:"100%", display:"flex", flexDirection:"column", gap:"6px", padding:"12px 20px", background:"transparent", border:"none", cursor:"pointer", borderBottom: i < students.length - 1 ? `1px solid ${divider}` : "none", fontFamily:"'Inter',sans-serif", transition:"background 0.1s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = dark ? "rgba(91,106,240,0.08)" : "#EEF0FE"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <div style={{ width:28, height:28, borderRadius:"7px", background: dark ? "rgba(91,106,240,0.2)" : "#EEF0FE", color:"#5B6AF0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, flexShrink:0 }}>
                      {s.fullName.split(" ").map((w) => w[0]).slice(0,2).join("").toUpperCase()}
                    </div>
                    <span style={{ fontSize:"13.5px", fontWeight:500, color:text }}>{s.fullName}</span>
                  </div>
                  <span className={`s-pill ${debtorIds.has(s.id) ? "pill-red" : "pill-green"}`}>
                    {debtorIds.has(s.id) ? "Qarzdor" : "To'lagan"}
                  </span>
                </div>

                {/* Ota-ona botga ulanishi uchun kod — nusxalash tugmasi bilan */}
                {s.linkCode && (
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", marginLeft:"38px" }}>
                    <span style={{ fontSize:"11px", color:sub }}>🔑 Kod:</span>
                    <span style={{ fontSize:"12px", fontWeight:600, color:"#5B6AF0", fontFamily:"monospace", letterSpacing:"0.5px" }}>{s.linkCode}</span>
                    <button
                      onClick={(e) => handleCopyCode(e, s.id, s.linkCode)}
                      style={{
                        fontSize:"10.5px", padding:"2px 8px", borderRadius:"6px",
                        border:`1px solid ${border}`, background:"transparent",
                        color: copiedId === s.id ? "#22C55E" : sub,
                        cursor:"pointer", fontFamily:"'Inter',sans-serif", fontWeight:600,
                      }}
                    >
                      {copiedId === s.id ? "✓ Nusxalandi" : "Nusxalash"}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {students.length === 0 && (
              <p style={{ padding:"24px 20px", textAlign:"center", fontSize:"13px", color:sub }}>Hali o'quvchi yo'q. + Qo'shish tugmasini bosing.</p>
            )}
          </div>
        </div>

        {/* Kalendar */}
        <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:"12px", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:`1px solid ${divider}` }}>
            <button onClick={prevMonth} style={{ fontSize:"22px", color:sub, background:"none", border:"none", cursor:"pointer", lineHeight:1, padding:"0 6px" }}>‹</button>
            <span style={{ fontSize:"16px", fontWeight:600, color:text }}>{MONTHS_UZ[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ fontSize:"22px", color:sub, background:"none", border:"none", cursor:"pointer", lineHeight:1, padding:"0 6px" }}>›</button>
          </div>
          <div style={{ padding:"24px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"8px", marginBottom:"12px" }}>
              {["Ya","Du","Se","Ch","Pa","Ju","Sh"].map((d) => (
                <div key={d} style={{ fontSize:"13px", fontWeight:600, color:"#9CA3AF", textAlign:"center" }}>{d}</div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"8px" }}>
              {cells.map((cell, i) => cell ? (
                <button key={i} disabled={!cell.isLesson}
                  onClick={() => cell.isLesson && setAttDate(cell.dateStr)}
                  style={{
                    aspectRatio:"1", borderRadius:"10px", fontSize:"16px",
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
            <p style={{ marginTop:"18px", fontSize:"13px", color:"#9CA3AF", textAlign:"center" }}>
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