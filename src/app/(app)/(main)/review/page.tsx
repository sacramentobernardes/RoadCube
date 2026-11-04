import type { Metadata } from "next";
import { Review } from "@/components/review/Review";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Revisão · RoadCube" };

export default async function ReviewPage() {
  await requireUser();
  return <Review />;
}
