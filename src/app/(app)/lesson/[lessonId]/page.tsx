import { notFound } from "next/navigation";
import { findLesson } from "@/data/curriculum";
import { LessonRunner } from "@/components/lesson/LessonRunner";
import { requireUser } from "@/lib/auth/dal";

export async function generateMetadata({ params }: PageProps<"/lesson/[lessonId]">) {
  const { lessonId } = await params;
  const found = findLesson(lessonId);
  return { title: found ? `${found.lesson.title} · RoadCube` : "RoadCube" };
}

export default async function LessonPage({ params }: PageProps<"/lesson/[lessonId]">) {
  await requireUser();
  const { lessonId } = await params;
  if (!findLesson(lessonId)) notFound();
  return <LessonRunner lessonId={lessonId} />;
}
