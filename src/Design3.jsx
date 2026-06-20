import { useState, useEffect, useRef } from "react";
import { SUBJECT_COLORS, DEFAULT_COLOR, DAYS, MONTHS, getDaysInMonth, getFirstDay, fmtDate, urgencyColor, urgencyBg } from "./shared";

const SUBJECT_LIST = ["Math Extension 1", "Chemistry", "Economics", "English Advanced", "Biology", "Math Advanced", "General"];
const TYPE_LIST = ["Study", "Assessment", "Tutoring", "Commitment", "Other"];

export default function Design3({ events: initialEvents, handoff }) {
  const today = new Date();
  const todayStr = fmtDate(today.getFullYear(), today.getMonth(), today.getDate());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(todayStr);
  const [events, setEvents] = useState(initialEvents);
  const [tasks, setTasks] = useState((handoff.tasks||[]).map((t,i) => ({ id: i, text: t, done: false })));
  const [newTask, setNewTask] = useState("");
  const [view, setView] = useState("month");
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", subject: "General", type: "Study", time: "" });
  const [hoveredDay, setHoveredDay] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("schedule");
  const inputRef = useRef();

  const cells = [...Array(getFirstDay(year, month)).fill(null), ...Array.from({length: getDaysInMonth(year, month)}, (_,i) => i+1)];
  const getEvts = (d) => events.filter(e => e.date === d);
  const selEvts = getEvts(selected);
  const assessments = events.filter(e => e.type === "Assessment")
    .map(e => ({ ...e, daysLeft: Math.ceil((new Date(e.date+"T12:00:00") - today) / 86400000) }))
    .filter(e => e.daysLeft >= 0).sort((a,b) => a.daysLeft - b.daysLeft);

  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;

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

  const getWeekDates = () => {
    const d = new Date(selected + "T12:00:00");
    const day = d.getDay();
    return Array.from({length: 7}, (_, i) => {
      const nd = new Date(d);
      nd.setDate(d.getDate() - day + i);
      return fmtDate(nd.getFullYear(), nd.getMonth(), nd.getDate());
    });
  };

  const col = (subj) => SUBJECT_COLORS[subj] || DEFAULT_COLOR;

  const SIDEBAR_TABS = [
    { id: "schedule", label: "Schedule" },
    { id: "focus", label: "Focus" },
    { id: "deadlines", label: "Deadlines" },
    { id: "tasks", label: "Tasks" },
    { id: "flags", label: "Flags" },
  ];

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", color: "#0f172a", fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Top nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52, position: "sticky", top: 56, zIndex: 90 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
            {today.getHours() < 12 ? "☀️" : today.getHours() < 17 ? "🌤️" : "🌙"} Dhigash
          </div>
          <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
            {["month","week","day"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "4px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                background: view === v ? "#fff" : "transparent",
                color: view === v ? "#0f172a" : "#94a3b8",
                fontSize: 12, fontWeight: view === v ? 700 : 400,
                boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s", textTransform: "capitalize"
              }}>{v}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f1f5f9", borderRadius: 99, padding: "5px 12px" }}>
            <div style={{ width: 60, height: 4, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${totalTasks?(completedTasks/totalTasks)*100:0}%`, background: "#22c55e", borderRadius: 99, transition: "width 0.3s" }}/>
            </div>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{completedTasks}/{totalTasks} tasks</span>
          </div>
          <button onClick={() => setAddEventOpen(true)} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add Event</button>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{today.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", minHeight: "calc(100vh - 108px)" }}>

        {/* Main */}
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => { setSelected(todayStr); setMonth(today.getMonth()); setYear(today.getFullYear()); }} style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "#eff6ff", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}>Today</button>
              <button onClick={() => month===0?(setMonth(11),setYear(y=>y-1)):setMonth(m=>m-1)} style={{ background: "#f1f5f9", border: "none", color: "#64748b", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 15 }}>‹</button>
              <button onClick={() => month===11?(setMonth(0),setYear(y=>y+1)):setMonth(m=>m+1)} style={{ background: "#f1f5f9", border: "none", color: "#64748b", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 15 }}>›</button>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{MONTHS[month]} {year}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {assessments.slice(0,3).map((a,i) => (
                <div key={i} onClick={() => { setSelected(a.date); setMonth(new Date(a.date+"T12:00:00").getMonth()); setSidebarTab("deadlines"); }} style={{ background: urgencyBg(a.daysLeft), border: `1px solid ${urgencyColor(a.daysLeft)}33`, borderRadius: 99, padding: "3px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: urgencyColor(a.daysLeft) }}>{a.daysLeft}d</span>
                  <span style={{ fontSize: 10, color: "#64748b" }}>{a.subject.replace("Math Extension 1","Ext 1").replace("English Advanced","Eng")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MONTH VIEW */}
          {view === "month" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
                {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#cbd5e1", fontWeight: 700, letterSpacing: 1, padding: "6px 0", borderBottom: "1px solid #e2e8f0" }}>{d}</div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", border: "1px solid #e2e8f0", borderTop: "none" }}>
                {cells.map((day, idx) => {
                  if (!day) return <div key={`e${idx}`} style={{ minHeight: 90, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", background: "#fafafa" }}/>;
                  const dateStr = fmtDate(year, month, day);
                  const evts = getEvts(dateStr);
                  const isToday = dateStr === todayStr;
                  const isSel = dateStr === selected;
                  const hasExam = evts.some(e => e.type === "Assessment");
                  return (
                    <div key={dateStr} onClick={() => { setSelected(dateStr); setSidebarTab("schedule"); }}
                      onMouseEnter={() => setHoveredDay(dateStr)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{ minHeight: 90, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "6px 6px 4px", cursor: "pointer", position: "relative", background: isSel?"#f0f9ff":isToday?"#fefce8":hoveredDay===dateStr?"#f8fafc":"#fff", transition: "background 0.1s" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isToday?"#0f172a":isSel?"#3b82f6":"transparent", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: isToday||isSel?700:400, color: isToday||isSel?"#fff":"#64748b" }}>{day}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {evts.slice(0,3).map((e,i) => {
                          const c = col(e.subject);
                          return <div key={i} style={{ fontSize: 9, fontWeight: 600, padding: "2px 5px", borderRadius: 4, background: e.type==="Assessment"?"#fee2e2":c.light||"#f1f5f9", color: e.type==="Assessment"?"#dc2626":"#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", borderLeft: `2px solid ${e.type==="Assessment"?"#ef4444":c.dot}` }}>{e.title.replace("⚠️ ","")}</div>;
                        })}
                        {evts.length > 3 && <div style={{ fontSize: 9, color: "#94a3b8", paddingLeft: 4 }}>+{evts.length-3} more</div>}
                      </div>
                      {hasExam && <div style={{ position:"absolute",top:5,right:5,width:6,height:6,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 4px #ef4444" }}/>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* WEEK VIEW */}
          {view === "week" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
              {getWeekDates().map(dateStr => {
                const d = new Date(dateStr+"T12:00:00");
                const evts = getEvts(dateStr);
                const isToday = dateStr === todayStr;
                const isSel = dateStr === selected;
                return (
                  <div key={dateStr} onClick={() => { setSelected(dateStr); setSidebarTab("schedule"); }} style={{ cursor: "pointer" }}>
                    <div style={{ textAlign: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{DAYS[d.getDay()].slice(0,3)}</div>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: isToday?"#0f172a":isSel?"#3b82f6":"transparent", display: "flex", alignItems: "center", justifyContent: "center", margin: "4px auto" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isToday||isSel?"#fff":"#64748b" }}>{d.getDate()}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 200 }}>
                      {evts.map((e,i) => {
                        const c = col(e.subject);
                        return <div key={i} style={{ padding: "6px 8px", borderRadius: 8, background: e.type==="Assessment"?"#fee2e2":c.light||"#f1f5f9", borderLeft: `3px solid ${e.type==="Assessment"?"#ef4444":c.dot}` }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{e.title.replace("⚠️ ","")}</div>
                          {e.time && <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.time}</div>}
                        </div>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DAY VIEW */}
          {view === "day" && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>
                {new Date(selected+"T12:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              {selEvts.length === 0
                ? <div style={{ textAlign: "center", padding: "60px 0", color: "#cbd5e1" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🙌</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>Nothing scheduled</div>
                    <button onClick={() => setAddEventOpen(true)} style={{ marginTop: 16, background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add something</button>
                  </div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {selEvts.map((e,i) => {
                      const c = col(e.subject);
                      const isExam = e.type === "Assessment";
                      return (
                        <div key={i} style={{ display: "flex", gap: 16, padding: "16px 20px", background: "#fff", border: `1px solid ${isExam?"#fecaca":"#e2e8f0"}`, borderLeft: `4px solid ${isExam?"#ef4444":c.dot}`, borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: isExam?"#ef4444":c.dot }}/>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>{e.type} · {e.subject}</span>
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: isExam?"#dc2626":"#0f172a", marginBottom: 4 }}>{e.title.replace("⚠️ ","")}</div>
                            {e.time && <div style={{ fontSize: 13, color: "#64748b" }}>🕐 {e.time}</div>}
                            {isExam && <div style={{ marginTop: 8, fontSize: 12, color: "#dc2626", fontWeight: 600, background: "#fee2e2", padding: "4px 10px", borderRadius: 8, display: "inline-block" }}>⚠️ Exam Day</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
              }
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ borderLeft: "1px solid #e2e8f0", background: "#fff", display: "flex", flexDirection: "column", height: "calc(100vh - 108px)", position: "sticky", top: 108, overflow: "hidden" }}>

          {/* Tabs — scrollable row */}
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", overflowX: "auto" }}>
            {SIDEBAR_TABS.map(tab => (
              <button key={tab.id} onClick={() => setSidebarTab(tab.id)} style={{
                flexShrink: 0, padding: "11px 14px", border: "none", cursor: "pointer",
                fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
                background: sidebarTab === tab.id ? "#fff" : "#f8fafc",
                color: sidebarTab === tab.id ? "#0f172a" : "#94a3b8",
                borderBottom: sidebarTab === tab.id ? "2px solid #0f172a" : "2px solid transparent",
                transition: "all 0.15s",
              }}>{tab.label}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>

            {/* SCHEDULE TAB */}
            {sidebarTab === "schedule" && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
                  {new Date(selected+"T12:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
                </div>
                {selEvts.length === 0
                  ? <div style={{ color: "#e2e8f0", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🙌</div>
                      Nothing scheduled
                      <div style={{ marginTop: 12 }}>
                        <button onClick={() => setAddEventOpen(true)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 600, color: "#64748b", cursor: "pointer" }}>+ Add event</button>
                      </div>
                    </div>
                  : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {selEvts.map((e,i) => {
                        const c = col(e.subject);
                        const isExam = e.type === "Assessment";
                        return (
                          <div key={i} style={{ padding: "10px 12px", background: isExam?"#fff5f5":"#f8fafc", border: `1px solid ${isExam?"#fecaca":"#e2e8f0"}`, borderLeft: `3px solid ${isExam?"#ef4444":c.dot}`, borderRadius: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: isExam?"#dc2626":"#0f172a" }}>{e.title.replace("⚠️ ","")}</div>
                            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{e.type} · {e.subject}</div>
                            {e.time && <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>🕐 {e.time}</div>}
                          </div>
                        );
                      })}
                      <button onClick={() => setAddEventOpen(true)} style={{ background: "#f8fafc", border: "1.5px dashed #e2e8f0", borderRadius: 10, padding: "8px", fontSize: 11, color: "#94a3b8", cursor: "pointer", fontWeight: 600 }}>+ Add event to this day</button>
                    </div>
                }
              </div>
            )}

            {/* FOCUS TAB */}
            {sidebarTab === "focus" && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Priority Focus</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderLeft: "3px solid #ef4444", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 800, letterSpacing: 1.5, marginBottom: 6 }}>#1 CRITICAL · {handoff.priority_days} DAYS</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>{handoff.priority_subject}</div>
                    <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{handoff.priority_focus}</div>
                  </div>
                  {handoff.secondary_focus && (
                    <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderLeft: "3px solid #f97316", borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 9, color: "#f97316", fontWeight: 800, letterSpacing: 1.5, marginBottom: 6 }}>#2 HIGH · {handoff.secondary_days} DAYS</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", marginBottom: 6 }}>{handoff.secondary_subject}</div>
                      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{handoff.secondary_focus}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DEADLINES TAB */}
            {sidebarTab === "deadlines" && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Upcoming Assessments</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {assessments.map((a,i) => {
                    const urg = urgencyColor(a.daysLeft);
                    const ugBg = urgencyBg(a.daysLeft);
                    return (
                      <div key={i} onClick={() => { setSelected(a.date); setMonth(new Date(a.date+"T12:00:00").getMonth()); setSidebarTab("schedule"); }} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, cursor: "pointer" }}>
                        <div style={{ background: ugBg, border: `1px solid ${urg}33`, borderRadius: 10, padding: "6px 10px", textAlign: "center", flexShrink: 0 }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: urg, lineHeight: 1 }}>{a.daysLeft}</div>
                          <div style={{ fontSize: 8, color: urg, fontWeight: 700, textTransform: "uppercase" }}>days</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title.replace("⚠️ ","")}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{a.subject}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8" }}>{new Date(a.date+"T12:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</div>
                        </div>
                      </div>
                    );
                  })}
                  {assessments.length === 0 && <div style={{ textAlign: "center", color: "#e2e8f0", fontSize: 13, padding: "20px 0" }}>No upcoming assessments 🎉</div>}
                </div>
              </div>
            )}

            {/* TASKS TAB */}
            {sidebarTab === "tasks" && (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Progress</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e" }}>{completedTasks}/{totalTasks} done</span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${totalTasks?(completedTasks/totalTasks)*100:0}%`, background: "linear-gradient(90deg,#22c55e,#16a34a)", borderRadius: 99, transition: "width 0.3s" }}/>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  <input ref={inputRef} value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key==="Enter"&&addTask()} placeholder="Add a task..." style={{ flex: 1, padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 12, outline: "none", background: "#f8fafc", color: "#0f172a" }}/>
                  <button onClick={addTask} style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, padding: "0 12px", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>+</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {tasks.map(t => (
                    <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", background: t.done?"#f0fdf4":"#f8fafc", border: `1px solid ${t.done?"#bbf7d0":"#e2e8f0"}`, borderRadius: 10 }}>
                      <div onClick={() => setTasks(prev => prev.map(x => x.id===t.id?{...x,done:!x.done}:x))} style={{ width: 16, height: 16, borderRadius: 5, border: `2px solid ${t.done?"#22c55e":"#d1d5db"}`, background: t.done?"#22c55e":"transparent", flexShrink: 0, marginTop: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {t.done && <span style={{ fontSize: 10, color: "#fff" }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 12, color: t.done?"#86efac":"#374151", flex: 1, lineHeight: 1.5, textDecoration: t.done?"line-through":"none" }}>{t.text}</span>
                      <button onClick={() => setTasks(prev => prev.filter(x => x.id!==t.id))} style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 14, padding: "0 2px" }}>×</button>
                    </div>
                  ))}
                  {tasks.length === 0 && <div style={{ textAlign: "center", color: "#e2e8f0", fontSize: 13, padding: "20px 0" }}>No tasks 🎉</div>}
                </div>
                {tasks.length > 0 && (
                  <div style={{ marginTop: 14, padding: "10px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10 }}>
                    <div style={{ fontSize: 10, color: "#3b82f6", fontWeight: 700, marginBottom: 3 }}>💡 VAULT SYNC</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Tell Claude "sync my tasks to vault" to save these to Obsidian</div>
                  </div>
                )}
              </div>
            )}

            {/* FLAGS TAB */}
            {sidebarTab === "flags" && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Active Flags</div>
                {(handoff.flags||[]).map((f,i) => (
                  <div key={i} style={{ padding: "10px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderLeft: "3px solid #f59e0b", borderRadius: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{f}</div>
                  </div>
                ))}
                {(!handoff.flags||handoff.flags.length===0) && <div style={{ textAlign: "center", color: "#e2e8f0", fontSize: 13, padding: "20px 0" }}>No active flags</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {addEventOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setAddEventOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 28, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>Add Event</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={newEvent.title} onChange={e => setNewEvent(p=>({...p,title:e.target.value}))} placeholder="Event title..." style={{ padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, outline: "none", color: "#0f172a" }}/>
              <select value={newEvent.subject} onChange={e => setNewEvent(p=>({...p,subject:e.target.value}))} style={{ padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, outline: "none", color: "#0f172a", background: "#fff" }}>
                {SUBJECT_LIST.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={newEvent.type} onChange={e => setNewEvent(p=>({...p,type:e.target.value}))} style={{ padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, outline: "none", color: "#0f172a", background: "#fff" }}>
                {TYPE_LIST.map(t => <option key={t}>{t}</option>)}
              </select>
              <input value={newEvent.time} onChange={e => setNewEvent(p=>({...p,time:e.target.value}))} placeholder="Time (e.g. 1:00–3:00pm)" style={{ padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, outline: "none", color: "#0f172a" }}/>
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
