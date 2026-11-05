"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { levelFromXp } from "@/lib/gamification";
import { useRoadCube } from "@/lib/store";
import { Avatar } from "@/components/shell/Avatar";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { Dashboard } from "./Dashboard";
import { SettingsPanel } from "./SettingsPanel";

type Tab = "overview" | "settings";

export function Profile() {
  const profile = useRoadCube((s) => s.profile);
  const avatar = useRoadCube((s) => s.settings.avatar);
  const xp = useRoadCube((s) => s.xp);
  const setProfile = useRoadCube((s) => s.setProfile);
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const level = levelFromXp(xp);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex items-center gap-6">
        <Avatar value={avatar} name={profile?.name} className="size-20 text-3xl sm:size-24 sm:text-4xl" />
        <div className="min-w-0 flex-1">
          <Kicker color="var(--cube-yellow)">
            Perfil · {profile ? `desde ${new Date(profile.createdAt).toLocaleDateString("pt-BR")}` : "local"}
          </Kicker>
          {editing ? (
            <form
              className="mt-3 flex max-w-md items-center gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) setProfile(name.trim());
                setEditing(false);
              }}
            >
              <input
                autoFocus
                value={name}
                maxLength={30}
                onChange={(e) => setName(e.target.value)}
                className="min-w-0 flex-1 border-b-2 border-ink bg-transparent text-4xl font-bold tracking-[-0.04em] outline-none"
              />
              <Button size="sm" type="submit">
                Salvar
              </Button>
            </form>
          ) : (
            <h1 className="mt-3 flex items-center gap-3 text-5xl leading-[0.95] font-bold tracking-[-0.045em]">
              <span className="min-w-0 truncate pb-1">
                {profile?.name ?? "Cubista anônimo"}
                <span className="text-cube-red">.</span>
              </span>
              <button type="button" aria-label="Editar nome" onClick={() => setEditing(true)} className="text-muted hover:text-text">
                <Pencil className="size-4" />
              </button>
            </h1>
          )}
          <div className="mt-4 flex max-w-md items-center gap-4">
            <span className="shrink-0 font-mono text-sm">nível {level.level}</span>
            <ProgressBar value={level.progress} color="var(--cube-yellow)" />
            <span className="shrink-0 font-mono text-xs text-muted">
              {level.current}/{level.needed} xp
            </span>
          </div>
        </div>
      </header>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "overview", label: "Visão geral" },
          { value: "settings", label: "Configurações" },
        ]}
      />
      {tab === "overview" ? <Dashboard /> : <SettingsPanel />}
    </div>
  );
}
