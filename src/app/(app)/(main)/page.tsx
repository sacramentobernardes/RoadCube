import { Trail } from "@/components/trail/Trail";
import { requireUser } from "@/lib/auth/dal";

export default async function HomePage() {
  await requireUser();
  return <Trail />;
}
