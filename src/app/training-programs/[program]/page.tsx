import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CareerDestination from "@/components/career-destination";
import { careerPrograms } from "@/lib/career-content";

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ program: "appointment-setter" }, { program: "virtual-assistant" }];
}
const findProgram = (program: string) =>
  careerPrograms.find(
    (ch) => ch.href === `/training-programs/${program}` && ch.id !== "training",
  );
export async function generateMetadata({
  params,
}: {
  params: Promise<{ program: string }>;
}): Promise<Metadata> {
  const { program } = await params,
    chapter = findProgram(program);
  if (!chapter) return {};
  return {
    title: chapter.title,
    description: chapter.body,
    alternates: { canonical: chapter.href },
  };
}
export default async function ProgramPage({
  params,
}: {
  params: Promise<{ program: string }>;
}) {
  const { program } = await params,
    chapter = findProgram(program);
  if (!chapter) notFound();
  return <CareerDestination chapter={chapter} />;
}
