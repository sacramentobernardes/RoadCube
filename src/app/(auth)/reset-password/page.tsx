import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/PasswordForms";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Nova senha · RoadCube", robots: { index: false } };

export default async function ResetPasswordPage() {
  await requireUser();
  return <ResetPasswordForm />;
}
