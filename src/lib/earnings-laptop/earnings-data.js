export const records = Object.freeze([
  {
    name: "Jason Brown",
    role: "Closer",
    amount: 3335320,
    period: "5 month total",
  },
  {
    name: "Hassan Ali",
    role: "Remote Closer",
    amount: 1351900,
    period: "3 month commissions",
  },
  {
    name: "Kashaf Abbasi",
    role: "Remote Closer",
    amount: 1171240,
    period: "3 month commissions",
  },
  {
    name: "Ahmed Dar",
    role: "Closer",
    amount: 1074405,
    period: "3 month commissions",
  },
  {
    name: "James Ephrim",
    role: "Closer",
    amount: 1031000,
    period: "3 month commissions",
  },
  {
    name: "Hamza Javed",
    role: "Closer",
    amount: 485000,
    period: "Last month commissions",
  },
  {
    name: "Murtaza",
    role: "Remote Closer",
    amount: 473000,
    period: "Last month paycheck",
  },
  { name: "Fahad", role: "Closer", amount: 342000, period: "Remote paycheck" },
  {
    name: "Kashan Malik",
    role: "Closer",
    amount: 253000,
    period: "Last month paycheck",
  },
  {
    name: "Haider Ali",
    role: "Closer",
    amount: 80000,
    period: "Two closings on day one",
  },
]);
export const total = records.reduce((sum, record) => sum + record.amount, 0);
export const format = (amount) => amount.toLocaleString("en-US");
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const smooth = (v) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};
export const range = (p, a, b) => smooth((p - a) / (b - a));

export function storyAt(p, staticMode = false) {
  const recordStart = 0.3,
    span = 0.052;
  const local = (p - recordStart) / span;
  const index = clamp(Math.floor(local), 0, 9);
  return {
    p,
    open: staticMode
      ? 1
      : range(p, 0.155, 0.275) * (1 - range(p, 0.935, 0.995)),
    screen: staticMode
      ? 1
      : range(p, 0.235, 0.285) * (1 - range(p, 0.927, 0.958)),
    record: index,
    phase: clamp(local - index),
    showingRecords: !staticMode && p >= 0.3 && p < 0.82,
    summary: staticMode || p >= 0.82,
    staticMode,
  };
}
