// DESIGN 1: Midnight Pro — Dark, sleek, neon accents
import { useState } from "react";
import { SUBJECT_COLORS, DEFAULT_COLOR, DAYS, MONTHS, getDaysInMonth, getFirstDay, fmtDate, urgencyColor } from "./shared";

export default function Design1({ events, handoff }) {
  const today = new Date();
  const todayStr = fmtDate(today.getFullYear(), today.getMonth(), today.getDate());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(todayStr);
  const [tasks, setTasks] = useState((handoff.tasks||[]).map(t => ({ text: t, done: false })));

  const cells = [...Array(getFirstDay(year, month)).fill(null), ...Array.from({length: getDaysInMonth(year, month)}, (_,i) => i+1)];
  const getEvts = (d) => events.filter(e => e.date === d);
  const selEvts = getEvts(selected);
  const assessments = events.filter(e => e.type === "Assessment")
    .map(e => ({ ...e, daysLeft: Math.ceil((new Date(e.date+"T12:00:00") - today) / 86400000) }))
    .filter(e => e.daysLeft >= 0).sort((a,b) => a.daysLeft - b.daysLeft);

  return (
    <div style={{ background: "#080810", minHeight: "100vh", padding: "24px 28px", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "#3b82f6", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>Year 11 · 2026</div>
          <div style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #e2e8f0, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening"}, Dhigash
          </div>
          <div style={{ fontSize: 13, color: "#334155", marginTop: 4 }}>
            {today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
            {assessments[0] && <span style={{ color: urgencyColor(assessments[0].daysLeft), fontWeight: 700 }}> · {assessments[0].title.replace("⚠️ ", "")} in {assessments[0].daysLeft}d</span>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#3b82f6", lineHeight: 1 }}>{today.getDate()}</div>
          <div style={{ fontSize: 11, color: "#334155", textTransform: "uppercase", letterSpacing: 1 }}>{MONTHS[today.getMonth()].slice(0,3)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Calendar */}
        <div style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 18, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={() => month===0?(setMonth(11),setYear(y=>y-1)):setMonth(m=>m-1)} style={{ background: "#1a1a2e", border: "none", color: "#64748b", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>‹</button>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{MONTHS[month].slice(0,3)} {year}</div>
            <button onClick={() => month===11?(setMonth(0),setYear(y=>y+1)):setMonth(m=>m+1)} style={{ background: "#1a1a2e", border: "none", color: "#64748b", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 9, color: "#334155", fontWeight: 700 }}>{d[0]}</div>)}
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
                  borderRadius: 8, padding: "5px 2px 4px", minHeight: 44, cursor: "pointer", position: "relative",
                  background: isSel ? "#3b82f6" : isToday ? "#0f2744" : "transparent",
                  border: isToday && !isSel ? "1px solid #3b82f622" : "1px solid transparent",
                }}>
                  <div style={{ fontSize: 11, fontWeight: isSel||isToday?700:400, color: isSel?"#fff":isToday?"#60a5fa":"#475569", textAlign: "center", marginBottom: 2 }}>{day}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                    {evts.slice(0,3).map((e,i) => {
                      const col = SUBJECT_COLORS[e.subject]||DEFAULT_COLOR;
                      return <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: isSel?"rgba(255,255,255,0.8)":e.type==="Assessment"?"#ef4444":col.dot }}/>;
                    })}
                  </div>
                  {hasExam&&!isSel&&<div style={{ position:"absolute",top:2,right:2,width:4,height:4,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 4px #ef4444" }}/>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected day */}
        <div style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 18, padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
            {new Date(selected+"T12:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "short" })}
          </div>
          {selEvts.length === 0
            ? <div style={{ color: "#1e293b", fontSize: 13, textAlign: "center", paddingTop: 20 }}>Rest day 🙌</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selEvts.map((e, i) => {
                  const col = SUBJECT_COLORS[e.subject]||DEFAULT_COLOR;
                  const isExam = e.type === "Assessment";
                  return (
                    <div key={i} style={{ borderLeft: `3px solid ${isExam?"#ef4444":col.dot}`, padding: "10px 12px", background: isExam?"#1a0505":"#12121f", borderRadius: "0 10px 10px 0" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isExam?"#fca5a5":"#e2e8f0" }}>{e.title}</div>
                      <div style={{ fontSize: 10, color: "#334155", marginTop: 3 }}>{e.subject}{e.time&&` · ${e.time}`}</div>
                    </div>
                  );
                })}
              </div>
          }
        </div>

        {/* Countdown */}
        <div style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 18, padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Countdowns</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {assessments.map((a, i) => {
              const urg = urgencyColor(a.daysLeft);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: urg+"15", border: `1px solid ${urg}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: urg }}>{a.daysLeft}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title.replace("⚠️ ","")}</div>
                    <div style={{ fontSize: 10, color: "#334155" }}>{a.subject}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 16 }}>
        {/* Priority */}
        <div style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 18, padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>🎯 Priority Focus</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#0f0505", border: "1px solid #ef444422", borderLeft: "3px solid #ef4444", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>#1 CRITICAL · {handoff.priority_days}D · {handoff.priority_subject?.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{handoff.priority_focus}</div>
            </div>
            {handoff.secondary_focus && (
              <div style={{ background: "#0f0a05", border: "1px solid #f9731622", borderLeft: "3px solid #f97316", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, color: "#f97316", fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>#2 HIGH · {handoff.secondary_days}D · {handoff.secondary_subject?.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{handoff.secondary_focus}</div>
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div style={{ background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 18, padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>📋 Tasks</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map((t, i) => (
              <div key={i} onClick={() => setTasks(prev => prev.map((x,j) => j===i?{...x,done:!x.done}:x))} style={{ display: "flex", gap: 8, cursor: "pointer", alignItems: "flex-start", opacity: t.done?0.35:1 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, border: `1.5px solid ${t.done?"#22c55e":"#1e293b"}`, background: t.done?"#22c55e":"transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {t.done && <span style={{ fontSize: 9, color: "#fff" }}>✓</span>}
                </div>
                <span style={{ fontSize: 11, color: "#475569", lineHeight: 1.5, textDecoration: t.done?"line-through":"none" }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
