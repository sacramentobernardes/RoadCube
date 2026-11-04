import type { Metadata } from "next";
import { Profile } from "@/components/profile/Profile";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Perfil · RoadCube" };

export default async function ProfilePage() {
  await requireUser();
  return <Profile />;
}
