import { Logo } from "@/components/shell/Logo";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { CubeFrame } from "@/components/cube/CubeFrame";
import { TwistyCube } from "@/components/cube/TwistyCube";
import { Tag } from "@/components/ui/Tag";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="page-width flex h-14 items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
      </header>
      <main className="page-width grid grid-cols-[minmax(0,1fr)] items-center gap-12 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:gap-20 md:py-20 2xl:grid-cols-[minmax(0,1fr)_minmax(0,min(600px,66vh))]">
        <div className="w-full max-w-md justify-self-center">{children}</div>
        <div className="hidden md:block">
          <CubeFrame title="sune.alg" footerLeft={<Tag tone="dark">em loop</Tag>}>
            <TwistyCube alg="R U R' U R U2 R'" anchor="end" view="oll" autoplay loop />
          </CubeFrame>
        </div>
      </main>
    </div>
  );
}
