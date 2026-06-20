import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const STATIC_EVENTS = [
  { date: "2026-06-20", title: "Peak Chem", subject: "Chemistry", type: "Tutoring", time: "1:00–3:00pm" },
  { date: "2026-06-20", title: "Math Ext 1 — CS3 + CS4", subject: "Math Extension 1", type: "Study" },
  { date: "2026-06-20", title: "Math Ext 1 — Past Paper", subject: "Math Extension 1", type: "Study" },
  { date: "2026-06-21", title: "Kurt Tutoring", subject: "Math Extension 1", type: "Tutoring", time: "10:30am–1:00pm" },
  { date: "2026-06-21", title: "ACE Economics", subject: "Economics", type: "Tutoring", time: "1:30–5:30pm" },
  { date: "2026-06-21", title: "Math Ext 1 — Past Paper Blitz", subject: "Math Extension 1", type: "Study" },
  { date: "2026-06-22", title: "⚠️ MATH EXT 1 EXAM", subject: "Math Extension 1", type: "Assessment" },
  { date: "2026-06-22", title: "Chem Practice Test", subject: "Chemistry", type: "Study" },
  { date: "2026-06-23", title: "⚠️ CHEMISTRY PRACTICAL", subject: "Chemistry", type: "Assessment" },
  { date: "2026-06-24", title: "English Timed Write", subject: "English Advanced", type: "Study" },
  { date: "2026-06-28", title: "English Timed Write 2", subject: "English Advanced", type: "Study" },
  { date: "2026-07-01", title: "⚠️ ENGLISH ESSAY", subject: "English Advanced", type: "Assessment" },
];

const STATIC_HANDOFF = {
  priority_focus: "Math Extension 1 exam is Monday — 2 days. Finish CS3 + CS4 this morning, then Absolute Value and Inverse Functions. Run a timed past paper after Peak Chem.",
  priority_subject: "Math Extension 1",
  priority_days: 2,
  secondary_focus: "Use Peak Chem 1–3pm to lock in Mod 2: moles, stoichiometry, standard solution procedure.",
  secondary_subject: "Chemistry",
  secondary_days: 3,
  flags: ["⚠️ Math Ext 1 exam Monday — if exercise sets not done today, full past paper blitz tomorrow", "📝 Kurt homework: 2 weeks outstanding", "📚 New Chemistry Notes synced last night"],
  tasks: ["Math Ext 1 — Finish CS3 + CS4", "Math Ext 1 — Absolute Value 1, 2, 3", "Math Ext 1 — Inverse Functions 1, 2, 3", "Math Ext 1 — Timed past paper", "Chemistry — Module 2 practice questions"],
};

