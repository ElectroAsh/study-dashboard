import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Dashboard from "./Dashboard";

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

  if (loading) return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 14, color: "#94a3b8" }}>Loading...</div>
    </div>
  );

  return <Dashboard events={events} handoff={handoff} />;
}
