import type { Metadata } from "next";
import { Trainer } from "@/components/train/Trainer";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Treinar · RoadCube" };

export default async function TrainPage() {
  await requireUser();
  return <Trainer />;
}
