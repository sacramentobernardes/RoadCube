import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Entrar · RoadCube" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <AuthForm
      mode="login"
      next={typeof next === "string" ? next : undefined}
      notice={typeof error === "string" ? error : undefined}
    />
  );
}
