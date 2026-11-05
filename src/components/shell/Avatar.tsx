import { cn } from "@/lib/cn";

const COLORS: Record<string, string> = {
  W: "#f4f4f2",
  Y: "#f2c230",
  G: "#1f9d5a",
  R: "#e03a2f",
  B: "#2f55d4",
  O: "#f07a2a",
};

/** Avatares prontos: padrões clássicos de cubo, lidos linha a linha. */
export const AVATAR_PRESETS: Record<string, string> = {
  xadrez: "GWGWGWGWG",
  cruz: "YWYWWWYWY",
  centro: "BBBBOBBBB",
  faixas: "RRRWWWBBB",
  diagonal: "RYGYGRGRY",
  moldura: "OOOOYOOOO",
  quinas: "GRGRRRGRG",
  arcoiris: "RGBOYWBOR",
};

const PRESET_PREFIX = "preset:";

export const presetValue = (id: string) => `${PRESET_PREFIX}${id}`;

function PresetImage({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 64 64" className="size-full" aria-hidden>
      <rect width="64" height="64" fill="#121316" />
      {[...AVATAR_PRESETS[id]].map((c, i) => (
        <rect key={i} x={6 + (i % 3) * 18} y={6 + Math.floor(i / 3) * 18} width="16" height="16" rx="3.5" fill={COLORS[c]} />
      ))}
    </svg>
  );
}

/** Foto, avatar de cubo ou a inicial do nome, nessa ordem. */
export function Avatar({ value, name, className }: { value: string | null; name?: string; className?: string }) {
  const preset = value?.startsWith(PRESET_PREFIX) ? value.slice(PRESET_PREFIX.length) : null;
  const isPhoto = value?.startsWith("data:image/");
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full border border-border font-semibold", className)}>
      {preset && AVATAR_PRESETS[preset] ? (
        <PresetImage id={preset} />
      ) : isPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- imagem local em data URL
        <img src={value!} alt="" className="size-full object-cover" />
      ) : (
        (name ?? "?").slice(0, 1).toUpperCase()
      )}
    </span>
  );
}
