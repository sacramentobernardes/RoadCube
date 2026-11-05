"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Monitor, Moon, Sun, Upload } from "lucide-react";
import { imageToAvatar } from "@/lib/avatar";
import { useRoadCube } from "@/lib/store";
import { flushUserData } from "@/lib/sync";
import { setTheme, useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { deleteAccount, logout } from "@/app/(auth)/actions";
import { AVATAR_PRESETS, Avatar, presetValue } from "@/components/shell/Avatar";
import { Button } from "@/components/ui/Button";

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="border-t border-border">{children}</div>
    </section>
  );
}

function Row({ title, detail, children }: { title: string; detail?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border py-4">
      <div className="min-w-0">
        <div className="font-medium">{title}</div>
        {detail && <div className="truncate text-sm text-muted">{detail}</div>}
      </div>
      {children}
    </div>
  );
}

function Choice<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: typeof Sun }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-lg bg-surface-2 p-1">
      {options.map(({ value: v, label: text, icon: Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
            value === v ? "bg-surface text-text shadow-sm" : "text-muted hover:text-text",
          )}
        >
          {Icon && <Icon className="size-4" />} {text}
        </button>
      ))}
    </div>
  );
}

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
      className={cn("relative h-6 w-10 rounded-full transition", checked ? "bg-ink" : "bg-border")}
    >
      <span className={cn("absolute top-1 size-4 rounded-full bg-surface transition-all", checked ? "left-5" : "left-1")} />
    </button>
  );
}

function AvatarPicker() {
  const avatar = useRoadCube((s) => s.settings.avatar);
  const name = useRoadCube((s) => s.profile?.name);
  const updateSettings = useRoadCube((s) => s.updateSettings);
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file?: File) {
    if (!file) return;
    setError(null);
    try {
      updateSettings({ avatar: await imageToAvatar(file) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível usar essa imagem.");
    }
  }

  return (
    <div className="border-b border-border py-4">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar value={avatar} name={name} className="size-16 text-2xl" />
        <div className="min-w-0 flex-1">
          <div className="font-medium">Avatar</div>
          <div className="text-sm text-muted">Envie uma foto ou escolha um padrão de cubo.</div>
        </div>
        <input ref={input} type="file" accept="image/*" aria-label="Enviar foto" className="hidden" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
        <Button variant="secondary" size="sm" onClick={() => input.current?.click()}>
          <Upload className="size-4" /> Enviar foto
        </Button>
        {avatar && (
          <Button variant="ghost" size="sm" onClick={() => updateSettings({ avatar: null })}>
            Remover
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-cube-red">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.keys(AVATAR_PRESETS).map((id) => (
          <button
            key={id}
            type="button"
            aria-label={`Avatar ${id}`}
            aria-pressed={avatar === presetValue(id)}
            onClick={() => updateSettings({ avatar: presetValue(id) })}
            className={cn("rounded-full transition hover:scale-105", avatar === presetValue(id) && "ring-2 ring-ink ring-offset-2 ring-offset-bg")}
          >
            <Avatar value={presetValue(id)} className="size-10" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const s = useRoadCube();
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-12">
      <Group title="Perfil">
        <AvatarPicker />
      </Group>

      <Group title="Aparência">
        <Row title="Tema" detail="Vale para este aparelho.">
          <Choice label="Tema" value={theme} options={THEMES} onChange={setTheme} />
        </Row>
      </Group>

      <Group title="Aprendizado">
        <Row title="Meta diária" detail="XP que você quer ganhar por dia.">
          <Choice
            label="Meta diária"
            value={s.dailyGoal}
            options={[10, 20, 30, 50].map((v) => ({ value: v, label: `${v} XP` }))}
            onChange={s.setDailyGoal}
          />
        </Row>
        <Row title="Velocidade das animações" detail="Para acompanhar os movimentos do cubo.">
          <Choice
            label="Velocidade das animações"
            value={s.settings.animationSpeed}
            options={[0.5, 1, 1.5, 2].map((v) => ({ value: v, label: `${String(v).replace(".", ",")}×` }))}
            onChange={(animationSpeed) => s.updateSettings({ animationSpeed })}
          />
        </Row>
        <Row title="Efeitos sonoros" detail="Sons de acerto, erro e conclusão.">
          <Switch label="Efeitos sonoros" checked={s.settings.sound} onChange={() => s.updateSettings({ sound: !s.settings.sound })} />
        </Row>
      </Group>

      <Group title="Treino">
        <Row title="Tamanho do scramble" detail="Movimentos por embaralhamento.">
          <Choice
            label="Tamanho do scramble"
            value={s.settings.scrambleLength}
            options={[20, 25, 30].map((v) => ({ value: v, label: String(v) }))}
            onChange={(scrambleLength) => s.updateSettings({ scrambleLength })}
          />
        </Row>
        <Row title="Esconder o tempo" detail="O cronômetro só mostra o resultado ao parar.">
          <Switch label="Esconder o tempo" checked={s.settings.hideTimer} onChange={() => s.updateSettings({ hideTimer: !s.settings.hideTimer })} />
        </Row>
      </Group>

      <Group title="Conta">
        <Row title="E-mail" detail={s.email}>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={async () => {
              await flushUserData();
              await logout();
            }}
          >
            Sair
          </Button>
        </Row>
        <Row title="Senha" detail="Crie uma nova senha para entrar.">
          <Link href="/reset-password">
            <Button variant="secondary" size="sm">
              Alterar senha
            </Button>
          </Link>
        </Row>
        <Row title="Apagar progresso" detail="XP, lições, revisões e tempos da sua conta.">
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0 text-cube-red"
            onClick={() => {
              if (window.confirm("Apagar todo o progresso (XP, lições, revisões e tempos)? Isso não pode ser desfeito.")) {
                s.resetProgress();
              }
            }}
          >
            Apagar
          </Button>
        </Row>
        <Row title="Excluir conta" detail="Remove sua conta e todos os dados, para sempre.">
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0 text-cube-red"
            onClick={async () => {
              if (window.prompt("Isso não pode ser desfeito. Para confirmar, digite EXCLUIR:")?.trim() !== "EXCLUIR") return;
              const result = await deleteAccount();
              if (result?.error) window.alert(result.error);
            }}
          >
            Excluir
          </Button>
        </Row>
      </Group>
    </div>
  );
}