const SUBJECT_COLORS = {
  "Math Extension 1": { dot: "#a855f7", border: "#7c3aed" },
  "Chemistry":        { dot: "#ef4444", border: "#7f1d1d" },
  "Economics":        { dot: "#eab308", border: "#854d0e" },
  "English Advanced": { dot: "#3b82f6", border: "#1d4ed8" },
  "Biology":          { dot: "#22c55e", border: "#15803d" },
  "Math Advanced":    { dot: "#6366f1", border: "#4338ca" },
};
const DEFAULT_COLOR = { dot: "#f97316", border: "#92400e" };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m) { return new Date(y, m, 1).getDay(); }
function fmtDate(y, m, d) { return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
function urgencyColor(d) { return d <= 3 ? "#ef4444" : d <= 7 ? "#eab308" : "#22c55e"; }

export default function App() {
  const today = new Date();
  const todayStr = fmtDate(today.getFullYear(), today.getMonth(), today.getDate());

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(todayStr);
  const [events, setEvents] = useState(STATIC_EVENTS);
  const [handoff, setHandoff] = useState(STATIC_HANDOFF);
  const [tasks, setTasks] = useState(STATIC_HANDOFF.tasks.map(t => ({ text: t, done: false })));
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dark, setDark] = useState(true);

  const T = {
    bg:       dark ? "#0b0b12" : "#f1f5f9",
    card:     dark ? "#13131f" : "#ffffff",
    cardBorder: dark ? "#1e1e30" : "#e2e8f0",
    text:     dark ? "#e2e8f0" : "#0f172a",
    textMid:  dark ? "#94a3b8" : "#475569",
    textDim:  dark ? "#475569" : "#94a3b8",
    dayBg:    dark ? "#0d0d1a" : "#f8fafc",
    dayToday: dark ? "#0f2744" : "#dbeafe",
    daySel:   "#3b82f6",
    navBtn:   dark ? "#1e1e30" : "#e2e8f0",
    taskBg:   dark ? "#0d0d1a" : "#f8fafc",
    eventBg:  dark ? "#0d0d1a" : "#f8fafc",
    examBg:   dark ? "#1a0505" : "#fef2f2",
    flagBg:   dark ? "#0d0d1a" : "#f8fafc",
  };

  useEffect(() => {
    document.body.style.background = T.bg;
  }, [dark]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: eventsData } = await supabase.from('events').select('*').order('date');
        if (eventsData && eventsData.length > 0) setEvents(eventsData);
        const { data: handoffData } = await supabase.from('handoff').select('*').order('created_at', { ascending: false }).limit(1);
        if (handoffData && handoffData.length > 0) {
          setHandoff(handoffData[0]);
          setTasks(handoffData[0].tasks.map(t => ({ text: t, done: false })));
          setLastUpdated(new Date(handoffData[0].created_at));
        }
      } catch (e) { console.log('Using static data'); }
      setLoading(false);
    }
    fetchData();
  }, []);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const cells = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_,i) => i+1)];
  const getEvents = (dateStr) => events.filter(e => e.date === dateStr);
  const selectedEvents = getEvents(selected);
  const assessments = events
    .filter(e => e.type === "Assessment")
    .map(e => ({ ...e, daysLeft: Math.ceil((new Date(e.date+"T12:00:00") - today) / 86400000) }))
    .filter(e => e.daysLeft >= 0)
    .sort((a,b) => a.daysLeft - b.daysLeft);

  const toggleTask = (i) => setTasks(prev => prev.map((t, idx) => idx === i ? {...t, done: !t.done} : t));

  if (loading) return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif", background:T.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{fontSize:14, color:T.textDim}}>Loading dashboard...</div>
    </div>
  );

  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif", background:T.bg, minHeight:"100vh", padding:"28px 32px", color:T.text}}>

      {/* Header */}
      <div style={{marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:11, color:T.textDim, letterSpacing:3, textTransform:"uppercase", marginBottom:6}}>Study Dashboard · Year 11 2026</div>
          <div style={{fontSize:28, fontWeight:800, color:T.text, letterSpacing:-0.5}}>
            {today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening"}, Dhigash 👋
          </div>
          <div style={{fontSize:13, color:T.textDim, marginTop:4}}>
            {today.toLocaleDateString("en-AU",{weekday:"long", day:"numeric", month:"long", year:"numeric"})}
            {assessments[0] && <span> &nbsp;·&nbsp; <span style={{color: urgencyColor(assessments[0].daysLeft), fontWeight:700}}>{assessments[0].title.replace("⚠️ ","")} in {assessments[0].daysLeft} day{assessments[0].daysLeft!==1?"s":""}</span></span>}
          </div>
        </div>

        {/* Dark/Light toggle */}
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          {lastUpdated && <div style={{fontSize:10, color:T.textDim, textAlign:"right"}}>Last updated<br/>{lastUpdated.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"})}</div>}
          <button onClick={() => setDark(d => !d)} style={{
            background: dark ? "#1e1e30" : "#e2e8f0",
            border: "none", borderRadius:50, padding:"8px 16px",
            cursor:"pointer", fontSize:13, fontWeight:600,
            color: dark ? "#94a3b8" : "#475569",
            display:"flex", alignItems:"center", gap:6,
            transition:"all 0.2s"
          }}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1.1fr 0.9fr", gap:20, marginBottom:20}}>
        {/* Calendar */}
        <div style={{background:T.card, borderRadius:20, padding:24, border:`1px solid ${T.cardBorder}`}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
            <button onClick={() => month===0?(setMonth(11),setYear(y=>y-1)):setMonth(m=>m-1)} style={{background:T.navBtn,border:"none",color:T.textMid,borderRadius:10,width:34,height:34,cursor:"pointer",fontSize:18}}>‹</button>
            <div style={{fontWeight:700, fontSize:17, color:T.text}}>{MONTHS[month]} {year}</div>
            <button onClick={() => month===11?(setMonth(0),setYear(y=>y+1)):setMonth(m=>m+1)} style={{background:T.navBtn,border:"none",color:T.textMid,borderRadius:10,width:34,height:34,cursor:"pointer",fontSize:18}}>›</button>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:6}}>
            {DAYS.map(d => <div key={d} style={{textAlign:"center",fontSize:10,color:T.textDim,fontWeight:700,letterSpacing:1,paddingBottom:4}}>{d}</div>)}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3}}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`e${idx}`}/>;
              const dateStr = fmtDate(year, month, day);
              const dayEvents = getEvents(dateStr);
              const isToday = dateStr === todayStr;
              const isSel = dateStr === selected;
              const hasExam = dayEvents.some(e => e.type === "Assessment");
              return (
                <div key={dateStr} onClick={() => setSelected(dateStr)} style={{
                  borderRadius:12, padding:"8px 4px 6px", minHeight:56, cursor:"pointer",
                  background: isSel ? T.daySel : isToday ? T.dayToday : T.dayBg,
                  border: isToday&&!isSel ? "1.5px solid #3b82f6" : isSel ? "1.5px solid #60a5fa" : `1.5px solid ${T.cardBorder}`,
                  transition:"all 0.12s", position:"relative",
                }}>
                  <div style={{fontSize:13,fontWeight:isToday||isSel?700:400,color:isSel?"#fff":isToday?"#3b82f6":T.textMid,textAlign:"center",marginBottom:4}}>{day}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:2,justifyContent:"center"}}>
                    {dayEvents.slice(0,4).map((e,i) => {
                      const col = SUBJECT_COLORS[e.subject]||DEFAULT_COLOR;
                      return <div key={i} style={{width:5,height:5,borderRadius:"50%",background:isSel?"rgba(255,255,255,0.75)":e.type==="Assessment"?"#ef4444":col.dot}}/>;
                    })}
                  </div>
                  {hasExam&&!isSel&&<div style={{position:"absolute",top:4,right:4,width:5,height:5,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 4px #ef4444"}}/>}
                </div>
              );
            })}
          </div>

          <div style={{marginTop:16,display:"flex",flexWrap:"wrap",gap:10}}>
            {Object.entries(SUBJECT_COLORS).map(([s,c]) => (
              <div key={s} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:c.dot}}/>
                <span style={{fontSize:10,color:T.textDim}}>{s.replace("Math Extension 1","Ext 1").replace("English Advanced","English").replace("Math Advanced","Math Adv")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Countdown */}
          <div style={{background:T.card,borderRadius:20,padding:20,border:`1px solid ${T.cardBorder}`}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Assessment Countdown</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {assessments.map((a,i) => {
                const urg = urgencyColor(a.daysLeft);
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:40,height:40,borderRadius:12,background:urg+"18",border:`1px solid ${urg}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:14,fontWeight:800,color:urg}}>{a.daysLeft}</span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title.replace("⚠️ ","")}</div>
                      <div style={{fontSize:11,color:T.textDim,marginTop:1}}>{a.subject}</div>
                    </div>
                    <div style={{fontSize:9,fontWeight:700,color:urg,background:urg+"18",padding:"3px 8px",borderRadius:99,whiteSpace:"nowrap",letterSpacing:0.5}}>
                      {a.daysLeft===0?"TODAY":a.daysLeft===1?"TOMORROW":`${a.daysLeft}d`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day */}
          <div style={{background:T.card,borderRadius:20,padding:20,border:`1px solid ${T.cardBorder}`,flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>
              {new Date(selected+"T12:00:00").toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}
            </div>
            {selectedEvents.length===0
              ? <div style={{color:T.textDim,fontSize:13,textAlign:"center",paddingTop:16}}>Nothing on — rest day 🙌</div>
              : <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {selectedEvents.map((e,i) => {
                    const col = SUBJECT_COLORS[e.subject]||DEFAULT_COLOR;
                    const isExam = e.type==="Assessment";
                    return (
                      <div key={i} style={{background:isExam?T.examBg:T.eventBg,border:`1px solid ${isExam?"#fca5a5":T.cardBorder}`,borderLeft:`3px solid ${isExam?"#ef4444":col.dot}`,borderRadius:12,padding:"10px 14px"}}>
                        <div style={{fontSize:13,fontWeight:600,color:isExam?"#ef4444":T.text}}>{e.title}</div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:col.dot}}/>
                          <span style={{fontSize:11,color:T.textDim}}>{e.subject}</span>
                          {e.time&&<><span style={{color:T.textDim}}>·</span><span style={{fontSize:11,color:T.textDim}}>{e.time}</span></>}
                          <span style={{marginLeft:"auto",fontSize:9,fontWeight:700,color:isExam?"#ef4444":T.textDim,background:isExam?"#fee2e2":T.navBtn,padding:"2px 7px",borderRadius:99,letterSpacing:0.5}}>{e.type.toUpperCase()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>
        </div>
      </div>

      {/* Priority + Tasks */}
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 0.8fr",gap:20,marginBottom:20}}>
        <div style={{background:T.card,borderRadius:20,padding:22,border:`1px solid ${T.cardBorder}`}}>
          <div style={{fontSize:10,fontWeight:700,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>🎯 Priority Focus</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:dark?"#1a0505":"#fef2f2",border:"1px solid #fca5a5",borderLeft:"3px solid #ef4444",borderRadius:14,padding:16}}>
              <div style={{fontSize:10,color:"#ef4444",fontWeight:800,letterSpacing:1.5,marginBottom:6}}>#1 CRITICAL · {handoff.priority_days} DAYS · {handoff.priority_subject?.toUpperCase()}</div>
              <div style={{fontSize:13,color:T.text,lineHeight:1.6}}>{handoff.priority_focus}</div>
            </div>
            {handoff.secondary_focus&&(
              <div style={{background:dark?"#1a0d05":"#fff7ed",border:"1px solid #fed7aa",borderLeft:"3px solid #f97316",borderRadius:14,padding:16}}>
                <div style={{fontSize:10,color:"#f97316",fontWeight:800,letterSpacing:1.5,marginBottom:6}}>#2 HIGH · {handoff.secondary_days} DAYS · {handoff.secondary_subject?.toUpperCase()}</div>
                <div style={{fontSize:13,color:T.text,lineHeight:1.6}}>{handoff.secondary_focus}</div>
              </div>
            )}
          </div>
        </div>

        <div style={{background:T.card,borderRadius:20,padding:22,border:`1px solid ${T.cardBorder}`}}>
          <div style={{fontSize:10,fontWeight:700,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>📋 Today's Tasks</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {tasks.map((t,i) => (
              <div key={i} onClick={()=>toggleTask(i)} style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",opacity:t.done?0.4:1,transition:"opacity 0.2s"}}>
                <div style={{width:16,height:16,borderRadius:5,border:`1.5px solid ${t.done?"#22c55e":T.textDim}`,background:t.done?"#22c55e":"transparent",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                  {t.done&&<span style={{fontSize:10,color:"#fff"}}>✓</span>}
                </div>
                <span style={{fontSize:12,color:T.textMid,lineHeight:1.5,textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flags */}
      {handoff.flags&&handoff.flags.length>0&&(
        <div style={{background:T.card,borderRadius:20,padding:20,border:`1px solid ${T.cardBorder}`}}>
          <div style={{fontSize:10,fontWeight:700,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>⚠️ Flags</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {handoff.flags.map((f,i)=>(
              <div key={i} style={{fontSize:13,color:T.textMid,padding:"10px 14px",background:T.flagBg,borderRadius:10,borderLeft:`3px solid ${T.textDim}`}}>{f}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
