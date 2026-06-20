// DESIGN 3: Clean Slate — Light mode, minimal, editorial
import { useState } from "react";
import { SUBJECT_COLORS, DEFAULT_COLOR, DAYS, MONTHS, getDaysInMonth, getFirstDay, fmtDate, urgencyColor, urgencyBg } from "./shared";

export default function Design3({ events, handoff }) {
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
    <div style={{ background: "#fafafa", minHeight: "100vh", padding: "28px 36px", color: "#0f172a", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Year 11 · 2026</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", letterSpacing: -1 }}>
              {today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening"}, Dhigash.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}</div>
            {assessments[0] && (
              <div style={{ fontSize: 13, fontWeight: 700, color: urgencyColor(assessments[0].daysLeft), marginTop: 2 }}>
                {assessments[0].title.replace("⚠️ ","")} — {assessments[0].daysLeft} day{assessments[0].daysLeft!==1?"s":""}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 28, marginBottom: 28 }}>
        {/* Calendar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={() => month===0?(setMonth(11),setYear(y=>y-1)):setMonth(m=>m-1)} style={{ background: "#f1f5f9", border: "none", color: "#64748b", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16 }}>‹</button>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{MONTHS[month]} {year}</div>
            <button onClick={() => month===11?(setMonth(0),setYear(y=>y+1)):setMonth(m=>m+1)} style={{ background: "#f1f5f9", border: "none", color: "#64748b", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16 }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#cbd5e1", fontWeight: 700, letterSpacing: 1 }}>{d[0]}</div>)}
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
                  background: isSel ? "#0f172a" : isToday ? "#eff6ff" : "#ffffff",
                  border: isSel ? "none" : isToday ? "1.5px solid #bfdbfe" : "1.5px solid #f1f5f9",
                  boxShadow: isSel ? "0 4px 12px rgba(15,23,42,0.15)" : "none",
                }}>
                  <div style={{ fontSize: 12, fontWeight: isSel||isToday?700:400, color: isSel?"#fff":isToday?"#2563eb":"#64748b", textAlign: "center", marginBottom: 3 }}>{day}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                    {evts.slice(0,3).map((e,i) => {
                      const col = SUBJECT_COLORS[e.subject]||DEFAULT_COLOR;
                      return <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: isSel?"rgba(255,255,255,0.6)":e.type==="Assessment"?"#ef4444":col.dot }}/>;
                    })}
                  </div>
                  {hasExam&&!isSel&&<div style={{ position:"absolute",top:3,right:3,width:5,height:5,borderRadius:"50%",background:"#ef4444" }}/>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Selected day */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
              {new Date(selected+"T12:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            {selEvts.length === 0
              ? <div style={{ color: "#e2e8f0", fontSize: 13 }}>Nothing scheduled 🙌</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selEvts.map((e, i) => {
                    const col = SUBJECT_COLORS[e.subject]||DEFAULT_COLOR;
                    const isExam = e.type === "Assessment";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: isExam?"#fef2f2":"#ffffff", border: `1px solid ${isExam?"#fecaca":"#f1f5f9"}`, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: isExam?"#ef4444":col.dot, flexShrink: 0 }}/>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isExam?"#dc2626":"#0f172a" }}>{e.title}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{e.subject}{e.time&&` · ${e.time}`}</div>
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: isExam?"#ef4444":"#94a3b8", background: isExam?"#fee2e2":"#f8fafc", padding: "2px 8px", borderRadius: 99, letterSpacing: 0.5 }}>{e.type.toUpperCase()}</div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>

          {/* Assessments */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Assessments</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {assessments.map((a, i) => {
                const urg = urgencyColor(a.daysLeft);
                const ugBg = urgencyBg(a.daysLeft);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#ffffff", border: "1px solid #f1f5f9", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ background: ugBg, border: `1px solid ${urg}33`, borderRadius: 8, padding: "4px 8px", textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: urg, lineHeight: 1 }}>{a.daysLeft}</div>
                      <div style={{ fontSize: 8, color: urg, fontWeight: 600 }}>days</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title.replace("⚠️ ","")}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.subject}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 28, paddingTop: 24, borderTop: "1px solid #e2e8f0" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Priority Focus</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderLeft: "3px solid #ef4444", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 800, letterSpacing: 1.5, marginBottom: 6 }}>#1 CRITICAL · {handoff.priority_days} DAYS · {handoff.priority_subject?.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{handoff.priority_focus}</div>
            </div>
            {handoff.secondary_focus && (
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderLeft: "3px solid #f97316", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 10, color: "#f97316", fontWeight: 800, letterSpacing: 1.5, marginBottom: 6 }}>#2 HIGH · {handoff.secondary_days} DAYS · {handoff.secondary_subject?.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{handoff.secondary_focus}</div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Tasks</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map((t, i) => (
              <div key={i} onClick={() => setTasks(prev => prev.map((x,j) => j===i?{...x,done:!x.done}:x))} style={{ display: "flex", gap: 10, cursor: "pointer", alignItems: "flex-start", opacity: t.done?0.4:1 }}>
                <div style={{ width: 16, height: 16, borderRadius: 5, border: `2px solid ${t.done?"#22c55e":"#e2e8f0"}`, background: t.done?"#22c55e":"transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {t.done && <span style={{ fontSize: 10, color: "#fff" }}>✓</span>}
                </div>
                <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, textDecoration: t.done?"line-through":"none" }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
