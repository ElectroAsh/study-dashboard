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

  // Aurora card style — but light/clean colours
  const card = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 22,
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "24px 28px", color: "#0f172a", fontFamily: "'Inter',system-ui,sans-serif", position: "relative" }}>

      {/* Subtle background blobs — Clean Slate colours */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #dbeafe55, transparent 70%)", pointerEvents: "none" }}/>
      <div style={{ position: "fixed", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #f0fdf455, transparent 70%)", pointerEvents: "none" }}/>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6, color: "#3b82f6" }}>Study Dashboard · Year 11 2026</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
              {today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening"}, Dhigash 👋
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              {today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* Live countdown — next exam */}
          {nextExam && (
            <div style={{ background: urgencyBg(nextExam.daysLeft), border: `1px solid ${urgencyColor(nextExam.daysLeft)}33`, borderRadius: 16, padding: "14px 20px", textAlign: "center", minWidth: 200 }}>
              <div style={{ fontSize: 10, color: urgencyColor(nextExam.daysLeft), fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
                {nextExam.title.replace("⚠️ ","")}
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 6 }}>
                {[
                  { val: nextExam.daysLeft, label: "d" },
                  { val: nextExam.hours, label: "h" },
                  { val: nextExam.mins, label: "m" },
                  { val: nextExam.secs, label: "s" },
                ].map((seg, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: urgencyColor(nextExam.daysLeft), fontVariantNumeric: "tabular-nums" }}>{pad(seg.val)}</span>
                    <span style={{ fontSize: 9, color: urgencyColor(nextExam.daysLeft), fontWeight: 700, opacity: 0.7 }}>{seg.label}</span>
                    {i < 3 && <span style={{ fontSize: 16, color: urgencyColor(nextExam.daysLeft), opacity: 0.3, margin: "0 1px" }}>:</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 1: Calendar + Day panel + Countdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Calendar */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={() => month===0?(setMonth(11),setYear(y=>y-1)):setMonth(m=>m-1)} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#64748b", borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>‹</button>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{MONTHS[month]} {year}</div>
            <button onClick={() => month===11?(setMonth(0),setYear(y=>y+1)):setMonth(m=>m+1)} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#64748b", borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 6 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#cbd5e1", fontWeight: 600 }}>{d[0]}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`e${idx}`}/>;
              const dateStr = fmtDate(year, month, day);
              const evts = getEvts(dateStr);
              const isToday = dateStr === todayStr;
              const isSel = dateStr === selected;
              const hasExam = evts.some(e => e.type === "Assessment");
              return (
                <div key={dateStr} onClick={() => setSelected(dateStr)} style={{
                  borderRadius: 10, padding: "7px 3px 5px", minHeight: 52, cursor: "pointer", position: "relative",
                  background: isSel ? "#0f172a" : isToday ? "#eff6ff" : "#f8fafc",
                  border: isToday&&!isSel ? "1.5px solid #bfdbfe" : isSel ? "1.5px solid #0f172a" : "1.5px solid #e2e8f0",
                  boxShadow: isSel ? "0 4px 12px rgba(15,23,42,0.15)" : "none",
                  transition: "all 0.12s",
                }}>
                  <div style={{ fontSize: 12, fontWeight: isSel||isToday?700:400, color: isSel?"#fff":isToday?"#2563eb":"#64748b", textAlign: "center", marginBottom: 3 }}>{day}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                    {evts.slice(0,3).map((e,i) => {
                      const c = col(e.subject);
                      return <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: isSel?"rgba(255,255,255,0.6)":e.type==="Assessment"?"#ef4444":c.dot }}/>;
                    })}
                  </div>
                  {hasExam&&!isSel&&<div style={{ position:"absolute",top:3,right:3,width:5,height:5,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 5px #ef4444" }}/>}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(SUBJECT_COLORS).map(([s,c]) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }}/>
                <span style={{ fontSize: 9, color: "#94a3b8" }}>{s.replace("Math Extension 1","Ext 1").replace("English Advanced","Eng").replace("Math Advanced","Math Adv")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: day + assessments stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Selected day */}
          <div style={{ ...card, flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
              {new Date(selected+"T12:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            {selEvts.length === 0
              ? <div style={{ color: "#e2e8f0", fontSize: 13, textAlign: "center", paddingTop: 12 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🙌</div>
                  Nothing on
                  <div style={{ marginTop: 10 }}>
                    <button onClick={() => setAddEventOpen(true)} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>+ Add event</button>
                  </div>
                </div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selEvts.map((e, i) => {
                    const c = col(e.subject);
                    const isExam = e.type === "Assessment";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: isExam?"#fff5f5":"#f8fafc", border: `1px solid ${isExam?"#fecaca":"#e2e8f0"}`, borderRadius: 10 }}>
                        <div style={{ width: 3, height: 36, borderRadius: 99, background: isExam?"#ef4444":c.dot, flexShrink: 0 }}/>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isExam?"#dc2626":"#0f172a" }}>{e.title.replace("⚠️ ","")}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{e.subject}{e.time&&` · ${e.time}`}</div>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: isExam?"#ef4444":"#94a3b8", background: isExam?"#fee2e2":"#f1f5f9", padding: "2px 7px", borderRadius: 99, letterSpacing: 0.5 }}>{e.type.toUpperCase()}</span>
                      </div>
                    );
                  })}
                  <button onClick={() => setAddEventOpen(true)} style={{ background: "#fff", border: "1.5px dashed #e2e8f0", borderRadius: 10, padding: "7px", fontSize: 11, color: "#94a3b8", cursor: "pointer", fontWeight: 600 }}>+ Add event</button>
                </div>
            }
          </div>

          {/* Assessment countdown — Aurora progress bars, clean colours */}
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Assessments</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {assessments.map((a, i) => {
                const urg = urgencyColor(a.daysLeft);
                const pct = Math.max(0, Math.min(100, (1 - a.daysLeft/14)*100));
                return (
                  <div key={i} onClick={() => setSelected(a.date)} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{a.title.replace("⚠️ ","")}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: urg, flexShrink: 0, marginLeft: 8 }}>{a.daysLeft}d</span>
                    </div>
                    <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${urg}, ${urg}88)`, borderRadius: 99 }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Priority + Tasks */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 16, marginBottom: 16 }}>

        {/* Priority */}
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>🎯 Priority Focus</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderLeft: "3px solid #ef4444", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>#1 · {handoff.priority_days}D · {handoff.priority_subject?.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{handoff.priority_focus}</div>
            </div>
            {handoff.secondary_focus && (
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderLeft: "3px solid #f97316", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, color: "#f97316", fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>#2 · {handoff.secondary_days}D · {handoff.secondary_subject?.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{handoff.secondary_focus}</div>
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>📋 Tasks</div>
          {/* Progress */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>Progress</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e" }}>{completedTasks}/{totalTasks}</span>
            </div>
            <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${totalTasks?(completedTasks/totalTasks)*100:0}%`, background: "linear-gradient(90deg,#22c55e,#16a34a)", borderRadius: 99, transition: "width 0.3s" }}/>
            </div>
          </div>
          {/* Add task */}
          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            <input ref={inputRef} value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key==="Enter"&&addTask()} placeholder="Add task..." style={{ flex: 1, padding: "6px 8px", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 11, outline: "none", background: "#f8fafc", color: "#0f172a" }}/>
            <button onClick={addTask} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 7, padding: "0 10px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>+</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflow: "auto" }}>
            {tasks.map(t => (
              <div key={t.id} style={{ display: "flex", gap: 7, cursor: "pointer", alignItems: "flex-start", opacity: t.done?0.4:1 }}>
                <div onClick={() => setTasks(prev => prev.map(x => x.id===t.id?{...x,done:!x.done}:x))} style={{ width: 14, height: 14, borderRadius: 4, border: `2px solid ${t.done?"#22c55e":"#e2e8f0"}`, background: t.done?"#22c55e":"transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {t.done && <span style={{ fontSize: 9, color: "#fff" }}>✓</span>}
                </div>
                <span style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, flex: 1, textDecoration: t.done?"line-through":"none" }}>{t.text}</span>
                <button onClick={() => setTasks(prev => prev.filter(x => x.id!==t.id))} style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer", fontSize: 13, padding: 0 }}>×</button>
              </div>
            ))}
            {tasks.length === 0 && <div style={{ textAlign: "center", color: "#e2e8f0", fontSize: 12, padding: "10px 0" }}>No tasks 🎉</div>}
          </div>
        </div>
      </div>

      {/* Row 3: Flags */}
      {handoff.flags && handoff.flags.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>⚠️ Flags</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {handoff.flags.map((f,i) => (
              <div key={i} style={{ fontSize: 12, color: "#374151", padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderLeft: "3px solid #f59e0b", borderRadius: 10 }}>{f}</div>
            ))}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {addEventOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setAddEventOpen(false)}>
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
