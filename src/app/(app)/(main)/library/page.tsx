import type { Metadata } from "next";
import { Library } from "@/components/library/Library";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Biblioteca · RoadCube" };

export default async function LibraryPage() {
  await requireUser();
  return <Library />;
}
