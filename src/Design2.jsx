// DESIGN 2: Aurora — Dark with purple/blue gradient accents, glassmorphism
import { useState } from "react";
import { SUBJECT_COLORS, DEFAULT_COLOR, DAYS, MONTHS, getDaysInMonth, getFirstDay, fmtDate, urgencyColor } from "./shared";

export default function Design2({ events, handoff }) {
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

  const card = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 22, backdropFilter: "blur(10px)" };

  return (
    <div style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #0d0820 50%, #0a0a1a 100%)", minHeight: "100vh", padding: "24px 28px", color: "#e2e8f0", position: "relative", overflow: "hidden" }}>
      {/* Background blobs */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #7c3aed22, transparent 70%)", pointerEvents: "none" }}/>
      <div style={{ position: "fixed", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #1d4ed822, transparent 70%)", pointerEvents: "none" }}/>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6, background: "linear-gradient(90deg, #a855f7, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Study Dashboard</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>
              {today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening"}, Dhigash 👋
            </div>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
              {today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          {/* Next exam pill */}
          {assessments[0] && (
            <div style={{ background: "linear-gradient(135deg, #ef444422, #f9731622)", border: "1px solid #ef444433", borderRadius: 14, padding: "12px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#ef4444", lineHeight: 1 }}>{assessments[0].daysLeft}</div>
              <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>days left</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{assessments[0].subject.replace("Math Extension 1","Ext 1")}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Calendar */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={() => month===0?(setMonth(11),setYear(y=>y-1)):setMonth(m=>m-1)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>‹</button>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{MONTHS[month]} {year}</div>
            <button onClick={() => month===11?(setMonth(0),setYear(y=>y+1)):setMonth(m=>m+1)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 6 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#334155", fontWeight: 600 }}>{d[0]}</div>)}
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
                  background: isSel ? "linear-gradient(135deg, #7c3aed, #3b82f6)" : isToday ? "rgba(59,130,246,0.12)" : "transparent",
                  border: isToday&&!isSel ? "1px solid #3b82f633" : "1px solid transparent",
                  boxShadow: isSel ? "0 4px 15px #7c3aed44" : "none",
                }}>
                  <div style={{ fontSize: 12, fontWeight: isSel||isToday?700:400, color: isSel?"#fff":isToday?"#60a5fa":"#475569", textAlign: "center", marginBottom: 3 }}>{day}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                    {evts.slice(0,3).map((e,i) => {
                      const col = SUBJECT_COLORS[e.subject]||DEFAULT_COLOR;
                      return <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: isSel?"rgba(255,255,255,0.7)":e.type==="Assessment"?"#ef4444":col.dot }}/>;
                    })}
                  </div>
                  {hasExam&&!isSel&&<div style={{ position:"absolute",top:3,right:3,width:5,height:5,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 6px #ef4444" }}/>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(SUBJECT_COLORS).map(([s,c]) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }}/>
                <span style={{ fontSize: 9, color: "#334155" }}>{s.replace("Math Extension 1","Ext 1").replace("English Advanced","Eng").replace("Math Advanced","Math Adv")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: day + countdown stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Selected day */}
          <div style={{ ...card, flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
              {new Date(selected+"T12:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            {selEvts.length === 0
              ? <div style={{ color: "#1e293b", fontSize: 13, textAlign: "center", paddingTop: 12 }}>Nothing on 🙌</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selEvts.map((e, i) => {
                    const col = SUBJECT_COLORS[e.subject]||DEFAULT_COLOR;
                    const isExam = e.type === "Assessment";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: isExam?"rgba(239,68,68,0.08)":"rgba(255,255,255,0.03)", border: `1px solid ${isExam?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.06)"}`, borderRadius: 10 }}>
                        <div style={{ width: 3, height: 36, borderRadius: 99, background: isExam?"#ef4444":col.dot, flexShrink: 0 }}/>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isExam?"#fca5a5":"#e2e8f0" }}>{e.title}</div>
                          <div style={{ fontSize: 10, color: "#334155" }}>{e.subject}{e.time&&` · ${e.time}`}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>

          {/* Countdown */}
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Assessments</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {assessments.map((a, i) => {
                const urg = urgencyColor(a.daysLeft);
                const pct = Math.max(0, Math.min(100, (1 - a.daysLeft/14)*100));
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{a.title.replace("⚠️ ","")}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: urg, flexShrink: 0, marginLeft: 8 }}>{a.daysLeft}d</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${urg}, ${urg}88)`, borderRadius: 99, transition: "width 0.5s" }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 16 }}>
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>🎯 Priority Focus</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderLeft: "3px solid #ef4444", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>#1 · {handoff.priority_days}D · {handoff.priority_subject?.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{handoff.priority_focus}</div>
            </div>
            {handoff.secondary_focus && (
              <div style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)", borderLeft: "3px solid #f97316", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 9, color: "#f97316", fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>#2 · {handoff.secondary_days}D · {handoff.secondary_subject?.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{handoff.secondary_focus}</div>
              </div>
            )}
          </div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>📋 Tasks</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map((t, i) => (
              <div key={i} onClick={() => setTasks(prev => prev.map((x,j) => j===i?{...x,done:!x.done}:x))} style={{ display: "flex", gap: 8, cursor: "pointer", alignItems: "flex-start", opacity: t.done?0.3:1 }}>
                <div style={{ width: 15, height: 15, borderRadius: 5, border: `1.5px solid ${t.done?"#a855f7":"rgba(255,255,255,0.1)"}`, background: t.done?"linear-gradient(135deg,#7c3aed,#3b82f6)":"transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {t.done && <span style={{ fontSize: 9, color: "#fff" }}>✓</span>}
                </div>
                <span style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, textDecoration: t.done?"line-through":"none" }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
