import { Reveal } from "@/components/ui/reveal";

const points = [
  {
    n: "01",
    title: "It's invisible until it isn't",
    body: "Local and prod env vars drift apart quietly over months of normal work — a new variable here, a forgotten update there.",
  },
  {
    n: "02",
    title: "Nobody re-reads 40 lines by hand",
    body: "You could catch it by eye. Nobody actually does it before every deploy — same reason spell-check exists even though you could proofread yourself.",
  },
  {
    n: "03",
    title: "You find out in production",
    body: "A missing key or a stale URL doesn't show up in review. It shows up as a broken deploy, at the worst possible time.",
  },
];

export function Problem() {
  return (
    <section className="relative overflow-hidden bg-paper text-ink">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-28 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.32em] text-ink/45 uppercase">The problem</p>
          <h2 className="mt-5 text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.02] tracking-tight">
            The friction is real,{" "}
            <span className="text-charcoal/70">even if it's small.</span>
          </h2>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-charcoal">
            A <code className="rounded bg-ink px-1.5 py-0.5 font-mono text-[0.85em] text-silver">.env</code> file
            is a fine place to store variables. It's a miserable place to keep two copies in sync.
          </p>
        </Reveal>

        <div className="space-y-0">
          {points.map((p, i) => (
            <Reveal key={p.n} delay={i * 120}>
              <article className="group grid grid-cols-[auto_1fr] gap-6 border-t border-ink/10 py-8 transition-colors duration-500 hover:border-ink/40">
                <span className="font-mono text-5xl font-medium text-ink/25 transition-transform duration-500 group-hover:-translate-y-1 sm:text-6xl">
                  {p.n}
                </span>
                <div className="pt-2">
                  <h3 className="text-xl font-medium tracking-tight text-ink">{p.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-charcoal">{p.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
