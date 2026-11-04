import { Kicker } from "./Kicker";

/** Cabeçalho editorial das páginas: rótulo mono, título grande e descrição. */
export function PageHeader({
  kicker,
  title,
  description,
  color,
}: {
  kicker: string;
  title: string;
  description?: React.ReactNode;
  color?: string;
}) {
  return (
    <header className="mb-10">
      <Kicker color={color}>{kicker}</Kicker>
      <h1 className="mt-4 text-4xl leading-[0.95] font-bold tracking-[-0.045em] sm:text-5xl">
        {title}
        <span className="text-cube-red">.</span>
      </h1>
      {description && <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{description}</p>}
    </header>
  );
}
