import { useState, useEffect, useRef } from "react";
import { SUBJECT_COLORS, DEFAULT_COLOR, DAYS, MONTHS, getDaysInMonth, getFirstDay, fmtDate, urgencyColor, urgencyBg } from "./shared";

const SUBJECT_LIST = ["Math Extension 1", "Chemistry", "Economics", "English Advanced", "Biology", "Math Advanced", "General"];
const TYPE_LIST = ["Study", "Assessment", "Tutoring", "Commitment", "Other"];

export default function Dashboard({ events: initialEvents, handoff }) {
  const today = new Date();
  const todayStr = fmtDate(today.getFullYear(), today.getMonth(), today.getDate());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(todayStr);
  const [events, setEvents] = useState(initialEvents);
  const [tasks, setTasks] = useState((handoff.tasks||[]).map((t,i) => ({ id: i, text: t, done: false })));
  const [newTask, setNewTask] = useState("");
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", subject: "General", type: "Study", time: "" });
  const [now, setNow] = useState(new Date());
  const inputRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const cells = [...Array(getFirstDay(year, month)).fill(null), ...Array.from({length: getDaysInMonth(year, month)}, (_,i) => i+1)];
  const getEvts = (d) => events.filter(e => e.date === d);
  const selEvts = getEvts(selected);

  const assessments = events.filter(e => e.type === "Assessment")
    .map(e => {
      const examDate = new Date(e.date + "T09:00:00");
      const diff = examDate - now;
      const daysLeft = Math.ceil(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return { ...e, daysLeft, diff, hours, mins, secs };
    })
    .filter(e => e.diff > 0)
    .sort((a,b) => a.diff - b.diff);

  const nextExam = assessments[0];
  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const pad = (n) => String(Math.max(0,n)).padStart(2, "0");

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), text: newTask.trim(), done: false }]);
    setNewTask("");
    inputRef.current?.focus();
  };

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    setEvents(prev => [...prev, { ...newEvent, date: selected }]);
    setNewEvent({ title: "", subject: "General", type: "Study", time: "" });
    setAddEventOpen(false);
  };

  const col = (subj) => SUBJECT_COLORS[subj] || DEFAULT_COLOR;

  const card = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };

  const lbl = { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 };

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh", padding: "24px 28px", color: "#0f172a", fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4, color: "#3b82f6" }}>Year 11 · 2026</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: -0.5 }}>
            {today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening"}, Dhigash 👋
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
            {today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {nextExam && (
          <div style={{ background: urgencyBg(nextExam.daysLeft), border: `1px solid ${urgencyColor(nextExam.daysLeft)}33`, borderRadius: 18, padding: "14px 22px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: urgencyColor(nextExam.daysLeft), fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>
              {nextExam.title.replace("⚠️ ","")}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              {[
                { val: nextExam.daysLeft, label: "d" },
                { val: nextExam.hours, label: "h" },
                { val: nextExam.mins, label: "m" },
                { val: nextExam.secs, label: "s" },
              ].map((seg, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: urgencyColor(nextExam.daysLeft), fontVariantNumeric: "tabular-nums" }}>{pad(seg.val)}</span>
                  <span style={{ fontSize: 9, color: urgencyColor(nextExam.daysLeft), fontWeight: 700, opacity: 0.6 }}>{seg.label}</span>
                  {i < 3 && <span style={{ fontSize: 16, color: urgencyColor(nextExam.daysLeft), opacity: 0.25, margin: "0 2px" }}>:</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "0.75fr 0.85fr 0.65fr", gap: 16, marginBottom: 16 }}>

        {/* COL 1: Calendar */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button onClick={() => month===0?(setMonth(11),setYear(y=>y-1)):setMonth(m=>m-1)} style={{ background: "#f1f5f9", border: "none", color: "#64748b", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 15 }}>‹</button>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{MONTHS[month]} {year}</div>
            <button onClick={() => month===11?(setMonth(0),setYear(y=>y+1)):setMonth(m=>m+1)} style={{ background: "#f1f5f9", border: "none", color: "#64748b", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 15 }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, marginBottom: 3 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 9, color: "#cbd5e1", fontWeight: 700 }}>{d[0]}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`e${idx}`}/>;
              const dateStr = fmtDate(year, month, day);
              const evts = getEvts(dateStr);
              const isToday = dateStr === todayStr;
              const isSel = dateStr === selected;
              const hasExam = evts.some(e => e.type === "Assessment");
              return (
                <div key={dateStr} onClick={() => setSelected(dateStr)} style={{
                  borderRadius: 8, padding: "5px 2px 4px", minHeight: 38, cursor: "pointer", position: "relative",
                  background: isSel ? "#0f172a" : isToday ? "#eff6ff" : "#f8fafc",
                  border: isToday&&!isSel ? "1.5px solid #bfdbfe" : "1.5px solid transparent",
                  boxShadow: isSel ? "0 3px 10px rgba(15,23,42,0.15)" : "none",
                  transition: "all 0.12s",
                }}>
                  <div style={{ fontSize: 11, fontWeight: isSel||isToday?700:400, color: isSel?"#fff":isToday?"#2563eb":"#64748b", textAlign: "center", marginBottom: 2 }}>{day}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                    {evts.slice(0,3).map((e,i) => {
                      const c = col(e.subject);
                      return <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: isSel?"rgba(255,255,255,0.55)":e.type==="Assessment"?"#ef4444":c.dot }}/>;
                    })}
                  </div>
                  {hasExam&&!isSel&&<div style={{ position:"absolute",top:2,right:2,width:4,height:4,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 4px #ef4444" }}/>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(SUBJECT_COLORS).map(([s,c]) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot }}/>
                <span style={{ fontSize: 8, color: "#94a3b8" }}>{s.replace("Math Extension 1","Ext 1").replace("English Advanced","Eng").replace("Math Advanced","Math Adv")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COL 2: Selected day + Assessments — compact */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Selected day — compact */}
          <div style={card}>
            <div style={lbl}>
              {new Date(selected+"T12:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "short" })}
            </div>
            {selEvts.length === 0
              ? <div style={{ color: "#cbd5e1", fontSize: 12, textAlign: "center", padding: "10px 0" }}>Nothing on 🙌
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => setAddEventOpen(true)} style={{ background: "#f1f5f9", border: "none", borderRadius: 7, padding: "4px 10px", fontSize: 10, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>+ Add event</button>
                  </div>
                </div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {selEvts.map((e,i) => {
                    const c = col(e.subject);
                    const isExam = e.type === "Assessment";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: isExam?"#fff5f5":"#f8fafc", border: `1px solid ${isExam?"#fecaca":"#e2e8f0"}`, borderRadius: 9 }}>
                        <div style={{ width: 3, height: 28, borderRadius: 99, background: isExam?"#ef4444":c.dot, flexShrink: 0 }}/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: isExam?"#dc2626":"#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title.replace("⚠️ ","")}</div>
                          <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{e.subject}{e.time&&` · ${e.time}`}</div>
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 700, color: isExam?"#ef4444":"#94a3b8", background: isExam?"#fee2e2":"#f1f5f9", padding: "2px 6px", borderRadius: 99, flexShrink: 0 }}>{e.type.toUpperCase()}</span>
                      </div>
                    );
                  })}
                  <button onClick={() => setAddEventOpen(true)} style={{ background: "transparent", border: "1.5px dashed #e2e8f0", borderRadius: 9, padding: "5px", fontSize: 10, color: "#94a3b8", cursor: "pointer", fontWeight: 600 }}>+ Add event</button>
                </div>
            }
          </div>

          {/* Assessments — compact */}
          <div style={card}>
            <div style={lbl}>Upcoming Assessments</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {assessments.map((a,i) => {
                const urg = urgencyColor(a.daysLeft);
                const ugBg = urgencyBg(a.daysLeft);
                return (
                  <div key={i} onClick={() => setSelected(a.date)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <div style={{ background: ugBg, border: `1px solid ${urg}33`, borderRadius: 10, padding: "6px 8px", textAlign: "center", flexShrink: 0, minWidth: 42 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: urg, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{a.daysLeft}</div>
                      <div style={{ fontSize: 7, color: urg, fontWeight: 700, opacity: 0.7, textTransform: "uppercase" }}>days</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title.replace("⚠️ ","")}</div>
                      <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{a.subject}</div>
                    </div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: urg, background: ugBg, padding: "2px 7px", borderRadius: 99, flexShrink: 0 }}>
                      {a.daysLeft === 0 ? "TODAY" : a.daysLeft === 1 ? "TMR" : `${a.daysLeft}d`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COL 3: Tasks — full height */}
        <div style={{ ...card, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={lbl}>📋 Tasks</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 12 }}>{completedTasks}/{totalTasks}</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${totalTasks?(completedTasks/totalTasks)*100:0}%`, background: "linear-gradient(90deg,#22c55e,#16a34a)", borderRadius: 99, transition: "width 0.3s" }}/>
          </div>

          {/* Add task */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <input ref={inputRef} value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key==="Enter"&&addTask()} placeholder="Add a task..." style={{ flex: 1, padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 11, outline: "none", background: "#f8fafc", color: "#0f172a" }}/>
            <button onClick={addTask} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 9, width: 32, cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>

          {/* Task list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflow: "auto" }}>
            {tasks.map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", background: t.done?"#f0fdf4":"#f8fafc", border: `1px solid ${t.done?"#bbf7d0":"#e2e8f0"}`, borderRadius: 10 }}>
                <div onClick={() => setTasks(prev => prev.map(x => x.id===t.id?{...x,done:!x.done}:x))} style={{ width: 16, height: 16, borderRadius: 5, border: `2px solid ${t.done?"#22c55e":"#d1d5db"}`, background: t.done?"#22c55e":"#fff", flexShrink: 0, marginTop: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {t.done && <span style={{ fontSize: 9, color: "#fff", fontWeight: 800 }}>✓</span>}
                </div>
                <span style={{ fontSize: 11, color: t.done?"#86efac":"#374151", flex: 1, lineHeight: 1.5, textDecoration: t.done?"line-through":"none" }}>{t.text}</span>
                <button onClick={() => setTasks(prev => prev.filter(x => x.id!==t.id))} style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
              </div>
            ))}
            {tasks.length === 0 && <div style={{ textAlign: "center", color: "#cbd5e1", fontSize: 12, padding: "12px 0" }}>All done 🎉</div>}
          </div>
        </div>
      </div>

      {/* Row 2: Priority + Flags */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 16 }}>
        <div style={card}>
          <div style={lbl}>🎯 Priority Focus</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderLeft: "3px solid #ef4444", borderRadius: 12, padding: 13 }}>
              <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 800, letterSpacing: 1.5, marginBottom: 4 }}>#1 CRITICAL · {handoff.priority_days}D · {handoff.priority_subject?.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{handoff.priority_focus}</div>
            </div>
            {handoff.secondary_focus && (
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderLeft: "3px solid #f97316", borderRadius: 12, padding: 13 }}>
                <div style={{ fontSize: 9, color: "#f97316", fontWeight: 800, letterSpacing: 1.5, marginBottom: 4 }}>#2 HIGH · {handoff.secondary_days}D · {handoff.secondary_subject?.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{handoff.secondary_focus}</div>
              </div>
            )}
          </div>
        </div>

        {handoff.flags && handoff.flags.length > 0 && (
          <div style={card}>
            <div style={lbl}>⚠️ Flags</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {handoff.flags.map((f,i) => (
                <div key={i} style={{ fontSize: 11, color: "#374151", padding: "8px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderLeft: "3px solid #f59e0b", borderRadius: 9, lineHeight: 1.5 }}>{f}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {addEventOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setAddEventOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 28, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>Add Event</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={newEvent.title} onChange={e => setNewEvent(p=>({...p,title:e.target.value}))} placeholder="Event title..." style={{ padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, outline: "none", color: "#0f172a", background: "#f8fafc" }}/>
              <select value={newEvent.subject} onChange={e => setNewEvent(p=>({...p,subject:e.target.value}))} style={{ padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, outline: "none", color: "#0f172a", background: "#fff" }}>
                {SUBJECT_LIST.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={newEvent.type} onChange={e => setNewEvent(p=>({...p,type:e.target.value}))} style={{ padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, outline: "none", color: "#0f172a", background: "#fff" }}>
                {TYPE_LIST.map(t => <option key={t}>{t}</option>)}
              </select>
              <input value={newEvent.time} onChange={e => setNewEvent(p=>({...p,time:e.target.value}))} placeholder="Time (e.g. 1:00–3:00pm)" style={{ padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, outline: "none", color: "#0f172a", background: "#f8fafc" }}/>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Adding to: {new Date(selected+"T12:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button onClick={() => setAddEventOpen(false)} style={{ flex: 1, padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={addEvent} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add Event</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
