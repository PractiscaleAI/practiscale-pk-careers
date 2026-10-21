import type { Metadata } from "next";
import CareerDestination from "@/components/career-destination";
import { careerChapters } from "@/lib/career-content";
export const metadata: Metadata = {
  title: "Career opportunities",
  description: careerChapters[1].body,
  alternates: { canonical: "/jobs" },
};
export default function JobsPage() {
  return <CareerDestination chapter={careerChapters[1]} />;
}
