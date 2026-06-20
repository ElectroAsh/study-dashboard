export const SUBJECT_COLORS = {
  "Math Extension 1": { dot: "#a855f7", border: "#7c3aed", light: "#f3e8ff" },
  "Chemistry":        { dot: "#ef4444", border: "#7f1d1d", light: "#fee2e2" },
  "Economics":        { dot: "#eab308", border: "#854d0e", light: "#fef9c3" },
  "English Advanced": { dot: "#3b82f6", border: "#1d4ed8", light: "#dbeafe" },
  "Biology":          { dot: "#22c55e", border: "#15803d", light: "#dcfce7" },
  "Math Advanced":    { dot: "#6366f1", border: "#4338ca", light: "#e0e7ff" },
};
export const DEFAULT_COLOR = { dot: "#f97316", border: "#92400e", light: "#ffedd5" };
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
export const getFirstDay = (y, m) => new Date(y, m, 1).getDay();
export const fmtDate = (y, m, d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
export const urgencyColor = (d) => d <= 3 ? "#ef4444" : d <= 7 ? "#f97316" : "#22c55e";
export const urgencyBg = (d) => d <= 3 ? "#fee2e2" : d <= 7 ? "#ffedd5" : "#dcfce7";
