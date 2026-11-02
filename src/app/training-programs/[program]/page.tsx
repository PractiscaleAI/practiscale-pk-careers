import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InteriorShell from "@/components/interior-shell";
import TrainingProgramPage, {
  trainingPrograms,
  type TrainingProgramSlug,
} from "@/components/training-program-page";

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(trainingPrograms).map((program) => ({ program }));
}
const findProgram = (program: string) =>
  program in trainingPrograms
    ? trainingPrograms[program as TrainingProgramSlug]
    : null;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ program: string }>;
}): Promise<Metadata> {
  const { program } = await params,
    chapter = findProgram(program);
  if (!chapter) return {};
  return {
    title: { absolute: chapter.seoTitle },
    description: chapter.seoDescription,
    keywords: chapter.keywords,
    alternates: { canonical: chapter.href },
    openGraph: {
      title: chapter.seoTitle,
      description: chapter.seoDescription,
      url: chapter.href,
      type: "website",
    },
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
  return (
    <InteriorShell>
      <TrainingProgramPage program={chapter} />
    </InteriorShell>
  );
}
