import { HOW_IT_WORKS } from "@/data/tips";
import { Kicker } from "@/components/ui/Kicker";

export function HowItWorks() {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold tracking-tight">Como a trilha funciona</h2>
      <ol className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-3">
        {HOW_IT_WORKS.map((step, i) => (
          <li key={step.title}>
            <Kicker>Passo {i + 1}</Kicker>
            <h3 className="mt-2 text-xl font-bold tracking-tight">{step.title}</h3>
            <p className="mt-1 max-w-[46ch] leading-relaxed text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
