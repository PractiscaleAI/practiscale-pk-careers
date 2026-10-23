export const earningsRecords = [
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
] as const;

export const earningsTotal = earningsRecords.reduce(
  (sum, record) => sum + record.amount,
  0,
);
