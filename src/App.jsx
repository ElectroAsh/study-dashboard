import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Design1 from "./Design1";
import Design2 from "./Design2";
import Design3 from "./Design3";

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

export default function App() {
  const [design, setDesign] = useState(1);
  const [events, setEvents] = useState(STATIC_EVENTS);
  const [handoff, setHandoff] = useState(STATIC_HANDOFF);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: eventsData } = await supabase.from('events').select('*').order('date');
        if (eventsData && eventsData.length > 0) setEvents(eventsData);
        const { data: handoffData } = await supabase.from('handoff').select('*').order('created_at', { ascending: false }).limit(1);
        if (handoffData && handoffData.length > 0) setHandoff(handoffData[0]);
      } catch (e) {}
      setLoading(false);
    }
    fetchData();
  }, []);

  const designs = [
    { id: 1, label: "Midnight Pro" },
    { id: 2, label: "Aurora" },
    { id: 3, label: "Clean Slate" },
  ];

  const props = { events, handoff };

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", minHeight: "100vh" }}>
      {/* Design switcher */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
        display: "flex", justifyContent: "center", padding: "12px",
        background: design === 3 ? "rgba(255,255,255,0.85)" : "rgba(10,10,18,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: design === 3 ? "1px solid #e2e8f0" : "1px solid #1e1e30",
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: design === 3 ? "#94a3b8" : "#475569", letterSpacing: 2, textTransform: "uppercase", marginRight: 8 }}>Design</span>
          {designs.map(d => (
            <button key={d.id} onClick={() => setDesign(d.id)} style={{
              padding: "7px 18px", borderRadius: 99, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, letterSpacing: 0.3, transition: "all 0.2s",
              background: design === d.id ? "#3b82f6" : design === 3 ? "#f1f5f9" : "#1e1e30",
              color: design === d.id ? "#fff" : design === 3 ? "#64748b" : "#64748b",
              boxShadow: design === d.id ? "0 2px 12px #3b82f655" : "none",
            }}>{d.label}</button>
          ))}
        </div>
      </div>

      <div style={{ paddingTop: 56 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", color: "#64748b" }}>Loading...</div>
        ) : (
          <>
            {design === 1 && <Design1 {...props} />}
            {design === 2 && <Design2 {...props} />}
            {design === 3 && <Design3 {...props} />}
          </>
        )}
      </div>
    </div>
  );
}
