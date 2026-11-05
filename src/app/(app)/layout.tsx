import type { Metadata } from "next";
import { UserDataProvider } from "@/components/auth/UserDataProvider";
import { requireUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { loadUserData } from "@/lib/user-data";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const initial = await loadUserData(await createClient(), user.id);
  return (
    <UserDataProvider key={user.id} userId={user.id} email={user.email ?? null} initial={initial}>
      {children}
    </UserDataProvider>
  );
}
