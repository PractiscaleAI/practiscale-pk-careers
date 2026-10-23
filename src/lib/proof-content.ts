export const proofMetrics = [
  { id: "healthcare", value: "500+", label: "US healthcare businesses served" },
  { id: "team", value: "100+", label: "Team members in Pakistan" },
  { id: "portal", value: "46,000", label: "Candidates in our hiring portal" },
  { id: "publications", value: "29", label: "Published client case studies" },
] as const;

export function proofActiveIndex(progress: number) {
  if (progress < 0.12 || progress >= 0.84) return -1;
  return Math.min(3, Math.floor((progress - 0.12) / 0.18));
}
