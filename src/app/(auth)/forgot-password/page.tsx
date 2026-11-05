import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/PasswordForms";

export const metadata: Metadata = { title: "Recuperar senha · RoadCube", robots: { index: false } };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
